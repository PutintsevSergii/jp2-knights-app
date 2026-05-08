import { ForbiddenException } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import {
  adminScopeFor,
  canUseAdminOrganizationUnit,
  requireAdminLite,
  requireAdminOrganizationUnitScope,
  requireScopedAdminWrite,
  requireSuperAdmin
} from "./admin-access.policy.js";

const officer: CurrentUserPrincipal = {
  id: "officer_1",
  email: "officer@example.test",
  displayName: "Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["unit_1"]
};

const superAdmin: CurrentUserPrincipal = {
  ...officer,
  id: "admin_1",
  roles: ["SUPER_ADMIN"],
  officerOrganizationUnitIds: []
};

describe("admin access policy", () => {
  it("maps super admin to global scope and officers to assigned organization units", () => {
    expect(adminScopeFor(superAdmin)).toBeNull();
    expect(adminScopeFor(officer)).toEqual(["unit_1"]);
  });

  it("allows admin lite for officers and super admins only", () => {
    expect(() => requireAdminLite(officer)).not.toThrow();
    expect(() => requireAdminLite({ ...officer, roles: ["BROTHER"] })).toThrow(ForbiddenException);
  });

  it("keeps super admin checks centralized", () => {
    expect(() => requireSuperAdmin(superAdmin)).not.toThrow();
    expect(() => requireSuperAdmin(officer)).toThrow(ForbiddenException);
  });

  it("enforces scoped officer organization unit writes", () => {
    expect(canUseAdminOrganizationUnit(officer, "unit_1")).toBe(true);
    expect(canUseAdminOrganizationUnit(officer, "unit_2")).toBe(false);
    expect(() =>
      requireAdminOrganizationUnitScope(officer, "unit_2", "Outside scope.")
    ).toThrow(ForbiddenException);
    expect(() => requireScopedAdminWrite(officer, "unit_1", "Outside scope.")).not.toThrow();
    expect(() => requireScopedAdminWrite(officer, null, "Outside scope.")).toThrow(
      ForbiddenException
    );
  });

  it("keeps Admin Lite scope checks out of feature services", () => {
    const featureServiceFiles = [
      "apps/api/src/admin-candidate-requests/admin-candidate-request.service.ts",
      "apps/api/src/admin-candidates/admin-candidate.service.ts",
      "apps/api/src/admin-content/admin-announcement.service.ts",
      "apps/api/src/admin-content/admin-event.service.ts",
      "apps/api/src/admin-content/admin-prayer.service.ts",
      "apps/api/src/admin-dashboard/admin-dashboard.service.ts",
      "apps/api/src/admin-identity-access/admin-identity-access.service.ts",
      "apps/api/src/organization/organization.service.ts"
    ];

    for (const filePath of featureServiceFiles) {
      const source = readFileSync(join(process.cwd(), filePath), "utf8");
      expect(source).not.toMatch(/function scopeFor|function requireSuperAdmin|canAccessAdminLite/);
    }
  });
});
