import { describe, expect, it } from "vitest";
import { classifyWebVital, normalizeWebVitalValue } from "@/lib/performance";

describe("performance thresholds", () => {
  it("classifies Core Web Vitals using the standard thresholds", () => {
    expect(classifyWebVital("LCP", 2400)).toBe("good");
    expect(classifyWebVital("LCP", 3200)).toBe("needs-improvement");
    expect(classifyWebVital("LCP", 4100)).toBe("poor");
    expect(classifyWebVital("INP", 180)).toBe("good");
    expect(classifyWebVital("INP", 320)).toBe("needs-improvement");
    expect(classifyWebVital("INP", 650)).toBe("poor");
    expect(classifyWebVital("CLS", 0.08)).toBe("good");
    expect(classifyWebVital("CLS", 0.12)).toBe("needs-improvement");
    expect(classifyWebVital("CLS", 0.3)).toBe("poor");
  });

  it("normalizes values without losing CLS precision", () => {
    expect(normalizeWebVitalValue("CLS", 0.123456)).toBe(0.1235);
    expect(normalizeWebVitalValue("INP", 182.7)).toBe(183);
  });
});
