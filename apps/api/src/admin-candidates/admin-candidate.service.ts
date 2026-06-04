import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { hasRole } from "@jp2/shared-auth";
import { PRIVACY_WORKFLOW_RETENTION_BUCKETS } from "@jp2/shared-types";
import {
  adminScopeFor,
  requireAdminLite,
  requireSuperAdmin
} from "../admin/admin-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminCandidateRepository } from "./admin-candidate.repository.js";
import type {
  AdminCandidateProfileDetail,
  AdminCandidateProfileDetailResponse,
  AdminCandidateProfileErasureResponse,
  AdminCandidateProfileExportResponse,
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
      candidateProfiles: await this.candidateRepository.listCandidateProfiles(
        adminScopeFor(principal)
      )
    };
  }

  async getCandidateProfile(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminCandidateProfileDetailResponse> {
    assertCanReadCandidates(principal);

    const candidateProfile = await this.candidateRepository.findCandidateProfile(
      id,
      adminScopeFor(principal)
    );

    if (!candidateProfile) {
      throw new NotFoundException("Candidate profile was not found in the current admin scope.");
    }

    return { candidateProfile };
  }

  async exportCandidateProfile(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminCandidateProfileExportResponse> {
    requireSuperAdmin(principal);

    const candidateProfile = await this.candidateRepository.findCandidateProfileForExport(id);

    if (!candidateProfile) {
      throw new NotFoundException("Candidate profile was not found.");
    }

    const notificationPreferences =
      await this.candidateRepository.findNotificationPreferencesForUser(candidateProfile.userId);
    const [
      providerAccounts,
      deviceTokens,
      userRoles,
      identityAccessReviews,
      memberships,
      officerAssignments,
      roadmapAssignments,
      eventParticipations
    ] = await Promise.all([
      this.candidateRepository.listProviderAccountsForUser(candidateProfile.userId),
      this.candidateRepository.listDeviceTokensForUser(candidateProfile.userId),
      this.candidateRepository.listUserRolesForUser(candidateProfile.userId),
      this.candidateRepository.listIdentityAccessReviewsForUser(candidateProfile.userId),
      this.candidateRepository.listMembershipsForUser(candidateProfile.userId),
      this.candidateRepository.listOfficerAssignmentsForUser(candidateProfile.userId),
      this.candidateRepository.listRoadmapAssignmentsForUser(candidateProfile.userId),
      this.candidateRepository.listEventParticipationsForUser(candidateProfile.userId)
    ]);

    await this.auditLog.record({
      action: "admin.candidateProfile.export",
      actorUserId: principal.id,
      entityType: "candidate_profile",
      entityId: candidateProfile.id,
      scopeOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
      beforeSummary: null,
      afterSummary: summarizeCandidateProfileExportForAudit(candidateProfile)
    });

    return {
      candidateProfile,
      providerAccounts,
      deviceTokens,
      userRoles,
      identityAccessReviews,
      memberships,
      officerAssignments,
      roadmapAssignments,
      eventParticipations,
      notificationPreferences,
      retentionBucket: PRIVACY_WORKFLOW_RETENTION_BUCKETS.candidateProfile,
      exportedAt: new Date().toISOString()
    };
  }

  async eraseCandidateProfile(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminCandidateProfileErasureResponse> {
    requireSuperAdmin(principal);

    const beforeCandidateProfile = await this.candidateRepository.findCandidateProfileForExport(id);

    if (!beforeCandidateProfile) {
      throw new NotFoundException("Candidate profile was not found.");
    }

    if (beforeCandidateProfile.status === "converted_to_brother") {
      throw new ConflictException(
        "Converted candidate profiles require the brother retention workflow."
      );
    }

    const erasedAt = new Date();
    if (
      await this.candidateRepository.candidateProfileUserHasActiveNonCandidateAccess(
        beforeCandidateProfile.userId,
        erasedAt
      )
    ) {
      throw new ConflictException(
        "Candidate profile user has active non-candidate access and cannot be erased here."
      );
    }

    const erasedCandidateProfile = await this.candidateRepository.eraseCandidateProfile(
      id,
      erasedAt
    );

    if (!erasedCandidateProfile) {
      throw new NotFoundException("Candidate profile was not found.");
    }

    await this.auditLog.record({
      action: "admin.candidateProfile.erase",
      actorUserId: principal.id,
      entityType: "candidate_profile",
      entityId: beforeCandidateProfile.id,
      scopeOrganizationUnitId: beforeCandidateProfile.assignedOrganizationUnitId,
      beforeSummary: summarizeCandidateProfileErasureBeforeAudit(beforeCandidateProfile),
      afterSummary: summarizeCandidateProfileErasureAfterAudit(erasedCandidateProfile)
    });

    return {
      candidateProfileId: erasedCandidateProfile.id,
      userId: erasedCandidateProfile.userId,
      retentionBucket: PRIVACY_WORKFLOW_RETENTION_BUCKETS.candidateProfile,
      erasedAt: erasedAt.toISOString(),
      archivedAt: erasedCandidateProfile.archivedAt ?? erasedAt.toISOString()
    };
  }

  async updateCandidateProfile(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminCandidateProfile
  ): Promise<AdminCandidateProfileDetailResponse> {
    assertCanUpdateCandidates(principal, data);
    const scopeOrganizationUnitIds = adminScopeFor(principal);
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

function assertCanReadCandidates(principal: CurrentUserPrincipal): void {
  requireAdminLite(principal);
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

function summarizeCandidateProfileExportForAudit(
  candidateProfile: AdminCandidateProfileDetail
): AuditSummary {
  return {
    candidateProfileId: candidateProfile.id,
    userId: candidateProfile.userId,
    candidateRequestId: candidateProfile.candidateRequestId,
    assignedOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
    responsibleOfficerId: candidateProfile.responsibleOfficerId,
    status: candidateProfile.status,
    archived: Boolean(candidateProfile.archivedAt),
    includesPersonalData: true
  };
}

function summarizeCandidateProfileErasureBeforeAudit(
  candidateProfile: AdminCandidateProfileDetail
): AuditSummary {
  return {
    candidateProfileId: candidateProfile.id,
    userId: candidateProfile.userId,
    candidateRequestId: candidateProfile.candidateRequestId,
    assignedOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
    responsibleOfficerId: candidateProfile.responsibleOfficerId,
    status: candidateProfile.status,
    archived: Boolean(candidateProfile.archivedAt),
    hadPersonalData: true
  };
}

function summarizeCandidateProfileErasureAfterAudit(
  candidateProfile: AdminCandidateProfileDetail
): AuditSummary {
  return {
    candidateProfileId: candidateProfile.id,
    userId: candidateProfile.userId,
    candidateRequestId: candidateProfile.candidateRequestId,
    assignedOrganizationUnitId: candidateProfile.assignedOrganizationUnitId,
    responsibleOfficerId: candidateProfile.responsibleOfficerId,
    status: candidateProfile.status,
    archived: Boolean(candidateProfile.archivedAt),
    erasedPersonalData: true,
    revokedCandidateAccess: true
  };
}
