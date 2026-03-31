import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminPageAlertProps {
  children: string;
  title: string;
}

export const AdminPageAlert = ({ children, title }: AdminPageAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
};
