import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectNoRuntimeErrors, trackRuntimeErrors } from "../e2e/helpers/runtime";
import { getDeploymentOrigin, getReleaseAdminCredentials } from "./helpers/config";
import { waitForMagicLink } from "./helpers/gmail";
import { createFreshTotpCode } from "./helpers/totp";

const seedCart = async (page: Page, state: unknown) => {
  await page.addInitScript((cartState) => {
    window.localStorage.clear();
    window.localStorage.setItem("gooj:cart", JSON.stringify(cartState));
  }, state);
};

const enterAndVerifyTotp = async ({
  confirmationLocator,
  input,
  page,
  secret,
  submitButton,
}: {
  confirmationLocator: Locator;
  input: Locator;
  page: Page;
  secret: string;
  submitButton: Locator;
}) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const code = await createFreshTotpCode(secret);

    await input.fill(code);
    await submitButton.click();

    try {
      await expect(confirmationLocator).toBeVisible({ timeout: 12_000 });
      return;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }

      const failureAlert = page.getByText(/Could not verify the MFA code/i);

      if (await failureAlert.isVisible().catch(() => false)) {
        await page.waitForTimeout(1_000);
      }
    }
  }
};

test("homepage renders primary CTAs without runtime errors on the deployed release", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /Explore personalised gift boxes/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "GOOJ" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /The Birthday Box/i }).first()).toBeVisible();

  expectNoRuntimeErrors(runtime);
});

test("product detail bag flow reaches checkout on the deployed release", async ({ page }) => {
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

test("checkout applies seeded promo code WELCOME15 and keeps it after refresh", async ({ page }) => {
  const runtime = trackRuntimeErrors(page);

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

  await page.getByRole("button", { name: "Discount code" }).click();
  await page.getByPlaceholder("Enter discount code").fill("WELCOME15");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByText("WELCOME15", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete Order • £55.25" })).toBeVisible();

  await page.reload();

  await expect(page.getByText("WELCOME15", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete Order • £55.25" })).toBeVisible();

  expectNoRuntimeErrors(runtime);
});

test("version manifest is reachable and served with non-cacheable headers", async ({ request, baseURL }) => {
  const manifestUrl = new URL("/version.json", baseURL).toString();
  const response = await request.get(manifestUrl, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });

  expect(response.ok()).toBeTruthy();
  expect(response.headers()["cache-control"]).toContain("no-cache");

  const manifest = (await response.json()) as {
    buildId?: string;
  };

  expect(typeof manifest.buildId).toBe("string");
  expect(manifest.buildId).toBeTruthy();
});

test("deployed hashed assets advertise compression headers", async ({ request, baseURL }) => {
  const htmlResponse = await request.get(baseURL!, {
    headers: {
      "accept-encoding": "br, gzip",
    },
  });

  expect(htmlResponse.ok()).toBeTruthy();

  const html = await htmlResponse.text();
  const assetMatch = html.match(/\/assets\/[^"]+\.js/);

  expect(assetMatch, "Could not find a built JS asset in the deployed HTML").toBeTruthy();

  const assetResponse = await request.get(new URL(assetMatch![0], baseURL!).toString(), {
    headers: {
      "accept-encoding": "br, gzip",
    },
  });

  expect(assetResponse.ok()).toBeTruthy();
  expect(assetResponse.headers()["cache-control"]).toContain("immutable");
  expect(["br", "gzip"]).toContain(assetResponse.headers()["content-encoding"]);
});

test.describe("credentialed admin release smoke", () => {
  test.describe.configure({ mode: "serial" });

  test("admin account can sign in via magic link, step up with MFA, and reach protected routes", async ({
    page,
  }) => {
    const runtime = trackRuntimeErrors(page);
    const {
      adminEmail,
      gmailClientId,
      gmailClientSecret,
      gmailRefreshToken,
      totpSecret,
    } = getReleaseAdminCredentials();
    const sentAfter = Date.now() - 60_000;
    const sidebarDashboardLink = page.getByRole("link", { name: "Dashboard" });

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin Sign In" })).toBeVisible();

    await page.getByPlaceholder("Email address").fill(adminEmail);
    await page.getByRole("button", { name: "Email me an admin sign-in link" }).click();

    const magicLink = await waitForMagicLink({
      clientId: gmailClientId,
      clientSecret: gmailClientSecret,
      expectedOrigin: getDeploymentOrigin(),
      recipient: adminEmail,
      refreshToken: gmailRefreshToken,
      sentAfter,
    });

    await page.goto(magicLink);
    await page.waitForLoadState("networkidle");

    if (!(await sidebarDashboardLink.isVisible().catch(() => false))) {
      const existingFactorInput = page.locator("#admin-mfa-code");
      const verifyButton = page.getByRole("button", { name: "Verify MFA and continue" });

      if (!(await existingFactorInput.isVisible().catch(() => false))) {
        throw new Error(
          "Expected the release admin account to present an existing TOTP factor for step-up verification.",
        );
      }

      await enterAndVerifyTotp({
        confirmationLocator: sidebarDashboardLink,
        input: existingFactorInput,
        page,
        secret: totpSecret,
        submitButton: verifyButton,
      });
    }

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(adminEmail)).toBeVisible();

    await page.getByRole("link", { name: "Performance" }).click();
    await expect(page).toHaveURL(/\/admin\/performance$/);
    await expect(page.getByRole("heading", { name: "Performance" })).toBeVisible();

    await page.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByText("The Birthday Box")).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("heading", { name: "Admin Sign In" })).toBeVisible();

    expectNoRuntimeErrors(runtime);
  });
});
