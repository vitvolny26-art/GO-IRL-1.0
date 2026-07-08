import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __GO_IRL_COMMIT__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || process.env.VITE_GIT_COMMIT || "unknown"),
    __GO_IRL_BUILT_AT__: JSON.stringify(process.env.VITE_BUILD_TIME || new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-go-irl-v0-[hash].js",
        chunkFileNames: "assets/[name]-go-irl-v0-[hash].js",
        assetFileNames: "assets/go-irl-v0-[hash][extname]",
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/@tanstack")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@supabase") || id.includes("node_modules/zustand")) {
            return "vendor-data";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("/src/verticals/SportVertical") || id.includes("\\src\\verticals\\SportVertical")) {
            return "vertical-sport";
          }
        },
      },
    },
  },
});
