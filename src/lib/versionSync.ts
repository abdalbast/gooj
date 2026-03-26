const VERSION_CHECK_INTERVAL_MS = 60_000;
const VERSION_MANIFEST_PATH = "/version.json";
const FORCED_BUILD_ID_STORAGE_KEY = "gooj:forced-build-id";
const BUILD_QUERY_PARAM = "__gooj_build";

type VersionManifest = {
  buildId: string;
  builtAt?: string;
};

let versionSyncStarted = false;
let versionCheckInFlight = false;

const buildVersionedUrl = (assetPath: string) => {
  const separator = assetPath.includes("?") ? "&" : "?";

  return `${assetPath}${separator}v=${encodeURIComponent(__APP_BUILD_ID__)}`;
};

const clearVersionReloadMarker = () => {
  if (window.sessionStorage.getItem(FORCED_BUILD_ID_STORAGE_KEY) === __APP_BUILD_ID__) {
    window.sessionStorage.removeItem(FORCED_BUILD_ID_STORAGE_KEY);
  }
};

const tidyRefreshQueryParam = () => {
  const currentUrl = new URL(window.location.href);

  if (currentUrl.searchParams.get(BUILD_QUERY_PARAM) !== __APP_BUILD_ID__) {
    return;
  }

  currentUrl.searchParams.delete(BUILD_QUERY_PARAM);
  window.history.replaceState(
    window.history.state,
    "",
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
  );
};

const fetchLatestVersion = async (): Promise<VersionManifest | null> => {
  const versionUrl = new URL(VERSION_MANIFEST_PATH, window.location.origin);
  versionUrl.searchParams.set("ts", Date.now().toString());

  const response = await fetch(versionUrl.toString(), {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    return null;
  }

  const manifest = (await response.json()) as Partial<VersionManifest>;

  if (typeof manifest.buildId !== "string" || manifest.buildId.length === 0) {
    return null;
  }

  return {
    buildId: manifest.buildId,
    builtAt: manifest.builtAt,
  };
};

const clearClientCaches = async () => {
  const cleanupTasks: Promise<unknown>[] = [];

  if ("serviceWorker" in navigator) {
    cleanupTasks.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
    );
  }

  if ("caches" in window) {
    cleanupTasks.push(
      caches.keys().then((cacheKeys) => Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)))),
    );
  }

  await Promise.allSettled(cleanupTasks);
};

const forceLoadLatestBuild = async (nextBuildId: string) => {
  if (window.sessionStorage.getItem(FORCED_BUILD_ID_STORAGE_KEY) === nextBuildId) {
    return;
  }

  window.sessionStorage.setItem(FORCED_BUILD_ID_STORAGE_KEY, nextBuildId);
  await clearClientCaches();

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set(BUILD_QUERY_PARAM, nextBuildId);
  window.location.replace(currentUrl.toString());
};

const checkForNewBuild = async () => {
  if (versionCheckInFlight) {
    return;
  }

  versionCheckInFlight = true;

  try {
    tidyRefreshQueryParam();
    clearVersionReloadMarker();

    const latestVersion = await fetchLatestVersion();

    if (!latestVersion || latestVersion.buildId === __APP_BUILD_ID__) {
      return;
    }

    await forceLoadLatestBuild(latestVersion.buildId);
  } catch {
    // Ignore transient version-check failures and retry on the next focus/interval tick.
  } finally {
    versionCheckInFlight = false;
  }
};

export const startVersionSync = () => {
  if (import.meta.env.DEV || versionSyncStarted || typeof window === "undefined") {
    return;
  }

  versionSyncStarted = true;

  window.addEventListener("focus", () => {
    void checkForNewBuild();
  });

  window.addEventListener("pageshow", () => {
    void checkForNewBuild();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void checkForNewBuild();
    }
  });

  window.setInterval(() => {
    void checkForNewBuild();
  }, VERSION_CHECK_INTERVAL_MS);

  void checkForNewBuild();
};

export { buildVersionedUrl };
