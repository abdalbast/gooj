interface AdminPageLoadingStateProps {
  message: string;
}

export const AdminPageLoadingState = ({ message }: AdminPageLoadingStateProps) => {
  return (
    <div className="border border-border p-6 text-sm font-light text-muted-foreground">
      {message}
    </div>
  );
};
