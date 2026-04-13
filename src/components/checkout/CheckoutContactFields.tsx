import { CheckoutFormField } from "./CheckoutFormField";
import type {
  CheckoutContactDetails,
  CheckoutFormFieldChange,
} from "@/lib/checkout";

interface CheckoutContactFieldsProps<T extends CheckoutContactDetails> {
  emailId: string;
  emailPlaceholder: string;
  firstNameId: string;
  lastNameId: string;
  onChange: CheckoutFormFieldChange<T>;
  phoneId: string;
  phonePlaceholder: string;
  values: T;
}

export const CheckoutContactFields = <T extends CheckoutContactDetails>({
  emailId,
  emailPlaceholder,
  firstNameId,
  lastNameId,
  onChange,
  phoneId,
  phonePlaceholder,
  values,
}: CheckoutContactFieldsProps<T>) => {
  const fieldScope = emailId.startsWith("billing") ? "billing" : "";
  const autoCompleteWithScope = (token: string) =>
    fieldScope ? `${fieldScope} ${token}` : token;

  return (
    <>
      <CheckoutFormField
        autoCapitalize="none"
        autoComplete={autoCompleteWithScope("email")}
        id={emailId}
        inputMode="email"
        label="Email Address *"
        onChange={(value) => onChange("email", value)}
        placeholder={emailPlaceholder}
        type="email"
        value={values.email}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CheckoutFormField
          autoComplete={autoCompleteWithScope("given-name")}
          id={firstNameId}
          label="First Name *"
          onChange={(value) => onChange("firstName", value)}
          placeholder="First name"
          value={values.firstName}
        />
        <CheckoutFormField
          autoComplete={autoCompleteWithScope("family-name")}
          id={lastNameId}
          label="Last Name *"
          onChange={(value) => onChange("lastName", value)}
          placeholder="Last name"
          value={values.lastName}
        />
      </div>

      <CheckoutFormField
        autoComplete={autoCompleteWithScope("tel")}
        id={phoneId}
        inputMode="tel"
        label="Phone Number"
        onChange={(value) => onChange("phone", value)}
        placeholder={phonePlaceholder}
        type="tel"
        value={values.phone}
      />
    </>
  );
};
