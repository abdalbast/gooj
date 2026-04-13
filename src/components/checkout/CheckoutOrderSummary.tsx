import { ImageIcon, MessageSquare, Minus, PenLine, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatGBP } from "@/lib/commerce";
import { CheckoutCard } from "./CheckoutCard";
import type { CartDisplayItem, CartPricing } from "@/lib/cartDerived";
import type { PromotionRecord } from "@/lib/promotions";

interface CheckoutOrderSummaryProps {
  cartItems: CartDisplayItem[];
  discountCode: string;
  discountError: string | null;
  discountNotice: string | null;
  isApplyingDiscount: boolean;
  onDiscountCodeChange: (value: string) => void;
  onDiscountSubmit: () => void;
  onRemovePromotion: () => void;
  onShowDiscountInput: () => void;
  pricing: CartPricing;
  promotion: PromotionRecord | null;
  showDiscountInput: boolean;
  updateQuantity: (id: string, quantity: number) => void;
}

export const CheckoutOrderSummary = ({
  cartItems,
  discountCode,
  discountError,
  discountNotice,
  isApplyingDiscount,
  onDiscountCodeChange,
  onDiscountSubmit,
  onRemovePromotion,
  onShowDiscountInput,
  pricing,
  promotion,
  showDiscountInput,
  updateQuantity,
}: CheckoutOrderSummaryProps) => {
  return (
    <CheckoutCard className="lg:sticky lg:top-[calc(5.5rem+var(--safe-area-top))]">
      <h2 className="mb-6 text-lg font-light text-foreground">Order Summary</h2>

      {cartItems.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm font-light text-muted-foreground">
            Your bag is empty. Add a gift box to continue to checkout.
          </p>
          <Button asChild className="w-full rounded-none">
            <Link to="/category/shop">Browse gift boxes</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item, index) => (
            <div className="flex gap-3 sm:gap-4" key={item.id}>
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-none bg-muted sm:h-20 sm:w-20">
                <img
                  alt={item.name}
                  className="h-full w-full object-cover"
                  decoding="async"
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="80px"
                  src={item.image}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-light text-foreground">{item.name}</h3>
                {item.hasPhoto || item.message || item.handwrittenNote ? (
                  <div className="mt-1 space-y-0.5">
                    {item.hasPhoto ? (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" /> Photo included
                      </p>
                    ) : null}
                    {item.message ? (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" /> {item.message.slice(0, 40)}...
                      </p>
                    ) : null}
                    {item.handwrittenNote ? (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <PenLine className="h-3 w-3" /> Handwritten card
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-2 flex items-center gap-2">
                  <Button
                    aria-label={`Decrease quantity for ${item.name}`}
                    className="h-11 w-11 rounded-none border-muted-foreground/20 p-0"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    size="sm"
                    variant="outline"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="min-w-[2ch] text-center text-sm font-medium text-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    aria-label={`Increase quantity for ${item.name}`}
                    className="h-11 w-11 rounded-none border-muted-foreground/20 p-0"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="shrink-0 font-medium text-foreground">{item.price}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-muted-foreground/20 pt-6">
        {promotion ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-foreground">{promotion.code}</p>
                <p className="text-xs text-muted-foreground">{promotion.discountLabel}</p>
              </div>
              <button
                className="min-h-11 px-2 text-sm text-foreground underline transition-all hover:no-underline"
                onClick={onRemovePromotion}
                type="button"
              >
                Remove
              </button>
            </div>
            {discountNotice ? (
              <p className="text-xs text-muted-foreground" role="status">
                {discountNotice}
              </p>
            ) : null}
          </div>
        ) : !showDiscountInput ? (
          <button
            className="min-h-11 text-sm text-foreground underline transition-all hover:no-underline"
            onClick={onShowDiscountInput}
            type="button"
          >
            Discount code
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                autoCapitalize="characters"
                autoComplete="off"
                className="flex-1 rounded-none"
                inputMode="text"
                onChange={(event) => onDiscountCodeChange(event.target.value)}
                placeholder="Enter discount code"
                type="text"
                value={discountCode}
              />
              <button
                className="min-h-11 px-3 text-sm text-foreground underline transition-all hover:no-underline"
                disabled={isApplyingDiscount}
                onClick={onDiscountSubmit}
                type="button"
              >
                {isApplyingDiscount ? "Applying..." : "Apply"}
              </button>
            </div>
            {discountError ? (
              <p className="text-xs text-destructive" role="alert">
                {discountError}
              </p>
            ) : null}
            {discountNotice ? (
              <p className="text-xs text-muted-foreground" role="status">
                {discountNotice}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-muted-foreground/20 pt-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatGBP(pricing.subtotal)}</span>
        </div>
        {pricing.merchandiseDiscount > 0 ? (
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-foreground">-{formatGBP(pricing.merchandiseDiscount)}</span>
          </div>
        ) : null}
        {pricing.shippingDiscount > 0 ? (
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping discount</span>
            <span className="text-foreground">-{formatGBP(pricing.shippingDiscount)}</span>
          </div>
        ) : null}
      </div>
    </CheckoutCard>
  );
};
