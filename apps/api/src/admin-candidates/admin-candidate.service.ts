import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { AdminCandidateRepository } from "./admin-candidate.repository.js";
import type {
  AdminCandidateProfileDetail,
  AdminCandidateProfileDetailResponse,
  AdminCandidateProfileListResponse,
  UpdateAdminCandidateProfile
} from "./admin-candidate.types.js";

@Injectable()
export class AdminCandidateService {
  constructor(
    private readonly candidateRepository: AdminCandidateRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listCandidateProfiles(
    principal: CurrentUserPrincipal
  ): Promise<AdminCandidateProfileListResponse> {
    assertCanReadCandidates(principal);

    return {
      candidateProfiles: await this.candidateRepository.listCandidateProfiles(scopeFor(principal))
    };
  }

  async getCandidateProfile(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminCandidateProfileDetailResponse> {
    assertCanReadCandidates(principal);

    const candidateProfile = await this.candidateRepository.findCandidateProfile(
      id,
      scopeFor(principal)
    );

    if (!candidateProfile) {
      throw new NotFoundException("Candidate profile was not found in the current admin scope.");
    }

    return { candidateProfile };
  }

  async updateCandidateProfile(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminCandidateProfile
  ): Promise<AdminCandidateProfileDetailResponse> {
    assertCanUpdateCandidates(principal, data);
    const scopeOrganizationUnitIds = scopeFor(principal);
    const beforeCandidateProfile = await this.candidateRepository.findCandidateProfile(
      id,
      scopeOrganizationUnitIds
    );
    const candidateProfile = await this.candidateRepository.updateCandidateProfile(
      id,
      data,
      scopeOrganizationUnitIds
    );

    if (!candidateProfile) {
      throw new NotFoundException("Candidate profile was not found in the current admin scope.");
    }

    await this.auditLog.record({
      action: "admin.candidateProfile.update",
      actorUserId: principal.id,
      entityType: "candidate_profile",
      entityId: candidateProfile.id,
      scopeOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
      beforeSummary: beforeCandidateProfile
        ? summarizeCandidateProfileForAudit(beforeCandidateProfile)
        : null,
      afterSummary: summarizeCandidateProfileForAudit(candidateProfile)
    });

    return { candidateProfile };
  }
}

function scopeFor(principal: CurrentUserPrincipal): readonly string[] | null {
  return hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? []);
}

function assertCanReadCandidates(principal: CurrentUserPrincipal): void {
  if (!canAccessAdminLite(principal)) {
    assertNotIdleApprovalPrincipal(principal);
    throw new ForbiddenException("Admin Lite access is required.");
  }
}

function assertCanUpdateCandidates(
  principal: CurrentUserPrincipal,
  data: UpdateAdminCandidateProfile
): void {
  assertCanReadCandidates(principal);

  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if (
    data.responsibleOfficerId !== undefined &&
    data.responsibleOfficerId !== null &&
    data.responsibleOfficerId !== principal.id
  ) {
    throw new ForbiddenException("Officers can only assign themselves as responsible officer.");
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
    "Officer candidate profile assignment must stay within assigned organization units."
  );
}

function summarizeCandidateProfileForAudit(
  candidateProfile: AdminCandidateProfileDetail
): AuditSummary {
  return {
    candidateProfileId: candidateProfile.id,
    userId: candidateProfile.userId,
    candidateRequestId: candidateProfile.candidateRequestId,
    hasEmail: Boolean(candidateProfile.email),
    assignedOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
    assignedOrganizationUnitName: candidateProfile.assignedOrganizationUnitName,
    responsibleOfficerId: candidateProfile.responsibleOfficerId,
    responsibleOfficerName: candidateProfile.responsibleOfficerName,
    status: candidateProfile.status,
    archivedAt: candidateProfile.archivedAt
  };
}
