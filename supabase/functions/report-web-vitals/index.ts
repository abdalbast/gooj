import { createClient } from "npm:@supabase/supabase-js@2.100.1";

type MetricName = "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
type MetricRating = "good" | "needs-improvement" | "poor";
type DeviceClass = "mobile" | "tablet" | "desktop";
type ViewportBucket = "xs" | "sm" | "md" | "lg" | "xl";
type ReferrerCategory = "direct" | "internal" | "search" | "social" | "external";
type PageType = "account" | "admin" | "catalog" | "checkout" | "content" | "legal" | "other" | "storefront";

type WebVitalEvent = {
  capturedAt: string;
  deviceClass: DeviceClass;
  environment: string;
  metricDelta: number;
  metricId: string;
  metricName: MetricName;
  metricValue: number;
  navigationType: string;
  networkType: string | null;
  pageType: PageType;
  rating: MetricRating;
  referrerCategory: ReferrerCategory;
  releaseId: string;
  routeKey: string;
  routePath: string;
  sampleRate: number;
  saveData: boolean | null;
  schemaVersion: 1;
  viewportBucket: ViewportBucket;
  wasRestoredFromBfcache: boolean;
};

type WebVitalEnvelope = {
  environment: string;
  events: WebVitalEvent[];
  releaseId: string;
  schemaVersion: 1;
  sentAt: string;
  source: "gooj-web-vitals";
};

const ALLOWED_ORIGINS = new Set([
  "https://gooj.vercel.app",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://gooj.vercel.app",
  "Cache-Control": "no-store",
  Vary: "Origin",
});

const isMetricName = (value: string): value is MetricName =>
  ["CLS", "FCP", "INP", "LCP", "TTFB"].includes(value);

const isMetricRating = (value: string): value is MetricRating =>
  ["good", "needs-improvement", "poor"].includes(value);

const isDeviceClass = (value: string): value is DeviceClass =>
  ["mobile", "tablet", "desktop"].includes(value);

const isViewportBucket = (value: string): value is ViewportBucket =>
  ["xs", "sm", "md", "lg", "xl"].includes(value);

const isReferrerCategory = (value: string): value is ReferrerCategory =>
  ["direct", "internal", "search", "social", "external"].includes(value);

const isPageType = (value: string): value is PageType =>
  ["account", "admin", "catalog", "checkout", "content", "legal", "other", "storefront"].includes(value);

const isIsoDate = (value: string) => !Number.isNaN(Date.parse(value));

const isSafeString = (value: unknown, maxLength: number) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;

const isOptionalSafeString = (value: unknown, maxLength: number) =>
  value == null || (typeof value === "string" && value.length <= maxLength);

const isFiniteMetricValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const parseEnvelope = async (request: Request) => {
  const rawBody = await request.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as Partial<WebVitalEnvelope>;
  } catch {
    return null;
  }
};

const isValidEvent = (event: Partial<WebVitalEvent>): event is WebVitalEvent => {
  return (
    event.schemaVersion === 1 &&
    isMetricName(event.metricName ?? "") &&
    isFiniteMetricValue(event.metricValue) &&
    isFiniteMetricValue(event.metricDelta) &&
    isSafeString(event.metricId, 128) &&
    isMetricRating(event.rating ?? "") &&
    isSafeString(event.routeKey, 80) &&
    isSafeString(event.routePath, 160) &&
    isPageType(event.pageType ?? "") &&
    isSafeString(event.releaseId, 120) &&
    isSafeString(event.environment, 32) &&
    isDeviceClass(event.deviceClass ?? "") &&
    isViewportBucket(event.viewportBucket ?? "") &&
    isOptionalSafeString(event.networkType, 24) &&
    (event.saveData === null || typeof event.saveData === "boolean") &&
    isReferrerCategory(event.referrerCategory ?? "") &&
    isSafeString(event.navigationType, 32) &&
    typeof event.wasRestoredFromBfcache === "boolean" &&
    typeof event.sampleRate === "number" &&
    event.sampleRate > 0 &&
    event.sampleRate <= 1 &&
    isSafeString(event.capturedAt, 64) &&
    isIsoDate(event.capturedAt)
  );
};

const createResponse = (status: number, origin: string | null, body?: Record<string, string>) =>
  new Response(body ? JSON.stringify(body) : null, {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
    status,
  });

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return createResponse(204, origin);
  }

  if (request.method !== "POST") {
    return createResponse(405, origin, { error: "Method not allowed." });
  }

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return createResponse(403, origin, { error: "Origin not allowed." });
  }

  const envelope = await parseEnvelope(request);

  if (
    !envelope ||
    envelope.schemaVersion !== 1 ||
    envelope.source !== "gooj-web-vitals" ||
    !Array.isArray(envelope.events) ||
    envelope.events.length === 0 ||
    envelope.events.length > 10
  ) {
    return createResponse(400, origin, { error: "Invalid payload." });
  }

  const validEvents = envelope.events.filter(isValidEvent);

  if (validEvents.length !== envelope.events.length) {
    return createResponse(400, origin, { error: "Invalid event payload." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return createResponse(500, origin, { error: "Supabase environment is not configured." });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const records = validEvents.map((event) => ({
    app_version: event.releaseId,
    captured_at: event.capturedAt,
    device_class: event.deviceClass,
    environment: event.environment,
    metric_delta: event.metricDelta,
    metric_id: event.metricId,
    metric_name: event.metricName,
    metric_value: event.metricValue,
    navigation_type: event.navigationType,
    network_type: event.networkType,
    page_type: event.pageType,
    rating: event.rating,
    referrer_category: event.referrerCategory,
    route_key: event.routeKey,
    route_path: event.routePath,
    sample_rate: event.sampleRate,
    save_data: event.saveData,
    schema_version: event.schemaVersion,
    viewport_bucket: event.viewportBucket,
    was_restored_from_bfcache: event.wasRestoredFromBfcache,
  }));

  const { error } = await supabase.from("web_vitals_events").upsert(records, {
    ignoreDuplicates: true,
    onConflict: "metric_name,metric_id",
  });

  if (error) {
    console.error("report-web-vitals insert failed", error);
    return createResponse(500, origin, { error: "Could not store metrics." });
  }

  return createResponse(202, origin, { status: "accepted" });
});
