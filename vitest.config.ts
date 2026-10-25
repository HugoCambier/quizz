import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

// Extends `vite.config.ts` so the path aliases resolve in tests exactly as at
// build time. Tests live under `tests/`, mirroring `src/`.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["tests/setup.ts"],
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text"],
        reportsDirectory: "coverage",
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["**/*.d.ts", "src/main.tsx"],
      },
    },
  }),
);
