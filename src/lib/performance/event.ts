import type { Metric } from "web-vitals";
import type { WebVitalsConfig } from "./config";
import { buildWebVitalContext } from "./context";
import { classifyWebVital, normalizeWebVitalValue } from "./thresholds";
import { WEB_VITAL_NAMES, type WebVitalEvent } from "./types";

type MetricLike = Pick<Metric, "delta" | "entries" | "id" | "name" | "navigationType" | "value">;
type EventConfig = Pick<WebVitalsConfig, "environment" | "releaseId" | "sampleRate">;

export const isSupportedMetricName = (metricName: string): metricName is (typeof WEB_VITAL_NAMES)[number] =>
  WEB_VITAL_NAMES.includes(metricName as (typeof WEB_VITAL_NAMES)[number]);

export const buildWebVitalEvent = (
  metric: MetricLike,
  config: EventConfig,
): WebVitalEvent | null => {
  if (!isSupportedMetricName(metric.name)) {
    return null;
  }

  const metricValue = normalizeWebVitalValue(metric.name, metric.value);
  const metricDelta = normalizeWebVitalValue(metric.name, metric.delta);

  return {
    ...buildWebVitalContext({
      environment: config.environment,
      metricEntries: metric.entries,
      navigationType: metric.navigationType,
      releaseId: config.releaseId,
      sampleRate: config.sampleRate,
    }),
    metricDelta,
    metricId: metric.id,
    metricName: metric.name,
    metricValue,
    rating: classifyWebVital(metric.name, metricValue),
    schemaVersion: 1,
  };
};
