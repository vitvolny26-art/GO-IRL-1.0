import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __GO_IRL_COMMIT__: "\"a18abb0\"",
    __GO_IRL_BUILT_AT__: "\"2026-07-08T14:10:13.387Z\"",
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
