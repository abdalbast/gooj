import { expect, test } from "@playwright/test";

test("refreshes to a cache-busted URL when a newer build is published", async ({ page }) => {
  let versionRequestCount = 0;

  await page.route("**/version.json**", async (route) => {
    versionRequestCount += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        buildId: "published-build-for-test",
        builtAt: "2026-03-26T00:00:00.000Z",
      }),
    });
  });

  await page.goto("/");
  await page.waitForURL(/__gooj_build=published-build-for-test/);

  expect(versionRequestCount).toBeGreaterThan(0);
});
