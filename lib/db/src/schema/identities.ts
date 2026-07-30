import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const userIdentitiesTable = pgTable("user_identities", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  sessionToken: text("session_token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const claimCodesTable = pgTable("claim_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserIdentity = typeof userIdentitiesTable.$inferSelect;
export type ClaimCode = typeof claimCodesTable.$inferSelect;
