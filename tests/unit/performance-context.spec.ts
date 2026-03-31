import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildWebVitalEvent,
  getDeviceClass,
  getReferrerCategory,
  getViewportBucket,
  resolveRouteDescriptor,
} from "@/lib/performance";

describe("performance context", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/product/the-birthday-box");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://www.google.com/search?q=gooj",
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: {
        effectiveType: "4g",
        saveData: false,
      },
    });
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { type: "navigate" } as PerformanceNavigationTiming,
    ]);
  });

  it("derives stable route descriptors and coarse viewport context", () => {
    expect(resolveRouteDescriptor("/product/the-birthday-box")).toEqual({
      pageType: "catalog",
      path: "/product/the-birthday-box",
      routeKey: "product-detail",
    });
    expect(getDeviceClass(390)).toBe("mobile");
    expect(getViewportBucket(390)).toBe("xs");
    expect(getReferrerCategory("https://www.google.com/search?q=gooj", window.location.origin)).toBe("search");
  });

  it("builds a safe web vitals payload with route and device context", () => {
    const event = buildWebVitalEvent(
      {
        delta: 2450.2,
        entries: [{ startTime: 2450.2 } as PerformanceEntry],
        id: "lcp-1",
        name: "LCP",
        navigationType: "navigate",
        value: 2450.2,
      },
      {
        environment: "production",
        releaseId: "build-123",
        sampleRate: 1,
      },
    );

    expect(event).toMatchObject({
      deviceClass: "mobile",
      environment: "production",
      metricDelta: 2450,
      metricId: "lcp-1",
      metricName: "LCP",
      metricValue: 2450,
      navigationType: "navigate",
      networkType: "4g",
      pageType: "catalog",
      rating: "good",
      referrerCategory: "search",
      releaseId: "build-123",
      routeKey: "product-detail",
      routePath: "/product/the-birthday-box",
      saveData: false,
      schemaVersion: 1,
      viewportBucket: "xs",
      wasRestoredFromBfcache: false,
    });
    expect(event?.capturedAt).toMatch(/T/);
  });
});
