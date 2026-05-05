import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminCandidateRequestRepository } from "./admin-candidate-request.repository.js";
import type {
  AdminCandidateRequestDetail,
  AdminCandidateRequestDetailResponse,
  AdminCandidateRequestListResponse,
  UpdateAdminCandidateRequest
} from "./admin-candidate-request.types.js";

@Injectable()
export class AdminCandidateRequestService {
  constructor(
    private readonly candidateRequestRepository: AdminCandidateRequestRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listCandidateRequests(
    principal: CurrentUserPrincipal
  ): Promise<AdminCandidateRequestListResponse> {
    if (!canAccessAdminLite(principal)) {
      throw new ForbiddenException("Admin Lite access is required.");
    }

    return {
      candidateRequests: await this.candidateRequestRepository.listCandidateRequests(
        scopeFor(principal)
      )
    };
  }

  async getCandidateRequest(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminCandidateRequestDetailResponse> {
    if (!canAccessAdminLite(principal)) {
      throw new ForbiddenException("Admin Lite access is required.");
    }

    const candidateRequest = await this.candidateRequestRepository.findCandidateRequest(
      id,
      scopeFor(principal)
    );

    if (!candidateRequest) {
      throw new NotFoundException("Candidate request was not found in the current admin scope.");
    }

    return { candidateRequest };
  }

  async updateCandidateRequest(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminCandidateRequest
  ): Promise<AdminCandidateRequestDetailResponse> {
    assertCanUpdateCandidateRequest(principal, data);

    const scopeOrganizationUnitIds = scopeFor(principal);
    const beforeCandidateRequest = await this.candidateRequestRepository.findCandidateRequest(
      id,
      scopeOrganizationUnitIds
    );
    const candidateRequest = await this.candidateRequestRepository.updateCandidateRequest(
      id,
      data,
      scopeOrganizationUnitIds
    );

    if (!candidateRequest) {
      throw new NotFoundException("Candidate request was not found in the current admin scope.");
    }

    await this.auditLog.record({
      action: "admin.candidateRequest.update",
      actorUserId: principal.id,
      entityType: "candidate_request",
      entityId: candidateRequest.id,
      scopeOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
      beforeSummary: beforeCandidateRequest
        ? summarizeCandidateRequestForAudit(beforeCandidateRequest)
        : null,
      afterSummary: summarizeCandidateRequestForAudit(candidateRequest)
    });

    return { candidateRequest };
  }
}

function scopeFor(principal: CurrentUserPrincipal): readonly string[] | null {
  return hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? []);
}

function assertCanUpdateCandidateRequest(
  principal: CurrentUserPrincipal,
  data: UpdateAdminCandidateRequest
): void {
  if (!canAccessAdminLite(principal)) {
    throw new ForbiddenException("Admin Lite access is required.");
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if (data.assignedOrganizationUnitId === undefined) {
    return;
  }

  if (
    data.assignedOrganizationUnitId &&
    (principal.officerOrganizationUnitIds ?? []).includes(data.assignedOrganizationUnitId)
  ) {
    return;
  }

  throw new ForbiddenException(
    "Officer candidate request assignment must stay within assigned organization units."
  );
}

function summarizeCandidateRequestForAudit(
  candidateRequest: AdminCandidateRequestDetail
): AuditSummary {
  return {
    firstName: candidateRequest.firstName,
    lastName: candidateRequest.lastName,
    hasEmail: Boolean(candidateRequest.email),
    country: candidateRequest.country,
    city: candidateRequest.city,
    status: candidateRequest.status,
    assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
    assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
    hasOfficerNote: Boolean(candidateRequest.officerNote),
    archivedAt: candidateRequest.archivedAt
  };
}
