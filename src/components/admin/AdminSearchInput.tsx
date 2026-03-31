import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchInputProps {
  className?: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export const AdminSearchInput = ({
  className = "max-w-sm",
  onChange,
  placeholder,
  value,
}: AdminSearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="rounded-none pl-9"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
};
