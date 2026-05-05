import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminCandidateRequestRepository } from "./admin-candidate-request.repository.js";
import type {
  AdminCandidateRequestDetail,
  AdminCandidateRequestDetailResponse,
  AdminCandidateRequestListResponse,
  AdminCandidateProfileDetailResponse,
  ConvertCandidateRequest,
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

  async convertCandidateRequest(
    principal: CurrentUserPrincipal,
    id: string,
    data: ConvertCandidateRequest
  ): Promise<AdminCandidateProfileDetailResponse> {
    assertCanConvertCandidateRequest(principal, data);

    const scopeOrganizationUnitIds = scopeFor(principal);
    const candidateRequest = await this.candidateRequestRepository.findCandidateRequest(
      id,
      scopeOrganizationUnitIds
    );

    if (!candidateRequest) {
      throw new NotFoundException("Candidate request was not found in the current admin scope.");
    }

    if (
      candidateRequest.status === "converted_to_candidate" ||
      candidateRequest.status === "rejected"
    ) {
      throw new ConflictException("Candidate request cannot be converted from its current status.");
    }

    const assignedOrganizationUnitId =
      data.assignedOrganizationUnitId ?? candidateRequest.assignedOrganizationUnitId;

    if (!assignedOrganizationUnitId) {
      throw new ConflictException(
        "Candidate request must be assigned to an organization unit before conversion."
      );
    }

    assertCanUseOrganizationUnit(principal, assignedOrganizationUnitId);

    const candidateProfile = await this.candidateRequestRepository.convertCandidateRequest(
      id,
      {
        assignedOrganizationUnitId,
        responsibleOfficerId: data.responsibleOfficerId
      },
      principal.id,
      scopeOrganizationUnitIds
    );

    if (!candidateProfile) {
      throw new NotFoundException("Candidate request was not found in the current admin scope.");
    }

    await this.auditLog.record({
      action: "admin.candidateRequest.convert",
      actorUserId: principal.id,
      entityType: "candidate_profile",
      entityId: candidateProfile.id,
      scopeOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
      beforeSummary: summarizeCandidateRequestForAudit(candidateRequest),
      afterSummary: {
        candidateProfileId: candidateProfile.id,
        userId: candidateProfile.userId,
        candidateRequestId: candidateProfile.candidateRequestId,
        hasEmail: Boolean(candidateProfile.email),
        assignedOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
        assignedOrganizationUnitName: candidateProfile.assignedOrganizationUnitName,
        responsibleOfficerId: candidateProfile.responsibleOfficerId,
        status: candidateProfile.status
      }
    });

    return { candidateProfile };
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

function assertCanConvertCandidateRequest(
  principal: CurrentUserPrincipal,
  data: ConvertCandidateRequest
): void {
  if (!canAccessAdminLite(principal)) {
    throw new ForbiddenException("Admin Lite access is required.");
  }

  if (!hasRole(principal, "SUPER_ADMIN") && data.responsibleOfficerId !== undefined) {
    if (data.responsibleOfficerId !== null && data.responsibleOfficerId !== principal.id) {
      throw new ForbiddenException("Officers can only assign themselves as responsible officer.");
    }
  }

  if (data.assignedOrganizationUnitId) {
    assertCanUseOrganizationUnit(principal, data.assignedOrganizationUnitId);
  }
}

function assertCanUseOrganizationUnit(
  principal: CurrentUserPrincipal,
  organizationUnitId: string
): void {
  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if ((principal.officerOrganizationUnitIds ?? []).includes(organizationUnitId)) {
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
