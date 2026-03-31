# Changelog

All notable changes to this project will be documented in this file.

## 2026-03-31

### Added
- Introduced a cart state layer with shared cart pricing, shipping, and promotion logic across the storefront and checkout flow.
- Added a modular checkout experience with customer, address, shipping, payment, and order summary sections.
- Added customer authentication flows for reminders plus admin MFA and admin-access handling utilities.
- Added a performance reporting pipeline with web vitals collection, transport helpers, dashboard utilities, and an admin performance screen.
- Added reusable admin UI primitives, virtualized admin tables, entity dialog helpers, and expanded admin pages for products, promotions, content, orders, customers, and performance.
- Added responsive image infrastructure, new AVIF image assets, and refreshed storefront media for hero and collection content.
- Added Vitest unit and integration coverage for cart behavior, promotions, reminders, performance reporting, admin table virtualization, lazy UI, overlays, responsive images, checkout promo handling, and customer auth flows.
- Added deployment header coverage and refreshed Playwright end-to-end checks for functional, mobile, performance, and bundle-budget behavior.
- Added `security_best_practices_report.md` to document the current security audit findings and remediation guidance.

### Changed
- Reworked routing to lazy-load storefront, reminders, auth-protected, and admin surfaces behind shared layout guards.
- Updated the storefront navigation, search, favorites, bag, product gallery, product info, editorial sections, and category grid to use the new navigation data and overlay behavior.
- Refined reminder management to support authenticated create, edit, delete, and upcoming-date sorting against Supabase-backed data.
- Expanded Supabase data access, generated types, bootstrap SQL, and migrations to support hardened admin access, public promotion lookup, and web-vitals reporting.
- Updated project tooling and dependencies to support Vitest, Testing Library, `web-vitals`, and the broader admin and checkout feature set.
- Revised the README and environment example to reflect the current Supabase-backed setup and local configuration.

### Security
- Tightened admin origin and permission handling in the frontend and documented remaining risks in the security audit report.
- Added database migrations for admin access hardening and broader observability support.

### Verification
- `npm run lint`
- `npm run test:app`
- `npm run build`
