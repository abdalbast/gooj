import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPromotionBreakdown,
  isPromotionExpired,
  normalizePromotionCode,
  parsePromotionDiscountValue,
} from "@/lib/promotions";
import { lookupActivePromotion } from "@/lib/promotionLookup";
import { maybeGetSupabaseClient } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  maybeGetSupabaseClient: vi.fn(),
}));

describe("promotion helpers", () => {
  beforeEach(() => {
    vi.mocked(maybeGetSupabaseClient).mockReset();
  });

  it("normalizes promo codes and parses supported labels", () => {
    expect(normalizePromotionCode(" goojit20 ")).toBe("GOOJIT20");
    expect(
      parsePromotionDiscountValue({
        code: "GOOJIT20",
        discountLabel: "20%",
        expiresAt: "2026-12-31",
        promoType: "Percentage",
      }),
    ).toBe(20);
    expect(
      parsePromotionDiscountValue({
        code: "SPRING10",
        discountLabel: "£10 off",
        expiresAt: "2026-12-31",
        promoType: "Fixed",
      }),
    ).toBe(10);
  });

  it("handles percentage, fixed, and shipping promotions", () => {
    expect(
      getPromotionBreakdown({
        promotion: {
          code: "GOOJIT20",
          discountLabel: "20%",
          expiresAt: "2026-12-31",
          promoType: "Percentage",
        },
        shippingPrice: 15,
        subtotal: 100,
      }),
    ).toMatchObject({
      merchandiseDiscount: 20,
      shippingDiscount: 0,
      shippingPrice: 15,
      totalDiscount: 20,
    });

    expect(
      getPromotionBreakdown({
        promotion: {
          code: "SPRING10",
          discountLabel: "£10 off",
          expiresAt: "2026-12-31",
          promoType: "Fixed",
        },
        shippingPrice: 15,
        subtotal: 100,
      }),
    ).toMatchObject({
      merchandiseDiscount: 10,
      shippingDiscount: 0,
      shippingPrice: 15,
      totalDiscount: 10,
    });

    expect(
      getPromotionBreakdown({
        promotion: {
          code: "FREEDELIVERY",
          discountLabel: "Free Delivery",
          expiresAt: "2026-12-31",
          promoType: "Shipping",
        },
        shippingPrice: 15,
        subtotal: 100,
      }),
    ).toMatchObject({
      merchandiseDiscount: 0,
      shippingDiscount: 15,
      shippingPrice: 0,
      totalDiscount: 15,
    });
  });

  it("treats expired promotions as invalid", () => {
    expect(isPromotionExpired("2024-01-01", new Date("2026-03-30T12:00:00.000Z"))).toBe(true);
    expect(isPromotionExpired("2026-12-31", new Date("2026-03-30T12:00:00.000Z"))).toBe(false);
  });

  it("looks up promotions through the public Supabase RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          code: "GOOJIT20",
          discount_label: "20%",
          expires_at: "2026-12-31",
          promo_type: "Percentage",
        },
      ],
      error: null,
    });

    vi.mocked(maybeGetSupabaseClient).mockReturnValue({
      rpc,
    } as never);

    await expect(lookupActivePromotion("goojit20")).resolves.toEqual({
      code: "GOOJIT20",
      discountLabel: "20%",
      expiresAt: "2026-12-31",
      promoType: "Percentage",
    });
    expect(rpc).toHaveBeenCalledWith("lookup_active_promotion", {
      code_input: "GOOJIT20",
    });
  });
});
