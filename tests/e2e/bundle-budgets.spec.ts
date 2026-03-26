import { expect, test } from "@playwright/test";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

test("build artifacts stay within route budget ceilings @perf", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Bundle budgets are only enforced on desktop Chromium.");

  const assetsDir = join(process.cwd(), "dist", "assets");
  const assetFiles = readdirSync(assetsDir);

  const publicEntry = assetFiles.find((fileName) => /^index-.*\.js$/.test(fileName));
  const adminDashboardEntry = assetFiles.find((fileName) =>
    /^AdminDashboard-.*\.js$/.test(fileName),
  );

  expect(publicEntry, "Missing public entry bundle").toBeTruthy();
  expect(adminDashboardEntry, "Missing admin dashboard bundle").toBeTruthy();

  const publicEntrySize = statSync(join(assetsDir, publicEntry!)).size;
  const adminDashboardSize = statSync(join(assetsDir, adminDashboardEntry!)).size;

  expect(publicEntrySize).toBeLessThanOrEqual(180 * 1024);
  expect(adminDashboardSize).toBeLessThanOrEqual(430 * 1024);
});
