import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/supabase.types";
import type {
  DeviceClass,
  PerformancePageType,
  WebVitalName,
  WebVitalRating,
} from "./types";

type OverviewRow = Database["public"]["Functions"]["get_web_vitals_overview"]["Returns"][number];
type RouteSummaryRow = Database["public"]["Functions"]["get_web_vitals_route_summary"]["Returns"][number];
type DailyTrendRow = Database["public"]["Functions"]["get_web_vitals_daily_trends"]["Returns"][number];
type DeviceSummaryRow = Database["public"]["Functions"]["get_web_vitals_device_summary"]["Returns"][number];
type ReleaseSummaryRow = Database["public"]["Functions"]["get_web_vitals_release_summary"]["Returns"][number];

export interface WebVitalsOverviewRecord {
  goodCount: number;
  metricName: WebVitalName;
  needsImprovementCount: number;
  p75Value: number;
  poorCount: number;
  rating: WebVitalRating;
  sampleCount: number;
}

export interface WebVitalsRouteSummaryRecord {
  metricName: WebVitalName;
  p75Value: number;
  pageType: PerformancePageType;
  poorCount: number;
  poorRate: number;
  rating: WebVitalRating;
  routeKey: string;
  sampleCount: number;
}

export interface WebVitalsDailyTrendRecord {
  bucketDate: string;
  metricName: WebVitalName;
  p75Value: number;
  rating: WebVitalRating;
  sampleCount: number;
}

export interface WebVitalsDeviceSummaryRecord {
  deviceClass: DeviceClass;
  metricName: WebVitalName;
  p75Value: number;
  rating: WebVitalRating;
  sampleCount: number;
}

export interface WebVitalsReleaseSummaryRecord {
  appVersion: string;
  lastReceivedAt: string;
  metricName: WebVitalName;
  p75Value: number;
  rating: WebVitalRating;
  sampleCount: number;
}

export interface WebVitalsReportFilter {
  environmentFilter?: string | null;
  releaseFilter?: string | null;
  windowDays: number;
}

export interface WebVitalsReportSnapshot {
  devices: WebVitalsDeviceSummaryRecord[];
  overview: WebVitalsOverviewRecord[];
  releases: WebVitalsReleaseSummaryRecord[];
  routes: WebVitalsRouteSummaryRecord[];
  trends: WebVitalsDailyTrendRecord[];
}

const mapOverviewRecord = (row: OverviewRow): WebVitalsOverviewRecord => ({
  goodCount: row.good_count,
  metricName: row.metric_name as WebVitalName,
  needsImprovementCount: row.needs_improvement_count,
  p75Value: row.p75_value,
  poorCount: row.poor_count,
  rating: row.rating as WebVitalRating,
  sampleCount: row.sample_count,
});

const mapRouteSummaryRecord = (row: RouteSummaryRow): WebVitalsRouteSummaryRecord => ({
  metricName: row.metric_name as WebVitalName,
  p75Value: row.p75_value,
  pageType: row.page_type as PerformancePageType,
  poorCount: row.poor_count,
  poorRate: row.poor_rate,
  rating: row.rating as WebVitalRating,
  routeKey: row.route_key,
  sampleCount: row.sample_count,
});

const mapDailyTrendRecord = (row: DailyTrendRow): WebVitalsDailyTrendRecord => ({
  bucketDate: row.bucket_date,
  metricName: row.metric_name as WebVitalName,
  p75Value: row.p75_value,
  rating: row.rating as WebVitalRating,
  sampleCount: row.sample_count,
});

const mapDeviceSummaryRecord = (row: DeviceSummaryRow): WebVitalsDeviceSummaryRecord => ({
  deviceClass: row.device_class as DeviceClass,
  metricName: row.metric_name as WebVitalName,
  p75Value: row.p75_value,
  rating: row.rating as WebVitalRating,
  sampleCount: row.sample_count,
});

const mapReleaseSummaryRecord = (row: ReleaseSummaryRow): WebVitalsReleaseSummaryRecord => ({
  appVersion: row.app_version,
  lastReceivedAt: row.last_received_at,
  metricName: row.metric_name as WebVitalName,
  p75Value: row.p75_value,
  rating: row.rating as WebVitalRating,
  sampleCount: row.sample_count,
});

const getFilterArgs = (filter: WebVitalsReportFilter) => ({
  environment_filter: filter.environmentFilter ?? "production",
  release_filter: filter.releaseFilter ?? null,
  window_days: filter.windowDays,
});

const getOverview = async (filter: WebVitalsReportFilter) => {
  const { data, error } = await getSupabaseClient().rpc("get_web_vitals_overview", getFilterArgs(filter));

  if (error) {
    throw error;
  }

  return data.map(mapOverviewRecord);
};

const getRouteSummary = async (filter: WebVitalsReportFilter) => {
  const { data, error } = await getSupabaseClient().rpc("get_web_vitals_route_summary", {
    ...getFilterArgs(filter),
    limit_count: 5,
  });

  if (error) {
    throw error;
  }

  return data.map(mapRouteSummaryRecord);
};

const getDailyTrends = async (filter: WebVitalsReportFilter) => {
  const { data, error } = await getSupabaseClient().rpc("get_web_vitals_daily_trends", getFilterArgs(filter));

  if (error) {
    throw error;
  }

  return data.map(mapDailyTrendRecord);
};

const getDeviceSummary = async (filter: WebVitalsReportFilter) => {
  const { data, error } = await getSupabaseClient().rpc("get_web_vitals_device_summary", getFilterArgs(filter));

  if (error) {
    throw error;
  }

  return data.map(mapDeviceSummaryRecord);
};

const getReleaseSummary = async (filter: WebVitalsReportFilter) => {
  const { data, error } = await getSupabaseClient().rpc("get_web_vitals_release_summary", {
    environment_filter: filter.environmentFilter ?? "production",
    release_limit: 5,
    window_days: Math.max(filter.windowDays, 30),
  });

  if (error) {
    throw error;
  }

  return data.map(mapReleaseSummaryRecord);
};

export const getWebVitalsReportSnapshot = async (
  filter: WebVitalsReportFilter,
): Promise<WebVitalsReportSnapshot> => {
  const [overview, routes, trends, devices, releases] = await Promise.all([
    getOverview(filter),
    getRouteSummary(filter),
    getDailyTrends(filter),
    getDeviceSummary(filter),
    getReleaseSummary(filter),
  ]);

  return {
    devices,
    overview,
    releases,
    routes,
    trends,
  };
};
