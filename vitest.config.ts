import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "react-native": fileURLToPath(new URL("./tools/test/react-native.ts", import.meta.url))
    }
  },
  test: {
    include: ["apps/**/*.test.ts", "apps/**/*.test.tsx", "libs/**/*.test.ts", "tools/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**", ".nx/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**", ".nx/**"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
