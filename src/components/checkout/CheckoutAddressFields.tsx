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
  return (
    <div className="space-y-4">
      <CheckoutFormField
        id={addressId}
        label="Address *"
        onChange={(value) => onChange("address", value)}
        placeholder="Street address"
        value={values.address}
      />

      <div className="grid grid-cols-2 gap-4">
        <CheckoutFormField
          id={cityId}
          label="City *"
          onChange={(value) => onChange("city", value)}
          placeholder="City"
          value={values.city}
        />
        <CheckoutFormField
          id={postalCodeId}
          label="Postal Code *"
          onChange={(value) => onChange("postalCode", value)}
          placeholder="Postal code"
          value={values.postalCode}
        />
      </div>

      <CheckoutFormField
        id={countryId}
        label="Country *"
        onChange={(value) => onChange("country", value)}
        placeholder="Country"
        value={values.country}
      />
    </div>
  );
};
