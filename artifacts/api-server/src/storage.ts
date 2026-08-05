import crypto from 'crypto';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { db, ordersTable, userIdentitiesTable, claimCodesTable, pushTokensTable } from '@workspace/db';

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

  /**
   * Conditionally advance an order's status. The UPDATE only fires when the
   * order is still in `fromStatus`, so concurrent callers get at most one
   * non-null return value — only that caller should send a notification.
   */
  async advanceOrderStatus(id: number, fromStatus: string, newStatus: string) {
    const [order] = await db.update(ordersTable)
      .set({ status: newStatus })
      .where(and(eq(ordersTable.id, id), eq(ordersTable.status, fromStatus)))
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

  /**
   * Confirm delivery only when the order is still in_transit.
   * Returns null if another caller already transitioned it, preventing
   * duplicate delivered notifications.
   */
  async confirmOrderDelivery(id: number) {
    const [order] = await db.update(ordersTable)
      .set({ status: 'delivered', confirmedAt: new Date() })
      .where(and(eq(ordersTable.id, id), eq(ordersTable.status, 'in_transit')))
      .returning();
    return order ?? null;
  }

  // ---- Identity & claim code operations ----

  async createClaimCode(email: string): Promise<string> {
    // Invalidate any unused prior codes for this email
    await db.delete(claimCodesTable).where(
      and(eq(claimCodesTable.email, email), sql`${claimCodesTable.usedAt} IS NULL`)
    );
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.insert(claimCodesTable).values({ email, codeHash, expiresAt });
    return code;
  }

  async verifyClaimCode(email: string, code: string, currentSessionToken: string): Promise<string | null> {
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const now = new Date();

    const [row] = await db.select().from(claimCodesTable).where(
      and(
        eq(claimCodesTable.email, email),
        eq(claimCodesTable.codeHash, codeHash),
        sql`${claimCodesTable.usedAt} IS NULL`,
        sql`${claimCodesTable.expiresAt} > ${now}`
      )
    );
    if (!row) return null;

    // Mark code used
    await db.update(claimCodesTable).set({ usedAt: now }).where(eq(claimCodesTable.id, row.id));

    // Look up existing identity for this email
    const [existing] = await db.select().from(userIdentitiesTable).where(eq(userIdentitiesTable.email, email));

    if (existing) {
      // Migrate any orders from currentSessionToken → canonical session token
      if (currentSessionToken !== existing.sessionToken) {
        await db.update(ordersTable)
          .set({ sessionToken: existing.sessionToken })
          .where(eq(ordersTable.sessionToken, currentSessionToken));
      }
      return existing.sessionToken;
    } else {
      // First time linking — register current session as canonical
      await db.insert(userIdentitiesTable).values({ email, sessionToken: currentSessionToken });
      return currentSessionToken;
    }
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

  // ---- Push token operations ----

  async upsertPushToken(sessionToken: string, expoPushToken: string) {
    // Insert; if this (session, token) pair already exists, no-op
    await db
      .insert(pushTokensTable)
      .values({ sessionToken, expoPushToken })
      .onConflictDoNothing({
        target: [pushTokensTable.sessionToken, pushTokensTable.expoPushToken],
      });
  }

  async getPushTokensForSession(sessionToken: string): Promise<string[]> {
    const rows = await db
      .select({ expoPushToken: pushTokensTable.expoPushToken })
      .from(pushTokensTable)
      .where(eq(pushTokensTable.sessionToken, sessionToken));
    return rows.map((r) => r.expoPushToken);
  }
}

export const storage = new Storage();
