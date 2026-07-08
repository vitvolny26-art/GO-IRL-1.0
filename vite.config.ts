import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";

// Get current git commit SHA and timestamp
let gitCommit = "unknown";
let builtAt = new Date().toISOString();

try {
  gitCommit = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
} catch {
  console.warn("Could not get git commit hash");
}

try {
  builtAt = execSync('git log -1 --format=%cI', { encoding: "utf-8" }).trim();
} catch {
  console.warn("Could not get git commit timestamp");
}

console.log(`[GO IRL] Building with commit: ${gitCommit}, built at: ${builtAt}`);

export default defineConfig({
  plugins: [react()],
  define: {
    __GO_IRL_COMMIT__: JSON.stringify(gitCommit),
    __GO_IRL_BUILT_AT__: JSON.stringify(builtAt),
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
