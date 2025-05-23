/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";

const noncePlugin = (placeholderName = "**CSP_NONCE**"): PluginOption => ({
  name: "add-nonce-script-attr",
  enforce: "post",
  transformIndexHtml(html) {
    return html
      .replace(new RegExp("<script", "g"), `<script nonce="${placeholderName}"`)
      .replace(new RegExp("<link", "g"), `<link nonce="${placeholderName}"`);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2022",
  },
  plugins: [react(), topLevelAwait(), noncePlugin()],
  server: {
    port: 3046,
    proxy: {
      "/api/v3/file": {
        target: "http://localhost:4444",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1": {
        target: "http://localhost:3030",
        changeOrigin: true,
        secure: false,
      },
      "/api/v3": {
        target: "http://localhost:3030",
        changeOrigin: true,
        secure: false,
      },
      "/api/tldraw": {
        target: "http://localhost:3349",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/vitest.setup.ts"],
  },
  preview: {
    port: 3046,
  },
});
