import { expect, test } from "@playwright/test";
import { expectNoRuntimeErrors, trackRuntimeErrors } from "./helpers/runtime";

test("home page renders primary CTAs without runtime errors", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /Explore personalised gift boxes/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "GOOJ" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /The Birthday Box/i }).first()).toBeVisible();

  expectNoRuntimeErrors(runtime);
});

test("product detail bag flow reaches checkout", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/product/1");

  await expect(page.getByRole("heading", { level: 1, name: "The Birthday Box" })).toBeVisible();
  await page.getByRole("button", { name: "Add to Bag" }).click();
  await page.getByRole("button", { name: "Shopping bag" }).click();
  await expect(page.getByRole("heading", { name: "Bag" })).toBeVisible();
  await page.getByRole("link", { name: "Check Out" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("heading", { name: "Shipping Options" })).toBeVisible();

  expectNoRuntimeErrors(runtime);
});

test("product image zoom opens from keyboard and restores focus on close", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/product/1");

  const zoomTrigger = page.getByRole("button", { name: /open product view 1 fullscreen/i });
  await zoomTrigger.focus();
  await expect(zoomTrigger).toBeFocused();

  await page.keyboard.press("Enter");

  const imageDialog = page.getByRole("dialog", { name: "Product image gallery" });
  await expect(imageDialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close image gallery" })).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(imageDialog).toBeHidden();
  await expect(zoomTrigger).toBeFocused();

  expectNoRuntimeErrors(runtime);
});

test("checkout uses canonical GBP shipping labels and totals", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/checkout");

  await expect(page.getByText("Free • 3-5 business days")).toBeVisible();
  await expect(page.getByText("£15 • 1-2 business days")).toBeVisible();
  await expect(page.getByText("£35 • Next business day")).toBeVisible();

  const completeOrderButton = page.getByRole("button", { name: /Complete Order/i });
  await expect(completeOrderButton).toHaveText("Complete Order • £150");

  await page.getByLabel("Express Shipping").check();
  await expect(completeOrderButton).toHaveText("Complete Order • £165");

  await page.getByLabel("Overnight Delivery").check();
  await expect(completeOrderButton).toHaveText("Complete Order • £185");

  expectNoRuntimeErrors(runtime);
});

test("date reminders route renders Supabase auth or setup state without runtime errors", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/reminders#add-date");

  await expect(
    page.getByRole("heading", {
      name: /Sign In To Save Reminders|Supabase Configuration Required/i,
    }),
  ).toBeVisible();

  expectNoRuntimeErrors(runtime);
});

test("admin route renders auth or setup state without runtime errors", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/admin");

  await expect(
    page.getByRole("heading", {
      name: /Admin Sign In|Supabase Configuration Required/i,
    }),
  ).toBeVisible();

  expectNoRuntimeErrors(runtime);
});
