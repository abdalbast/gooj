import { describe, expect, it } from "vitest";
import { formatShippingOptionSummary, parseGBPValue } from "@/lib/commerce";

describe("commerce helpers", () => {
  it("parses GBP strings into numeric values", () => {
    expect(parseGBPValue("£65")).toBe(65);
    expect(parseGBPValue("£65.50")).toBe(65.5);
  });

  it("formats a shipping summary with price and delivery window", () => {
    expect(formatShippingOptionSummary("express")).toContain("£15");
    expect(formatShippingOptionSummary("express")).toContain("1-2 business days");
  });
});
