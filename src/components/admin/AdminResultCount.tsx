interface AdminResultCountProps {
  count: number;
  label: string;
}

export const AdminResultCount = ({ count, label }: AdminResultCountProps) => {
  return (
    <span className="text-xs text-muted-foreground">
      {count} {label}
      {count !== 1 ? "s" : ""}
    </span>
  );
};
