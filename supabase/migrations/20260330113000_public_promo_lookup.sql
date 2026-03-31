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
