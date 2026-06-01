import { Injectable } from "@nestjs/common";
import { requireAdminLite, requireSuperAdmin } from "../admin/admin-access.policy.js";
import { adminContentScopeFor } from "../admin/admin-content-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertPublishHasPriorApproval } from "../content/content-approval.policy.js";
import { AdminPrayerRepository } from "./admin-prayer.repository.js";
import type {
  AdminPrayerDetailResponse,
  AdminPrayerListResponse,
  CreateAdminPrayerRequest,
  UpdateAdminPrayerRequest
} from "./admin-prayer.types.js";

@Injectable()
export class AdminPrayerService {
  constructor(
    private readonly adminPrayerRepository: AdminPrayerRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listAdminPrayers(principal: CurrentUserPrincipal): Promise<AdminPrayerListResponse> {
    requireAdminLite(principal);

    return {
      prayers: await this.adminPrayerRepository.listManageablePrayers(
        adminContentScopeFor(principal)
      )
    };
  }

  async createAdminPrayer(
    principal: CurrentUserPrincipal,
    data: CreateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    requireSuperAdmin(principal);
    assertPublishHasPriorApproval(data.status, null, "Prayer");

    const prayer = await this.adminPrayerRepository.createPrayer(data, principal.id);
    await this.auditLog.record({
      action: "admin.prayer.create",
      actorUserId: principal.id,
      entityType: "prayer",
      entityId: prayer.id,
      scopeOrganizationUnitId: prayer.targetOrganizationUnitId,
      beforeSummary: null,
      afterSummary: summarizePrayerForAudit(prayer)
    });

    return {
      prayer
    };
  }

  async updateAdminPrayer(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    requireSuperAdmin(principal);

    const beforePrayer = await this.adminPrayerRepository.findPrayerForAudit(id);
    assertPublishHasPriorApproval(data.status, beforePrayer, "Prayer");
    const prayer = await this.adminPrayerRepository.updatePrayer(id, data, principal.id);
    await this.auditLog.record({
      action: "admin.prayer.update",
      actorUserId: principal.id,
      entityType: "prayer",
      entityId: prayer.id,
      scopeOrganizationUnitId: prayer.targetOrganizationUnitId,
      beforeSummary: beforePrayer ? summarizePrayerForAudit(beforePrayer) : null,
      afterSummary: summarizePrayerForAudit(prayer)
    });

    return {
      prayer
    };
  }
}

function summarizePrayerForAudit(prayer: AdminPrayerDetailResponse["prayer"]): AuditSummary {
  return {
    title: prayer.title,
    language: prayer.language,
    visibility: prayer.visibility,
    targetOrganizationUnitId: prayer.targetOrganizationUnitId,
    status: prayer.status,
    approvedAt: prayer.approvedAt,
    publishedAt: prayer.publishedAt,
    archivedAt: prayer.archivedAt
  };
}
