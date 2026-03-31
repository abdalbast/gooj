import { formatGBP } from "@/lib/commerce";

export interface CheckoutContactDetails {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CheckoutAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutBillingDetails extends CheckoutContactDetails, CheckoutAddress {}

export type CheckoutFormFieldChange<T extends Record<string, string>> = <
  Field extends keyof T,
>(
  field: Field,
  value: T[Field],
) => void;

export const createEmptyCheckoutContactDetails = (): CheckoutContactDetails => ({
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
});

export const createEmptyCheckoutAddress = (): CheckoutAddress => ({
  address: "",
  city: "",
  country: "",
  postalCode: "",
});

export const createEmptyCheckoutBillingDetails = (): CheckoutBillingDetails => ({
  ...createEmptyCheckoutContactDetails(),
  ...createEmptyCheckoutAddress(),
});

export const updateCheckoutFields = <T extends Record<string, string>, Field extends keyof T>(
  current: T,
  field: Field,
  value: T[Field],
) => ({
  ...current,
  [field]: value,
});

export const formatCheckoutShippingPrice = (value: number) => {
  return value === 0 ? "Free" : formatGBP(value);
};
