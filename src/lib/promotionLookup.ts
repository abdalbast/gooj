import { maybeGetSupabaseClient } from "./supabase";
import {
  isPromotionExpired,
  normalizePromotionCode,
  type PromotionRecord,
} from "./promotions";

interface PromotionLookupRow {
  code: string;
  discount_label: string;
  expires_at: string;
  promo_type: string;
}

export const lookupActivePromotion = async (code: string): Promise<PromotionRecord | null> => {
  const normalizedCode = normalizePromotionCode(code);

  if (!normalizedCode) {
    return null;
  }

  const client = maybeGetSupabaseClient();

  if (!client) {
    throw new Error("Promotions are unavailable until Supabase is configured.");
  }

  const { data, error } = await client.rpc("lookup_active_promotion", {
    code_input: normalizedCode,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? (data[0] as PromotionLookupRow | undefined) : undefined;

  if (!row) {
    return null;
  }

  const promotion: PromotionRecord = {
    code: row.code,
    discountLabel: row.discount_label,
    expiresAt: row.expires_at,
    promoType: row.promo_type,
  };

  return isPromotionExpired(promotion.expiresAt) ? null : promotion;
};
