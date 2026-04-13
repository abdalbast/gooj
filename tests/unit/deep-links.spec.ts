import { describe, expect, it } from "vitest";
import { getCustomerRoutePathFromDeepLink } from "@/lib/deepLinks";

describe("custom scheme deep links", () => {
  it.each([
    ["goojit://product/1", "/product/1"],
    ["goojit:///product/1", "/product/1"],
    ["goojit://category/shop", "/category/shop"],
    ["goojit:///about/customer-care", "/about/customer-care"],
    ["goojit://reminders?intent=add-date", "/reminders?intent=add-date"],
  ])("maps %s to %s", (href, expectedPath) => {
    expect(getCustomerRoutePathFromDeepLink(href)).toBe(expectedPath);
  });

  it.each([
    "https://gooj.vercel.app/product/1",
    "goojit://admin",
    "goojit:///admin/products",
    "goojit://reports/sales",
    "not a url",
    "",
  ])("rejects unsupported link %s", (href) => {
    expect(getCustomerRoutePathFromDeepLink(href)).toBeNull();
  });
});
