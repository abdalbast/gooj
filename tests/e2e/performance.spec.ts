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
