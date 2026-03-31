# Security Audit Report

## Executive Summary

This codebase is a browser-only Vite/React SPA that talks directly to Supabase using the publishable key. There are no app-owned backend/API routes in the repository, so the real security boundary is Supabase Auth, Supabase RLS, and the Vercel edge configuration.

The strongest issues are around privileged access: admin access is protected only by single-factor email magic links, and the configured redirect allowlist is broad enough to trust wildcard Vercel preview domains. A compromised or malicious preview deployment could capture an admin session and then use the same browser-accessible Supabase client to read and modify all `admin_*` tables. Runtime security headers are also weak: as verified on March 27, 2026 against `https://gooj.vercel.app`, the site is missing CSP, clickjacking protection, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.

The database RLS posture is better than the rest of the app: `reminders` is isolated per user, admin tables have RLS enabled, and I did not find raw SQL, command execution, or server-owned secret keys committed in the repo. The remaining meaningful risks are authorization model weakness, auth abuse surface, missing browser hardening, and developer-tool dependency advisories.

## Findings

### Finding 1
- Severity: Critical
- Title: Wildcard auth redirect allowlist trusts preview domains that can capture admin sessions
- Location:
  - `supabase/config.toml:148-150`
  - `src/contexts/AuthContext.tsx:137-142`
  - `src/pages/admin/AdminLayout.tsx:82-125`
  - `supabase/migrations/20260326183000_bootstrap.sql:192-277`
- Evidence:
  - `site_url = "https://gooj.vercel.app"`
  - `additional_redirect_urls = ["http://127.0.0.1:8080/**", ..., "https://gooj.vercel.app/**", "https://*-abdalbast-khdhirs-projects.vercel.app/**"]`
  - `const emailRedirectTo = new URL(redirectPath, window.location.origin).toString();`
  - Admin table access is granted to any authenticated session where `public.is_admin()` returns true.
- Impact:
  - Any trusted preview domain can receive magic-link completions for the production auth project. If a preview build is compromised, malicious, or easier to deploy than production, it can steal the resulting Supabase session and use it to read and modify `admin_products`, `admin_promotions`, `admin_content_blocks`, `admin_customers`, and `admin_orders`.
- Exploit example:
  - An attacker gets a preview deployment under the allowed wildcard, adds JavaScript that reads the Supabase session from browser storage after login, and sends it off-site.
  - An admin is sent to that preview’s `/admin` page and requests a magic link.
  - Supabase redirects the completed login back to the trusted preview domain, where the attacker exfiltrates the token and then calls the Supabase REST API as that admin.
- Fix:
  - Remove the wildcard preview domain from `additional_redirect_urls`.
  - Allow only exact production URLs plus exact local development URLs.
  - If previews are required, use a separate Supabase project for previews or gate previews behind strong access control and a separate auth audience.
  - Code-level change: reject admin sign-in on non-production origins, for example:

```ts
const allowedAdminOrigins = new Set(["https://gooj.vercel.app", "http://127.0.0.1:8080"]);
if (!allowedAdminOrigins.has(window.location.origin)) {
  return { error: new Error("Admin sign-in is disabled on this origin.") };
}
```

### Finding 2
- Severity: High
- Title: Admin authorization is single-factor only; no MFA or step-up requirement is enforced for privileged actions
- Location:
  - `src/contexts/AuthContext.tsx:127-143`
  - `src/pages/admin/AdminLayout.tsx:82-125`
  - `supabase/migrations/20260326183000_bootstrap.sql:22-35`
  - `supabase/migrations/20260326183000_bootstrap.sql:192-277`
  - `supabase/config.toml:274-281`
- Evidence:
  - Admin login is just `client.auth.signInWithOtp({ email, options: { emailRedirectTo } })`.
  - `public.is_admin()` checks only whether the current `auth.uid()` is in `public.admin_users` and active.
  - Admin RLS policies use only `public.is_admin()`.
  - MFA capability is enabled in config, but nothing in the app or policies requires `aal2`.
- Impact:
  - Anyone who compromises an admin mailbox, forwarding rule, or email session gets full admin database access. There is no second factor, no step-up check, and no reduced-scope admin session.
- Exploit example:
  - An attacker gains temporary access to `admin@example.com` email, uses the `/admin` flow once, clicks the magic link, and immediately gets full read access to customer emails/orders and write access to products/promotions/content.
- Fix:
  - Require MFA for admin sessions and enforce it in database policies, not only in UI.
  - Use `auth.jwt()` / `aal` checks in RLS, for example:

```sql
create or replace function public.is_admin_aal2()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

drop policy if exists "admin_products_admin_read" on public.admin_products;
create policy "admin_products_admin_read"
on public.admin_products
for select
to authenticated
using (public.is_admin_aal2());
```

### Finding 3
- Severity: High
- Title: The `role` column is not part of authorization; any active admin row gets full super-admin rights
- Location:
  - `supabase/migrations/20260326183000_bootstrap.sql:13-20`
  - `supabase/migrations/20260326183000_bootstrap.sql:22-35`
  - `supabase/migrations/20260326183000_bootstrap.sql:192-277`
  - `src/contexts/AuthContext.tsx:88-95`
  - `src/pages/admin/AdminLayout.tsx:171-173`
- Evidence:
  - `admin_users.role text not null default 'admin'`
  - `public.is_admin()` ignores `role` and checks only `active = true`.
  - The UI displays `adminMembership?.role`, but no policy differentiates roles.
- Impact:
  - The code suggests there are roles, but they are cosmetic. Any future “support”, “editor”, or “analyst” account inserted into `admin_users` will inherit full write/delete access to every admin table. This is an authorization design flaw, not just a missing UI control.
- Exploit example:
  - Operations inserts a low-privilege user with `role = 'support'` expecting read-only access.
  - That user signs in and can still delete products, deactivate promotions, and read all customer/order data because RLS does not branch on role.
- Fix:
  - Add an allowlisted role check in the function and split policies by capability.
  - Example:

```sql
alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('super_admin', 'content_admin', 'support_readonly'));

create or replace function public.has_admin_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
      and admin_user.active = true
      and admin_user.role = any(required_roles)
  );
$$;
```

### Finding 4
- Severity: Medium
- Title: Browser hardening is missing in deployed responses: no CSP, no clickjacking protection, no `nosniff`, no referrer or permissions policy
- Location:
  - `vercel.json:9-46`
  - `index.html:1-38`
  - Runtime verification on March 27, 2026 using `curl -I https://gooj.vercel.app/` and `curl -I https://gooj.vercel.app/admin`
- Evidence:
  - Repo header config only sets `Cache-Control`.
  - Deployed responses include `strict-transport-security` but do not include `Content-Security-Policy`, `X-Frame-Options`, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`.
- Impact:
  - XSS blast radius is larger than necessary because there is no CSP.
  - The admin UI can be framed and clickjacked because there is no frame protection.
  - The browser is not instructed to disable MIME sniffing or restrict referrer leakage.
- Exploit example:
  - An attacker hosts a page that overlays invisible buttons on top of an iframe to `/admin/promotions` and tricks a logged-in admin into clicking “Delete” or toggling promotion state.
- Fix:
  - Add security headers at the Vercel edge. Example baseline:

```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://mdvejmnfyakfnkfqtqkx.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
  ]
}
```

### Finding 5
- Severity: Medium
- Title: Auth and reminder write surfaces are open to abuse; there is no CAPTCHA, quota, or payload-size enforcement
- Location:
  - `src/components/auth/EmailAuthCard.tsx:26-55`
  - `src/contexts/AuthContext.tsx:127-143`
  - `supabase/config.toml:190-203`
  - `supabase/migrations/20260326183000_bootstrap.sql:37-46`
  - `supabase/migrations/20260326183000_bootstrap.sql:170-190`
- Evidence:
  - The app allows arbitrary email magic-link requests from the browser.
  - CAPTCHA is commented out in Supabase config.
  - `reminders.notes`, `recipient_name`, and `occasion` are unbounded `text` columns with no length checks or per-user quotas.
  - Any confirmed authenticated user can insert unlimited reminders into their own account.
- Impact:
  - Attackers can abuse the auth flow to send unwanted emails and create large numbers of accounts.
  - Authenticated users can bloat storage by inserting large reminder payloads or a very high row count, increasing cost and degrading the product.
- Exploit example:
  - A scripted attacker rotates IPs, requests thousands of magic links to third-party addresses, and then uses confirmed throwaway accounts to write oversized `notes` values into `public.reminders`.
- Fix:
  - Enable Turnstile or hCaptcha on auth entry points.
  - Rate-limit or challenge repeated requests in the UI and/or via edge middleware.
  - Add database constraints, for example:

```sql
alter table public.reminders
  add constraint reminders_recipient_name_len check (char_length(recipient_name) between 1 and 120),
  add constraint reminders_occasion_len check (char_length(occasion) between 1 and 60),
  add constraint reminders_notes_len check (char_length(notes) <= 1000);
```

### Finding 6
- Severity: Low
- Title: Image upload validation is client-side only and can be bypassed or abused for browser-side resource exhaustion
- Location:
  - `src/components/product/GiftPersonalisation.tsx:77-82`
  - `src/components/product/ProductPhotoCropDialog.tsx:169-199`
- Evidence:
  - The only file restriction is `accept="image/jpeg,image/png,image/webp"`.
  - There is no explicit MIME verification, file-size cap, or image-dimension cap before decoding and drawing onto a canvas.
- Impact:
  - A user can select a very large or malformed image and force expensive `image.decode()` / canvas work in the browser. This is not currently a server compromise because the file is never uploaded in this repo, but it is still weak validation and unsafe to copy into a real upload flow.
- Exploit example:
  - A 100 MB image or extremely high-resolution image causes the product page to freeze when the crop dialog opens.
- Fix:
  - Validate `file.type`, `file.size`, and decoded dimensions before processing.
  - Reject unsupported types and cap size aggressively, for example 5 MB and 6000x6000 max.
  - If these files are ever uploaded server-side, repeat validation on the server and strip metadata.

### Finding 7
- Severity: Low
- Title: The repo has known dependency advisories, but they currently sit in the build/lint toolchain rather than shipped runtime code
- Location:
  - `package.json:1-46`
  - `package-lock.json`
  - Verified on March 27, 2026 with `npm audit --json`
- Evidence:
  - `npm audit` reported 15 advisories, including:
    - `picomatch` high severity via Vite/Tailwind dependency paths
    - `eslint` / `minimatch` / `brace-expansion`
    - `yaml`
  - `npm ls` shows the vulnerable packages are coming from dev/build tooling such as `vite`, `tailwindcss`, `eslint`, and `typescript-eslint`.
- Impact:
  - These do not appear to be part of the shipped browser bundle, so this is mainly a developer/CI/preview risk rather than a direct end-user exploit path.
- Exploit example:
  - A malicious PR or crafted file pattern can trigger toolchain ReDoS or parser issues during CI or local development.
- Fix:
  - Upgrade the affected build-tool chain:
    - move `vite` off `8.0.0`
    - update `tailwindcss` to a version pulling fixed `picomatch`
    - update `typescript-eslint`
    - plan the `eslint` major update or pin a fixed transitive graph

### Finding 8
- Severity: Low
- Title: `public.is_admin()` is a `SECURITY DEFINER` function in an exposed schema without an explicit execute restriction
- Location:
  - `supabase/migrations/20260326183000_bootstrap.sql:22-35`
- Evidence:
  - The function is created in `public` and no `REVOKE EXECUTE` / `GRANT EXECUTE` statement follows it.
  - In PostgreSQL, new functions are executable by `PUBLIC` unless privileges are tightened.
- Impact:
  - This is mainly an information-leak/hardening issue. A caller who knows a UUID may be able to test whether that UUID belongs to an active admin via RPC if the function is exposed.
- Exploit example:
  - An authenticated attacker calls the function directly over PostgREST with guessed UUIDs to probe admin membership.
- Fix:
  - Restrict function execution explicitly:

```sql
revoke execute on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;
```

## Top 5 Real-World Attack Scenarios

1. A malicious preview deployment under the allowed wildcard hosts `/admin`, receives a magic-link callback, steals the admin session, and dumps `admin_orders` plus `admin_customers`.
2. A phished or temporarily compromised admin mailbox is enough for a full admin takeover because no MFA or step-up requirement exists anywhere in the policy path.
3. A logged-in admin is clickjacked into deleting products or toggling promotions because the deployed site can be framed and admin actions are one-click browser mutations.
4. A scripted attacker abuses the passwordless auth flow to send large volumes of unwanted login/signup emails and then uses throwaway accounts to bloat the `reminders` table.
5. A supposedly low-privilege “support” user is inserted into `admin_users` and unexpectedly receives full destructive access because `role` is not enforced in any RLS policy.

## Security Hardening Checklist

- Remove wildcard preview domains from Supabase redirect allowlists.
- Use a separate Supabase project or auth audience for preview deployments.
- Require MFA for admin users and enforce `aal2` in RLS.
- Replace `public.is_admin()` with role-aware capability checks.
- Add `frame-ancestors 'none'` / `X-Frame-Options: DENY`.
- Add a CSP that pins `connect-src` to the Supabase origin and limits script/style/font sources.
- Add `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Enable CAPTCHA on auth entry points.
- Add DB constraints for reminder field lengths and apply per-user quotas/rate limits.
- Validate uploaded image type, size, and dimensions before decode/crop.
- Restrict `EXECUTE` on security-definer SQL functions.
- Upgrade vulnerable build-tool dependencies and re-run `npm audit`.
- Add admin audit logging for product/promotion/content changes.
- Keep `.env.local` and `.vercel/` ignored; do not add a service-role key to any `VITE_*` variable.
