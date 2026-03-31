interface AdminFieldErrorProps {
  message?: string;
}

export const AdminFieldError = ({ message }: AdminFieldErrorProps) => {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-destructive">{message}</p>;
};
