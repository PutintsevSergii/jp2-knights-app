import { describe, expect, it } from "vitest";
import { getAdminHealth, getAdminThemePreview } from "./main.js";

describe("admin shell", () => {
  it("supports explicit demo mode", () => {
    expect(getAdminHealth("demo").runtimeMode).toBe("demo");
  });

  it("uses shared design tokens", () => {
    expect(getAdminThemePreview().action).toBeDefined();
  });
});
