import { expect, test } from "@playwright/test";
import { expectNoRuntimeErrors, trackRuntimeErrors } from "./helpers/runtime";

test("mobile smoke verifies no horizontal overflow on home and checkout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile overflow smoke only runs on the mobile Chromium project.");

  const runtime = trackRuntimeErrors(page);

  for (const route of ["/", "/checkout"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasHorizontalOverflow, `Unexpected horizontal overflow on ${route}`).toBeFalsy();
  }

  expectNoRuntimeErrors(runtime);
});
