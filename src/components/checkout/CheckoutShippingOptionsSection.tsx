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
            className="flex min-h-14 items-start gap-3 rounded-none border border-muted-foreground/20 p-4"
            key={optionId}
          >
            <RadioGroupItem className="mt-1 h-5 w-5" id={optionId} value={optionId} />
            <Label
              className="flex flex-1 cursor-pointer flex-col gap-1 font-light text-foreground sm:flex-row sm:items-center sm:justify-between"
              htmlFor={optionId}
            >
              <span>
                {SHIPPING_OPTIONS[optionId].label}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatShippingOptionSummary(optionId)}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </CheckoutCard>
  );
};
