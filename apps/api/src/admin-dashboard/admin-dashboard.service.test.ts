import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminDashboardRepository } from "./admin-dashboard.repository.js";
import { AdminDashboardService } from "./admin-dashboard.service.js";

const brother: CurrentUserPrincipal = {
  id: "brother_1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"]
};

const officer: CurrentUserPrincipal = {
  id: "officer_1",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

const superAdmin: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminDashboardService", () => {
  it("builds a scoped officer dashboard without exposing row-level private data", async () => {
    const repository = dashboardRepository();

    await expect(new AdminDashboardService(repository).getDashboard(officer)).resolves.toEqual({
      scope: {
        adminKind: "OFFICER",
        organizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
      },
      counts: {
        organizationUnits: 1,
        prayers: 2,
        events: 0
      },
      tasks: [
        {
          id: "manage-organization-units",
          label: "Review organization units",
          count: 1,
          targetRoute: "/admin/organization-units",
          priority: "normal"
        },
        {
          id: "manage-prayers",
          label: "Review prayers",
          count: 2,
          targetRoute: "/admin/prayers",
          priority: "normal"
        },
        {
          id: "manage-events",
          label: "Review events",
          count: 0,
          targetRoute: "/admin/events",
          priority: "attention"
        }
      ]
    });
    expect(repository.scopes).toEqual([["11111111-1111-4111-8111-111111111111"]]);
  });

  it("uses global scope for super admins", async () => {
    const repository = dashboardRepository();

    await expect(new AdminDashboardService(repository).getDashboard(superAdmin)).resolves.toEqual(
      expect.objectContaining({
        scope: {
          adminKind: "SUPER_ADMIN",
          organizationUnitIds: []
        }
      })
    );
    expect(repository.scopes).toEqual([null]);
  });

  it("blocks non-admin principals", async () => {
    await expect(
      new AdminDashboardService(dashboardRepository()).getDashboard(brother)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function dashboardRepository(): AdminDashboardRepository & {
  scopes: Array<readonly string[] | null>;
} {
  return {
    scopes: [],
    loadCounts(scopeOrganizationUnitIds) {
      this.scopes.push(scopeOrganizationUnitIds);
      return Promise.resolve({
        organizationUnits: 1,
        prayers: 2,
        events: 0
      });
    }
  };
}
