import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { hasRole } from "@jp2/shared-auth";
import {
  adminScopeFor,
  requireAdminLite,
  requireAdminOrganizationUnitScope
} from "../admin/admin-access.policy.js";
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

type CandidateRequestStatus = AdminCandidateRequestDetail["status"];

@Injectable()
export class AdminCandidateRequestService {
  constructor(
    private readonly candidateRequestRepository: AdminCandidateRequestRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listCandidateRequests(
    principal: CurrentUserPrincipal
  ): Promise<AdminCandidateRequestListResponse> {
    requireAdminLite(principal);

    return {
      candidateRequests: await this.candidateRequestRepository.listCandidateRequests(
        adminScopeFor(principal)
      )
    };
  }

  async getCandidateRequest(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminCandidateRequestDetailResponse> {
    requireAdminLite(principal);

    const candidateRequest = await this.candidateRequestRepository.findCandidateRequest(
      id,
      adminScopeFor(principal)
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

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const beforeCandidateRequest = await this.candidateRequestRepository.findCandidateRequest(
      id,
      scopeOrganizationUnitIds
    );

    if (!beforeCandidateRequest) {
      throw new NotFoundException("Candidate request was not found in the current admin scope.");
    }

    assertAllowedCandidateRequestUpdate(beforeCandidateRequest, data);

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
      beforeSummary: summarizeCandidateRequestForAudit(beforeCandidateRequest),
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

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const candidateRequest = await this.candidateRequestRepository.findCandidateRequest(
      id,
      scopeOrganizationUnitIds
    );

    if (!candidateRequest) {
      throw new NotFoundException("Candidate request was not found in the current admin scope.");
    }

    if (candidateRequest.status !== "invited") {
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

function assertAllowedCandidateRequestUpdate(
  candidateRequest: AdminCandidateRequestDetail,
  data: UpdateAdminCandidateRequest
): void {
  if (
    candidateRequest.status === "converted_to_candidate" ||
    candidateRequest.status === "rejected"
  ) {
    throw new ConflictException("Terminal candidate requests cannot be updated.");
  }

  if (data.status === undefined || data.status === candidateRequest.status) {
    return;
  }

  if (!allowedNextStatuses[candidateRequest.status].includes(data.status)) {
    throw new ConflictException("Candidate request status transition is not allowed.");
  }

  if (data.status === "rejected") {
    const rejectionNote = data.officerNote ?? candidateRequest.officerNote;

    if (!rejectionNote) {
      throw new ConflictException("Rejected candidate requests require an officer note.");
    }
  }
}

const allowedNextStatuses: Record<CandidateRequestStatus, readonly CandidateRequestStatus[]> = {
  new: ["contacted", "rejected"],
  contacted: ["invited", "rejected"],
  invited: ["rejected"],
  rejected: [],
  converted_to_candidate: []
};

function assertCanUpdateCandidateRequest(
  principal: CurrentUserPrincipal,
  data: UpdateAdminCandidateRequest
): void {
  requireAdminLite(principal);

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
  requireAdminLite(principal);

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
  requireAdminOrganizationUnitScope(
    principal,
    organizationUnitId,
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
