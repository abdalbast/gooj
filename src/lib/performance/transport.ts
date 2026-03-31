import type { WebVitalsConfig } from "./config";
import type { WebVitalEnvelope, WebVitalEvent } from "./types";

declare global {
  interface Navigator {
    connection?: NetworkInformation & { saveData?: boolean };
  }

  interface Window {
    __GOOJ_WEB_VITALS__?: WebVitalEvent[];
  }
}

const MAX_BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 1000;

type FlushReason = "capacity" | "pagehide" | "timer" | "visibilitychange";

const createEnvelope = (
  events: WebVitalEvent[],
  config: Pick<WebVitalsConfig, "environment" | "releaseId">,
): WebVitalEnvelope => ({
  environment: config.environment,
  events,
  releaseId: config.releaseId,
  schemaVersion: 1,
  sentAt: new Date().toISOString(),
  source: "gooj-web-vitals",
});

const createBeaconBody = (payload: string) =>
  new Blob([payload], { type: "text/plain;charset=UTF-8" });

export const deliverWebVitalsPayload = async ({
  endpoint,
  payload,
  preferBeacon,
}: {
  endpoint: string;
  payload: string;
  preferBeacon: boolean;
}) => {
  if (preferBeacon && typeof navigator.sendBeacon === "function") {
    try {
      const queued = navigator.sendBeacon(endpoint, createBeaconBody(payload));

      if (queued) {
        return "beacon" as const;
      }
    } catch {
      // Ignore transport failures and fall through to fetch.
    }
  }

  try {
    await fetch(endpoint, {
      body: payload,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
      mode: "cors",
    });

    return "fetch" as const;
  } catch {
    return "none" as const;
  }
};

export const createWebVitalsTransport = (config: WebVitalsConfig) => {
  let flushTimer: number | null = null;
  let lifecycleHooksRegistered = false;
  const queue: WebVitalEvent[] = [];

  const clearFlushTimer = () => {
    if (flushTimer != null) {
      window.clearTimeout(flushTimer);
      flushTimer = null;
    }
  };

  const flush = async (reason: FlushReason) => {
    clearFlushTimer();

    if (!config.endpoint || queue.length === 0) {
      return;
    }

    const events = queue.splice(0, queue.length);
    const payload = JSON.stringify(createEnvelope(events, config));

    await deliverWebVitalsPayload({
      endpoint: config.endpoint,
      payload,
      preferBeacon: reason === "pagehide" || reason === "visibilitychange",
    });
  };

  const scheduleFlush = () => {
    if (flushTimer != null) {
      return;
    }

    flushTimer = window.setTimeout(() => {
      void flush("timer");
    }, FLUSH_INTERVAL_MS);
  };

  const registerLifecycleHooks = () => {
    if (lifecycleHooksRegistered) {
      return;
    }

    lifecycleHooksRegistered = true;

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        void flush("visibilitychange");
      }
    });

    window.addEventListener("pagehide", () => {
      void flush("pagehide");
    });
  };

  const report = (event: WebVitalEvent) => {
    if (config.debug) {
      window.__GOOJ_WEB_VITALS__ = [...(window.__GOOJ_WEB_VITALS__ ?? []), event];
      // Keep the browser-side diagnostics opt-in and quiet in production.
      console.debug("[web-vitals]", event);
    }

    if (!config.enabled || !config.endpoint) {
      return;
    }

    queue.push(event);

    if (queue.length >= MAX_BATCH_SIZE) {
      void flush("capacity");
      return;
    }

    registerLifecycleHooks();
    scheduleFlush();
  };

  return {
    flush,
    report,
  };
};
