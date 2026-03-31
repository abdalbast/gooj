import { getSupabaseClient } from "@/lib/supabase";
import { mapAdminPromotion } from "./shared";
import type { AdminPromotionInput } from "./types";

export const listAdminPromotions = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_promotions")
    .select("*")
    .order("expires_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapAdminPromotion);
};

export const saveAdminPromotion = async (
  promotion: AdminPromotionInput,
  promotionId?: string,
) => {
  const client = getSupabaseClient();
  const payload = {
    code: promotion.code.trim().toUpperCase(),
    discount_label: promotion.discount.trim(),
    expires_at: promotion.expiresAt,
    promo_type: promotion.type.trim(),
  };

  const query = promotionId
    ? client.from("admin_promotions").update(payload).eq("id", promotionId).select("*").single()
    : client
        .from("admin_promotions")
        .insert({
          ...payload,
          active: true,
        })
        .select("*")
        .single();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapAdminPromotion(data);
};

export const setAdminPromotionActive = async (promotionId: string, active: boolean) => {
  const { data, error } = await getSupabaseClient()
    .from("admin_promotions")
    .update({ active })
    .eq("id", promotionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAdminPromotion(data);
};

export const deleteAdminPromotion = async (promotionId: string) => {
  const { error } = await getSupabaseClient()
    .from("admin_promotions")
    .delete()
    .eq("id", promotionId);

  if (error) {
    throw error;
  }
};
