import { getCatalogProduct } from "./catalog";
import {
  SHIPPING_OPTIONS,
  parseGBPValue,
} from "./commerce";
import { getPromotionBreakdown } from "./promotions";
import { type CartLineItem, type CartState } from "./cart";

export interface CartDisplayItem extends CartLineItem {
  category: string;
  image: string;
  name: string;
  price: string;
  priceValue: number;
}

export interface CartPricing {
  baseShipping: number;
  merchandiseDiscount: number;
  shipping: number;
  shippingDiscount: number;
  subtotal: number;
  total: number;
  totalDiscount: number;
}

export const selectCartDisplayItems = (state: CartState): CartDisplayItem[] => {
  return state.items.flatMap((item) => {
    const product = getCatalogProduct(item.productId);

    if (!product) {
      return [];
    }

    return [
      {
        ...item,
        category: product.category,
        image: product.image,
        name: product.name,
        price: product.price,
        priceValue: parseGBPValue(product.price),
      },
    ];
  });
};

export const selectCartPricing = (state: CartState): CartPricing => {
  const items = selectCartDisplayItems(state);
  const subtotal = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  const baseShipping = SHIPPING_OPTIONS[state.shippingOption].price;
  const promotion = getPromotionBreakdown({
    promotion: state.appliedPromotion,
    shippingPrice: baseShipping,
    subtotal,
  });

  return {
    baseShipping,
    merchandiseDiscount: promotion.merchandiseDiscount,
    shipping: promotion.shippingPrice,
    shippingDiscount: promotion.shippingDiscount,
    subtotal,
    total: Math.max(0, subtotal - promotion.merchandiseDiscount + promotion.shippingPrice),
    totalDiscount: promotion.totalDiscount,
  };
};
