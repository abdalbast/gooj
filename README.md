# GOOJ

GOOJ is a Vite + React storefront for curated gift boxes, with customer-facing shopping flows, reminder tools, and a local admin UI.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Playwright

## Local Development

Requirements:

- Node.js 20+
- npm

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

The app runs locally on `http://127.0.0.1:8080`.

## Build And Test

```sh
npm run build
npm run test:e2e
npm run test:perf
```

If Playwright browsers are not installed yet, run:

```sh
npm run test:e2e:install
```

## Project Structure

- `src/` application code
- `public/` static assets
- `tests/e2e/` Playwright coverage
- `scripts/` local utility scripts

## Deployment

This project is prepared for deployment on Vercel. Deployment-specific configuration lives in `vercel.json`.

## Supabase Configuration

Copy the example environment file and fill in your own project values:

```sh
cp .env.example .env.local
```

Required variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

These values should come from your Supabase project's Connect dialog or API settings.

### Bootstrap The Database

Run the SQL bootstrap in your Supabase SQL editor:

```sh
open supabase/bootstrap.sql
```

That script creates:

- Supabase-backed `reminders`
- Supabase auth-aware `admin_users`
- Admin data tables for products, promotions, content, customers, and orders
- RLS policies for customer reminders and admin-only reads/writes
- Sample admin data so the dashboard is populated immediately

### Auth Flow

- Customer reminders use Supabase email magic links.
- `/admin` also uses Supabase magic links, but access is allowed only for users present in `public.admin_users`.
- After you create an admin user in Supabase Auth, insert that user into `public.admin_users` using the example SQL at the bottom of `supabase/bootstrap.sql`.
- Make sure your Supabase Auth URL configuration allows redirects back to your local app and production domain.

## Vercel Environment Variables

Set the same frontend variables in your Vercel project before production deployments:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

If you are using the Vercel CLI, you can pull the configured values back into local development with:

```sh
vercel env pull .env.local
```
