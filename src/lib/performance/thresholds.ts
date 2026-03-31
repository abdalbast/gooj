import type { WebVitalName, WebVitalRating } from "./types";

const WEB_VITAL_THRESHOLDS: Record<WebVitalName, readonly [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
};

export const getWebVitalThresholds = (metricName: WebVitalName) => WEB_VITAL_THRESHOLDS[metricName];

export const classifyWebVital = (metricName: WebVitalName, metricValue: number): WebVitalRating => {
  const [goodThreshold, needsImprovementThreshold] = getWebVitalThresholds(metricName);

  if (metricValue <= goodThreshold) {
    return "good";
  }

  if (metricValue <= needsImprovementThreshold) {
    return "needs-improvement";
  }

  return "poor";
};

export const normalizeWebVitalValue = (metricName: WebVitalName, metricValue: number) => {
  if (metricName === "CLS") {
    return Number(metricValue.toFixed(4));
  }

  return Math.round(metricValue);
};

export const formatWebVitalValue = (metricName: WebVitalName, metricValue: number) => {
  if (metricName === "CLS") {
    return metricValue.toFixed(3);
  }

  return `${Math.round(metricValue).toLocaleString("en-GB")} ms`;
};
