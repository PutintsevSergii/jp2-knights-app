import { ForbiddenException, Injectable } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
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
    if (!canAccessAdminLite(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Admin Lite access is required.");
    }

    return {
      prayers: await this.adminPrayerRepository.listManageablePrayers(
        hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? [])
      )
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

function requireSuperAdmin(principal: CurrentUserPrincipal): void {
  if (!hasRole(principal, "SUPER_ADMIN")) {
    assertNotIdleApprovalPrincipal(principal);
    throw new ForbiddenException("Super Admin access is required.");
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
