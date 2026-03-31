const DEFAULT_DEPLOYMENT_URL = "https://gooj.vercel.app";

const REQUIRED_RELEASE_ENV_KEYS = [
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_TOTP_SECRET",
  "E2E_GMAIL_CLIENT_ID",
  "E2E_GMAIL_CLIENT_SECRET",
  "E2E_GMAIL_REFRESH_TOKEN",
] as const;

export interface ReleaseAdminCredentials {
  adminEmail: string;
  gmailClientId: string;
  gmailClientSecret: string;
  gmailRefreshToken: string;
  totpSecret: string;
}

const requireEnv = (key: (typeof REQUIRED_RELEASE_ENV_KEYS)[number]) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${key}. Populate the release automation secrets before running npm run test:release.`,
    );
  }

  return value;
};

export const getDeploymentUrl = () => {
  const rawValue = process.env.DEPLOYMENT_URL?.trim() || DEFAULT_DEPLOYMENT_URL;

  return rawValue.startsWith("http") ? rawValue : `https://${rawValue}`;
};

export const getDeploymentOrigin = () => new URL(getDeploymentUrl()).origin;

export const getReleaseAdminCredentials = (): ReleaseAdminCredentials => ({
  adminEmail: requireEnv("E2E_ADMIN_EMAIL"),
  gmailClientId: requireEnv("E2E_GMAIL_CLIENT_ID"),
  gmailClientSecret: requireEnv("E2E_GMAIL_CLIENT_SECRET"),
  gmailRefreshToken: requireEnv("E2E_GMAIL_REFRESH_TOKEN"),
  totpSecret: requireEnv("E2E_ADMIN_TOTP_SECRET"),
});
