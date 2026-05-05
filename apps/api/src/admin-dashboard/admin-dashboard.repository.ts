import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { adminEventListWhere } from "../admin-content/admin-event.repository.js";
import { adminPrayerListWhere } from "../admin-content/admin-prayer.repository.js";
import { PrismaService } from "../database/prisma.service.js";
import type { AdminDashboardCounts } from "./admin-dashboard.types.js";

export abstract class AdminDashboardRepository {
  abstract loadCounts(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminDashboardCounts>;
}

@Injectable()
export class PrismaAdminDashboardRepository implements AdminDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async loadCounts(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminDashboardCounts> {
    const [identityAccessReviews, organizationUnits, prayers, events] = await Promise.all([
      this.prisma.identityAccessReview.count({
        where: adminDashboardIdentityAccessReviewWhere(scopeOrganizationUnitIds)
      }),
      this.prisma.organizationUnit.count({
        where: adminDashboardOrganizationUnitWhere(scopeOrganizationUnitIds)
      }),
      this.prisma.prayer.count({
        where: adminPrayerListWhere(scopeOrganizationUnitIds)
      }),
      this.prisma.event.count({
        where: adminEventListWhere(scopeOrganizationUnitIds)
      })
    ]);

    return {
      identityAccessReviews,
      organizationUnits,
      prayers,
      events
    };
  }
}

export function adminDashboardIdentityAccessReviewWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.IdentityAccessReviewWhereInput {
  const pendingWhere: Prisma.IdentityAccessReviewWhereInput = {
    status: "pending"
  };

  if (scopeOrganizationUnitIds === null) {
    return pendingWhere;
  }

  return {
    ...pendingWhere,
    scopeOrganizationUnitId: {
      in: [...scopeOrganizationUnitIds]
    }
  };
}

export function adminDashboardOrganizationUnitWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.OrganizationUnitWhereInput {
  const activeWhere: Prisma.OrganizationUnitWhereInput = {
    status: "active",
    archivedAt: null
  };

  if (scopeOrganizationUnitIds === null) {
    return activeWhere;
  }

  return {
    ...activeWhere,
    id: {
      in: [...scopeOrganizationUnitIds]
    }
  };
}
