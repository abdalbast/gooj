import type { Page } from "@playwright/test";

const FORBIDDEN_NAV_ASSETS = [
  "rings-collection.png",
  "earrings-collection.png",
  "arcus-bracelet.png",
  "span-bracelet.png",
  "founders.png",
];

export interface RouteMetrics {
  decodedSize: number;
  transferSize: number;
  localRequests: string[];
  imageRequests: string[];
  videoRequests: string[];
  forbiddenHits: string[];
}

const isImageRequest = (url: string) => /\.(png|jpe?g|webp|gif|svg)$/i.test(url);
const isVideoRequest = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

export const collectRouteMetrics = async (page: Page, path: string): Promise<RouteMetrics> => {
  const responses: string[] = [];
  const responseListener = (response: { status: () => number; url: () => string }) => {
    const status = response.status();

    if ((status >= 200 && status < 400) || status === 304) {
      responses.push(response.url());
    }
  };

  page.on("response", responseListener);

  await page.goto(path, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const origin = new URL(page.url()).origin;
  const perfSummary = await page.evaluate((localOrigin) => {
    const resources = performance
      .getEntriesByType("resource")
      .map((entry) => ({
        url: entry.name,
        decodedBodySize: entry.decodedBodySize || 0,
        transferSize: entry.transferSize || 0,
      }))
      .filter((entry) => entry.url.startsWith(localOrigin));

    return {
      decodedSize: resources.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
      transferSize: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
    };
  }, origin);

  page.off("response", responseListener);

  const localRequests = Array.from(new Set(responses.filter((url) => url.startsWith(origin))));
  const forbiddenHits = localRequests.filter((url) =>
    FORBIDDEN_NAV_ASSETS.some((assetName) => url.includes(assetName)),
  );

  return {
    decodedSize: perfSummary.decodedSize,
    transferSize: perfSummary.transferSize,
    localRequests,
    imageRequests: localRequests.filter(isImageRequest),
    videoRequests: localRequests.filter(isVideoRequest),
    forbiddenHits,
  };
};
