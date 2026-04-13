import type { ReactNode } from "react";

interface CheckoutCardProps {
  children: ReactNode;
  className?: string;
}

export const CheckoutCard = ({ children, className = "" }: CheckoutCardProps) => {
  return <div className={`rounded-none bg-muted/20 p-5 sm:p-8 ${className}`.trim()}>{children}</div>;
};
