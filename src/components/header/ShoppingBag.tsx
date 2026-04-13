import { useEffect, type RefObject } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatGBPTwoDecimals, parseGBPValue } from "@/lib/commerce";
import { useCart } from "@/contexts/CartContext";
import { selectCartDisplayItems } from "@/lib/cartDerived";

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  panelId: string;
  titleId: string;
  initialFocusRef?: RefObject<HTMLButtonElement | null>;
  onViewFavorites?: () => void;
}

const ShoppingBag = ({
  isOpen,
  onClose,
  panelId,
  titleId,
  initialFocusRef,
  onViewFavorites,
}: ShoppingBagProps) => {
  const { state, updateQuantity } = useCart();
  const cartItems = selectCartDisplayItems(state);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      initialFocusRef?.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialFocusRef, isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseGBPValue(item.price);
    return sum + (price * item.quantity);
  }, 0);

  return (
    <>
      {/* Invisible backdrop to capture clicks outside the popover */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Apple-style popover */}
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="custom-scrollbar absolute left-4 right-4 top-full z-50 mt-2 flex max-h-[calc(100dvh-5.5rem-var(--safe-area-top)-var(--safe-area-bottom))] w-auto animate-in flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl fade-in slide-in-from-top-4 duration-300 sm:left-auto sm:right-6 sm:w-[min(22rem,calc(100vw-3rem))]"
      >
        {/* Content */}
        <div className="flex flex-1 flex-col p-5 pb-[calc(1.25rem+var(--safe-area-bottom))]">
          <div className="mb-4 flex items-center justify-between">
            <h3 id={titleId} className="text-xl font-medium text-gray-900">
              Bag
            </h3>
            <button
              ref={initialFocusRef}
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close bag"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile favorites toggle - only show on mobile */}
          {onViewFavorites && (
            <div className="md:hidden pb-4 mb-4 border-b border-black/5">
              <button
                type="button"
                onClick={onViewFavorites}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-50/50 px-4 py-2.5 text-gray-800 transition-colors duration-200 hover:bg-gray-100/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span className="text-sm font-medium">View Favorites</span>
              </button>
            </div>
          )}
          
          {cartItems.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 text-sm mb-4">
                Your bag is empty.
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-full bg-white/50 border-gray-200 text-gray-800 hover:bg-gray-50" 
                onClick={onClose}
                asChild
              >
                <Link to="/category/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="mb-5 max-h-[min(18rem,45dvh)] space-y-4 overflow-y-auto pr-1 touch-scroll">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        sizes="64px"
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="truncate">
                          <h4 className="text-[15px] font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-[13px] text-gray-500">{item.category}</p>
                        </div>
                        <p className="text-[15px] font-medium text-gray-900 whitespace-nowrap">{item.price}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 sm:h-8 sm:w-8"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className="text-[15px] font-medium w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 sm:h-8 sm:w-8"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 0)}
                          className="min-h-11 px-2 text-[13px] font-medium text-blue-600 opacity-100 transition-opacity hover:text-blue-700 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                          aria-label={`Remove ${item.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Subtotal and checkout */}
              <div className="border-t border-black/5 pt-4 space-y-4">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-gray-900 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-medium">{formatGBPTwoDecimals(subtotal)}</span>
                </div>
                
                <div className="space-y-2 pt-1">
                  <Button 
                    asChild 
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium border-0 py-6"
                    onClick={onClose}
                  >
                    <Link to="/checkout">
                      Check Out
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ShoppingBag;
