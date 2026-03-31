export interface PromotionRecord {
  code: string;
  discountLabel: string;
  expiresAt: string;
  promoType: string;
}

export interface PromotionBreakdown {
  merchandiseDiscount: number;
  shippingDiscount: number;
  shippingPrice: number;
  totalDiscount: number;
}

const parseIsoDateOnly = (value: string) => {
  return new Date(`${value}T00:00:00.000Z`);
};

export const normalizePromotionCode = (value: string) => value.trim().toUpperCase();

export const isPromotionExpired = (expiresAt: string, now = new Date()) => {
  const expiry = parseIsoDateOnly(expiresAt);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return expiry.getTime() < today.getTime();
};

export const parsePromotionDiscountValue = (promotion: PromotionRecord) => {
  if (promotion.promoType === "Percentage") {
    const match = promotion.discountLabel.match(/(\d+(?:\.\d+)?)\s*%/i);
    return match ? Number(match[1]) : null;
  }

  if (promotion.promoType === "Fixed") {
    const match = promotion.discountLabel.match(/£\s*(\d+(?:\.\d+)?)/i);
    return match ? Number(match[1]) : null;
  }

  return null;
};

export const getPromotionBreakdown = ({
  promotion,
  shippingPrice,
  subtotal,
}: {
  promotion: PromotionRecord | null;
  shippingPrice: number;
  subtotal: number;
}): PromotionBreakdown => {
  if (!promotion) {
    return {
      merchandiseDiscount: 0,
      shippingDiscount: 0,
      shippingPrice,
      totalDiscount: 0,
    };
  }

  if (promotion.promoType === "Shipping") {
    return {
      merchandiseDiscount: 0,
      shippingDiscount: shippingPrice,
      shippingPrice: 0,
      totalDiscount: shippingPrice,
    };
  }

  const parsedValue = parsePromotionDiscountValue(promotion);

  if (parsedValue === null) {
    return {
      merchandiseDiscount: 0,
      shippingDiscount: 0,
      shippingPrice,
      totalDiscount: 0,
    };
  }

  const merchandiseDiscount =
    promotion.promoType === "Percentage"
      ? Math.min(subtotal, (subtotal * parsedValue) / 100)
      : Math.min(subtotal, parsedValue);

  return {
    merchandiseDiscount,
    shippingDiscount: 0,
    shippingPrice,
    totalDiscount: merchandiseDiscount,
  };
};
