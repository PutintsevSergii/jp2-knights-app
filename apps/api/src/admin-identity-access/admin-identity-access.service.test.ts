import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminIdentityAccessRepository } from "./admin-identity-access.repository.js";
import { AdminIdentityAccessService } from "./admin-identity-access.service.js";
import type { AdminIdentityAccessReviewSummary } from "./admin-identity-access.types.js";

const review: AdminIdentityAccessReviewSummary = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "12121212-1212-4121-8121-121212121212",
  displayName: "Idle User",
  email: "idle@example.test",
  provider: "firebase",
  providerSubject: "firebase-subject",
  status: "pending",
  scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  scopeOrganizationUnitName: "Pilot Unit",
  requestedRole: "BROTHER",
  assignedRole: null,
  expiresAt: "2026-06-04T08:00:00.000Z",
  decidedBy: null,
  decidedAt: null,
  decisionNote: null,
  createdAt: "2026-05-05T08:00:00.000Z",
  updatedAt: "2026-05-05T08:00:00.000Z"
};

const superAdmin: CurrentUserPrincipal = {
  id: "admin-1",
  email: "admin@example.test",
  displayName: "Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

const scopedApprover: CurrentUserPrincipal = {
  id: "officer-1",
  email: "officer@example.test",
  displayName: "Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

describe("AdminIdentityAccessService", () => {
  it("lists reviews scoped to the current admin", async () => {
    const { service, spies } = serviceFixture();

    await expect(service.listReviews(scopedApprover)).resolves.toEqual({
      identityAccessReviews: [review]
    });
    expect(spies.listReviews).toHaveBeenCalledWith([
      "11111111-1111-4111-8111-111111111111"
    ]);
  });

  it("confirms pending reviews for a scoped approver with explicit privilege", async () => {
    const { service, spies } = serviceFixture({
      canApproveScope: true
    });

    await expect(
      service.confirmReview(superAdmin, review.id, {
        assignedRole: "BROTHER",
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        note: "Known brother"
      })
    ).resolves.toMatchObject({
      identityAccessReview: {
        status: "confirmed",
        assignedRole: "BROTHER"
      }
    });
    expect(spies.confirmReview).toHaveBeenCalled();
    expect(spies.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "admin.identityAccess.confirm",
        entityType: "identity_access_review"
      })
    );
  });

  it("rejects officer confirmation without country/region approver privilege", async () => {
    const { service } = serviceFixture({
      canApproveScope: false
    });

    await expect(
      service.confirmReview(scopedApprover, review.id, {
        assignedRole: "BROTHER",
        organizationUnitId: "11111111-1111-4111-8111-111111111111"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects decisions for non-pending reviews", async () => {
    const { service } = serviceFixture({
      review: {
        ...review,
        status: "expired"
      }
    });

    await expect(
      service.rejectReview(superAdmin, review.id, {
        note: "Too late"
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects non-admin list access and missing reviews", async () => {
    const { service } = serviceFixture({
      review: null
    });

    await expect(
      service.listReviews({
        id: "brother-1",
        email: "brother@example.test",
        displayName: "Brother",
        status: "active",
        roles: ["BROTHER"]
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getReview(superAdmin, review.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects out-of-scope and unscoped officer decisions", async () => {
    const { service } = serviceFixture();

    await expect(
      service.confirmReview(scopedApprover, review.id, {
        assignedRole: "BROTHER",
        organizationUnitId: "99999999-9999-4999-8999-999999999999"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.rejectReview(
        scopedApprover,
        review.id,
        {}
      )
    ).resolves.toMatchObject({
      identityAccessReview: {
        status: "rejected"
      }
    });
    const unscoped = serviceFixture({
      review: {
        ...review,
        scopeOrganizationUnitId: null
      }
    });
    await expect(unscoped.service.rejectReview(scopedApprover, review.id, {})).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("expires pending reviews for Super Admin only", async () => {
    const { service } = serviceFixture();

    await expect(service.expirePendingReviews(superAdmin)).resolves.toEqual({ expired: 1 });
    await expect(service.expirePendingReviews(scopedApprover)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });
});

function serviceFixture(options: {
  review?: AdminIdentityAccessReviewSummary | null;
  canApproveScope?: boolean;
} = {}) {
  const currentReview = options.review === undefined ? review : options.review;
  const confirmedReview: AdminIdentityAccessReviewSummary = {
    ...(currentReview ?? review),
    status: "confirmed",
    assignedRole: "BROTHER",
    decidedBy: "admin-1",
    decidedAt: "2026-05-05T09:00:00.000Z"
  };
  const repository = {
    listReviews: vi
      .fn<AdminIdentityAccessRepository["listReviews"]>()
      .mockResolvedValue(currentReview ? [currentReview] : []),
    findReview: vi.fn<AdminIdentityAccessRepository["findReview"]>().mockResolvedValue(currentReview),
    canApproveScope: vi
      .fn<AdminIdentityAccessRepository["canApproveScope"]>()
      .mockResolvedValue(options.canApproveScope ?? true),
    confirmReview: vi
      .fn<AdminIdentityAccessRepository["confirmReview"]>()
      .mockResolvedValue(confirmedReview),
    rejectReview: vi.fn<AdminIdentityAccessRepository["rejectReview"]>().mockResolvedValue({
      ...(currentReview ?? review),
      status: "rejected",
      decidedBy: "admin-1",
      decidedAt: "2026-05-05T09:00:00.000Z"
    }),
    expirePendingReviews: vi
      .fn<AdminIdentityAccessRepository["expirePendingReviews"]>()
      .mockResolvedValue(1)
  };
  const auditLog = {
    record: vi.fn<AuditLogService["record"]>().mockResolvedValue(undefined)
  };

  return {
    spies: {
      ...repository,
      recordAudit: auditLog.record
    },
    service: new AdminIdentityAccessService(
      repository,
      auditLog as unknown as AuditLogService
    )
  };
}
