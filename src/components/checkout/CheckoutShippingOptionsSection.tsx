import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SHIPPING_OPTIONS, SHIPPING_OPTION_ORDER, formatShippingOptionSummary } from "@/lib/commerce";
import { CheckoutCard } from "./CheckoutCard";
import type { ShippingOptionId } from "@/lib/commerce";

interface CheckoutShippingOptionsSectionProps {
  onShippingOptionChange: (shippingOption: ShippingOptionId) => void;
  shippingOption: ShippingOptionId;
}

export const CheckoutShippingOptionsSection = ({
  onShippingOptionChange,
  shippingOption,
}: CheckoutShippingOptionsSectionProps) => {
  return (
    <CheckoutCard>
      <h2 className="mb-6 text-lg font-light text-foreground">Shipping Options</h2>

      <RadioGroup
        className="space-y-4"
        onValueChange={(value) => onShippingOptionChange(value as ShippingOptionId)}
        value={shippingOption}
      >
        {SHIPPING_OPTION_ORDER.map((optionId) => (
          <div
            className="flex items-center justify-between rounded-none border border-muted-foreground/20 p-4"
            key={optionId}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem id={optionId} value={optionId} />
              <Label className="font-light text-foreground" htmlFor={optionId}>
                {SHIPPING_OPTIONS[optionId].label}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatShippingOptionSummary(optionId)}
            </div>
          </div>
        ))}
      </RadioGroup>
    </CheckoutCard>
  );
};
