import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": templateRoot,
      "@shared": path.resolve(templateRoot, "shared"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    // Next.js loads .env automatically for the app itself, but vitest needs
    // it loaded explicitly for server/*.test.ts (which import server/supabase.ts
    // etc. directly, outside of Next's runtime). Empty prefix = load every
    // key, not just NEXT_PUBLIC_-prefixed ones.
    env: loadEnv("", templateRoot, ""),
  },
});
