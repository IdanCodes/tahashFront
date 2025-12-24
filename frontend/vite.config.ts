// @ts-ignore
import react from "@vitejs/plugin-react";
// @ts-ignore
import tailwindcss from "@tailwindcss/vite";
import * as path from "node:path";

// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
// https://vite.dev/config/
// export default defineConfig({
//
// });
