import { pgTable, text, serial, timestamp, unique } from "drizzle-orm/pg-core";

export const pushTokensTable = pgTable("push_tokens", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  expoPushToken: text("expo_push_token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  unique("push_tokens_session_expo_unique").on(t.sessionToken, t.expoPushToken),
]);

export type PushToken = typeof pushTokensTable.$inferSelect;
