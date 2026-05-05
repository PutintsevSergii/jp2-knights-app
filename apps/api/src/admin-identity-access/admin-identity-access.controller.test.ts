import { describe, expect, it, vi } from "vitest";
import type { RequestWithPrincipal } from "../auth/current-user.types.js";
import { AdminIdentityAccessController } from "./admin-identity-access.controller.js";
import type { AdminIdentityAccessService } from "./admin-identity-access.service.js";

const principal = {
  id: "admin-1",
  email: "admin@example.test",
  displayName: "Admin",
  status: "active" as const,
  roles: ["SUPER_ADMIN" as const]
};

const review = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "12121212-1212-4121-8121-121212121212",
  displayName: "Idle User",
  email: "idle@example.test",
  provider: "firebase",
  providerSubject: "firebase-subject",
  status: "pending" as const,
  scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  scopeOrganizationUnitName: "Pilot Unit",
  requestedRole: "BROTHER" as const,
  assignedRole: null,
  expiresAt: "2026-06-04T08:00:00.000Z",
  decidedBy: null,
  decidedAt: null,
  decisionNote: null,
  createdAt: "2026-05-05T08:00:00.000Z",
  updatedAt: "2026-05-05T08:00:00.000Z"
};

describe("AdminIdentityAccessController", () => {
  it("delegates list, detail, confirm, reject, and expire actions to the service", async () => {
    const { controller, service } = fixture();
    const request: RequestWithPrincipal = { principal };

    await expect(controller.listReviews(request)).resolves.toEqual({
      identityAccessReviews: [review]
    });
    await expect(controller.getReview(request, review.id)).resolves.toEqual({
      identityAccessReview: review
    });
    await expect(
      controller.confirmReview(request, review.id, {
        assignedRole: "BROTHER",
        organizationUnitId: "11111111-1111-4111-8111-111111111111"
      })
    ).resolves.toEqual({ identityAccessReview: review });
    await expect(controller.rejectReview(request, review.id, { note: "No match" })).resolves.toEqual({
      identityAccessReview: review
    });
    await expect(controller.expirePendingReviews(request)).resolves.toEqual({ expired: 1 });

    expect(service.listReviews).toHaveBeenCalledWith(principal);
    expect(service.getReview).toHaveBeenCalledWith(principal, review.id);
    expect(service.confirmReview).toHaveBeenCalledWith(principal, review.id, {
      assignedRole: "BROTHER",
      organizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
    expect(service.rejectReview).toHaveBeenCalledWith(principal, review.id, { note: "No match" });
    expect(service.expirePendingReviews).toHaveBeenCalledWith(principal);
  });

  it("fails closed if invoked without the guard-attached principal", () => {
    const { controller } = fixture();

    expect(() => controller.listReviews({})).toThrow("CurrentUserGuard");
  });
});

function fixture() {
  const service = {
    listReviews: vi.fn<AdminIdentityAccessService["listReviews"]>().mockResolvedValue({
      identityAccessReviews: [review]
    }),
    getReview: vi.fn<AdminIdentityAccessService["getReview"]>().mockResolvedValue({
      identityAccessReview: review
    }),
    confirmReview: vi.fn<AdminIdentityAccessService["confirmReview"]>().mockResolvedValue({
      identityAccessReview: review
    }),
    rejectReview: vi.fn<AdminIdentityAccessService["rejectReview"]>().mockResolvedValue({
      identityAccessReview: review
    }),
    expirePendingReviews: vi
      .fn<AdminIdentityAccessService["expirePendingReviews"]>()
      .mockResolvedValue({ expired: 1 })
  };

  return {
    service,
    controller: new AdminIdentityAccessController(service as unknown as AdminIdentityAccessService)
  };
}
