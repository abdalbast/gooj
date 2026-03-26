import { AlertCircle } from "lucide-react";

interface SupabaseSetupCardProps {
  body: string;
  title: string;
}

const SupabaseSetupCard = ({ body, title }: SupabaseSetupCardProps) => {
  return (
    <div className="border border-border bg-background p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-muted p-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-light text-foreground">{title}</h2>
          <p className="text-sm font-light text-muted-foreground">{body}</p>
        </div>
      </div>
      <div className="border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        <p>`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be set before the app can talk to Supabase.</p>
      </div>
    </div>
  );
};

export default SupabaseSetupCard;
