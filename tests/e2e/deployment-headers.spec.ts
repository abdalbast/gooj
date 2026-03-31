import { expect, test } from "@playwright/test";

const getDeploymentUrl = () => {
  const rawUrl =
    process.env.DEPLOYMENT_URL ??
    process.env.VERCEL_DEPLOYMENT_URL ??
    process.env.VERCEL_URL;

  if (!rawUrl) {
    return null;
  }

  return rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
};

test("deployed assets advertise compression headers @perf", async () => {
  const deploymentUrl = getDeploymentUrl();

  test.skip(!deploymentUrl, "Deployment header checks only run when a preview or production URL is available.");

  const htmlResponse = await fetch(deploymentUrl!, {
    headers: {
      "accept-encoding": "br, gzip",
    },
  });

  expect(htmlResponse.ok).toBeTruthy();

  const html = await htmlResponse.text();
  const assetMatch = html.match(/\/assets\/[^"]+\.js/);

  expect(assetMatch, "Could not find a built JS asset in the deployed HTML").toBeTruthy();

  const assetResponse = await fetch(new URL(assetMatch![0], deploymentUrl!).toString(), {
    headers: {
      "accept-encoding": "br, gzip",
    },
  });

  expect(assetResponse.ok).toBeTruthy();
  expect(assetResponse.headers.get("vary")).toContain("Accept-Encoding");
  expect(["br", "gzip"]).toContain(assetResponse.headers.get("content-encoding"));
});
