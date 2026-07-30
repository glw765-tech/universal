# Order from the Universe

A cosmic intention-setting app. Write what you want from the universe, pay $1 to seal and send it, then track it through fulfillment stages — Processing, In Transit, and Delivered — with motivational messaging at each step. Only one active order at a time.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/universe-order run dev` — run the frontend (port 19760)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-universe-product` — create the $1 Universe Order product in Stripe
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion, Wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Payments: Stripe (one-time $1 checkout) via `stripe-replit-sync`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/orders.ts` — orders table schema
- `artifacts/api-server/src/routes/orders.ts` — all order endpoints + status advancement logic
- `artifacts/api-server/src/stripeClient.ts` — Stripe credential fetch from Replit connectors
- `artifacts/api-server/src/storage.ts` — DB queries for orders
- `artifacts/api-server/build.mjs` — includes step to copy stripe-replit-sync migrations into dist/
- `scripts/src/seed-universe-product.ts` — creates the $1 Stripe product (run once)

## Architecture decisions

- **Session-based orders (no auth):** A UUID is generated on first visit (stored in localStorage) and passed with all API calls. No login required — each browser session owns its orders.
- **Status auto-advancement in GET handler:** When `GET /orders/:id` is called, the server checks Stripe for payment completion (pending_payment → processing) and auto-advances processing → in_transit after 3 minutes. No background job needed.
- **Direct Stripe API for product lookup:** `GET /order-product` queries the Stripe API directly rather than the synced `stripe.products` table, since the sync may lag after product creation.
- **stripe-replit-sync SQL migrations must be copied to dist/:** esbuild bundles JS but not SQL files; `build.mjs` has a post-build step that copies `stripe-replit-sync/dist/migrations/` into the server's `dist/migrations/` directory.
- **One active order at a time:** enforced server-side — `POST /orders` returns 409 if an active order exists for the session.

## Product

- `/` — Write your intention and pay $1 to place your cosmic order
- `/order/:id` — Live tracking timeline: Received → Processing → In Transit → Delivered, with motivational messages at each stage
- `/success` — Stripe redirect handler, transitions to tracking page
- `/cancel` — Stripe cancel redirect with encouraging message
- `/history` — Archive of all confirmed/delivered orders

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/scripts run seed-universe-product` once to create the Stripe product before the checkout flow works
- The esbuild migrations copy step is critical — without it `stripe-replit-sync` can't find its SQL migration files at runtime
- Order status `pending_payment → processing` requires a real Stripe payment to complete; in dev use Stripe test card `4242 4242 4242 4242`
- `processing → in_transit` auto-advances after 3 minutes (checked lazily on GET /orders/:id)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
