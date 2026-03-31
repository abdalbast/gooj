import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatGBP } from "@/lib/commerce";
import { formatCheckoutShippingPrice } from "@/lib/checkout";
import { CheckoutCard } from "./CheckoutCard";
import type { CartPricing } from "@/lib/cartDerived";

interface CheckoutPaymentSectionProps {
  cartItemCount: number;
  isProcessing: boolean;
  onCompleteOrder: () => void;
  paymentComplete: boolean;
  pricing: CartPricing;
}

export const CheckoutPaymentSection = ({
  cartItemCount,
  isProcessing,
  onCompleteOrder,
  paymentComplete,
  pricing,
}: CheckoutPaymentSectionProps) => {
  return (
    <CheckoutCard>
      <h2 className="mb-6 text-lg font-light text-foreground">Payment Details</h2>

      {!paymentComplete ? (
        <div className="space-y-6">
          <div className="space-y-3 rounded-none border border-dashed border-muted-foreground/30 p-6 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-light text-muted-foreground">
              Payment processing will be handled by a secure payment provider (e.g. Stripe). No
              card data is collected in this demo.
            </p>
          </div>

          <div className="space-y-3 rounded-none border border-muted-foreground/20 bg-muted/10 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatGBP(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {formatCheckoutShippingPrice(pricing.shipping)}
              </span>
            </div>
            {pricing.merchandiseDiscount > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-foreground">-{formatGBP(pricing.merchandiseDiscount)}</span>
              </div>
            ) : null}
            {pricing.shippingDiscount > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping discount</span>
                <span className="text-foreground">-{formatGBP(pricing.shippingDiscount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-muted-foreground/20 pt-3 text-lg font-medium">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatGBP(pricing.total)}</span>
            </div>
          </div>

          <Button
            className="h-12 w-full rounded-none text-base"
            disabled={isProcessing || cartItemCount === 0}
            onClick={onCompleteOrder}
          >
            {isProcessing ? "Processing..." : `Complete Order • ${formatGBP(pricing.total)}`}
          </Button>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-light text-foreground">Order Complete!</h3>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order confirmation has been sent to your email.
          </p>
        </div>
      )}
    </CheckoutCard>
  );
};
