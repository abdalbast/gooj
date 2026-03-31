import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { AdminPageAlert } from "@/components/admin/AdminPageAlert";
import { AdminPageLoadingState } from "@/components/admin/AdminPageLoadingState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseErrorMessage } from "@/lib/supabaseData";
import {
  buildReleaseTableRows,
  buildTrendChartData,
  formatWebVitalValue,
  getMetricDisplayOrder,
  getWebVitalsReportSnapshot,
  WEB_VITAL_DISPLAY_ORDER,
  type WebVitalName,
  type WebVitalRating,
  type WebVitalsDeviceSummaryRecord,
  type WebVitalsReportSnapshot,
} from "@/lib/performance";

const metricStroke: Record<WebVitalName, string> = {
  CLS: "hsl(204, 94%, 40%)",
  FCP: "hsl(280, 70%, 45%)",
  INP: "hsl(12, 84%, 52%)",
  LCP: "hsl(142, 71%, 35%)",
  TTFB: "hsl(38, 92%, 50%)",
};

const ratingClasses: Record<WebVitalRating, string> = {
  good: "bg-green-50 text-green-700",
  "needs-improvement": "bg-amber-50 text-amber-700",
  poor: "bg-red-50 text-red-700",
};

const getRatingLabel = (rating: WebVitalRating) =>
  rating === "needs-improvement" ? "Needs Improvement" : rating[0].toUpperCase() + rating.slice(1);

const getDeviceMatrix = (records: WebVitalsDeviceSummaryRecord[]) => {
  return WEB_VITAL_DISPLAY_ORDER.map((metricName) => ({
    desktop: records.find(
      (record) => record.metricName === metricName && record.deviceClass === "desktop",
    ),
    metricName,
    mobile: records.find(
      (record) => record.metricName === metricName && record.deviceClass === "mobile",
    ),
    tablet: records.find(
      (record) => record.metricName === metricName && record.deviceClass === "tablet",
    ),
  }));
};

const windowOptions = [
  { label: "7 days", value: "7" },
  { label: "14 days", value: "14" },
  { label: "30 days", value: "30" },
];

const AdminPerformance = () => {
  const [snapshot, setSnapshot] = useState<WebVitalsReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState("14");
  const [releaseFilter, setReleaseFilter] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError(null);

    void getWebVitalsReportSnapshot({
      releaseFilter: releaseFilter === "all" ? null : releaseFilter,
      windowDays: Number.parseInt(windowDays, 10),
    })
      .then((report) => {
        if (!active) {
          return;
        }

        setSnapshot(report);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setPageError(getSupabaseErrorMessage(error, "Could not load performance reporting."));
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [releaseFilter, windowDays]);

  const overview = useMemo(
    () => getMetricDisplayOrder(snapshot?.overview ?? []),
    [snapshot?.overview],
  );
  const trendData = useMemo(
    () => buildTrendChartData(snapshot?.trends ?? []),
    [snapshot?.trends],
  );
  const deviceMatrix = useMemo(
    () => getDeviceMatrix(snapshot?.devices ?? []),
    [snapshot?.devices],
  );
  const releaseRows = useMemo(
    () => buildReleaseTableRows(snapshot?.releases ?? []),
    [snapshot?.releases],
  );
  const releaseOptions = useMemo(
    () => releaseRows.map((row) => row.appVersion),
    [releaseRows],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-light text-foreground">Performance</h1>
          <p className="max-w-2xl text-sm font-light text-muted-foreground">
            Real user Core Web Vitals from the storefront, summarized as p75 with route, device, and release segmentation.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select onValueChange={setWindowDays} value={windowDays}>
            <SelectTrigger className="w-[140px] rounded-none">
              <SelectValue placeholder="Window" />
            </SelectTrigger>
            <SelectContent>
              {windowOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setReleaseFilter} value={releaseFilter}>
            <SelectTrigger className="w-[220px] rounded-none">
              <SelectValue placeholder="All releases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Releases</SelectItem>
              {releaseOptions.map((releaseId) => (
                <SelectItem key={releaseId} value={releaseId}>
                  {releaseId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageError ? (
        <AdminPageAlert title="Performance query failed">{pageError}</AdminPageAlert>
      ) : null}

      {loading ? (
        <AdminPageLoadingState message="Loading Core Web Vitals from Supabase..." />
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light text-foreground">p75 Overview</h2>
              <span className="text-xs text-muted-foreground">
                Primary summary: 75th percentile over the selected window
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {overview.map((metric) => (
                <div className="border border-border p-5 space-y-3" key={metric.metricName}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{metric.metricName}</span>
                    <span className={`px-2 py-1 text-[11px] ${ratingClasses[metric.rating]}`}>
                      {getRatingLabel(metric.rating)}
                    </span>
                  </div>
                  <div className="text-2xl font-light text-foreground">
                    {formatWebVitalValue(metric.metricName, metric.p75Value)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block">Good</span>
                      <span className="text-foreground">{metric.goodCount}</span>
                    </div>
                    <div>
                      <span className="block">Needs Work</span>
                      <span className="text-foreground">{metric.needsImprovementCount}</span>
                    </div>
                    <div>
                      <span className="block">Poor</span>
                      <span className="text-foreground">{metric.poorCount}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.sampleCount} samples</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            {overview.map((metric) => (
              <div className="border border-border p-5 xl:col-span-1" key={`trend-${metric.metricName}`}>
                <div className="space-y-1 mb-4">
                  <h2 className="text-sm font-medium text-foreground">{metric.metricName} Trend</h2>
                  <p className="text-xs text-muted-foreground">
                    p75 by day for the selected window
                  </p>
                </div>
                <div className="h-[180px]">
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        width={50}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatWebVitalValue(metric.metricName, value), metric.metricName]}
                      />
                      <Line
                        dataKey={metric.metricName}
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                        stroke={metricStroke[metric.metricName]}
                        strokeWidth={2}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="border border-border p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-light text-foreground">Worst Routes</h2>
                <p className="text-sm font-light text-muted-foreground">
                  Top p75 offenders per metric with enough sample volume to trust.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="p-3 text-left text-sm font-normal text-foreground">Metric</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">Route</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">p75</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">Poor Rate</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">Samples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot?.routes.map((route) => (
                      <tr className="border-b border-border last:border-0" key={`${route.metricName}-${route.routeKey}`}>
                        <td className="p-3 text-sm font-light">{route.metricName}</td>
                        <td className="p-3 text-sm font-light text-muted-foreground">
                          {route.routeKey}
                          <div className="text-xs text-muted-foreground/80">{route.pageType}</div>
                        </td>
                        <td className="p-3 text-sm font-light">
                          {formatWebVitalValue(route.metricName, route.p75Value)}
                        </td>
                        <td className="p-3 text-sm font-light">{route.poorRate}%</td>
                        <td className="p-3 text-sm font-light">{route.sampleCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {snapshot?.routes.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">Not enough data yet to rank routes.</p>
                )}
              </div>
            </div>

            <div className="border border-border p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-light text-foreground">Device Split</h2>
                <p className="text-sm font-light text-muted-foreground">
                  p75 per metric by coarse device class.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="p-3 text-left text-sm font-normal text-foreground">Metric</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">Mobile</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">Tablet</th>
                      <th className="p-3 text-left text-sm font-normal text-foreground">Desktop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceMatrix.map((row) => (
                      <tr className="border-b border-border last:border-0" key={row.metricName}>
                        <td className="p-3 text-sm font-light">{row.metricName}</td>
                        {[row.mobile, row.tablet, row.desktop].map((record, index) => (
                          <td className="p-3 text-sm font-light" key={`${row.metricName}-${index}`}>
                            {record ? formatWebVitalValue(row.metricName, record.p75Value) : "—"}
                            <div className="text-xs text-muted-foreground">
                              {record ? `${record.sampleCount} samples` : ""}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="border border-border p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-light text-foreground">Release Comparison</h2>
              <p className="text-sm font-light text-muted-foreground">
                Recent build ids with p75 by metric to spot regressions after deployment.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="p-3 text-left text-sm font-normal text-foreground">Release</th>
                    {WEB_VITAL_DISPLAY_ORDER.map((metricName) => (
                      <th className="p-3 text-left text-sm font-normal text-foreground" key={metricName}>
                        {metricName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {releaseRows.map((row) => (
                    <tr className="border-b border-border last:border-0" key={row.appVersion}>
                      <td className="p-3 text-sm font-light text-muted-foreground">
                        <div className="text-foreground">{row.appVersion}</div>
                        <div className="text-xs">
                          {new Date(row.lastReceivedAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>
                      {WEB_VITAL_DISPLAY_ORDER.map((metricName) => (
                        <td className="p-3 text-sm font-light" key={`${row.appVersion}-${metricName}`}>
                          {row[metricName] != null
                            ? formatWebVitalValue(metricName, row[metricName] as number)
                            : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {releaseRows.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">No release-level data available yet.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminPerformance;
