import { Router, type IRouter } from "express";
import {
  CreateOrderBody,
  GetOrderParams,
  CreateOrderCheckoutParams,
  CreateOrderCheckoutBody,
  ConfirmOrderDeliveryParams,
  ConfirmOrderDeliveryBody,
  GetActiveOrderQueryParams,
  GetOrderHistoryQueryParams,
} from "@workspace/api-zod";
import { storage } from "../storage";
import { getUncachableStripeClient } from "../stripeClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// --- Motivational messages per stage ---
const MOTIVATIONAL_MESSAGES: Record<string, string> = {
  pending_payment:
    "Your intention is ready. Seal it with $1 and send it to the universe.",
  processing:
    "The universe has received your order. Trust that it is already working — often in ways you cannot yet see.",
  in_transit:
    "It is on its way to you. Stay open, stay expectant. What you ordered has already been sent.",
  delivered:
    "You manifested it. The universe always delivers to those who believe and remain open to receiving.",
};

function getTrackingStage(status: string): number {
  switch (status) {
    case "pending_payment": return 1;
    case "processing": return 2;
    case "in_transit": return 3;
    case "delivered": return 4;
    default: return 1;
  }
}

function serializeOrder(order: {
  id: number;
  intention: string;
  status: string;
  sessionToken: string;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: order.id,
    intention: order.intention,
    status: order.status,
    sessionToken: order.sessionToken,
    stripePaymentIntentId: order.stripePaymentIntentId ?? null,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId ?? null,
    motivationalMessage: MOTIVATIONAL_MESSAGES[order.status] ?? "",
    trackingStage: getTrackingStage(order.status),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

// Auto-advance order status based on time and payment
async function maybeAdvanceOrder(order: Awaited<ReturnType<typeof storage.getOrder>>) {
  if (!order) return order;

  // pending_payment → processing (check if Stripe says paid)
  if (order.status === "pending_payment" && order.stripeCheckoutSessionId) {
    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
      if (session.status === "complete" && session.payment_status === "paid") {
        const updated = await storage.updateOrderToProcessing(
          order.id,
          session.payment_intent as string | null,
          session.id
        );
        return updated ?? order;
      }
    } catch (err) {
      logger.warn({ err, orderId: order.id }, "Could not check Stripe session status");
    }
    return order;
  }

  // processing → in_transit (after 3 minutes)
  if (order.status === "processing") {
    const processingAge = Date.now() - order.updatedAt.getTime();
    if (processingAge >= 3 * 60 * 1000) {
      const updated = await storage.advanceOrderStatus(order.id, "in_transit");
      return updated ?? order;
    }
  }

  return order;
}

// GET /orders/active
router.get("/orders/active", async (req, res): Promise<void> => {
  const parsed = GetActiveOrderQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let order = await storage.getActiveOrderForSession(parsed.data.sessionToken);
  if (order) {
    order = await maybeAdvanceOrder(order) ?? order;
  }

  res.json({ order: order ? serializeOrder(order) : null });
});

// GET /order-product
// Queries Stripe API directly for reliability (sync tables may lag behind)
router.get("/order-product", async (_req, res): Promise<void> => {
  try {
    const stripe = await getUncachableStripeClient();
    const products = await stripe.products.search({
      query: "name:'Universe Order' AND active:'true'",
    });
    if (products.data.length === 0) {
      res.status(404).json({ error: "Universe Order product not found. Please seed the product first." });
      return;
    }
    const prices = await stripe.prices.list({
      product: products.data[0].id,
      active: true,
      limit: 1,
    });
    if (prices.data.length === 0) {
      res.status(404).json({ error: "No active price found for Universe Order product." });
      return;
    }
    res.json({
      priceId: prices.data[0].id,
      unitAmount: prices.data[0].unit_amount ?? 100,
      currency: prices.data[0].currency ?? "usd",
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch order product from Stripe");
    res.status(500).json({ error: "Failed to retrieve product information." });
  }
});

// GET /orders/current — must come before /orders/:id
router.get("/orders/current", async (req, res): Promise<void> => {
  const parsed = GetActiveOrderQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const orders = await storage.getCurrentOrdersForSession(parsed.data.sessionToken);
  const advanced = await Promise.all(orders.map(o => maybeAdvanceOrder(o)));
  res.json(advanced.map(o => serializeOrder(o!)));
});

// GET /orders/history
router.get("/orders/history", async (req, res): Promise<void> => {
  const parsed = GetOrderHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const orders = await storage.getDeliveredOrdersForSession(parsed.data.sessionToken);
  res.json(orders.map(serializeOrder));
});

// POST /orders
router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const order = await storage.createOrder({
    intention: parsed.data.intention,
    sessionToken: parsed.data.sessionToken,
  });

  res.status(201).json(serializeOrder(order));
});

// GET /orders/:id/mobile-success — Stripe success redirect for mobile app
// Stripe requires an https success_url; this endpoint chain-redirects to the
// app scheme so openAuthSessionAsync can detect it and close the browser.
router.get("/orders/:id/mobile-success", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  res.redirect(`universe-order-mobile://order/${params.data.id}`);
});

// GET /orders/:id
router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let order = await storage.getOrder(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  order = await maybeAdvanceOrder(order) ?? order;
  res.json(serializeOrder(order));
});

// POST /orders/:id/checkout
router.post("/orders/:id/checkout", async (req, res): Promise<void> => {
  const params = CreateOrderCheckoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateOrderCheckoutBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const order = await storage.getOrder(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.sessionToken !== body.data.sessionToken) {
    res.status(403).json({ error: "Session token mismatch" });
    return;
  }

  const stripe = await getUncachableStripeClient();

  // Query Stripe directly for the active price — sync tables may lag in production
  const products = await stripe.products.search({
    query: "name:'Universe Order' AND active:'true'",
  });
  if (!products.data.length) {
    res.status(500).json({ error: "Universe Order product not configured" });
    return;
  }
  const prices = await stripe.prices.list({ product: products.data[0].id, active: true, limit: 1 });
  if (!prices.data.length) {
    res.status(500).json({ error: "Universe Order product has no active price" });
    return;
  }
  const priceId = prices.data[0].id;

  const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || req.get("host")}`;

  // If the mobile client sets mobileReturn=true, use a redirect endpoint as
  // success_url so the app scheme redirect chain-closes the in-app browser.
  const mobileReturn = req.body?.mobileReturn === true;
  const successUrl = mobileReturn
    ? `${baseUrl}/api/orders/${order.id}/mobile-success`
    : `${baseUrl}/success?orderId=${order.id}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    success_url: successUrl,
    cancel_url: `${baseUrl}/cancel`,
    metadata: { orderId: String(order.id) },
  });

  await storage.updateOrderCheckoutSession(order.id, session.id);

  res.json({ url: session.url! });
});

// PATCH /orders/:id/confirm
router.patch("/orders/:id/confirm", async (req, res): Promise<void> => {
  const params = ConfirmOrderDeliveryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = ConfirmOrderDeliveryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const order = await storage.getOrder(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.sessionToken !== body.data.sessionToken) {
    res.status(403).json({ error: "Session token mismatch" });
    return;
  }

  if (order.status !== "in_transit") {
    res.status(400).json({ error: "Order must be in transit before confirming delivery" });
    return;
  }

  const confirmed = await storage.confirmOrderDelivery(order.id);
  if (!confirmed) {
    res.status(500).json({ error: "Failed to confirm delivery" });
    return;
  }

  res.json(serializeOrder(confirmed));
});

export default router;
