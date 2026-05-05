import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
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
    if (!canAccessAdminLite(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Admin Lite access is required.");
    }

    return {
      events: await this.adminEventRepository.listManageableEvents(scopeFor(principal))
    };
  }

  async createAdminEvent(
    principal: CurrentUserPrincipal,
    data: CreateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    assertCanWriteEvent(principal, data.targetOrganizationUnitId ?? null);

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
      assertCanWriteEvent(principal, data.targetOrganizationUnitId);
    } else if (!canAccessAdminLite(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Admin Lite access is required.");
    }

    const scopeOrganizationUnitIds = scopeFor(principal);
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

function scopeFor(principal: CurrentUserPrincipal): readonly string[] | null {
  return hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? []);
}

function assertCanWriteEvent(
  principal: CurrentUserPrincipal,
  targetOrganizationUnitId: string | null
): void {
  if (!canAccessAdminLite(principal)) {
    assertNotIdleApprovalPrincipal(principal);
    throw new ForbiddenException("Admin Lite access is required.");
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if (
    targetOrganizationUnitId &&
    (principal.officerOrganizationUnitIds ?? []).includes(targetOrganizationUnitId)
  ) {
    return;
  }

  throw new ForbiddenException("Officer event writes must stay within assigned organization units.");
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
