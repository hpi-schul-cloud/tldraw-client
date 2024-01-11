import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
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
  plugins: [react(), topLevelAwait(), noncePlugin()],
  server: {
    open: true,
    port: 3046,
    proxy: {
      "/api": {
        target: "http://localhost:3030",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
