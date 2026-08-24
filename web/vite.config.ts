import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Phase 0 — live health endpoint
      "/health": "http://127.0.0.1:3000",
      // Phase 1+ — all API routes share this prefix
      "/api": "http://127.0.0.1:3000",
    },
  },
});
