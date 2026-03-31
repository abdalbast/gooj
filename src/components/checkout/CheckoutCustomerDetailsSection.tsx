import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckoutAddressFields } from "./CheckoutAddressFields";
import { CheckoutCard } from "./CheckoutCard";
import { CheckoutContactFields } from "./CheckoutContactFields";
import type {
  CheckoutAddress,
  CheckoutBillingDetails,
  CheckoutContactDetails,
  CheckoutFormFieldChange,
} from "@/lib/checkout";

interface CheckoutCustomerDetailsSectionProps {
  billingDetails: CheckoutBillingDetails;
  customerDetails: CheckoutContactDetails;
  hasSeparateBilling: boolean;
  onBillingDetailsChange: CheckoutFormFieldChange<CheckoutBillingDetails>;
  onCustomerDetailsChange: CheckoutFormFieldChange<CheckoutContactDetails>;
  onSeparateBillingChange: (checked: boolean) => void;
  onShippingAddressChange: CheckoutFormFieldChange<CheckoutAddress>;
  shippingAddress: CheckoutAddress;
}

export const CheckoutCustomerDetailsSection = ({
  billingDetails,
  customerDetails,
  hasSeparateBilling,
  onBillingDetailsChange,
  onCustomerDetailsChange,
  onSeparateBillingChange,
  onShippingAddressChange,
  shippingAddress,
}: CheckoutCustomerDetailsSectionProps) => {
  return (
    <CheckoutCard>
      <h2 className="mb-6 text-lg font-light text-foreground">Customer Details</h2>

      <div className="space-y-6">
        <CheckoutContactFields
          emailId="email"
          emailPlaceholder="Enter your email"
          firstNameId="firstName"
          lastNameId="lastName"
          onChange={onCustomerDetailsChange}
          phoneId="phone"
          phonePlaceholder="Enter your phone number"
          values={customerDetails}
        />

        <div className="mt-8 border-t border-muted-foreground/20 pt-6">
          <h3 className="mb-4 text-base font-light text-foreground">Shipping Address</h3>
          <CheckoutAddressFields
            addressId="shippingAddress"
            cityId="shippingCity"
            countryId="shippingCountry"
            onChange={onShippingAddressChange}
            postalCodeId="shippingPostalCode"
            values={shippingAddress}
          />
        </div>

        <div className="mt-8 border-t border-muted-foreground/20 pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={hasSeparateBilling}
              id="separateBilling"
              onCheckedChange={(checked) => onSeparateBillingChange(checked === true)}
            />
            <Label
              className="cursor-pointer text-sm font-light text-foreground"
              htmlFor="separateBilling"
            >
              Other billing address
            </Label>
          </div>
        </div>

        {hasSeparateBilling ? (
          <div className="space-y-6 pt-4">
            <h3 className="text-base font-light text-foreground">Billing Details</h3>
            <CheckoutContactFields
              emailId="billingEmail"
              emailPlaceholder="Enter billing email"
              firstNameId="billingFirstName"
              lastNameId="billingLastName"
              onChange={onBillingDetailsChange}
              phoneId="billingPhone"
              phonePlaceholder="Enter billing phone number"
              values={billingDetails}
            />
            <CheckoutAddressFields
              addressId="billingAddress"
              cityId="billingCity"
              countryId="billingCountry"
              onChange={onBillingDetailsChange}
              postalCodeId="billingPostalCode"
              values={billingDetails}
            />
          </div>
        ) : null}
      </div>
    </CheckoutCard>
  );
};
