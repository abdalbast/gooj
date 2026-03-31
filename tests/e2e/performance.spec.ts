import { expect, test } from "@playwright/test";
import { collectRouteMetrics } from "./helpers/routeMetrics";
import { expectNoRuntimeErrors, trackRuntimeErrors } from "./helpers/runtime";

const MB = 1024 * 1024;

test("home route stays within initial asset budgets @perf", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Performance budgets are only enforced on desktop Chromium.");

  const runtime = trackRuntimeErrors(page);
  const metrics = await collectRouteMetrics(page, "/");

  expect(metrics.forbiddenHits).toEqual([]);
  expect(metrics.videoRequests.length).toBeLessThanOrEqual(1);
  expect(metrics.videoRequests.some((url) => url.includes("hero-video-2"))).toBeFalsy();
  expect(metrics.decodedSize).toBeLessThanOrEqual(8.5 * MB);

  expectNoRuntimeErrors(runtime);
});

test("checkout route avoids decorative media regressions @perf", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Performance budgets are only enforced on desktop Chromium.");

  const runtime = trackRuntimeErrors(page);
  const metrics = await collectRouteMetrics(page, "/checkout");

  expect(metrics.forbiddenHits).toEqual([]);
  expect(metrics.videoRequests).toEqual([]);
  expect(metrics.decodedSize).toBeLessThanOrEqual(1.0 * MB);

  expectNoRuntimeErrors(runtime);
});

test("reminders route stays lightweight @perf", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Performance budgets are only enforced on desktop Chromium.");

  const runtime = trackRuntimeErrors(page);
  const metrics = await collectRouteMetrics(page, "/reminders#add-date");

  expect(metrics.forbiddenHits).toEqual([]);
  expect(metrics.decodedSize).toBeLessThanOrEqual(1.2 * MB);

  expectNoRuntimeErrors(runtime);
});

test("category route avoids image and payload spikes @perf", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Performance budgets are only enforced on desktop Chromium.");

  const runtime = trackRuntimeErrors(page);
  const metrics = await collectRouteMetrics(page, "/category/for-her-birthday");

  expect(metrics.forbiddenHits).toEqual([]);
  expect(metrics.imageRequests.length).toBeLessThanOrEqual(20);
  expect(metrics.decodedSize).toBeLessThanOrEqual(5.0 * MB);

  expectNoRuntimeErrors(runtime);
});

test("deferred storefront chunks stay off the network until triggered @perf", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Performance budgets are only enforced on desktop Chromium.");

  const runtime = trackRuntimeErrors(page);
  const requestedScripts = new Set<string>();

  page.on("response", (response) => {
    const url = response.url();

    if (url.includes("/assets/") && url.endsWith(".js")) {
      requestedScripts.add(url);
    }
  });

  await page.goto("/product/1");
  await page.waitForLoadState("networkidle");

  expect(
    Array.from(requestedScripts).some((url) =>
      ["ShoppingBag-", "ImageZoom-", "ProductPhotoCropDialog-"].some((chunkName) =>
        url.includes(chunkName),
      ),
    ),
  ).toBeFalsy();

  await page.getByRole("button", { name: "Shopping bag" }).click();
  await expect(page.getByRole("heading", { name: "Bag" })).toBeVisible();
  expect(Array.from(requestedScripts).some((url) => url.includes("ShoppingBag-"))).toBeTruthy();

  await page.setInputFiles('input[type="file"]', "public/founders.webp");
  await expect(
    page.getByRole("heading", { name: "Frame the photo exactly how it should appear" }),
  ).toBeVisible();
  expect(
    Array.from(requestedScripts).some((url) => url.includes("ProductPhotoCropDialog-")),
  ).toBeTruthy();

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /open product view 1 fullscreen/i }).click();
  await expect(page.getByRole("dialog", { name: "Product image gallery" })).toBeVisible();
  expect(Array.from(requestedScripts).some((url) => url.includes("ImageZoom-"))).toBeTruthy();

  expectNoRuntimeErrors(runtime);
});

test("supported browsers request avif storefront imagery when available @perf", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Image-format checks are only enforced on desktop Chromium.");

  const runtime = trackRuntimeErrors(page);
  const imageRequests = new Set<string>();

  page.on("response", (response) => {
    if (response.request().resourceType() === "image") {
      imageRequests.add(response.url());
    }
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(
    Array.from(imageRequests).some((url) => url.includes("hero-poster") && url.endsWith(".avif")),
  ).toBeTruthy();
  expect(
    Array.from(imageRequests).some((url) => url.includes("pantheon") && url.endsWith(".avif")),
  ).toBeTruthy();

  await page.getByRole("link", { name: "About" }).hover();
  await page.waitForTimeout(300);

  expect(
    Array.from(imageRequests).some((url) => url.includes("founders") && url.endsWith(".avif")),
  ).toBeTruthy();

  expectNoRuntimeErrors(runtime);
});
