import { useCallback, useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseErrorMessage } from "@/lib/supabaseData";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/useAuth";

type TotpFactor = {
  friendly_name?: string;
  id: string;
  status: "unverified" | "verified";
};

type TotpEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

const ADMIN_TOTP_NAME = "GOOJ Admin";

const AdminMfaCard = () => {
  const { reloadSession } = useAuth();
  const { toast } = useToast();
  const client = getSupabaseClient();
  const [error, setError] = useState<string | null>(null);
  const [existingFactor, setExistingFactor] = useState<TotpFactor | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);

  const loadFactors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: factorError } = await client.auth.mfa.listFactors();

      if (factorError) {
        throw factorError;
      }

      const verifiedFactor = data.all.find(
        (factor) => factor.factor_type === "totp" && factor.status === "verified",
      );

      setExistingFactor(
        verifiedFactor
          ? {
              friendly_name: verifiedFactor.friendly_name,
              id: verifiedFactor.id,
              status: verifiedFactor.status,
            }
          : null,
      );
    } catch (loadError) {
      setError(getSupabaseErrorMessage(loadError, "Could not load your MFA factors."));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadFactors();
  }, [loadFactors]);

  const startEnrollment = async () => {
    setEnrolling(true);
    setError(null);

    try {
      const { data: factorsData, error: factorsError } = await client.auth.mfa.listFactors();

      if (factorsError) {
        throw factorsError;
      }

      const staleTotpFactors = factorsData.all.filter(
        (factor) => factor.factor_type === "totp" && factor.status === "unverified",
      );

      await Promise.all(
        staleTotpFactors.map((factor) => client.auth.mfa.unenroll({ factorId: factor.id })),
      );

      const { data, error: enrollError } = await client.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: ADMIN_TOTP_NAME,
      });

      if (enrollError) {
        throw enrollError;
      }

      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setSetupCode("");
    } catch (enrollError) {
      setError(getSupabaseErrorMessage(enrollError, "Could not start MFA setup."));
    } finally {
      setEnrolling(false);
    }
  };

  const verifyFactor = async (factorId: string, code: string, successTitle: string) => {
    setVerifying(true);
    setError(null);

    try {
      const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        throw challengeError;
      }

      const { error: verifyError } = await client.auth.mfa.verify({
        challengeId: challenge.id,
        code: code.trim(),
        factorId,
      });

      if (verifyError) {
        throw verifyError;
      }

      await reloadSession();
      await loadFactors();
      setEnrollment(null);
      setSetupCode("");
      setVerificationCode("");

      toast({
        description: "Your admin session now meets the required MFA level.",
        title: successTitle,
      });
    } catch (verifyError) {
      setError(getSupabaseErrorMessage(verifyError, "Could not verify the MFA code."));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto border border-border bg-background p-6 space-y-5">
      <div className="space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-light text-foreground">Admin MFA Required</h2>
        <p className="text-sm font-light text-muted-foreground">
          Privileged admin pages now require a verified authenticator app and an `aal2` session.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>MFA step-up failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="border border-border p-4 text-sm font-light text-muted-foreground">
          Loading your MFA configuration...
        </div>
      ) : existingFactor ? (
        <div className="space-y-4">
          <div className="rounded-none border border-border bg-muted/20 p-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Verified factor</p>
            <p className="text-sm font-light text-foreground">{existingFactor.friendly_name || ADMIN_TOTP_NAME}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground" htmlFor="admin-mfa-code">
              Authenticator code
            </label>
            <Input
              autoComplete="one-time-code"
              className="rounded-none font-mono"
              id="admin-mfa-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              value={verificationCode}
            />
          </div>

          <Button
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
            disabled={verifying || verificationCode.trim().length < 6}
            onClick={() => void verifyFactor(existingFactor.id, verificationCode, "MFA verified")}
          >
            {verifying ? "Verifying..." : "Verify MFA and continue"}
          </Button>
        </div>
      ) : enrollment ? (
        <div className="space-y-4">
          <div className="rounded-none border border-border bg-muted/10 p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-light text-foreground">
              <KeyRound className="h-4 w-4" />
              Scan this QR code with your authenticator app
            </div>
            <img
              alt="Authenticator QR code"
              className="mx-auto h-52 w-52 border border-border bg-white p-3"
              src={`data:image/svg+xml;utf-8,${encodeURIComponent(enrollment.qrCode)}`}
            />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Manual setup secret</p>
              <Input className="rounded-none font-mono" readOnly value={enrollment.secret} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground" htmlFor="admin-mfa-setup-code">
              Enter the 6-digit code from your authenticator app
            </label>
            <Input
              autoComplete="one-time-code"
              className="rounded-none font-mono"
              id="admin-mfa-setup-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setSetupCode(event.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              value={setupCode}
            />
          </div>

          <Button
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
            disabled={verifying || setupCode.trim().length < 6}
            onClick={() => void verifyFactor(enrollment.factorId, setupCode, "MFA enabled")}
          >
            {verifying ? "Verifying..." : "Enable MFA"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-none border border-border bg-muted/20 p-4 text-sm font-light text-muted-foreground">
            No verified authenticator factor is enrolled for this admin account yet.
          </div>

          <Button
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
            disabled={enrolling}
            onClick={() => void startEnrollment()}
          >
            {enrolling ? "Preparing setup..." : "Set up authenticator app"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminMfaCard;
