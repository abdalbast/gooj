import { CheckoutFormField } from "./CheckoutFormField";
import type { CheckoutAddress, CheckoutFormFieldChange } from "@/lib/checkout";

interface CheckoutAddressFieldsProps<T extends CheckoutAddress> {
  addressId: string;
  cityId: string;
  countryId: string;
  onChange: CheckoutFormFieldChange<T>;
  postalCodeId: string;
  values: T;
}

export const CheckoutAddressFields = <T extends CheckoutAddress>({
  addressId,
  cityId,
  countryId,
  onChange,
  postalCodeId,
  values,
}: CheckoutAddressFieldsProps<T>) => {
  const fieldScope = addressId.startsWith("billing") ? "billing" : "shipping";
  const autoCompleteWithScope = (token: string) => `${fieldScope} ${token}`;

  return (
    <div className="space-y-4">
      <CheckoutFormField
        autoComplete={autoCompleteWithScope("street-address")}
        id={addressId}
        label="Address *"
        onChange={(value) => onChange("address", value)}
        placeholder="Street address"
        value={values.address}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CheckoutFormField
          autoComplete={autoCompleteWithScope("address-level2")}
          id={cityId}
          label="City *"
          onChange={(value) => onChange("city", value)}
          placeholder="City"
          value={values.city}
        />
        <CheckoutFormField
          autoCapitalize="characters"
          autoComplete={autoCompleteWithScope("postal-code")}
          id={postalCodeId}
          inputMode="text"
          label="Postal Code *"
          onChange={(value) => onChange("postalCode", value)}
          placeholder="Postal code"
          value={values.postalCode}
        />
      </div>

      <CheckoutFormField
        autoComplete={autoCompleteWithScope("country-name")}
        id={countryId}
        label="Country *"
        onChange={(value) => onChange("country", value)}
        placeholder="Country"
        value={values.country}
      />
    </div>
  );
};
