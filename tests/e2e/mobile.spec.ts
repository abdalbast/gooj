import { expect, test, type Page } from "@playwright/test";
import { expectNoRuntimeErrors, trackRuntimeErrors } from "./helpers/runtime";

const seedCart = async (page: Page, state: unknown) => {
  await page.addInitScript((cartState) => {
    window.localStorage.setItem("gooj:cart", JSON.stringify(cartState));
  }, state);
};

const expectMinimumTouchTarget = async (
  locator: Parameters<typeof expect>[0],
  label: string,
) => {
  const box = await locator.boundingBox();

  expect(box, `Missing bounding box for ${label}`).not.toBeNull();
  expect(box!.width, `${label} width is below 44px`).toBeGreaterThanOrEqual(44);
  expect(box!.height, `${label} height is below 44px`).toBeGreaterThanOrEqual(44);
};

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

test("mobile overlays lock scroll and dismiss cleanly", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile overlay checks only run on the mobile Chromium project.");

  const runtime = trackRuntimeErrors(page);

  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Toggle menu" });
  await menuButton.click();
  await expect(page.getByRole("dialog", { name: "Mobile menu" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Mobile menu" })).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .toBe("visible");
  await expect(menuButton).toBeFocused();

  const bagButton = page.getByRole("button", { name: "Shopping bag" });
  await bagButton.click();

  const bagDialog = page.getByRole("dialog", { name: "Bag" });
  await expect(bagDialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close bag" })).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .toBe("hidden");

  await page.getByRole("button", { name: /View Favorites/i }).click();

  const favoritesDialog = page.getByRole("dialog", { name: "Your Favorites" });
  await expect(favoritesDialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(favoritesDialog).toBeHidden();
  await expect(bagButton).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .toBe("visible");

  expectNoRuntimeErrors(runtime);
});

test("mobile primary actions meet minimum touch targets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Touch-target checks only run on the mobile Chromium project.");

  const runtime = trackRuntimeErrors(page);

  await page.goto("/");

  await expectMinimumTouchTarget(page.getByRole("button", { name: "Toggle menu" }), "menu button");
  await expectMinimumTouchTarget(page.getByRole("button", { name: "Search" }), "search button");
  await expectMinimumTouchTarget(page.getByRole("button", { name: "Shopping bag" }), "shopping bag button");

  await seedCart(page, {
    appliedPromotion: null,
    items: [
      {
        hasPhoto: false,
        handwrittenNote: false,
        id: "1::::printed::no-photo",
        message: "",
        productId: "1",
        quantity: 1,
      },
    ],
    shippingOption: "standard",
  });
  await page.goto("/checkout");

  await expectMinimumTouchTarget(
    page.getByRole("button", { name: /Decrease quantity for The Birthday Box/i }),
    "checkout decrement button",
  );
  await expectMinimumTouchTarget(
    page.getByRole("button", { name: /Increase quantity for The Birthday Box/i }),
    "checkout increment button",
  );

  expectNoRuntimeErrors(runtime);
});
