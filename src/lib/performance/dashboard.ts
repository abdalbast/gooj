import type {
  WebVitalsDailyTrendRecord,
  WebVitalsReleaseSummaryRecord,
} from "./reporting";
import type { WebVitalName } from "./types";

export const WEB_VITAL_DISPLAY_ORDER: WebVitalName[] = ["LCP", "INP", "CLS", "FCP", "TTFB"];

type MetricChartRow = {
  dateLabel: string;
} & Partial<Record<WebVitalName, number>>;

type ReleaseTableRow = {
  appVersion: string;
  lastReceivedAt: string;
} & Partial<Record<WebVitalName, number>>;

const sortMetricNames = (left: WebVitalName, right: WebVitalName) =>
  WEB_VITAL_DISPLAY_ORDER.indexOf(left) - WEB_VITAL_DISPLAY_ORDER.indexOf(right);

export const getMetricDisplayOrder = <T extends { metricName: WebVitalName }>(records: T[]) =>
  [...records].sort((left, right) => sortMetricNames(left.metricName, right.metricName));

export const buildTrendChartData = (records: WebVitalsDailyTrendRecord[]): MetricChartRow[] => {
  const rows = new Map<string, MetricChartRow>();

  for (const record of records) {
    const row = rows.get(record.bucketDate) ?? {
      dateLabel: new Date(`${record.bucketDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    };

    row[record.metricName] = record.p75Value;
    rows.set(record.bucketDate, row);
  }

  return Array.from(rows.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
};

export const buildReleaseTableRows = (records: WebVitalsReleaseSummaryRecord[]): ReleaseTableRow[] => {
  const rows = new Map<string, ReleaseTableRow>();

  for (const record of records) {
    const row = rows.get(record.appVersion) ?? {
      appVersion: record.appVersion,
      lastReceivedAt: record.lastReceivedAt,
    };

    row[record.metricName] = record.p75Value;
    rows.set(record.appVersion, row);
  }

  return Array.from(rows.values()).sort((left, right) =>
    right.lastReceivedAt.localeCompare(left.lastReceivedAt),
  );
};
