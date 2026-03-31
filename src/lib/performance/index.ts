export { getWebVitalsConfig } from "./config";
export {
  buildReleaseTableRows,
  buildTrendChartData,
  getMetricDisplayOrder,
  WEB_VITAL_DISPLAY_ORDER,
} from "./dashboard";
export { buildWebVitalEvent, isSupportedMetricName } from "./event";
export {
  buildWebVitalContext,
  getDeviceClass,
  getReferrerCategory,
  getViewportBucket,
  resolveRouteDescriptor,
  startPerformanceContextTracking,
} from "./context";
export { getWebVitalsReportSnapshot } from "./reporting";
export {
  classifyWebVital,
  formatWebVitalValue,
  getWebVitalThresholds,
  normalizeWebVitalValue,
} from "./thresholds";
export { createWebVitalsTransport, deliverWebVitalsPayload } from "./transport";
export { startWebVitalsMonitoring } from "./webVitals";
export type {
  PerformancePageType,
  ReferrerCategory,
  RouteDescriptor,
  WebVitalContext,
  WebVitalEnvelope,
  WebVitalEvent,
  WebVitalName,
  WebVitalRating,
} from "./types";
export type {
  WebVitalsDailyTrendRecord,
  WebVitalsDeviceSummaryRecord,
  WebVitalsOverviewRecord,
  WebVitalsReleaseSummaryRecord,
  WebVitalsReportFilter,
  WebVitalsReportSnapshot,
  WebVitalsRouteSummaryRecord,
} from "./reporting";
