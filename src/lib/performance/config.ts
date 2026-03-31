export interface WebVitalsConfig {
  debug: boolean;
  enabled: boolean;
  endpoint: string | null;
  environment: string;
  releaseId: string;
  sampleRate: number;
}

const parseBoolean = (value: string | undefined) => {
  if (value == null || value.trim() === "") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
};

const parseSampleRate = (value: string | undefined) => {
  if (value == null || value.trim() === "") {
    return 1;
  }

  const parsedValue = Number.parseFloat(value);

  if (!Number.isFinite(parsedValue)) {
    return 1;
  }

  return Math.min(1, Math.max(0, parsedValue));
};

const deriveDefaultEndpoint = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();

  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL("/functions/v1/report-web-vitals", supabaseUrl).toString();
  } catch {
    return null;
  }
};

const isLocalPreviewOrigin = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return ["127.0.0.1", "localhost", "::1"].includes(window.location.hostname);
};

export const getWebVitalsConfig = (): WebVitalsConfig => {
  const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT?.trim() || deriveDefaultEndpoint();
  const explicitEnabled = parseBoolean(import.meta.env.VITE_WEB_VITALS_ENABLED);
  const debug = parseBoolean(import.meta.env.VITE_WEB_VITALS_DEBUG) ?? import.meta.env.DEV;
  const enabled =
    explicitEnabled ?? (import.meta.env.PROD && endpoint != null && !isLocalPreviewOrigin());

  return {
    debug,
    enabled,
    endpoint,
    environment: import.meta.env.PROD ? "production" : import.meta.env.MODE,
    releaseId: import.meta.env.VITE_WEB_VITALS_RELEASE_ID?.trim() || __APP_BUILD_ID__,
    sampleRate: parseSampleRate(import.meta.env.VITE_WEB_VITALS_SAMPLE_RATE),
  };
};
