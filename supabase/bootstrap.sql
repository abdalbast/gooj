create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

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

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipient_name text not null check (char_length(recipient_name) between 1 and 120),
  reminder_date date not null,
  occasion text not null check (char_length(occasion) between 1 and 60),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price_pence integer not null check (price_pence >= 0),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_label text not null,
  promo_type text not null,
  expires_at date not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.lookup_active_promotion(code_input text)
returns table (
  code text,
  discount_label text,
  promo_type text,
  expires_at date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    promotion.code,
    promotion.discount_label,
    promotion.promo_type,
    promotion.expires_at
  from public.admin_promotions promotion
  where promotion.active = true
    and promotion.expires_at >= current_date
    and promotion.code = upper(trim(code_input))
  limit 1;
$$;

revoke execute on function public.lookup_active_promotion(text) from public;
grant execute on function public.lookup_active_promotion(text) to anon;
grant execute on function public.lookup_active_promotion(text) to authenticated;

create table if not exists public.admin_content_blocks (
  id uuid primary key default gen_random_uuid(),
  section text not null unique,
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  orders_count integer not null default 0 check (orders_count >= 0),
  total_spent_pence integer not null default 0 check (total_spent_pence >= 0),
  last_order_at date,
  date_joined date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.admin_customers (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  items text not null,
  total_pence integer not null check (total_pence >= 0),
  status text not null check (status in ('Processing', 'Shipped', 'Delivered')),
  personalised boolean not null default false,
  order_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);
create index if not exists reminders_reminder_date_idx on public.reminders (reminder_date);
create index if not exists admin_orders_customer_id_idx on public.admin_orders (customer_id);
create index if not exists admin_orders_order_date_idx on public.admin_orders (order_date desc);

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
before update on public.reminders
for each row
execute function public.set_updated_at();

drop trigger if exists admin_products_set_updated_at on public.admin_products;
create trigger admin_products_set_updated_at
before update on public.admin_products
for each row
execute function public.set_updated_at();

drop trigger if exists admin_promotions_set_updated_at on public.admin_promotions;
create trigger admin_promotions_set_updated_at
before update on public.admin_promotions
for each row
execute function public.set_updated_at();

drop trigger if exists admin_content_blocks_set_updated_at on public.admin_content_blocks;
create trigger admin_content_blocks_set_updated_at
before update on public.admin_content_blocks
for each row
execute function public.set_updated_at();

drop trigger if exists admin_customers_set_updated_at on public.admin_customers;
create trigger admin_customers_set_updated_at
before update on public.admin_customers
for each row
execute function public.set_updated_at();

drop trigger if exists admin_orders_set_updated_at on public.admin_orders;
create trigger admin_orders_set_updated_at
before update on public.admin_orders
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.reminders enable row level security;
alter table public.admin_products enable row level security;
alter table public.admin_promotions enable row level security;
alter table public.admin_content_blocks enable row level security;
alter table public.admin_customers enable row level security;
alter table public.admin_orders enable row level security;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "reminders_select_self" on public.reminders;
create policy "reminders_select_self"
on public.reminders
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "reminders_insert_self" on public.reminders;
create policy "reminders_insert_self"
on public.reminders
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "reminders_update_self" on public.reminders;
create policy "reminders_update_self"
on public.reminders
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "reminders_delete_self" on public.reminders;
create policy "reminders_delete_self"
on public.reminders
for delete
to authenticated
using (user_id = auth.uid());

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

insert into public.admin_products (
  id,
  name,
  category,
  price_pence,
  description
)
values
  ('00000000-0000-0000-0000-000000000101', 'The Birthday Box', 'Gift Boxes', 6500, 'A curated box of birthday treats'),
  ('00000000-0000-0000-0000-000000000102', 'The Anniversary Box', 'Gift Boxes', 8500, 'Romantic indulgences for milestones'),
  ('00000000-0000-0000-0000-000000000103', 'The Mum Box', 'Gift Boxes', 5500, 'Pampering essentials for mum'),
  ('00000000-0000-0000-0000-000000000104', 'The Just Because Box', 'Gift Boxes', 4500, 'No occasion needed'),
  ('00000000-0000-0000-0000-000000000105', 'The Luxury Box', 'Luxury Boxes', 12000, 'Premium indulgence'),
  ('00000000-0000-0000-0000-000000000106', 'The Partner Box', 'Gift Boxes', 7500, 'For the woman in your life')
on conflict (id) do nothing;

insert into public.admin_promotions (
  id,
  code,
  discount_label,
  promo_type,
  expires_at,
  active
)
values
  ('00000000-0000-0000-0000-000000000201', 'GOOJIT20', '20%', 'Percentage', '2026-04-30', true),
  ('00000000-0000-0000-0000-000000000202', 'FREEDELIVERY', 'Free Delivery', 'Shipping', '2026-06-30', true),
  ('00000000-0000-0000-0000-000000000203', 'SPRING10', '£10 off', 'Fixed', '2026-03-31', false),
  ('00000000-0000-0000-0000-000000000204', 'WELCOME15', '15%', 'Percentage', '2026-12-31', true)
on conflict (id) do nothing;

insert into public.admin_content_blocks (
  id,
  section,
  title,
  body,
  sort_order
)
values
  ('00000000-0000-0000-0000-000000000301', 'Hero', 'Gooj It!', 'Thoughtful Made Easy. Curated gift boxes for every occasion.', 1),
  ('00000000-0000-0000-0000-000000000302', 'About Section', 'Born From a Simple Idea', 'Men want to give thoughtful gifts but do not always know where to start. GOOJ takes the guesswork out of gifting.', 2),
  ('00000000-0000-0000-0000-000000000303', 'Feature 1', 'Curated with Care', 'Every box is hand-selected to balance keepsake items with luxurious consumables.', 3),
  ('00000000-0000-0000-0000-000000000304', 'Feature 2', 'The Unboxing Experience', 'Premium packaging that makes the moment of opening as special as the gift itself.', 4),
  ('00000000-0000-0000-0000-000000000305', 'CTA', 'Never Miss a Moment', 'Set up date reminders and we will make sure you are always the thoughtful one.', 5)
on conflict (id) do nothing;

insert into public.admin_customers (
  id,
  full_name,
  email,
  orders_count,
  total_spent_pence,
  last_order_at,
  date_joined
)
values
  ('00000000-0000-0000-0000-000000000401', 'James Wilson', 'james.w@email.com', 5, 38500, '2026-03-19', '2025-10-01'),
  ('00000000-0000-0000-0000-000000000402', 'Tom Henderson', 'tom.h@email.com', 3, 27000, '2026-03-19', '2025-11-01'),
  ('00000000-0000-0000-0000-000000000403', 'Chris Mitchell', 'chris.m@email.com', 2, 15000, '2026-03-18', '2025-12-01'),
  ('00000000-0000-0000-0000-000000000404', 'Dan Roberts', 'dan.r@email.com', 4, 23000, '2026-03-18', '2025-09-01'),
  ('00000000-0000-0000-0000-000000000405', 'Alex Palmer', 'alex.p@email.com', 1, 7500, '2026-03-17', '2026-03-01'),
  ('00000000-0000-0000-0000-000000000406', 'Sam Turner', 'sam.t@email.com', 6, 42000, '2026-03-17', '2025-08-01')
on conflict (id) do nothing;

insert into public.admin_orders (
  id,
  order_number,
  customer_id,
  customer_name,
  customer_email,
  items,
  total_pence,
  status,
  personalised,
  order_date
)
values
  ('00000000-0000-0000-0000-000000000501', 'GOOJ-4821', '00000000-0000-0000-0000-000000000401', 'James Wilson', 'james.w@email.com', 'The Birthday Box', 6500, 'Shipped', true, '2026-03-19'),
  ('00000000-0000-0000-0000-000000000502', 'GOOJ-4820', '00000000-0000-0000-0000-000000000402', 'Tom Henderson', 'tom.h@email.com', 'The Luxury Box', 12000, 'Processing', true, '2026-03-19'),
  ('00000000-0000-0000-0000-000000000503', 'GOOJ-4819', '00000000-0000-0000-0000-000000000403', 'Chris Mitchell', 'chris.m@email.com', 'The Anniversary Box', 8500, 'Delivered', false, '2026-03-18'),
  ('00000000-0000-0000-0000-000000000504', 'GOOJ-4818', '00000000-0000-0000-0000-000000000404', 'Dan Roberts', 'dan.r@email.com', 'The Just Because Box', 4500, 'Shipped', true, '2026-03-18'),
  ('00000000-0000-0000-0000-000000000505', 'GOOJ-4817', '00000000-0000-0000-0000-000000000405', 'Alex Palmer', 'alex.p@email.com', 'The Partner Box', 7500, 'Delivered', false, '2026-03-17'),
  ('00000000-0000-0000-0000-000000000506', 'GOOJ-4816', '00000000-0000-0000-0000-000000000406', 'Sam Turner', 'sam.t@email.com', 'The Mum Box', 5500, 'Delivered', true, '2026-03-17')
on conflict (id) do nothing;

create table if not exists public.web_vitals_events (
  id bigint generated by default as identity primary key,
  schema_version smallint not null default 1,
  metric_name text not null check (metric_name in ('CLS', 'FCP', 'INP', 'LCP', 'TTFB')),
  metric_id text not null,
  metric_value double precision not null check (metric_value >= 0),
  metric_delta double precision not null check (metric_delta >= 0),
  rating text not null check (rating in ('good', 'needs-improvement', 'poor')),
  route_key text not null,
  route_path text not null,
  page_type text not null,
  captured_at timestamptz not null,
  received_at timestamptz not null default timezone('utc', now()),
  app_version text not null,
  environment text not null,
  device_class text not null,
  viewport_bucket text not null,
  network_type text,
  save_data boolean,
  referrer_category text not null,
  navigation_type text not null,
  was_restored_from_bfcache boolean not null default false,
  sample_rate double precision not null default 1 check (sample_rate > 0 and sample_rate <= 1),
  constraint web_vitals_events_metric_id_key unique (metric_name, metric_id)
);

create index if not exists web_vitals_events_received_at_idx
  on public.web_vitals_events (received_at desc);

create index if not exists web_vitals_events_metric_received_at_idx
  on public.web_vitals_events (metric_name, received_at desc);

create index if not exists web_vitals_events_route_metric_received_at_idx
  on public.web_vitals_events (route_key, metric_name, received_at desc);

create index if not exists web_vitals_events_app_version_received_at_idx
  on public.web_vitals_events (app_version, received_at desc);

create or replace function public.classify_web_vital(
  metric_name_input text,
  metric_value_input double precision
)
returns text
language sql
immutable
set search_path = public
as $$
  select case metric_name_input
    when 'LCP' then
      case
        when metric_value_input <= 2500 then 'good'
        when metric_value_input <= 4000 then 'needs-improvement'
        else 'poor'
      end
    when 'INP' then
      case
        when metric_value_input <= 200 then 'good'
        when metric_value_input <= 500 then 'needs-improvement'
        else 'poor'
      end
    when 'CLS' then
      case
        when metric_value_input <= 0.1 then 'good'
        when metric_value_input <= 0.25 then 'needs-improvement'
        else 'poor'
      end
    when 'FCP' then
      case
        when metric_value_input <= 1800 then 'good'
        when metric_value_input <= 3000 then 'needs-improvement'
        else 'poor'
      end
    when 'TTFB' then
      case
        when metric_value_input <= 800 then 'good'
        when metric_value_input <= 1800 then 'needs-improvement'
        else 'poor'
      end
    else 'poor'
  end;
$$;

create or replace function public.get_web_vitals_overview(
  window_days integer default 7,
  environment_filter text default 'production',
  release_filter text default null
)
returns table (
  metric_name text,
  p75_value double precision,
  rating text,
  sample_count bigint,
  good_count bigint,
  needs_improvement_count bigint,
  poor_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select
      event.metric_name,
      event.metric_value,
      event.rating
    from public.web_vitals_events event
    where public.is_admin_aal2(array['admin']::text[])
      and event.received_at >= timezone('utc', now()) - make_interval(days => greatest(window_days, 1))
      and (environment_filter is null or event.environment = environment_filter)
      and (release_filter is null or event.app_version = release_filter)
  ),
  aggregated as (
    select
      scoped.metric_name,
      percentile_cont(0.75) within group (order by scoped.metric_value) as p75_value,
      count(*)::bigint as sample_count,
      count(*) filter (where scoped.rating = 'good')::bigint as good_count,
      count(*) filter (where scoped.rating = 'needs-improvement')::bigint as needs_improvement_count,
      count(*) filter (where scoped.rating = 'poor')::bigint as poor_count
    from scoped
    group by scoped.metric_name
  )
  select
    aggregated.metric_name,
    aggregated.p75_value,
    public.classify_web_vital(aggregated.metric_name, aggregated.p75_value) as rating,
    aggregated.sample_count,
    aggregated.good_count,
    aggregated.needs_improvement_count,
    aggregated.poor_count
  from aggregated
  order by array_position(array['LCP', 'INP', 'CLS', 'FCP', 'TTFB']::text[], aggregated.metric_name);
$$;

create or replace function public.get_web_vitals_route_summary(
  window_days integer default 7,
  environment_filter text default 'production',
  release_filter text default null,
  limit_count integer default 5
)
returns table (
  metric_name text,
  route_key text,
  page_type text,
  p75_value double precision,
  rating text,
  sample_count bigint,
  poor_count bigint,
  poor_rate double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select
      event.metric_name,
      event.route_key,
      event.page_type,
      event.metric_value,
      event.rating
    from public.web_vitals_events event
    where public.is_admin_aal2(array['admin']::text[])
      and event.received_at >= timezone('utc', now()) - make_interval(days => greatest(window_days, 1))
      and (environment_filter is null or event.environment = environment_filter)
      and (release_filter is null or event.app_version = release_filter)
  ),
  aggregated as (
    select
      scoped.metric_name,
      scoped.route_key,
      min(scoped.page_type) as page_type,
      percentile_cont(0.75) within group (order by scoped.metric_value) as p75_value,
      count(*)::bigint as sample_count,
      count(*) filter (where scoped.rating = 'poor')::bigint as poor_count
    from scoped
    group by scoped.metric_name, scoped.route_key
    having count(*) >= 5
  ),
  ranked as (
    select
      aggregated.*,
      row_number() over (
        partition by aggregated.metric_name
        order by aggregated.p75_value desc, aggregated.sample_count desc, aggregated.route_key
      ) as route_rank
    from aggregated
  )
  select
    ranked.metric_name,
    ranked.route_key,
    ranked.page_type,
    ranked.p75_value,
    public.classify_web_vital(ranked.metric_name, ranked.p75_value) as rating,
    ranked.sample_count,
    ranked.poor_count,
    round(((ranked.poor_count::numeric / nullif(ranked.sample_count, 0)::numeric) * 100), 1)::double precision as poor_rate
  from ranked
  where ranked.route_rank <= greatest(limit_count, 1)
  order by array_position(array['LCP', 'INP', 'CLS', 'FCP', 'TTFB']::text[], ranked.metric_name), ranked.route_rank;
$$;

create or replace function public.get_web_vitals_daily_trends(
  window_days integer default 14,
  environment_filter text default 'production',
  release_filter text default null
)
returns table (
  bucket_date date,
  metric_name text,
  p75_value double precision,
  rating text,
  sample_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select
      timezone('utc', event.received_at)::date as bucket_date,
      event.metric_name,
      event.metric_value
    from public.web_vitals_events event
    where public.is_admin_aal2(array['admin']::text[])
      and event.received_at >= timezone('utc', now()) - make_interval(days => greatest(window_days, 1))
      and (environment_filter is null or event.environment = environment_filter)
      and (release_filter is null or event.app_version = release_filter)
  ),
  aggregated as (
    select
      scoped.bucket_date,
      scoped.metric_name,
      percentile_cont(0.75) within group (order by scoped.metric_value) as p75_value,
      count(*)::bigint as sample_count
    from scoped
    group by scoped.bucket_date, scoped.metric_name
  )
  select
    aggregated.bucket_date,
    aggregated.metric_name,
    aggregated.p75_value,
    public.classify_web_vital(aggregated.metric_name, aggregated.p75_value) as rating,
    aggregated.sample_count
  from aggregated
  order by aggregated.bucket_date asc, array_position(array['LCP', 'INP', 'CLS', 'FCP', 'TTFB']::text[], aggregated.metric_name);
$$;

create or replace function public.get_web_vitals_device_summary(
  window_days integer default 14,
  environment_filter text default 'production',
  release_filter text default null
)
returns table (
  metric_name text,
  device_class text,
  p75_value double precision,
  rating text,
  sample_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select
      event.metric_name,
      event.device_class,
      event.metric_value
    from public.web_vitals_events event
    where public.is_admin_aal2(array['admin']::text[])
      and event.received_at >= timezone('utc', now()) - make_interval(days => greatest(window_days, 1))
      and (environment_filter is null or event.environment = environment_filter)
      and (release_filter is null or event.app_version = release_filter)
  ),
  aggregated as (
    select
      scoped.metric_name,
      scoped.device_class,
      percentile_cont(0.75) within group (order by scoped.metric_value) as p75_value,
      count(*)::bigint as sample_count
    from scoped
    group by scoped.metric_name, scoped.device_class
  )
  select
    aggregated.metric_name,
    aggregated.device_class,
    aggregated.p75_value,
    public.classify_web_vital(aggregated.metric_name, aggregated.p75_value) as rating,
    aggregated.sample_count
  from aggregated
  order by array_position(array['LCP', 'INP', 'CLS', 'FCP', 'TTFB']::text[], aggregated.metric_name), aggregated.device_class;
$$;

create or replace function public.get_web_vitals_release_summary(
  window_days integer default 30,
  environment_filter text default 'production',
  release_limit integer default 5
)
returns table (
  app_version text,
  metric_name text,
  p75_value double precision,
  rating text,
  sample_count bigint,
  last_received_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with recent_releases as (
    select
      event.app_version,
      max(event.received_at) as last_received_at
    from public.web_vitals_events event
    where public.is_admin_aal2(array['admin']::text[])
      and event.received_at >= timezone('utc', now()) - make_interval(days => greatest(window_days, 1))
      and (environment_filter is null or event.environment = environment_filter)
    group by event.app_version
    order by last_received_at desc
    limit greatest(release_limit, 1)
  ),
  scoped as (
    select
      event.app_version,
      event.metric_name,
      event.metric_value,
      release.last_received_at
    from public.web_vitals_events event
    join recent_releases release on release.app_version = event.app_version
    where (environment_filter is null or event.environment = environment_filter)
  ),
  aggregated as (
    select
      scoped.app_version,
      scoped.metric_name,
      scoped.last_received_at,
      percentile_cont(0.75) within group (order by scoped.metric_value) as p75_value,
      count(*)::bigint as sample_count
    from scoped
    group by scoped.app_version, scoped.metric_name, scoped.last_received_at
  )
  select
    aggregated.app_version,
    aggregated.metric_name,
    aggregated.p75_value,
    public.classify_web_vital(aggregated.metric_name, aggregated.p75_value) as rating,
    aggregated.sample_count,
    aggregated.last_received_at
  from aggregated
  order by aggregated.last_received_at desc, array_position(array['LCP', 'INP', 'CLS', 'FCP', 'TTFB']::text[], aggregated.metric_name);
$$;

alter table public.web_vitals_events enable row level security;

drop policy if exists "web_vitals_events_admin_read" on public.web_vitals_events;
create policy "web_vitals_events_admin_read"
on public.web_vitals_events
for select
to authenticated
using (public.is_admin_aal2(array['admin']::text[]));

grant select on public.web_vitals_events to authenticated;

revoke execute on function public.get_web_vitals_overview(integer, text, text) from public;
revoke execute on function public.get_web_vitals_route_summary(integer, text, text, integer) from public;
revoke execute on function public.get_web_vitals_daily_trends(integer, text, text) from public;
revoke execute on function public.get_web_vitals_device_summary(integer, text, text) from public;
revoke execute on function public.get_web_vitals_release_summary(integer, text, integer) from public;

grant execute on function public.get_web_vitals_overview(integer, text, text) to authenticated;
grant execute on function public.get_web_vitals_route_summary(integer, text, text, integer) to authenticated;
grant execute on function public.get_web_vitals_daily_trends(integer, text, text) to authenticated;
grant execute on function public.get_web_vitals_device_summary(integer, text, text) to authenticated;
grant execute on function public.get_web_vitals_release_summary(integer, text, integer) to authenticated;

-- Grant admin access after creating an auth user in Supabase Auth.
-- Replace the UUID and email below with a real auth.users id:
--
-- insert into public.admin_users (user_id, email, full_name, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Store Admin', 'admin')
-- on conflict (user_id) do update
--   set email = excluded.email,
--       full_name = excluded.full_name,
--       role = excluded.role,
--       active = true;
