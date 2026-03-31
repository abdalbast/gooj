import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutFormFieldProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}

export const CheckoutFormField = ({
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: CheckoutFormFieldProps) => {
  return (
    <div>
      <Label className="text-sm font-light text-foreground" htmlFor={id}>
        {label}
      </Label>
      <Input
        className="mt-2 rounded-none"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
};
