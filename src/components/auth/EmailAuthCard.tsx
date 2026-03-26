import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/useAuth";

interface EmailAuthCardProps {
  body: string;
  redirectPath: string;
  submitLabel: string;
  title: string;
}

const EmailAuthCard = ({
  body,
  redirectPath,
  submitLabel,
  title,
}: EmailAuthCardProps) => {
  const { toast } = useToast();
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast({
        description: "Enter an email address to continue.",
        title: "Email required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim(), redirectPath);
    setSubmitting(false);

    if (error) {
      toast({
        description: error.message,
        title: "Could not send sign-in link",
        variant: "destructive",
      });
      return;
    }

    toast({
      description: `A Supabase magic link has been sent to ${email.trim()}.`,
      title: "Check your email",
    });
  };

  return (
    <div className="border border-border bg-background p-6 space-y-5">
      <div className="space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Mail className="h-4 w-4 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-light text-foreground">{title}</h2>
        <p className="text-sm font-light text-muted-foreground">{body}</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          className="rounded-none"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          type="email"
          value={email}
        />
        <Button
          className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Sending link..." : submitLabel}
        </Button>
      </form>
    </div>
  );
};

export default EmailAuthCard;
