import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/**/*.test.ts", "libs/**/*.test.ts", "tools/**/*.test.ts"],
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
