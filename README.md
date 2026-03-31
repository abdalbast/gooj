# GOOJ

GOOJ is a React + Vite storefront for curated gift boxes. It includes a customer-facing shopping experience, a Supabase-backed date reminders flow, and a protected admin console for merchandising and operational content.

The codebase is structured like a production frontend rather than a throwaway prototype: route-level code splitting, typed Supabase access, cache-safe deployment behavior, and Playwright coverage for functional, mobile, performance, and versioning regressions are already in place.

## Overview

### Customer Experience

- Editorial home page and category browsing
- Product detail pages with accessible image gallery and zoom
- Client-side shopping bag and checkout flow
- Date reminders area with Supabase-authenticated persistence
- Content pages for brand, support, legal, and store information

### Admin Experience

- Email magic link sign-in through Supabase Auth
- Access control enforced via `public.admin_users`
- Dashboard with seeded metrics and charts
- Core Web Vitals reporting at `/admin/performance`
- CRUD workflows for products and promotions
- Managed content blocks
- Read views for orders and customers

## Tech Stack

- React 18
- TypeScript
- Vite 8
- React Router 6
- Tailwind CSS
- shadcn/ui + Radix UI
- Supabase JavaScript client
- Recharts
- Playwright
- Vercel

## Repository Structure

```text
.
|-- public/                 # Static assets served directly
|-- scripts/                # Local utility scripts
|-- src/
|   |-- components/         # Reusable UI and feature components
|   |-- contexts/           # Auth/session context
|   |-- hooks/              # Shared hooks
|   |-- lib/                # Commerce, Supabase, versioning, utility modules
|   |-- pages/              # Route-level pages, including /admin
|   `-- assets/             # Bundled media assets
|-- supabase/
|   |-- bootstrap.sql       # Full database bootstrap for hosted projects
|   |-- config.toml         # Local Supabase CLI config
|   `-- migrations/         # Versioned SQL migrations
|-- tests/e2e/              # Playwright coverage
|-- vercel.json             # SPA rewrites and caching headers
`-- vite.config.ts          # Build config and version manifest generation
```

## Runtime Model

### Frontend

- The application is a single-page app served by Vite.
- Routes are lazy-loaded to keep the initial bundle controlled.
- Production builds emit `version.json`, and the client polls for newer builds to force-refresh stale tabs safely.

### Data

- Date reminders and admin data are stored in Supabase.
- The public product catalog shown on the storefront is currently sourced from local TypeScript data in [`src/lib/productData.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/productData.ts).
- Checkout is currently client-side only and simulates payment completion; there is no payment gateway, order API, or server-side order creation in this repository today.

That distinction matters operationally: the admin area is backed by Supabase, but the public catalog and checkout flow are not yet fully integrated into a transactional commerce backend.

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Start The App

```bash
npm run dev
```

The Vite dev server runs on `http://127.0.0.1:8080`.

### Preview A Production Build

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Production preview runs on `http://127.0.0.1:4173`.

## Environment Variables

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Required variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Optional performance-reporting variables:

```bash
VITE_WEB_VITALS_ENABLED=
VITE_WEB_VITALS_SAMPLE_RATE=1
VITE_WEB_VITALS_ENDPOINT=
VITE_WEB_VITALS_RELEASE_ID=
VITE_WEB_VITALS_DEBUG=
```

Release verification variables:

```bash
DEPLOYMENT_URL=https://gooj.vercel.app
E2E_ADMIN_EMAIL=
E2E_ADMIN_TOTP_SECRET=
E2E_GMAIL_CLIENT_ID=
E2E_GMAIL_CLIENT_SECRET=
E2E_GMAIL_REFRESH_TOKEN=
```

Notes:

- The app will render fallback setup states if these variables are missing.
- Both the reminders flow and admin console depend on these values.
- Use the Supabase project URL and publishable anon key from your project settings.
- Core Web Vitals reporting derives its default endpoint from `VITE_SUPABASE_URL` and the `report-web-vitals` Edge Function path. Override `VITE_WEB_VITALS_ENDPOINT` only if you need to point at a different ingress URL.
- `VITE_WEB_VITALS_ENABLED` defaults to production-only reporting. Local development stays quiet unless you explicitly enable it or turn on debug logging.
- The release gate uses the non-`VITE_` variables above to verify the live production deployment before tagging.

## Supabase Setup

This repository assumes a hosted Supabase project for authentication and data storage.

### Bootstrap The Database

Run [`supabase/bootstrap.sql`](/Users/abdalbastkhdhir/development/Business Projects/gooj/supabase/bootstrap.sql) in the Supabase SQL editor, or apply the migrations in [`supabase/migrations/20260326183000_bootstrap.sql`](/Users/abdalbastkhdhir/development/Business Projects/gooj/supabase/migrations/20260326183000_bootstrap.sql) and [`supabase/migrations/20260328090000_harden_admin_access.sql`](/Users/abdalbastkhdhir/development/Business Projects/gooj/supabase/migrations/20260328090000_harden_admin_access.sql).

The bootstrap creates:

- `public.reminders`
- `public.admin_users`
- `public.admin_products`
- `public.admin_promotions`
- `public.admin_content_blocks`
- `public.admin_customers`
- `public.admin_orders`
- `public.web_vitals_events`
- SQL reporting functions for p75 overview, trends, device splits, route summaries, and release comparisons
- RLS policies for reminder ownership and role-aware admin access
- Seed data for the admin dashboard and management screens

### Configure Auth Redirects

Supabase Auth should allow redirects back only to:

- Your local dev URL, for example `http://127.0.0.1:8080`
- Your production domain

The app uses magic-link email authentication for reminders, but `/admin` is intentionally restricted to approved local and production origins. Preview deployments should not be added to the admin redirect allowlist.

### Grant Admin Access

Signing into `/admin` is not enough by itself. The user must also exist in `public.admin_users`, have an allowed role, and complete TOTP MFA before admin data policies unlock.

After creating an auth user, insert a matching admin row:

```sql
insert into public.admin_users (user_id, email, full_name, role)
values ('<auth-user-uuid>', 'admin@example.com', 'Store Admin', 'admin')
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  active = true;
```

Supported admin roles:

- `admin`: full dashboard, catalog, content, orders, and customers access
- `catalog_manager`: products and promotions access
- `content_manager`: content management access
- `support_viewer`: orders and customers read access

After the first successful admin sign-in, the app will require the user to enroll a TOTP authenticator and step up to `aal2` before admin pages load.

## Available Scripts

```bash
npm run dev
npm run dev:logged
npm run build
npm run build:dev
npm run lint
npm run preview
npm run test:e2e:install
npm run test:e2e
npm run test:release
npm run test:perf
npm run test:ci
npm run release:notes -- 2026-03-31
npm run release:verify
```

## Testing And Quality Gates

Playwright coverage lives under [`tests/e2e`](/Users/abdalbastkhdhir/development/Business Projects/gooj/tests/e2e) and includes:

- Functional smoke coverage for home, product, checkout, reminders, and admin routes
- Mobile overflow and interaction checks
- Performance budgets for route payloads and media behavior
- Bundle size budget checks against built assets
- Version-sync behavior against `version.json`

Formal release verification uses [`playwright.release.config.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/playwright.release.config.ts) plus [`tests/release/release.spec.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/tests/release/release.spec.ts) to target the deployed production site directly.

Recommended verification flow before shipping:

```bash
npm run lint
npm run build
npm run test:app
npm run test:release
npm run test:e2e
npm run test:perf
```

If Playwright browsers are not installed yet:

```bash
npm run test:e2e:install
```

## Deployment

The repository is configured for Vercel.

### Vercel Behavior

- `vercel.json` rewrites all application routes to `index.html` for SPA routing.
- `index.html` and `version.json` are served with `no-cache` headers.
- hashed asset files under `/assets` are served as immutable.
- Formal releases should set `VITE_WEB_VITALS_RELEASE_ID` to the release tag before the production deploy.

### Required Vercel Environment Variables

Set the same frontend variables used locally:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- Optional: `VITE_WEB_VITALS_ENABLED`, `VITE_WEB_VITALS_SAMPLE_RATE`, `VITE_WEB_VITALS_RELEASE_ID`

If you manage env values with the Vercel CLI:

```bash
vercel env pull .env.local
```

For the full tag-and-release workflow, use [`RELEASE.md`](/Users/abdalbastkhdhir/development/Business Projects/gooj/RELEASE.md).

## Operational Notes

### Version Sync

The build pipeline emits `version.json` and injects a build id at compile time. In production, the client checks for a newer build on focus, visibility change, page show, and a timed interval. If a newer build is detected, it clears browser caches and reloads onto the latest deployment.

This is intentional and should be preserved unless you are also redesigning cache invalidation strategy.

### Caching

- Development server responses are configured with no-cache headers.
- Production HTML and version manifests are non-cacheable.
- Fingerprinted assets are safe to cache aggressively.

## Core Web Vitals Reporting

### What Was Implemented

- Real user measurement for `LCP`, `INP`, and `CLS`, with `FCP` and `TTFB` collected as secondary diagnostics
- A small browser-side performance module under [`src/lib/performance`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/performance)
- A public Supabase Edge Function at [`supabase/functions/report-web-vitals/index.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/supabase/functions/report-web-vitals/index.ts) for low-overhead beacon ingestion
- Persistent storage plus percentile-oriented SQL reporting in [`supabase/migrations/20260331103000_web_vitals_reporting.sql`](/Users/abdalbastkhdhir/development/Business Projects/gooj/supabase/migrations/20260331103000_web_vitals_reporting.sql)
- An internal admin view at [`src/pages/admin/AdminPerformance.tsx`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/pages/admin/AdminPerformance.tsx)

### Browser To Dashboard Flow

1. [`src/main.tsx`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/main.tsx) starts the monitoring bootstrap once per page load.
2. [`src/lib/performance/webVitals.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/performance/webVitals.ts) loads `web-vitals` lazily and reports metrics without blocking initial render.
3. [`src/lib/performance/context.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/performance/context.ts) adds safe route, release, device, viewport, referrer-category, and navigation context.
4. [`src/lib/performance/transport.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/performance/transport.ts) batches modestly, prefers `sendBeacon` on page hide, and falls back to `fetch(..., { keepalive: true })`.
5. The Supabase Edge Function validates the payload, upserts into `public.web_vitals_events`, and the admin page queries percentile summaries through SQL RPCs.

### Setup

Run the new migration or bootstrap SQL, then deploy the ingest function:

```bash
supabase db push
supabase functions deploy report-web-vitals --no-verify-jwt
```

After that, production builds will report automatically if `VITE_SUPABASE_URL` is present and `VITE_WEB_VITALS_ENABLED` is not set to `false`.

### Viewing Reports

- Sign in as an admin with MFA
- Open `/admin/performance`
- Use the window and release filters to inspect p75 trends, worst routes, device splits, and recent build comparisons

### Event Schema

Each stored event includes:

- metric name, value, delta, id, and rating
- route key, normalized path, and derived page type
- capture timestamp plus release id and environment
- device class, viewport bucket, connection type, and `saveData`
- referrer category, navigation type, and back/forward-cache restore flag

The payload intentionally excludes personal data, raw query strings, emails, and other user-identifying fields.

### Extending Later

- Add more route-group rules in [`src/lib/performance/context.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/performance/context.ts) if the router expands
- Swap the transport endpoint in [`src/lib/performance/config.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/src/lib/performance/config.ts) if reporting moves away from Supabase
- Extend the SQL RPCs if you need new cuts such as country, experiment cohort, or page-template-level rollups

## Current Gaps

These are the main areas to be aware of before calling the application fully production-complete from a commerce perspective:

- Public storefront products are hard-coded in the frontend rather than sourced from Supabase or an API.
- Checkout uses local state and simulated payment processing.
- There is no backend order submission, inventory reservation, payment capture, or webhook handling in this repository.
- Discount code handling is present in the UI but not connected to a pricing service.

The admin console and reminders flow are already backed by Supabase; the commerce transaction path is the remaining major systems gap.

## Recommended Next Steps

- Move storefront catalog data onto the same source of truth as admin-managed products.
- Replace simulated checkout with a real payment and order pipeline.
- Add CI enforcement for `lint`, `build`, and Playwright suites.
- Add observability for auth failures, Supabase query failures, and frontend runtime exceptions.
- Document release and rollback procedures once production hosting is finalized.

## References

- [`package.json`](/Users/abdalbastkhdhir/development/Business Projects/gooj/package.json)
- [`vite.config.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/vite.config.ts)
- [`vercel.json`](/Users/abdalbastkhdhir/development/Business Projects/gooj/vercel.json)
- [`supabase/bootstrap.sql`](/Users/abdalbastkhdhir/development/Business Projects/gooj/supabase/bootstrap.sql)
- [`playwright.config.ts`](/Users/abdalbastkhdhir/development/Business Projects/gooj/playwright.config.ts)
