const CUSTOM_SCHEME = "goojit:";

const EXACT_CUSTOMER_ROUTES = new Set([
  "/",
  "/checkout",
  "/about/our-story",
  "/about/sustainability",
  "/about/gift-guide",
  "/about/customer-care",
  "/about/store-locator",
  "/privacy-policy",
  "/terms-of-service",
  "/reminders",
]);

const CUSTOMER_ROUTE_PATTERNS = [/^\/category\/[a-z0-9-]+$/i, /^\/product\/[a-z0-9-]+$/i];

const normalizeDeepLinkPath = (url: URL) => {
  const hostSegment = url.hostname ? `/${url.hostname}` : "";
  const rawPath = `${hostSegment}${url.pathname}`.replace(/\/{2,}/g, "/");
  const pathname = rawPath === "" ? "/" : rawPath.replace(/\/$/, "") || "/";

  return pathname.toLowerCase();
};

const isSupportedCustomerRoute = (pathname: string) => {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return false;
  }

  if (EXACT_CUSTOMER_ROUTES.has(pathname)) {
    return true;
  }

  return CUSTOMER_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
};

export const getCustomerRoutePathFromDeepLink = (href: string | null | undefined) => {
  if (!href) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.protocol !== CUSTOM_SCHEME) {
    return null;
  }

  const pathname = normalizeDeepLinkPath(url);

  if (!isSupportedCustomerRoute(pathname)) {
    return null;
  }

  return `${pathname}${url.search}${url.hash}`;
};
