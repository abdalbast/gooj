import type { Metric } from "web-vitals";
import { getWebVitalsConfig } from "./config";
import { startPerformanceContextTracking } from "./context";
import { buildWebVitalEvent } from "./event";
import { createWebVitalsTransport } from "./transport";

let webVitalsStarted = false;

const scheduleObserverRegistration = (callback: () => void) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => callback());
    return;
  }

  window.setTimeout(callback, 0);
};

const shouldSampleSession = (sampleRate: number) => {
  if (sampleRate >= 1) {
    return true;
  }

  if (sampleRate <= 0) {
    return false;
  }

  return Math.random() <= sampleRate;
};

export const startWebVitalsMonitoring = () => {
  if (webVitalsStarted || typeof window === "undefined") {
    return;
  }

  const config = getWebVitalsConfig();

  if (!config.enabled && !config.debug) {
    return;
  }

  webVitalsStarted = true;
  startPerformanceContextTracking();

  if (!shouldSampleSession(config.sampleRate)) {
    return;
  }

  const transport = createWebVitalsTransport(config);

  scheduleObserverRegistration(() => {
    void import("web-vitals")
      .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        const handleMetric = (metric: Metric) => {
          const event = buildWebVitalEvent(metric, config);

          if (!event) {
            return;
          }

          transport.report(event);
        };

        onCLS(handleMetric);
        onFCP(handleMetric);
        onINP(handleMetric);
        onLCP(handleMetric);
        onTTFB(handleMetric);
      })
      .catch(() => {
        // Keep web vitals optional and never break the application bootstrap.
      });
  });
};
