import { Injectable, NotFoundException } from "@nestjs/common";
import {
  requireAdminLite,
  requireScopedAdminWrite
} from "../admin/admin-access.policy.js";
import { adminContentScopeFor } from "../admin/admin-content-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { eventMutationAuditAction } from "../content/content-audit-actions.js";
import {
  assertEventPublishHasPriorApproval,
  assertPublishedEventRetainsApproval
} from "../content/content-approval.policy.js";
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
      events: await this.adminEventRepository.listManageableEvents(
        adminContentScopeFor(principal)
      )
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
    assertEventPublishHasPriorApproval(data.status, null, "Event");

    const event = await this.adminEventRepository.createEvent(data, principal.id);
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

    const scope = adminContentScopeFor(principal);
    const beforeEvent = await this.adminEventRepository.findEventForAudit(
      id,
      scope
    );
    assertEventPublishHasPriorApproval(data.status, beforeEvent, "Event");
    assertPublishedEventRetainsApproval(
      data.status,
      data.approvedAt,
      beforeEvent,
      "Event"
    );
    const event = await this.adminEventRepository.updateEvent(
      id,
      data,
      scope,
      principal.id
    );

    if (!event) {
      throw new NotFoundException("Event was not found in the current admin scope.");
    }

    await this.auditLog.record({
      action: eventMutationAuditAction(data, beforeEvent),
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
    approvedAt: event.approvedAt,
    publishedAt: event.publishedAt,
    cancelledAt: event.cancelledAt,
    archivedAt: event.archivedAt
  };
}
