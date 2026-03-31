import { beforeEach, describe, expect, it } from "vitest";
import {
  CART_STORAGE_KEY,
  INITIAL_CART_STATE,
  cartReducer,
  loadStoredCartState,
  selectCartItemCount,
  selectCartPricing,
} from "@/lib/cart";

describe("cart reducer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds matching line items together", () => {
    const firstPass = cartReducer(INITIAL_CART_STATE, {
      type: "ADD_ITEM",
      item: {
        hasPhoto: false,
        handwrittenNote: false,
        message: "",
        productId: "1",
        quantity: 1,
      },
    });

    const secondPass = cartReducer(firstPass, {
      type: "ADD_ITEM",
      item: {
        hasPhoto: false,
        handwrittenNote: false,
        message: "",
        productId: "1",
        quantity: 2,
      },
    });

    expect(secondPass.items).toHaveLength(1);
    expect(secondPass.items[0]?.quantity).toBe(3);
    expect(selectCartItemCount(secondPass)).toBe(3);
  });

  it("updates quantities and removes items at zero", () => {
    const withItem = cartReducer(INITIAL_CART_STATE, {
      type: "ADD_ITEM",
      item: {
        hasPhoto: true,
        handwrittenNote: true,
        message: "Happy Birthday",
        productId: "1",
        quantity: 1,
      },
    });

    const itemId = withItem.items[0]!.id;
    const updated = cartReducer(withItem, {
      type: "SET_ITEM_QUANTITY",
      id: itemId,
      quantity: 4,
    });
    const removed = cartReducer(updated, {
      type: "SET_ITEM_QUANTITY",
      id: itemId,
      quantity: 0,
    });

    expect(updated.items[0]?.quantity).toBe(4);
    expect(removed.items).toEqual([]);
  });

  it("derives pricing from cart items and applied promotions", () => {
    const withItems = cartReducer(INITIAL_CART_STATE, {
      type: "ADD_ITEM",
      item: {
        hasPhoto: false,
        handwrittenNote: false,
        message: "",
        productId: "1",
        quantity: 1,
      },
    });

    const withShipping = cartReducer(withItems, {
      type: "SET_SHIPPING_OPTION",
      shippingOption: "express",
    });
    const withPromotion = cartReducer(withShipping, {
      type: "APPLY_PROMOTION",
      promotion: {
        code: "GOOJIT20",
        discountLabel: "20%",
        expiresAt: "2026-12-31",
        promoType: "Percentage",
      },
    });

    const pricing = selectCartPricing(withPromotion);

    expect(pricing.subtotal).toBe(65);
    expect(pricing.baseShipping).toBe(15);
    expect(pricing.merchandiseDiscount).toBe(13);
    expect(pricing.total).toBe(67);
  });

  it("hydrates stored cart state safely", () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        appliedPromotion: null,
        items: [
          {
            hasPhoto: false,
            handwrittenNote: false,
            id: "1::printed::no-photo",
            message: "",
            productId: "1",
            quantity: 2,
          },
        ],
        shippingOption: "overnight",
      }),
    );

    expect(loadStoredCartState()).toEqual({
      appliedPromotion: null,
      items: [
        {
          hasPhoto: false,
          handwrittenNote: false,
          id: "1::printed::no-photo",
          message: "",
          productId: "1",
          quantity: 2,
        },
      ],
      shippingOption: "overnight",
    });
  });
});
