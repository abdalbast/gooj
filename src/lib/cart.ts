import { type ShippingOptionId } from "./commerce";
import { type PromotionRecord } from "./promotions";

export const CART_STORAGE_KEY = "gooj:cart";

export interface CartLineInput {
  hasPhoto: boolean;
  handwrittenNote: boolean;
  message: string;
  productId: string;
  quantity: number;
}

export interface CartLineItem extends CartLineInput {
  id: string;
}

export interface CartState {
  appliedPromotion: PromotionRecord | null;
  items: CartLineItem[];
  shippingOption: ShippingOptionId;
}

export const INITIAL_CART_STATE: CartState = {
  appliedPromotion: null,
  items: [],
  shippingOption: "standard",
};

const isShippingOptionId = (value: unknown): value is ShippingOptionId => {
  return value === "standard" || value === "express" || value === "overnight";
};

const normalizeMessage = (value: string) => value.trim();

export const createCartLineId = (input: CartLineInput) => {
  return [
    input.productId,
    normalizeMessage(input.message),
    input.handwrittenNote ? "handwritten" : "printed",
    input.hasPhoto ? "photo" : "no-photo",
  ].join("::");
};

export const createCartLineItem = (input: CartLineInput): CartLineItem => ({
  ...input,
  id: createCartLineId(input),
  message: normalizeMessage(input.message),
  quantity: Math.max(1, input.quantity),
});

type CartAction =
  | { type: "ADD_ITEM"; item: CartLineInput }
  | { type: "APPLY_PROMOTION"; promotion: PromotionRecord }
  | { type: "CLEAR_PROMOTION" }
  | { type: "HYDRATE"; state: CartState }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "SET_ITEM_QUANTITY"; id: string; quantity: number }
  | { type: "SET_SHIPPING_OPTION"; shippingOption: ShippingOptionId };

const hydrateCartState = (value: unknown): CartState => {
  if (!value || typeof value !== "object") {
    return INITIAL_CART_STATE;
  }

  const state = value as Partial<CartState>;
  const items = Array.isArray(state.items)
    ? state.items.flatMap((item) => {
        if (!item || typeof item !== "object") {
          return [];
        }

        const candidate = item as Partial<CartLineItem>;

        if (
          typeof candidate.id !== "string" ||
          typeof candidate.productId !== "string" ||
          typeof candidate.quantity !== "number" ||
          typeof candidate.message !== "string" ||
          typeof candidate.handwrittenNote !== "boolean" ||
          typeof candidate.hasPhoto !== "boolean"
        ) {
          return [];
        }

        return [
          {
            hasPhoto: candidate.hasPhoto,
            handwrittenNote: candidate.handwrittenNote,
            id: candidate.id,
            message: candidate.message,
            productId: candidate.productId,
            quantity: Math.max(1, candidate.quantity),
          },
        ];
      })
    : [];

  const appliedPromotion =
    state.appliedPromotion &&
    typeof state.appliedPromotion.code === "string" &&
    typeof state.appliedPromotion.discountLabel === "string" &&
    typeof state.appliedPromotion.expiresAt === "string" &&
    typeof state.appliedPromotion.promoType === "string"
      ? state.appliedPromotion
      : null;

  return {
    appliedPromotion,
    items,
    shippingOption: isShippingOptionId(state.shippingOption)
      ? state.shippingOption
      : INITIAL_CART_STATE.shippingOption,
  };
};

export const loadStoredCartState = () => {
  if (typeof window === "undefined") {
    return INITIAL_CART_STATE;
  }

  const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!storedValue) {
    return INITIAL_CART_STATE;
  }

  try {
    return hydrateCartState(JSON.parse(storedValue));
  } catch {
    return INITIAL_CART_STATE;
  }
};

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "ADD_ITEM": {
      const nextItem = createCartLineItem(action.item);
      const existingItem = state.items.find((item) => item.id === nextItem.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === nextItem.id
              ? { ...item, quantity: item.quantity + nextItem.quantity }
              : item,
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, nextItem],
      };
    }
    case "SET_ITEM_QUANTITY":
      return {
        ...state,
        items: state.items.flatMap((item) => {
          if (item.id !== action.id) {
            return [item];
          }

          if (action.quantity <= 0) {
            return [];
          }

          return [{ ...item, quantity: action.quantity }];
        }),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    case "SET_SHIPPING_OPTION":
      return {
        ...state,
        shippingOption: action.shippingOption,
      };
    case "APPLY_PROMOTION":
      return {
        ...state,
        appliedPromotion: action.promotion,
      };
    case "CLEAR_PROMOTION":
      return {
        ...state,
        appliedPromotion: null,
      };
    default:
      return state;
  }
};

export const selectCartItemCount = (state: CartState) => {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
};

export type { CartDisplayItem, CartPricing } from "./cartDerived";
export { selectCartDisplayItems, selectCartPricing } from "./cartDerived";
