import { Injectable } from "@nestjs/common";
import { hasRole } from "@jp2/shared-auth";
import { adminScopeFor, requireAdminLite } from "../admin/admin-access.policy.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminDashboardRepository } from "./admin-dashboard.repository.js";
import type { AdminDashboardCounts, AdminDashboardResponse } from "./admin-dashboard.types.js";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly adminDashboardRepository: AdminDashboardRepository) {}

  async getDashboard(principal: CurrentUserPrincipal): Promise<AdminDashboardResponse> {
    requireAdminLite(principal);

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const counts = await this.adminDashboardRepository.loadCounts(scopeOrganizationUnitIds);

    return {
      scope: {
        adminKind: hasRole(principal, "SUPER_ADMIN") ? "SUPER_ADMIN" : "OFFICER",
        organizationUnitIds: scopeOrganizationUnitIds === null ? [] : [...scopeOrganizationUnitIds]
      },
      counts,
      tasks: buildTasks(counts)
    };
  }
}

function buildTasks(counts: AdminDashboardCounts): AdminDashboardResponse["tasks"] {
  return [
    {
      id: "review-identity-access",
      label: "Confirm sign-in requests",
      count: counts.identityAccessReviews,
      targetRoute: "/admin/identity-access-reviews",
      priority: counts.identityAccessReviews > 0 ? "attention" : "normal"
    },
    {
      id: "manage-organization-units",
      label: "Review organization units",
      count: counts.organizationUnits,
      targetRoute: "/admin/organization-units",
      priority: "normal"
    },
    {
      id: "manage-prayers",
      label: "Review prayers",
      count: counts.prayers,
      targetRoute: "/admin/prayers",
      priority: counts.prayers === 0 ? "attention" : "normal"
    },
    {
      id: "manage-events",
      label: "Review events",
      count: counts.events,
      targetRoute: "/admin/events",
      priority: counts.events === 0 ? "attention" : "normal"
    }
  ];
}
