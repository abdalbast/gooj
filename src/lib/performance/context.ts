import type {
  DeviceClass,
  PerformancePageType,
  ReferrerCategory,
  RouteDescriptor,
  ViewportBucket,
  WebVitalContext,
} from "./types";

const MOBILE_WIDTH = 768;
const TABLET_WIDTH = 1024;
const XL_WIDTH = 1440;
const LG_WIDTH = 1024;
const MD_WIDTH = 768;
const SM_WIDTH = 480;

const SEARCH_REFERRERS = [
  "google.",
  "bing.com",
  "duckduckgo.com",
  "ecosia.org",
  "search.yahoo.com",
];

const SOCIAL_REFERRERS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "pinterest.com",
  "reddit.com",
  "t.co",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "youtube.com",
];

interface RouteRule {
  matcher: RegExp;
  pageType: PerformancePageType;
  routeKey: string;
}

interface RouteSnapshot extends RouteDescriptor {
  capturedAt: number;
}

const ROUTE_RULES: RouteRule[] = [
  { matcher: /^\/$/, pageType: "storefront", routeKey: "home" },
  { matcher: /^\/category\/[^/]+\/?$/, pageType: "catalog", routeKey: "category" },
  { matcher: /^\/product\/[^/]+\/?$/, pageType: "catalog", routeKey: "product-detail" },
  { matcher: /^\/checkout\/?$/, pageType: "checkout", routeKey: "checkout" },
  { matcher: /^\/about\/our-story\/?$/, pageType: "content", routeKey: "about-our-story" },
  { matcher: /^\/about\/sustainability\/?$/, pageType: "content", routeKey: "about-sustainability" },
  { matcher: /^\/about\/gift-guide\/?$/, pageType: "content", routeKey: "about-gift-guide" },
  { matcher: /^\/about\/customer-care\/?$/, pageType: "content", routeKey: "about-customer-care" },
  { matcher: /^\/about\/store-locator\/?$/, pageType: "content", routeKey: "about-store-locator" },
  { matcher: /^\/privacy-policy\/?$/, pageType: "legal", routeKey: "privacy-policy" },
  { matcher: /^\/terms-of-service\/?$/, pageType: "legal", routeKey: "terms-of-service" },
  { matcher: /^\/reminders\/?$/, pageType: "account", routeKey: "reminders" },
  { matcher: /^\/admin\/products\/?$/, pageType: "admin", routeKey: "admin-products" },
  { matcher: /^\/admin\/promotions\/?$/, pageType: "admin", routeKey: "admin-promotions" },
  { matcher: /^\/admin\/content\/?$/, pageType: "admin", routeKey: "admin-content" },
  { matcher: /^\/admin\/orders\/?$/, pageType: "admin", routeKey: "admin-orders" },
  { matcher: /^\/admin\/customers\/?$/, pageType: "admin", routeKey: "admin-customers" },
  { matcher: /^\/admin\/performance\/?$/, pageType: "admin", routeKey: "admin-performance" },
  { matcher: /^\/admin\/?$/, pageType: "admin", routeKey: "admin-dashboard" },
];

let routeSnapshots: RouteSnapshot[] = [];
let routeTrackingStarted = false;
let latestBfcacheRestore = false;

const getNavigationEntry = () => {
  if (typeof performance === "undefined") {
    return null;
  }

  const [navigationEntry] = performance.getEntriesByType("navigation");
  return navigationEntry && "type" in navigationEntry ? navigationEntry : null;
};

const normalizePath = (pathname: string) => {
  const withoutQuery = pathname.split(/[?#]/u)[0] || "/";
  const trimmed = withoutQuery.replace(/\/+$/u, "");

  return trimmed === "" ? "/" : trimmed;
};

const captureCurrentRoute = () => {
  const snapshot: RouteSnapshot = {
    ...resolveRouteDescriptor(window.location.pathname),
    capturedAt: performance.now(),
  };
  const previousSnapshot = routeSnapshots.at(-1);

  if (previousSnapshot?.path === snapshot.path && previousSnapshot.routeKey === snapshot.routeKey) {
    return;
  }

  routeSnapshots.push(snapshot);
};

const patchHistoryMethod = (methodName: "pushState" | "replaceState") => {
  const originalMethod = window.history[methodName];

  window.history[methodName] = function patchHistory(
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    const result = originalMethod.apply(this, args);
    captureCurrentRoute();
    return result;
  };
};

export const resolveRouteDescriptor = (pathname: string): RouteDescriptor => {
  const normalizedPath = normalizePath(pathname);
  const matchingRule = ROUTE_RULES.find((rule) => rule.matcher.test(normalizedPath));

  if (matchingRule) {
    return {
      pageType: matchingRule.pageType,
      path: normalizedPath,
      routeKey: matchingRule.routeKey,
    };
  }

  return {
    pageType: "other",
    path: normalizedPath,
    routeKey: normalizedPath === "/404" ? "not-found" : "other",
  };
};

export const getDeviceClass = (viewportWidth: number) => {
  if (viewportWidth < MOBILE_WIDTH) {
    return "mobile" satisfies DeviceClass;
  }

  if (viewportWidth < TABLET_WIDTH) {
    return "tablet" satisfies DeviceClass;
  }

  return "desktop" satisfies DeviceClass;
};

export const getViewportBucket = (viewportWidth: number) => {
  if (viewportWidth < SM_WIDTH) {
    return "xs" satisfies ViewportBucket;
  }

  if (viewportWidth < MD_WIDTH) {
    return "sm" satisfies ViewportBucket;
  }

  if (viewportWidth < LG_WIDTH) {
    return "md" satisfies ViewportBucket;
  }

  if (viewportWidth < XL_WIDTH) {
    return "lg" satisfies ViewportBucket;
  }

  return "xl" satisfies ViewportBucket;
};

export const getReferrerCategory = (referrer: string, origin: string) => {
  if (!referrer) {
    return "direct" satisfies ReferrerCategory;
  }

  try {
    const referrerUrl = new URL(referrer);

    if (referrerUrl.origin === origin) {
      return "internal" satisfies ReferrerCategory;
    }

    if (SEARCH_REFERRERS.some((host) => referrerUrl.hostname.includes(host))) {
      return "search" satisfies ReferrerCategory;
    }

    if (SOCIAL_REFERRERS.some((host) => referrerUrl.hostname.includes(host))) {
      return "social" satisfies ReferrerCategory;
    }
  } catch {
    return "external" satisfies ReferrerCategory;
  }

  return "external" satisfies ReferrerCategory;
};

export const getMetricObservedAt = (entries: PerformanceEntry[]) => {
  const latestEntry = entries.at(-1);
  return typeof latestEntry?.startTime === "number" ? latestEntry.startTime : performance.now();
};

export const startPerformanceContextTracking = () => {
  if (routeTrackingStarted || typeof window === "undefined") {
    return;
  }

  routeTrackingStarted = true;
  routeSnapshots = [
    {
      ...resolveRouteDescriptor(window.location.pathname),
      capturedAt: performance.now(),
    },
  ];

  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");

  window.addEventListener("popstate", captureCurrentRoute);
  window.addEventListener("pageshow", (event) => {
    latestBfcacheRestore = event.persisted;
    captureCurrentRoute();
  });
};

export const getMetricRouteContext = (observedAt: number) => {
  if (routeSnapshots.length === 0 && typeof window !== "undefined") {
    routeSnapshots = [
      {
        ...resolveRouteDescriptor(window.location.pathname),
        capturedAt: performance.now(),
      },
    ];
  }

  for (let index = routeSnapshots.length - 1; index >= 0; index -= 1) {
    const snapshot = routeSnapshots[index];

    if (snapshot && snapshot.capturedAt <= observedAt) {
      return snapshot;
    }
  }

  return routeSnapshots[0] ?? {
    capturedAt: observedAt,
    ...resolveRouteDescriptor("/"),
  };
};

export const buildWebVitalContext = ({
  environment,
  metricEntries,
  navigationType,
  releaseId,
  sampleRate,
}: {
  environment: string;
  metricEntries: PerformanceEntry[];
  navigationType?: string;
  releaseId: string;
  sampleRate: number;
}): WebVitalContext => {
  const observedAt = getMetricObservedAt(metricEntries);
  const routeContext = getMetricRouteContext(observedAt);
  const viewportWidth = window.innerWidth;
  const connection = navigator.connection as
    | (NetworkInformation & { saveData?: boolean })
    | undefined;
  const navigationEntry = getNavigationEntry();

  return {
    capturedAt: new Date(performance.timeOrigin + observedAt).toISOString(),
    deviceClass: getDeviceClass(viewportWidth),
    environment,
    navigationType: navigationType || navigationEntry?.type || "navigate",
    networkType: connection?.effectiveType ?? null,
    pageType: routeContext.pageType,
    referrerCategory: getReferrerCategory(document.referrer, window.location.origin),
    releaseId,
    routeKey: routeContext.routeKey,
    routePath: routeContext.path,
    sampleRate,
    saveData: connection?.saveData ?? null,
    viewportBucket: getViewportBucket(viewportWidth),
    wasRestoredFromBfcache: latestBfcacheRestore,
  };
};
