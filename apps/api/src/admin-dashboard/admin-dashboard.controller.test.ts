import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminDashboardController } from "./admin-dashboard.controller.js";
import type { AdminDashboardService } from "./admin-dashboard.service.js";

const principal: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminDashboardController", () => {
  it("delegates dashboard reads using the guard-attached principal", async () => {
    const controller = new AdminDashboardController({
      getDashboard: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({
          scope: {
            adminKind: "SUPER_ADMIN",
            organizationUnitIds: []
          },
          counts: {
            organizationUnits: 1,
            prayers: 2,
            events: 3
          },
          tasks: []
        });
      }
    } as unknown as AdminDashboardService);

    await expect(controller.getDashboard({ principal })).resolves.toEqual({
      scope: {
        adminKind: "SUPER_ADMIN",
        organizationUnitIds: []
      },
      counts: {
        organizationUnits: 1,
        prayers: 2,
        events: 3
      },
      tasks: []
    });
  });

  it("fails closed when invoked without the guard-attached principal", async () => {
    const controller = new AdminDashboardController({} as AdminDashboardService);

    await expect(controller.getDashboard({})).rejects.toThrow("CurrentUserGuard");
  });
});
