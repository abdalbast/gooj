import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

test("build artifacts stay within route budget ceilings @perf", async ({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Bundle budgets are only enforced on desktop Chromium.");

  const assetsDir = join(process.cwd(), "dist", "assets");
  const assetFiles = readdirSync(assetsDir);

  const publicEntry = assetFiles.find((fileName) => /^index-.*\.js$/.test(fileName));
  const adminDashboardEntry = assetFiles.find((fileName) =>
    /^AdminDashboard-.*\.js$/.test(fileName),
  );
  const authLayoutChunk = assetFiles.find((fileName) => /^AuthLayout-.*\.js$/.test(fileName));
  const remindersChunk = assetFiles.find((fileName) => /^DateReminders-.*\.js$/.test(fileName));
  const adminLayoutChunk = assetFiles.find((fileName) => /^AdminLayout-.*\.js$/.test(fileName));
  const supabaseChunk = assetFiles.find((fileName) => /^supabase-.*\.js$/.test(fileName));
  const shoppingBagChunk = assetFiles.find((fileName) => /^ShoppingBag-.*\.js$/.test(fileName));
  const imageZoomChunk = assetFiles.find((fileName) => /^ImageZoom-.*\.js$/.test(fileName));
  const cropDialogChunk = assetFiles.find((fileName) =>
    /^ProductPhotoCropDialog-.*\.js$/.test(fileName),
  );
  const storeMapChunk = assetFiles.find((fileName) => /^StoreMap-.*\.js$/.test(fileName));

  expect(publicEntry, "Missing public entry bundle").toBeTruthy();
  expect(adminDashboardEntry, "Missing admin dashboard bundle").toBeTruthy();
  expect(authLayoutChunk, "Missing auth route shell chunk").toBeTruthy();
  expect(remindersChunk, "Missing reminders chunk").toBeTruthy();
  expect(adminLayoutChunk, "Missing admin layout chunk").toBeTruthy();
  expect(supabaseChunk, "Missing Supabase client chunk").toBeTruthy();
  expect(shoppingBagChunk, "Missing ShoppingBag lazy chunk").toBeTruthy();
  expect(imageZoomChunk, "Missing ImageZoom lazy chunk").toBeTruthy();
  expect(cropDialogChunk, "Missing crop dialog lazy chunk").toBeTruthy();
  expect(storeMapChunk, "Missing StoreMap lazy chunk").toBeTruthy();

  const publicEntrySize = statSync(join(assetsDir, publicEntry!)).size;
  const adminDashboardSize = statSync(join(assetsDir, adminDashboardEntry!)).size;
  const publicEntrySource = readFileSync(join(assetsDir, publicEntry!), "utf8");
  const publicEntryImports = Array.from(
    publicEntrySource.matchAll(/from "\.\/([^"]+)"/g),
    (match) => match[1],
  );

  expect(publicEntryImports).not.toContain(authLayoutChunk!);
  expect(publicEntryImports).not.toContain(remindersChunk!);
  expect(publicEntryImports).not.toContain(adminLayoutChunk!);
  expect(publicEntryImports).not.toContain(supabaseChunk!);

  expect(publicEntrySize).toBeLessThanOrEqual(120 * 1024);
  expect(adminDashboardSize).toBeLessThanOrEqual(430 * 1024);
});
