import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliverWebVitalsPayload } from "@/lib/performance";

describe("performance transport", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
  });

  it("uses sendBeacon when requested and available", async () => {
    const sendBeacon = vi.fn(() => true);

    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });

    const result = await deliverWebVitalsPayload({
      endpoint: "https://example.com/vitals",
      payload: "{\"events\":[]}",
      preferBeacon: true,
    });

    expect(result).toBe("beacon");
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("falls back to fetch when sendBeacon declines the payload", async () => {
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: vi.fn(() => false),
    });

    const result = await deliverWebVitalsPayload({
      endpoint: "https://example.com/vitals",
      payload: "{\"events\":[]}",
      preferBeacon: true,
    });

    expect(result).toBe("fetch");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("fails silently when both beacon and fetch fail", async () => {
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: undefined,
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await deliverWebVitalsPayload({
      endpoint: "https://example.com/vitals",
      payload: "{\"events\":[]}",
      preferBeacon: false,
    });

    expect(result).toBe("none");
  });
});
