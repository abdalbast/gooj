import { expect, test, type Page } from "@playwright/test";
import { expectNoRuntimeErrors, trackRuntimeErrors } from "./helpers/runtime";

const seedCart = async (page: Page, state: unknown) => {
  await page.addInitScript((cartState) => {
    window.localStorage.setItem("gooj:cart", JSON.stringify(cartState));
  }, state);
};

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

test("favorites drawer opens without shifting the page horizontally", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "Favorites navbar control is desktop only.",
  );

  const runtime = trackRuntimeErrors(page);

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const favoritesButton = page.getByRole("button", { name: "Favorites" });
  const beforeBox = await favoritesButton.boundingBox();
  const viewportMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
  }));

  await favoritesButton.click();

  await expect(page.getByRole("dialog", { name: "Your Favorites" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollX: window.scrollX,
      })),
    )
    .toEqual({
      scrollWidth: viewportMetrics.clientWidth,
      clientWidth: viewportMetrics.clientWidth,
      scrollX: 0,
    });

  const afterBox = await favoritesButton.boundingBox();

  expect(beforeBox).not.toBeNull();
  expect(afterBox).not.toBeNull();
  expect(afterBox).toEqual(beforeBox);

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

  await seedCart(page, {
    appliedPromotion: null,
    items: [
      {
        hasPhoto: true,
        handwrittenNote: true,
        id: "1::Happy Birthday::handwritten::photo",
        message: "Happy Birthday",
        productId: "1",
        quantity: 1,
      },
      {
        hasPhoto: false,
        handwrittenNote: false,
        id: "2::::printed::no-photo",
        message: "",
        productId: "2",
        quantity: 1,
      },
    ],
    shippingOption: "standard",
  });

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

test("checkout promo flow persists across refresh", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.route("**/rest/v1/rpc/lookup_active_promotion", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          code: "GOOJIT20",
          discount_label: "20%",
          expires_at: "2026-12-31",
          promo_type: "Percentage",
        },
      ]),
    });
  });

  await page.goto("/product/1");

  await page.getByRole("button", { name: "Add to Bag" }).click();
  await page.getByRole("button", { name: "Shopping bag" }).click();
  await page.getByRole("link", { name: "Check Out" }).click();

  await page.getByRole("button", { name: "Discount code" }).click();
  await page.getByPlaceholder("Enter discount code").fill("GOOJIT20");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByText("GOOJIT20", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete Order • £52" })).toBeVisible();

  await page.reload();

  await expect(page.getByText("GOOJIT20", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete Order • £52" })).toBeVisible();

  expectNoRuntimeErrors(runtime);
});

test("date reminders route renders Supabase auth or setup state without runtime errors", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/reminders#add-date");

  await expect(
    page.getByRole("heading", {
      name: /Welcome back|Supabase Configuration Required/i,
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
