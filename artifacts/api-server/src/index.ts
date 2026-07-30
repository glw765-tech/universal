import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import app from "./app";
import { logger } from "./lib/logger";
import { storage } from "./storage";

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required for Stripe integration.");
  }

  try {
    logger.info("Initializing Stripe schema...");
    await runMigrations({ databaseUrl, schema: "stripe" });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();

    logger.info("Setting up managed webhook...");
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    await stripeSync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/stripe/webhook`);
    logger.info("Webhook configured");

    // Sync existing Stripe data in background — don't block startup
    stripeSync.syncBackfill()
      .then(() => logger.info("Stripe data sync complete"))
      .catch((err) => logger.error({ err }, "Error syncing Stripe data"));
  } catch (err) {
    logger.error({ err }, "Failed to initialize Stripe");
    throw err;
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Stripe init is non-fatal — server starts even if Stripe credentials aren't available yet
try {
  await initStripe();
} catch (err) {
  logger.warn({ err }, "Stripe initialization failed — server will start without Stripe. Reconnect the Stripe integration if this persists.");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

// Background scheduler: advance processing orders to in_transit every 60 seconds
const PROCESSING_TO_TRANSIT_AGE_MS = 3 * 60 * 1000; // 3 minutes
const ADVANCE_INTERVAL_MS = 60 * 1000; // run every 60 seconds

async function advanceEligibleOrders() {
  try {
    const orders = await storage.getProcessingOrdersOlderThan(PROCESSING_TO_TRANSIT_AGE_MS);
    if (orders.length === 0) return;
    logger.info({ count: orders.length }, "Scheduler: advancing eligible orders to in_transit");
    await Promise.all(
      orders.map((order) => storage.advanceOrderStatus(order.id, "in_transit"))
    );
  } catch (err) {
    logger.error({ err }, "Scheduler: error advancing orders");
  }
}

setInterval(advanceEligibleOrders, ADVANCE_INTERVAL_MS);
logger.info({ intervalMs: ADVANCE_INTERVAL_MS }, "Order advancement scheduler started");
