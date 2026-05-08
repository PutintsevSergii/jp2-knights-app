import { Injectable, NotFoundException } from "@nestjs/common";
import {
  adminScopeFor,
  requireAdminLite,
  requireScopedAdminWrite
} from "../admin/admin-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminEventRepository } from "./admin-event.repository.js";
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
  CreateAdminEventRequest,
  UpdateAdminEventRequest
} from "./admin-event.types.js";

@Injectable()
export class AdminEventService {
  constructor(
    private readonly adminEventRepository: AdminEventRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listAdminEvents(principal: CurrentUserPrincipal): Promise<AdminEventListResponse> {
    requireAdminLite(principal);

    return {
      events: await this.adminEventRepository.listManageableEvents(adminScopeFor(principal))
    };
  }

  async createAdminEvent(
    principal: CurrentUserPrincipal,
    data: CreateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    requireScopedAdminWrite(
      principal,
      data.targetOrganizationUnitId ?? null,
      "Officer event writes must stay within assigned organization units."
    );

    const event = await this.adminEventRepository.createEvent(data);
    await this.auditLog.record({
      action: "admin.event.create",
      actorUserId: principal.id,
      entityType: "event",
      entityId: event.id,
      scopeOrganizationUnitId: event.targetOrganizationUnitId,
      beforeSummary: null,
      afterSummary: summarizeEventForAudit(event)
    });

    return {
      event
    };
  }

  async updateAdminEvent(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    if (data.targetOrganizationUnitId !== undefined) {
      requireScopedAdminWrite(
        principal,
        data.targetOrganizationUnitId,
        "Officer event writes must stay within assigned organization units."
      );
    } else {
      requireAdminLite(principal);
    }

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const beforeEvent = await this.adminEventRepository.findEventForAudit(
      id,
      scopeOrganizationUnitIds
    );
    const event = await this.adminEventRepository.updateEvent(id, data, scopeOrganizationUnitIds);

    if (!event) {
      throw new NotFoundException("Event was not found in the current admin scope.");
    }

    await this.auditLog.record({
      action: "admin.event.update",
      actorUserId: principal.id,
      entityType: "event",
      entityId: event.id,
      scopeOrganizationUnitId: event.targetOrganizationUnitId,
      beforeSummary: beforeEvent ? summarizeEventForAudit(beforeEvent) : null,
      afterSummary: summarizeEventForAudit(event)
    });

    return { event };
  }
}

function summarizeEventForAudit(event: AdminEventDetailResponse["event"]): AuditSummary {
  return {
    title: event.title,
    type: event.type,
    startAt: event.startAt,
    endAt: event.endAt,
    locationLabel: event.locationLabel,
    visibility: event.visibility,
    targetOrganizationUnitId: event.targetOrganizationUnitId,
    status: event.status,
    publishedAt: event.publishedAt,
    cancelledAt: event.cancelledAt,
    archivedAt: event.archivedAt
  };
}
