alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('admin', 'catalog_manager', 'content_manager', 'support_viewer'))
  not valid;

create or replace function public.has_admin_roles(
  required_roles text[],
  check_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = coalesce(check_user_id, auth.uid())
      and admin_user.active = true
      and admin_user.role = any(required_roles)
  );
$$;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_admin_roles(
    array['admin', 'catalog_manager', 'content_manager', 'support_viewer']::text[],
    check_user_id
  );
$$;

create or replace function public.is_admin_aal2(
  required_roles text[],
  check_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_admin_roles(required_roles, check_user_id)
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

revoke execute on function public.has_admin_roles(text[], uuid) from public;
revoke execute on function public.is_admin(uuid) from public;
revoke execute on function public.is_admin_aal2(text[], uuid) from public;

grant execute on function public.has_admin_roles(text[], uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin_aal2(text[], uuid) to authenticated;

drop policy if exists "admin_products_admin_read" on public.admin_products;
create policy "admin_products_admin_read"
on public.admin_products
for select
to authenticated
using (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_products_admin_insert" on public.admin_products;
create policy "admin_products_admin_insert"
on public.admin_products
for insert
to authenticated
with check (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_products_admin_update" on public.admin_products;
create policy "admin_products_admin_update"
on public.admin_products
for update
to authenticated
using (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]))
with check (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_products_admin_delete" on public.admin_products;
create policy "admin_products_admin_delete"
on public.admin_products
for delete
to authenticated
using (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_promotions_admin_read" on public.admin_promotions;
create policy "admin_promotions_admin_read"
on public.admin_promotions
for select
to authenticated
using (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_promotions_admin_insert" on public.admin_promotions;
create policy "admin_promotions_admin_insert"
on public.admin_promotions
for insert
to authenticated
with check (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_promotions_admin_update" on public.admin_promotions;
create policy "admin_promotions_admin_update"
on public.admin_promotions
for update
to authenticated
using (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]))
with check (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_promotions_admin_delete" on public.admin_promotions;
create policy "admin_promotions_admin_delete"
on public.admin_promotions
for delete
to authenticated
using (public.is_admin_aal2(array['admin', 'catalog_manager']::text[]));

drop policy if exists "admin_content_blocks_admin_read" on public.admin_content_blocks;
create policy "admin_content_blocks_admin_read"
on public.admin_content_blocks
for select
to authenticated
using (public.is_admin_aal2(array['admin', 'content_manager']::text[]));

drop policy if exists "admin_content_blocks_admin_update" on public.admin_content_blocks;
create policy "admin_content_blocks_admin_update"
on public.admin_content_blocks
for update
to authenticated
using (public.is_admin_aal2(array['admin', 'content_manager']::text[]))
with check (public.is_admin_aal2(array['admin', 'content_manager']::text[]));

drop policy if exists "admin_customers_admin_read" on public.admin_customers;
create policy "admin_customers_admin_read"
on public.admin_customers
for select
to authenticated
using (public.is_admin_aal2(array['admin', 'support_viewer']::text[]));

drop policy if exists "admin_orders_admin_read" on public.admin_orders;
create policy "admin_orders_admin_read"
on public.admin_orders
for select
to authenticated
using (public.is_admin_aal2(array['admin', 'support_viewer']::text[]));
