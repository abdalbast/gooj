import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const buildTimestamp = new Date().toISOString();
const buildId = buildTimestamp.replace(/[:.]/g, "-");

const noCacheHeaders = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const buildVersionPlugin = () => ({
  name: "build-version-plugin",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify(
        {
          buildId,
          builtAt: buildTimestamp,
        },
        null,
        2,
      ),
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    headers: noCacheHeaders,
  },
  preview: {
    headers: noCacheHeaders,
  },
  plugins: [react(), buildVersionPlugin()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __APP_BUILT_AT__: JSON.stringify(buildTimestamp),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
}));
