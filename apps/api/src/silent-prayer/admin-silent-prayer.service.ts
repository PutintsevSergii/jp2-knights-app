import { Injectable, NotFoundException } from "@nestjs/common";
import {
  requireAdminLite,
  requireScopedAdminWrite
} from "../admin/admin-access.policy.js";
import { adminContentScopeFor } from "../admin/admin-content-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminSilentPrayerRepository } from "./admin-silent-prayer.repository.js";
import type {
  AdminSilentPrayerEventDetailResponse,
  AdminSilentPrayerEventListResponse,
  AdminSilentPrayerEventSummary,
  CreateAdminSilentPrayerEventRequest,
  UpdateAdminSilentPrayerEventRequest
} from "./admin-silent-prayer.types.js";

@Injectable()
export class AdminSilentPrayerService {
  constructor(
    private readonly adminSilentPrayerRepository: AdminSilentPrayerRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listAdminSilentPrayerEvents(
    principal: CurrentUserPrincipal
  ): Promise<AdminSilentPrayerEventListResponse> {
    requireAdminLite(principal);

    return {
      silentPrayerEvents: await this.adminSilentPrayerRepository.listManageableEvents(
        adminContentScopeFor(principal)
      )
    };
  }

  async createAdminSilentPrayerEvent(
    principal: CurrentUserPrincipal,
    data: CreateAdminSilentPrayerEventRequest
  ): Promise<AdminSilentPrayerEventDetailResponse> {
    requireScopedAdminWrite(
      principal,
      data.targetOrganizationUnitId ?? null,
      "Officer silent-prayer event writes must stay within assigned organization units."
    );

    const silentPrayerEvent = await this.adminSilentPrayerRepository.createEvent(
      data,
      principal.id
    );
    await this.auditLog.record({
      action: "admin.silent_prayer_event.create",
      actorUserId: principal.id,
      entityType: "silent_prayer_event",
      entityId: silentPrayerEvent.id,
      scopeOrganizationUnitId: silentPrayerEvent.targetOrganizationUnitId,
      beforeSummary: null,
      afterSummary: summarizeSilentPrayerEventForAudit(silentPrayerEvent)
    });

    return {
      silentPrayerEvent
    };
  }

  async updateAdminSilentPrayerEvent(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminSilentPrayerEventRequest
  ): Promise<AdminSilentPrayerEventDetailResponse> {
    if (data.targetOrganizationUnitId !== undefined) {
      requireScopedAdminWrite(
        principal,
        data.targetOrganizationUnitId,
        "Officer silent-prayer event writes must stay within assigned organization units."
      );
    } else {
      requireAdminLite(principal);
    }

    const scope = adminContentScopeFor(principal);
    const beforeSilentPrayerEvent =
      await this.adminSilentPrayerRepository.findEventForAudit(id, scope);
    const silentPrayerEvent = await this.adminSilentPrayerRepository.updateEvent(
      id,
      data,
      scope,
      principal.id
    );

    if (!silentPrayerEvent) {
      throw new NotFoundException(
        "Silent-prayer event was not found in the current admin scope."
      );
    }

    await this.auditLog.record({
      action: "admin.silent_prayer_event.update",
      actorUserId: principal.id,
      entityType: "silent_prayer_event",
      entityId: silentPrayerEvent.id,
      scopeOrganizationUnitId: silentPrayerEvent.targetOrganizationUnitId,
      beforeSummary: beforeSilentPrayerEvent
        ? summarizeSilentPrayerEventForAudit(beforeSilentPrayerEvent)
        : null,
      afterSummary: summarizeSilentPrayerEventForAudit(silentPrayerEvent)
    });

    return { silentPrayerEvent };
  }
}

function summarizeSilentPrayerEventForAudit(
  silentPrayerEvent: AdminSilentPrayerEventSummary
): AuditSummary {
  return {
    title: silentPrayerEvent.title,
    visibility: silentPrayerEvent.visibility,
    targetOrganizationUnitId: silentPrayerEvent.targetOrganizationUnitId,
    status: silentPrayerEvent.status,
    startsAt: silentPrayerEvent.startsAt,
    endsAt: silentPrayerEvent.endsAt,
    approvedAt: silentPrayerEvent.approvedAt,
    publishedAt: silentPrayerEvent.publishedAt,
    cancelledAt: silentPrayerEvent.cancelledAt,
    archivedAt: silentPrayerEvent.archivedAt
  };
}
