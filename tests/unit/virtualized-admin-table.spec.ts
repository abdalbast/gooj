import { describe, expect, it } from "vitest";
import { getVirtualRange } from "@/components/admin/virtualizedAdminTableRange";

describe("getVirtualRange", () => {
  it("returns the first visible slice near the top of the list", () => {
    expect(
      getVirtualRange({
        itemCount: 500,
        overscan: 2,
        rowHeight: 80,
        scrollTop: 0,
        viewportHeight: 400,
      }),
    ).toEqual({
      end: 9,
      offsetTop: 0,
      start: 0,
    });
  });

  it("adds overscan around a scrolled viewport", () => {
    expect(
      getVirtualRange({
        itemCount: 500,
        overscan: 2,
        rowHeight: 80,
        scrollTop: 800,
        viewportHeight: 400,
      }),
    ).toEqual({
      end: 17,
      offsetTop: 640,
      start: 8,
    });
  });
});
