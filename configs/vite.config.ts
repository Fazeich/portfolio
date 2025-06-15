import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: "portfolio",
      fileName: "portfolio",
      formats: ["iife"],
      entry: path.resolve("./", "./src/main.tsx"),
    },
    rollupOptions: {
      input: {
        "index.html": "index.html",
      },
    },
  },
  plugins: [react()],
  base: "/portfolio/",

  resolve: {
    alias: {
      "@": path.resolve("./", "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://81.177.223.127:3010",
      },
    },
  },
  define: {
    process: {
      env: {},
      cwd: () => "/",
    },
  },
});
