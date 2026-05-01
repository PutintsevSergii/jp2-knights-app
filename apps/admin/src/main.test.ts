import { describe, expect, it } from "vitest";
import { getAdminHealth, getAdminThemePreview } from "./main.js";

describe("admin shell", () => {
  it("supports explicit demo mode", () => {
    expect(getAdminHealth("demo").runtimeMode).toBe("demo");
  });

  it("rejects demo mode for production builds", () => {
    expect(() => getAdminHealth("demo", "production")).toThrow(
      "Demo runtime mode is not allowed in production."
    );
  });

  it("uses shared design tokens", () => {
    expect(getAdminThemePreview().action).toBeDefined();
  });
});
