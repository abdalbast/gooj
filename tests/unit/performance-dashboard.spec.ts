import { describe, expect, it } from "vitest";
import {
  buildReleaseTableRows,
  buildTrendChartData,
  getMetricDisplayOrder,
} from "@/lib/performance";

describe("performance dashboard helpers", () => {
  it("sorts metrics into a stable display order", () => {
    expect(
      getMetricDisplayOrder([
        { metricName: "CLS" as const },
        { metricName: "LCP" as const },
        { metricName: "INP" as const },
      ]).map((record) => record.metricName),
    ).toEqual(["LCP", "INP", "CLS"]);
  });

  it("builds trend chart rows grouped by day", () => {
    expect(
      buildTrendChartData([
        {
          bucketDate: "2026-03-30",
          metricName: "LCP",
          p75Value: 2400,
          rating: "good",
          sampleCount: 15,
        },
        {
          bucketDate: "2026-03-30",
          metricName: "INP",
          p75Value: 180,
          rating: "good",
          sampleCount: 15,
        },
        {
          bucketDate: "2026-03-31",
          metricName: "LCP",
          p75Value: 2600,
          rating: "needs-improvement",
          sampleCount: 18,
        },
      ]),
    ).toEqual([
      { INP: 180, LCP: 2400, dateLabel: "30 Mar" },
      { LCP: 2600, dateLabel: "31 Mar" },
    ]);
  });

  it("groups release summaries into release rows", () => {
    expect(
      buildReleaseTableRows([
        {
          appVersion: "build-b",
          lastReceivedAt: "2026-03-31T12:00:00.000Z",
          metricName: "LCP",
          p75Value: 2600,
          rating: "needs-improvement",
          sampleCount: 10,
        },
        {
          appVersion: "build-a",
          lastReceivedAt: "2026-03-30T12:00:00.000Z",
          metricName: "LCP",
          p75Value: 2200,
          rating: "good",
          sampleCount: 12,
        },
        {
          appVersion: "build-b",
          lastReceivedAt: "2026-03-31T12:00:00.000Z",
          metricName: "INP",
          p75Value: 210,
          rating: "needs-improvement",
          sampleCount: 10,
        },
      ]),
    ).toEqual([
      {
        INP: 210,
        LCP: 2600,
        appVersion: "build-b",
        lastReceivedAt: "2026-03-31T12:00:00.000Z",
      },
      {
        LCP: 2200,
        appVersion: "build-a",
        lastReceivedAt: "2026-03-30T12:00:00.000Z",
      },
    ]);
  });
});
