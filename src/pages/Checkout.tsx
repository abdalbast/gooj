import { useEffect, useState } from "react";
import CheckoutHeader from "../components/header/CheckoutHeader";
import Footer from "../components/footer/Footer";
import { CheckoutCustomerDetailsSection } from "@/components/checkout/CheckoutCustomerDetailsSection";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutPaymentSection } from "@/components/checkout/CheckoutPaymentSection";
import { CheckoutShippingOptionsSection } from "@/components/checkout/CheckoutShippingOptionsSection";
import { useCart } from "@/contexts/CartContext";
import { selectCartDisplayItems, selectCartPricing } from "@/lib/cartDerived";
import {
  createEmptyCheckoutAddress,
  createEmptyCheckoutBillingDetails,
  createEmptyCheckoutContactDetails,
  updateCheckoutFields,
} from "@/lib/checkout";
import { lookupActivePromotion } from "@/lib/promotionLookup";

const Checkout = () => {
  const {
    applyPromotion,
    clearPromotion,
    setShippingOption,
    shippingOption,
    state,
    updateQuantity,
  } = useCart();
  const cartItems = selectCartDisplayItems(state);
  const pricing = selectCartPricing(state);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountNotice, setDiscountNotice] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(createEmptyCheckoutContactDetails);
  const [shippingAddress, setShippingAddress] = useState(createEmptyCheckoutAddress);
  const [hasSeparateBilling, setHasSeparateBilling] = useState(false);
  const [billingDetails, setBillingDetails] = useState(createEmptyCheckoutBillingDetails);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    if (!state.appliedPromotion) {
      return;
    }

    setDiscountCode(state.appliedPromotion.code);
  }, [state.appliedPromotion]);

  const handleDiscountSubmit = async () => {
    setDiscountError(null);
    setDiscountNotice(null);

    if (!discountCode.trim()) {
      setDiscountError("Enter a discount code to apply it.");
      return;
    }

    setIsApplyingDiscount(true);

    try {
      const promotion = await lookupActivePromotion(discountCode);

      if (!promotion) {
        setDiscountError("That code is not valid right now.");
        return;
      }

      applyPromotion(promotion);
      setDiscountCode(promotion.code);
      setDiscountNotice(`${promotion.code} applied.`);
      setShowDiscountInput(false);
    } catch {
      setDiscountError("We could not validate that code right now.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemovePromotion = () => {
    clearPromotion();
    setDiscountCode("");
    setDiscountError(null);
    setDiscountNotice("Discount code removed.");
  };

  const handleCustomerDetailsChange = (field: keyof typeof customerDetails, value: string) => {
    setCustomerDetails((current) => updateCheckoutFields(current, field, value));
  };

  const handleShippingAddressChange = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress((current) => updateCheckoutFields(current, field, value));
  };

  const handleBillingDetailsChange = (field: keyof typeof billingDetails, value: string) => {
    setBillingDetails((current) => updateCheckoutFields(current, field, value));
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setPaymentComplete(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      
      <main className="pb-[calc(3rem+var(--safe-area-bottom))] pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            
            {/* Order Summary - First on mobile, last on desktop */}
            <div className="lg:col-span-1 lg:order-2">
              <CheckoutOrderSummary
                cartItems={cartItems}
                discountCode={discountCode}
                discountError={discountError}
                discountNotice={discountNotice}
                isApplyingDiscount={isApplyingDiscount}
                onDiscountCodeChange={setDiscountCode}
                onDiscountSubmit={() => void handleDiscountSubmit()}
                onRemovePromotion={handleRemovePromotion}
                onShowDiscountInput={() => setShowDiscountInput(true)}
                pricing={pricing}
                promotion={state.appliedPromotion}
                showDiscountInput={showDiscountInput}
                updateQuantity={updateQuantity}
              />
            </div>

            {/* Left Column - Forms */}
            <div className="space-y-6 lg:order-1 lg:col-span-2 lg:space-y-8">
              <CheckoutCustomerDetailsSection
                billingDetails={billingDetails}
                customerDetails={customerDetails}
                hasSeparateBilling={hasSeparateBilling}
                onBillingDetailsChange={handleBillingDetailsChange}
                onCustomerDetailsChange={handleCustomerDetailsChange}
                onSeparateBillingChange={setHasSeparateBilling}
                onShippingAddressChange={handleShippingAddressChange}
                shippingAddress={shippingAddress}
              />

              <CheckoutShippingOptionsSection
                onShippingOptionChange={setShippingOption}
                shippingOption={shippingOption}
              />

              <CheckoutPaymentSection
                cartItemCount={cartItems.length}
                isProcessing={isProcessing}
                onCompleteOrder={() => void handleCompleteOrder()}
                paymentComplete={paymentComplete}
                pricing={pricing}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
