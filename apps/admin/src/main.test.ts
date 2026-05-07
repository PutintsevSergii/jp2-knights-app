import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAdminHealth, getAdminShellRoutes, getAdminThemePreview } from "./main.js";

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

  it("exposes admin content shell routes", () => {
    expect(getAdminShellRoutes().map((route) => route.path)).toEqual([
      "/admin/dashboard",
      "/admin/identity-access-reviews",
      "/admin/candidate-requests",
      "/admin/candidates",
      "/admin/organization-units",
      "/admin/prayers",
      "/admin/events",
      "/admin/announcements"
    ]);
  });

  it("keeps multi-screen admin model files as barrels only", () => {
    for (const fileName of [
      "admin-content-screens.ts",
      "admin-candidate-requests-screen.ts",
      "admin-candidates-screen.ts",
      "admin-organization-units-screen.ts"
    ]) {
      const source = readFileSync(join(process.cwd(), "apps/admin/src", fileName), "utf8");

      expect(source).not.toMatch(/export function build[A-Za-z]+Screen/);
      expect(source).not.toMatch(/export interface [A-Za-z]+Screen/);
    }
  });
});
