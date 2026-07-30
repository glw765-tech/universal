import { eq, sql, and, inArray } from 'drizzle-orm';
import { db, ordersTable } from '@workspace/db';

export class Storage {
  // ---- Order operations ----

  async createOrder(data: { intention: string; sessionToken: string }) {
    const [order] = await db.insert(ordersTable).values({
      intention: data.intention,
      sessionToken: data.sessionToken,
      status: 'pending_payment',
    }).returning();
    return order;
  }

  async getOrder(id: number) {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    return order ?? null;
  }

  async getActiveOrderForSession(sessionToken: string) {
    const [order] = await db.select().from(ordersTable).where(
      and(
        eq(ordersTable.sessionToken, sessionToken),
        inArray(ordersTable.status, ['pending_payment', 'processing', 'in_transit'])
      )
    ).orderBy(ordersTable.createdAt);
    return order ?? null;
  }

  async getCurrentOrdersForSession(sessionToken: string) {
    return await db.select().from(ordersTable).where(
      and(
        eq(ordersTable.sessionToken, sessionToken),
        inArray(ordersTable.status, ['pending_payment', 'processing', 'in_transit'])
      )
    ).orderBy(ordersTable.createdAt);
  }

  async getDeliveredOrdersForSession(sessionToken: string) {
    return await db.select().from(ordersTable).where(
      and(
        eq(ordersTable.sessionToken, sessionToken),
        eq(ordersTable.status, 'delivered')
      )
    ).orderBy(ordersTable.createdAt);
  }

  async updateOrderCheckoutSession(id: number, checkoutSessionId: string) {
    const [order] = await db.update(ordersTable)
      .set({ stripeCheckoutSessionId: checkoutSessionId })
      .where(eq(ordersTable.id, id))
      .returning();
    return order ?? null;
  }

  async updateOrderToProcessing(id: number, paymentIntentId: string | null, checkoutSessionId: string | null) {
    const [order] = await db.update(ordersTable)
      .set({
        status: 'processing',
        stripePaymentIntentId: paymentIntentId ?? undefined,
        stripeCheckoutSessionId: checkoutSessionId ?? undefined,
      })
      .where(eq(ordersTable.id, id))
      .returning();
    return order ?? null;
  }

  async advanceOrderStatus(id: number, newStatus: string) {
    const [order] = await db.update(ordersTable)
      .set({ status: newStatus })
      .where(eq(ordersTable.id, id))
      .returning();
    return order ?? null;
  }

  async getProcessingOrdersOlderThan(ageMs: number) {
    const cutoff = new Date(Date.now() - ageMs);
    return await db.select().from(ordersTable).where(
      and(
        eq(ordersTable.status, 'processing'),
        sql`${ordersTable.updatedAt} <= ${cutoff}`
      )
    );
  }

  async confirmOrderDelivery(id: number) {
    const [order] = await db.update(ordersTable)
      .set({ status: 'delivered', confirmedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();
    return order ?? null;
  }

  // ---- Stripe product queries ----

  async getUniverseOrderProduct() {
    const result = await db.execute(
      sql`
        SELECT p.id as product_id, p.name, pr.id as price_id, pr.unit_amount, pr.currency
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true AND p.name = 'Universe Order'
        LIMIT 1
      `
    );
    return result.rows[0] ?? null;
  }
}

export const storage = new Storage();
