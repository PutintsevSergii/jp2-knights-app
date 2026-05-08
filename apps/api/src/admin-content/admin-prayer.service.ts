import { Injectable } from "@nestjs/common";
import {
  adminScopeFor,
  requireAdminLite,
  requireSuperAdmin
} from "../admin/admin-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
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
      prayers: await this.adminPrayerRepository.listManageablePrayers(adminScopeFor(principal))
    };
  }

  async createAdminPrayer(
    principal: CurrentUserPrincipal,
    data: CreateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    requireSuperAdmin(principal);

    const prayer = await this.adminPrayerRepository.createPrayer(data);
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
    const prayer = await this.adminPrayerRepository.updatePrayer(id, data);
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
    publishedAt: prayer.publishedAt,
    archivedAt: prayer.archivedAt
  };
}
