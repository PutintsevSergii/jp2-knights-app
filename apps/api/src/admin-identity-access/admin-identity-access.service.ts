import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { hasRole } from "@jp2/shared-auth";
import { adminScopeFor, requireAdminLite } from "../admin/admin-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminIdentityAccessRepository } from "./admin-identity-access.repository.js";
import type {
  AdminIdentityAccessReviewDetailResponse,
  AdminIdentityAccessReviewListResponse,
  AdminIdentityAccessReviewSummary,
  ConfirmIdentityAccessReview,
  RejectIdentityAccessReview
} from "./admin-identity-access.types.js";

@Injectable()
export class AdminIdentityAccessService {
  constructor(
    private readonly repository: AdminIdentityAccessRepository,
    private readonly auditLog: AuditLogService
  ) {}

  async listReviews(
    principal: CurrentUserPrincipal
  ): Promise<AdminIdentityAccessReviewListResponse> {
    requireAdminLite(principal);

    return {
      identityAccessReviews: await this.repository.listReviews(adminScopeFor(principal))
    };
  }

  async getReview(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminIdentityAccessReviewDetailResponse> {
    requireAdminLite(principal);

    const review = await this.repository.findReview(id, adminScopeFor(principal));

    if (!review) {
      throw new NotFoundException("Identity access review was not found in the current scope.");
    }

    return { identityAccessReview: review };
  }

  async confirmReview(
    principal: CurrentUserPrincipal,
    id: string,
    data: ConfirmIdentityAccessReview
  ): Promise<AdminIdentityAccessReviewDetailResponse> {
    await this.assertCanDecideReview(principal, data.organizationUnitId);

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const before = await this.repository.findReview(id, scopeOrganizationUnitIds);

    if (!before) {
      throw new NotFoundException("Identity access review was not found in the current scope.");
    }

    if (before.status !== "pending") {
      throw new ConflictException("Identity access review is not pending.");
    }

    const confirmed = await this.repository.confirmReview(
      id,
      data,
      principal.id,
      scopeOrganizationUnitIds
    );

    if (!confirmed) {
      throw new NotFoundException("Identity access review was not found in the current scope.");
    }

    await this.auditDecision(principal, "admin.identityAccess.confirm", before, confirmed);

    return { identityAccessReview: confirmed };
  }

  async rejectReview(
    principal: CurrentUserPrincipal,
    id: string,
    data: RejectIdentityAccessReview
  ): Promise<AdminIdentityAccessReviewDetailResponse> {
    requireAdminLite(principal);

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const before = await this.repository.findReview(id, scopeOrganizationUnitIds);

    if (!before) {
      throw new NotFoundException("Identity access review was not found in the current scope.");
    }

    if (before.status !== "pending") {
      throw new ConflictException("Identity access review is not pending.");
    }

    await this.assertCanDecideReview(principal, before.scopeOrganizationUnitId);

    const rejected = await this.repository.rejectReview(id, data, principal.id, scopeOrganizationUnitIds);

    if (!rejected) {
      throw new NotFoundException("Identity access review was not found in the current scope.");
    }

    await this.auditDecision(principal, "admin.identityAccess.reject", before, rejected);

    return { identityAccessReview: rejected };
  }

  async expirePendingReviews(principal: CurrentUserPrincipal): Promise<{ expired: number }> {
    if (!hasRole(principal, "SUPER_ADMIN")) {
      throw new ForbiddenException("Only Super Admin can run global identity review expiry.");
    }

    return {
      expired: await this.repository.expirePendingReviews(new Date())
    };
  }

  private async assertCanDecideReview(
    principal: CurrentUserPrincipal,
    organizationUnitId: string | null
  ): Promise<void> {
    requireAdminLite(principal);

    if (hasRole(principal, "SUPER_ADMIN")) {
      return;
    }

    if (!organizationUnitId) {
      throw new ForbiddenException("Scoped approvers cannot decide unscoped identity reviews.");
    }

    if (!(principal.officerOrganizationUnitIds ?? []).includes(organizationUnitId)) {
      throw new ForbiddenException("Identity review decision is outside the current admin scope.");
    }

    if (await this.repository.canApproveScope(principal.id, organizationUnitId)) {
      return;
    }

    throw new ForbiddenException("Country/region approver privilege is required.");
  }

  private async auditDecision(
    principal: CurrentUserPrincipal,
    action: string,
    before: AdminIdentityAccessReviewSummary,
    after: AdminIdentityAccessReviewSummary
  ): Promise<void> {
    await this.auditLog.record({
      action,
      actorUserId: principal.id,
      entityType: "identity_access_review",
      entityId: after.id,
      scopeOrganizationUnitId: after.scopeOrganizationUnitId,
      beforeSummary: summarizeReview(before),
      afterSummary: summarizeReview(after)
    });
  }
}

function summarizeReview(review: AdminIdentityAccessReviewSummary): AuditSummary {
  return {
    userId: review.userId,
    provider: review.provider,
    hasEmail: Boolean(review.email),
    status: review.status,
    scopeOrganizationUnitId: review.scopeOrganizationUnitId,
    requestedRole: review.requestedRole,
    assignedRole: review.assignedRole,
    decidedBy: review.decidedBy,
    decidedAt: review.decidedAt
  };
}
