import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutFormFieldProps {
  autoCapitalize?: string;
  autoComplete?: string;
  enterKeyHint?: ComponentProps<typeof Input>["enterKeyHint"];
  id: string;
  inputMode?: ComponentProps<typeof Input>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}

export const CheckoutFormField = ({
  autoCapitalize,
  autoComplete,
  enterKeyHint,
  id,
  inputMode,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: CheckoutFormFieldProps) => {
  return (
    <div className="scroll-mt-[calc(5.5rem+var(--safe-area-top))]">
      <Label className="text-sm font-light text-foreground" htmlFor={id}>
        {label}
      </Label>
      <Input
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        className="mt-2 rounded-none"
        enterKeyHint={enterKeyHint}
        id={id}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
};
