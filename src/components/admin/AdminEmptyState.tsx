interface AdminEmptyStateProps {
  message: string;
}

export const AdminEmptyState = ({ message }: AdminEmptyStateProps) => {
  return <div className="border border-border p-6 text-sm text-muted-foreground">{message}</div>;
};
