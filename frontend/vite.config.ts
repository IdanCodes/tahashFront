import { ConfigEnv, defineConfig, loadEnv } from "vite";
import path from "path";
// @ts-ignore
import react from "@vitejs/plugin-react";
// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
});
