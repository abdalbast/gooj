import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Gift,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/useAuth";
import { cn } from "@/lib/utils";

type AuthView = "forgot-password" | "sign-in" | "sign-up" | "update-password";

type FeedbackState =
  | {
      description: string;
      title: string;
      tone: "default" | "destructive";
    }
  | null;

interface CustomerAuthPanelProps {
  redirectPath: string;
}

const minimumPasswordLength = 8;

const customerBenefits = [
  {
    body: "Save birthdays, anniversaries, and key gifting dates in one quiet place.",
    icon: Gift,
    title: "Private reminders",
  },
  {
    body: "Use Google or email and password, whichever is cleaner for you.",
    icon: Sparkles,
    title: "Faster returns",
  },
  {
    body: "Password resets and secure sessions are handled through Supabase Auth.",
    icon: ShieldCheck,
    title: "Secure by default",
  },
];

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const GoogleMark = () => (
  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M21.805 10.023H12.25v3.964h5.48c-.236 1.273-.953 2.352-2.023 3.078v2.557h3.273c1.916-1.764 3.02-4.365 3.02-7.447 0-.717-.065-1.406-.195-2.152Z"
      fill="#4285F4"
    />
    <path
      d="M12.25 22c2.73 0 5.024-.904 6.697-2.378l-3.273-2.557c-.904.606-2.06.976-3.424.976-2.63 0-4.857-1.774-5.652-4.159H3.223v2.639A10.1 10.1 0 0 0 12.25 22Z"
      fill="#34A853"
    />
    <path
      d="M6.598 13.882A6.07 6.07 0 0 1 6.283 12c0-.652.11-1.286.315-1.882V7.48H3.223a10.1 10.1 0 0 0 0 9.04l3.375-2.638Z"
      fill="#FBBC04"
    />
    <path
      d="M12.25 5.959c1.486 0 2.819.511 3.87 1.514l2.9-2.9C17.265 2.939 14.97 2 12.25 2 8.293 2 4.889 4.272 3.223 7.48l3.375 2.638c.795-2.385 3.023-4.159 5.652-4.159Z"
      fill="#EA4335"
    />
  </svg>
);

const CustomerAuthPanel = ({ redirectPath }: CustomerAuthPanelProps) => {
  const {
    clearPasswordRecovery,
    isPasswordRecovery,
    requestPasswordReset,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    updatePassword,
  } = useAuth();
  const [view, setView] = useState<AuthView>(isPasswordRecovery ? "update-password" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setView(isPasswordRecovery ? "update-password" : "sign-in");
    setPassword("");
    setConfirmPassword("");
    setFeedback(null);
  }, [isPasswordRecovery]);

  const changeView = (nextView: Exclude<AuthView, "update-password">) => {
    if (isPasswordRecovery) {
      clearPasswordRecovery();
    }

    setView(nextView);
    setPassword("");
    setConfirmPassword("");
    setFeedback(null);
  };

  const setErrorFeedback = (title: string, description: string) => {
    setFeedback({
      description,
      title,
      tone: "destructive",
    });
  };

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setFeedback(null);

    const { error } = await signInWithGoogle(redirectPath);
    setSubmitting(false);

    if (error) {
      setErrorFeedback("Google sign-in unavailable", error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalisedEmail = email.trim().toLowerCase();

    if ((view === "sign-in" || view === "sign-up" || view === "forgot-password") && !normalisedEmail) {
      setErrorFeedback("Email required", "Enter your email address to continue.");
      return;
    }

    if (
      (view === "sign-in" || view === "sign-up" || view === "forgot-password") &&
      !isValidEmail(normalisedEmail)
    ) {
      setErrorFeedback("Enter a valid email", "Use a real email address so we can complete the auth flow.");
      return;
    }

    if ((view === "sign-in" || view === "sign-up" || view === "update-password") && !password) {
      setErrorFeedback("Password required", "Enter your password to continue.");
      return;
    }

    if ((view === "sign-up" || view === "update-password") && password.length < minimumPasswordLength) {
      setErrorFeedback(
        "Password too short",
        `Use at least ${minimumPasswordLength} characters for a stronger password.`,
      );
      return;
    }

    if ((view === "sign-up" || view === "update-password") && password !== confirmPassword) {
      setErrorFeedback("Passwords do not match", "Re-enter the same password in both fields.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    if (view === "sign-in") {
      const { error } = await signInWithPassword(normalisedEmail, password);
      setSubmitting(false);

      if (error) {
        setErrorFeedback("Sign-in failed", error.message);
      }

      return;
    }

    if (view === "sign-up") {
      const { error, needsEmailConfirmation } = await signUpWithPassword(
        normalisedEmail,
        password,
        redirectPath,
      );
      setSubmitting(false);

      if (error) {
        setErrorFeedback("Could not create your account", error.message);
        return;
      }

      if (needsEmailConfirmation) {
        setFeedback({
          description: `We sent a confirmation link to ${normalisedEmail}. Open it to finish creating your account.`,
          title: "Check your inbox",
          tone: "default",
        });
      }

      return;
    }

    if (view === "forgot-password") {
      const { error } = await requestPasswordReset(normalisedEmail, "/reminders");
      setSubmitting(false);

      if (error) {
        setErrorFeedback("Could not send reset email", error.message);
        return;
      }

      setFeedback({
        description: `A reset link was sent to ${normalisedEmail}. Use that link to choose a new password.`,
        title: "Password reset sent",
        tone: "default",
      });
      return;
    }

    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setErrorFeedback("Could not update password", error.message);
      return;
    }

    setFeedback({
      description: "Your password has been updated. You can continue straight into your reminders.",
      title: "Password updated",
      tone: "default",
    });
  };

  const showGoogleOption = view === "sign-in" || view === "sign-up";
  const isPasswordEntryView = view === "sign-in" || view === "sign-up" || view === "update-password";
  const heading =
    view === "sign-up"
      ? "Create your account"
      : view === "forgot-password"
        ? "Reset your password"
        : view === "update-password"
          ? "Choose a new password"
          : "Welcome back";
  const description =
    view === "sign-up"
      ? "Set up a GOOJ account to save reminders, return faster, and keep your gifting calendar in one place."
      : view === "forgot-password"
        ? "Enter the email attached to your account and we’ll send you a secure reset link."
        : view === "update-password"
          ? "Create a fresh password to finish your recovery flow."
          : "Sign in to manage your saved reminders and upcoming gifting dates.";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#f7f2eb] shadow-[0_32px_90px_rgba(15,15,15,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,188,148,0.34),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.58),rgba(247,242,235,0.96))]" />
      <div className="absolute left-[-6rem] top-10 h-48 w-48 rounded-full bg-[#dbc29f]/45 blur-3xl" />
      <div className="absolute bottom-[-5rem] right-[-3rem] h-56 w-56 rounded-full bg-white/80 blur-3xl" />

      <div className="relative grid lg:grid-cols-[1.15fr_0.95fr]">
        <div className="border-b border-black/8 px-6 py-8 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-stone-500">
            <span className="inline-flex h-7 items-center rounded-full border border-black/10 bg-white/70 px-3">
              GOOJ Account
            </span>
            <span>Premium reminders</span>
          </div>

          <div className="mt-8 space-y-5">
            <h2 className="max-w-xl text-4xl font-light leading-none tracking-[-0.05em] text-stone-950 sm:text-[3.35rem]">
              A cleaner way to stay ready for every gifting moment.
            </h2>
            <p className="max-w-lg text-sm font-light leading-6 text-stone-600 sm:text-base">
              Your GOOJ account keeps important dates, quick re-entry, and a calm sign-in flow in one place.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {customerBenefits.map((benefit) => (
              <div
                className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-[0_20px_50px_rgba(15,15,15,0.04)] backdrop-blur"
                key={benefit.title}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-white">
                  <benefit.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-medium text-stone-950">{benefit.title}</h3>
                <p className="mt-2 text-sm font-light leading-6 text-stone-600">{benefit.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-black/8 bg-stone-950 px-5 py-4 text-stone-50">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-stone-300">
              <Check className="h-3.5 w-3.5" />
              Thoughtful by default
            </div>
            <p className="mt-3 max-w-md text-sm font-light leading-6 text-stone-200">
              Use the same account to save dates now and return later without rebuilding your gifting list.
            </p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/86 p-5 shadow-[0_28px_70px_rgba(15,15,15,0.06)] backdrop-blur sm:p-7">
            {!isPasswordRecovery && (
              <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-stone-950/5 p-1">
                <button
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    view === "sign-in" ? "bg-stone-950 text-white" : "text-stone-600 hover:text-stone-950",
                  )}
                  onClick={() => changeView("sign-in")}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    view === "sign-up" ? "bg-stone-950 text-white" : "text-stone-600 hover:text-stone-950",
                  )}
                  onClick={() => changeView("sign-up")}
                  type="button"
                >
                  Create account
                </button>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Secure access</p>
              <h3 className="text-3xl font-light tracking-[-0.04em] text-stone-950">{heading}</h3>
              <p className="text-sm font-light leading-6 text-stone-600">{description}</p>
            </div>

            {showGoogleOption && (
              <>
                <Button
                  className="mt-6 h-12 w-full rounded-full border border-black/10 bg-white text-stone-950 shadow-none hover:bg-stone-50"
                  disabled={submitting}
                  onClick={() => void handleGoogleAuth()}
                  type="button"
                  variant="outline"
                >
                  <GoogleMark />
                  Continue with Google
                </Button>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-black/10" />
                  <span className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Or continue with email</span>
                  <div className="h-px flex-1 bg-black/10" />
                </div>
              </>
            )}

            {feedback && (
              <Alert
                className={cn(
                  "mt-6 border rounded-[1.25rem]",
                  feedback.tone === "destructive"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-emerald-200 bg-emerald-50 text-emerald-950",
                )}
                variant={feedback.tone === "destructive" ? "destructive" : "default"}
              >
                <AlertTitle>{feedback.title}</AlertTitle>
                <AlertDescription>{feedback.description}</AlertDescription>
              </Alert>
            )}

            <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              {view !== "update-password" && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.2em] text-stone-500" htmlFor="customer-auth-email">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      autoComplete="email"
                      className="h-12 rounded-2xl border-black/10 bg-stone-50/80 pl-11 text-stone-950 placeholder:text-stone-400 focus-visible:ring-stone-950"
                      id="customer-auth-email"
                      inputMode="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                    />
                  </div>
                </div>
              )}

              {isPasswordEntryView && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-[0.2em] text-stone-500" htmlFor="customer-auth-password">
                      {view === "update-password" ? "New password" : "Password"}
                    </Label>
                    {view === "sign-in" && (
                      <button
                        className="text-xs font-medium text-stone-500 transition-colors hover:text-stone-950"
                        onClick={() => changeView("forgot-password")}
                        type="button"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      autoComplete={
                        view === "sign-in" ? "current-password" : "new-password"
                      }
                      className="h-12 rounded-2xl border-black/10 bg-stone-50/80 pl-11 text-stone-950 placeholder:text-stone-400 focus-visible:ring-stone-950"
                      id="customer-auth-password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={
                        view === "sign-in" ? "Enter your password" : "At least 8 characters"
                      }
                      type="password"
                      value={password}
                    />
                  </div>
                </div>
              )}

              {(view === "sign-up" || view === "update-password") && (
                <div className="space-y-2">
                  <Label
                    className="text-xs uppercase tracking-[0.2em] text-stone-500"
                    htmlFor="customer-auth-confirm-password"
                  >
                    Confirm password
                  </Label>
                  <Input
                    autoComplete="new-password"
                    className="h-12 rounded-2xl border-black/10 bg-stone-50/80 text-stone-950 placeholder:text-stone-400 focus-visible:ring-stone-950"
                    id="customer-auth-confirm-password"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    type="password"
                    value={confirmPassword}
                  />
                </div>
              )}

              <Button
                className="h-12 w-full rounded-full bg-stone-950 text-white hover:bg-stone-800"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? "Working..."
                  : view === "sign-up"
                    ? "Create my account"
                    : view === "forgot-password"
                      ? "Send reset link"
                      : view === "update-password"
                        ? "Save new password"
                        : "Sign in"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-sm font-light text-stone-600">
              {view === "forgot-password" && (
                <button
                  className="inline-flex items-center gap-2 text-stone-950 transition-colors hover:text-stone-700"
                  onClick={() => changeView("sign-in")}
                  type="button"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to sign in
                </button>
              )}

              {view === "sign-in" && (
                <p>
                  New to GOOJ?{" "}
                  <button
                    className="font-medium text-stone-950 transition-colors hover:text-stone-700"
                    onClick={() => changeView("sign-up")}
                    type="button"
                  >
                    Create an account
                  </button>
                </p>
              )}

              {view === "sign-up" && (
                <p>
                  Already registered?{" "}
                  <button
                    className="font-medium text-stone-950 transition-colors hover:text-stone-700"
                    onClick={() => changeView("sign-in")}
                    type="button"
                  >
                    Sign in instead
                  </button>
                </p>
              )}

              <div className="flex items-start gap-2 rounded-[1.25rem] border border-black/8 bg-stone-50/80 px-4 py-3 text-xs leading-5 text-stone-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-stone-950" />
                <p>
                  By continuing, you agree to the{" "}
                  <Link className="font-medium text-stone-950" to="/terms-of-service">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link className="font-medium text-stone-950" to="/privacy-policy">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerAuthPanel;
