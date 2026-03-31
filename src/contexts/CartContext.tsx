import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  INITIAL_CART_STATE,
  cartReducer,
  loadStoredCartState,
  selectCartItemCount,
  type CartLineInput,
  type CartState,
} from "@/lib/cart";
import { type PromotionRecord } from "@/lib/promotions";
import { type ShippingOptionId } from "@/lib/commerce";

interface CartProviderProps {
  children: ReactNode;
  initialState?: CartState;
}

interface CartContextValue {
  addItem: (item: CartLineInput) => void;
  applyPromotion: (promotion: PromotionRecord) => void;
  clearPromotion: () => void;
  itemCount: number;
  shippingOption: ShippingOptionId;
  state: CartState;
  setShippingOption: (shippingOption: ShippingOptionId) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const initializeState = (initialState?: CartState) => {
  return initialState ?? loadStoredCartState();
};

export const CartProvider = ({ children, initialState }: CartProviderProps) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState ?? INITIAL_CART_STATE,
    () => initializeState(initialState),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      addItem: (item: CartLineInput) => dispatch({ type: "ADD_ITEM", item }),
      applyPromotion: (promotion: PromotionRecord) =>
        dispatch({ type: "APPLY_PROMOTION", promotion }),
      clearPromotion: () => dispatch({ type: "CLEAR_PROMOTION" }),
      itemCount: selectCartItemCount(state),
      setShippingOption: (shippingOption: ShippingOptionId) =>
        dispatch({ type: "SET_SHIPPING_OPTION", shippingOption }),
      shippingOption: state.shippingOption,
      state,
      updateQuantity: (id: string, quantity: number) =>
        dispatch({ type: "SET_ITEM_QUANTITY", id, quantity }),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};
