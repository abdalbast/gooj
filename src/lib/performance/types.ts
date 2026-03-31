export const WEB_VITAL_NAMES = ["CLS", "FCP", "INP", "LCP", "TTFB"] as const;

export type WebVitalName = typeof WEB_VITAL_NAMES[number];
export type WebVitalRating = "good" | "needs-improvement" | "poor";
export type DeviceClass = "mobile" | "tablet" | "desktop";
export type ViewportBucket = "xs" | "sm" | "md" | "lg" | "xl";
export type ReferrerCategory = "direct" | "internal" | "search" | "social" | "external";
export type PerformancePageType =
  | "account"
  | "admin"
  | "catalog"
  | "checkout"
  | "content"
  | "legal"
  | "other"
  | "storefront";

export interface RouteDescriptor {
  pageType: PerformancePageType;
  path: string;
  routeKey: string;
}

export interface WebVitalContext {
  capturedAt: string;
  deviceClass: DeviceClass;
  environment: string;
  navigationType: string;
  networkType: string | null;
  pageType: PerformancePageType;
  referrerCategory: ReferrerCategory;
  releaseId: string;
  routeKey: string;
  routePath: string;
  sampleRate: number;
  saveData: boolean | null;
  viewportBucket: ViewportBucket;
  wasRestoredFromBfcache: boolean;
}

export interface WebVitalEvent extends WebVitalContext {
  metricDelta: number;
  metricId: string;
  metricName: WebVitalName;
  metricValue: number;
  rating: WebVitalRating;
  schemaVersion: 1;
}

export interface WebVitalEnvelope {
  environment: string;
  events: WebVitalEvent[];
  releaseId: string;
  schemaVersion: 1;
  sentAt: string;
  source: "gooj-web-vitals";
}
