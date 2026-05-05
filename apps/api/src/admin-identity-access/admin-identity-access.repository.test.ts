import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAdminIdentityAccessRepository } from "./admin-identity-access.repository.js";

const reviewRecord = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "12121212-1212-4121-8121-121212121212",
  status: "pending" as const,
  scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  requestedRole: "BROTHER" as const,
  assignedRole: null,
  expiresAt: new Date("2026-06-04T08:00:00.000Z"),
  decidedBy: null,
  decidedAt: null,
  decisionNote: null,
  createdAt: new Date("2026-05-05T08:00:00.000Z"),
  updatedAt: new Date("2026-05-05T08:00:00.000Z"),
  user: {
    displayName: "Idle User",
    email: "idle@example.test"
  },
  providerAccount: {
    provider: "firebase",
    providerSubject: "firebase-subject"
  },
  scopeUnit: {
    name: "Pilot Unit"
  }
};

describe("PrismaAdminIdentityAccessRepository", () => {
  it("lists scoped reviews after expiring stale pending rows", async () => {
    const prisma = fakePrisma();
    const repository = new PrismaAdminIdentityAccessRepository(prisma as unknown as PrismaService);

    await expect(
      repository.listReviews(["11111111-1111-4111-8111-111111111111"])
    ).resolves.toEqual([
      expect.objectContaining({
        id: reviewRecord.id,
        provider: "firebase",
        scopeOrganizationUnitName: "Pilot Unit"
      })
    ]);
    expect(prisma.identityAccessReview.updateMany).toHaveBeenCalled();
    expect(prisma.identityAccessReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          scopeOrganizationUnitId: {
            in: ["11111111-1111-4111-8111-111111111111"]
          }
        }
      })
    );
  });

  it("checks active scoped approver privilege", async () => {
    const prisma = fakePrisma();
    const repository = new PrismaAdminIdentityAccessRepository(prisma as unknown as PrismaService);

    await expect(
      repository.canApproveScope("officer-1", "11111111-1111-4111-8111-111111111111")
    ).resolves.toBe(true);
    prisma.identityAccessApproverAssignment.findFirst.mockResolvedValueOnce(null);
    await expect(
      repository.canApproveScope("officer-2", "11111111-1111-4111-8111-111111111111")
    ).resolves.toBe(false);
  });

  it("confirms a brother review with explicit role and membership scope", async () => {
    const prisma = fakePrisma();
    const repository = new PrismaAdminIdentityAccessRepository(prisma as unknown as PrismaService);

    await expect(
      repository.confirmReview(
        reviewRecord.id,
        {
          assignedRole: "BROTHER",
          organizationUnitId: "11111111-1111-4111-8111-111111111111",
          note: "Known brother"
        },
        "admin-1",
        null
      )
    ).resolves.toMatchObject({
      id: reviewRecord.id,
      status: "confirmed",
      assignedRole: "BROTHER"
    });
    expect(prisma.membership.create).toHaveBeenCalledWith({
      data: {
        userId: reviewRecord.userId,
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "active"
      }
    });
    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: {
        userId: reviewRecord.userId,
        role: "BROTHER",
        createdBy: "admin-1"
      }
    });
  });

  it("reuses existing role, candidate profile, and officer assignment scopes", async () => {
    const prisma = fakePrisma({
      existingRole: { id: "role-1" },
      existingCandidateProfile: { id: "profile-1" },
      existingOfficerAssignment: { id: "assignment-1" }
    });
    const repository = new PrismaAdminIdentityAccessRepository(prisma as unknown as PrismaService);

    await repository.confirmReview(
      reviewRecord.id,
      {
        assignedRole: "CANDIDATE",
        organizationUnitId: "11111111-1111-4111-8111-111111111111"
      },
      "admin-1",
      null
    );
    await repository.confirmReview(
      reviewRecord.id,
      {
        assignedRole: "OFFICER",
        organizationUnitId: "11111111-1111-4111-8111-111111111111"
      },
      "admin-1",
      null
    );

    expect(prisma.userRole.update).toHaveBeenCalledWith({
      where: { id: "role-1" },
      data: { revokedAt: null }
    });
    expect(prisma.candidateProfile.update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: { assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111" }
    });
    expect(prisma.officerAssignment.create).not.toHaveBeenCalled();
  });

  it("returns null when confirm or reject cannot find a pending scoped review", async () => {
    const prisma = fakePrisma({ pendingReview: null, rejectCount: 0 });
    const repository = new PrismaAdminIdentityAccessRepository(prisma as unknown as PrismaService);

    await expect(
      repository.confirmReview(
        reviewRecord.id,
        {
          assignedRole: "BROTHER",
          organizationUnitId: "11111111-1111-4111-8111-111111111111"
        },
        "admin-1",
        []
      )
    ).resolves.toBeNull();
    await expect(repository.rejectReview(reviewRecord.id, {}, "admin-1", [])).resolves.toBeNull();
  });
});

interface FakePrismaOptions {
  pendingReview?: typeof reviewRecord | null;
  existingRole?: { id: string } | null;
  existingCandidateProfile?: { id: string } | null;
  existingOfficerAssignment?: { id: string } | null;
  rejectCount?: number;
}

function fakePrisma(options: FakePrismaOptions = {}) {
  const pendingReview = options.pendingReview === undefined ? reviewRecord : options.pendingReview;
  const confirmedReview = {
    ...reviewRecord,
    status: "confirmed" as const,
    assignedRole: "BROTHER" as const,
    decidedBy: "admin-1",
    decidedAt: new Date("2026-05-05T09:00:00.000Z"),
    decisionNote: "Known brother"
  };
  const tx = {
    identityAccessReview: {
      findFirst: vi.fn().mockResolvedValue(pendingReview),
      update: vi.fn().mockResolvedValue(confirmedReview)
    },
    user: {
      update: vi.fn().mockResolvedValue({})
    },
    userRole: {
      findFirst: vi.fn().mockResolvedValue(options.existingRole ?? null),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({})
    },
    candidateProfile: {
      findFirst: vi.fn().mockResolvedValue(options.existingCandidateProfile ?? null),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({})
    },
    membership: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({})
    },
    officerAssignment: {
      findFirst: vi.fn().mockResolvedValue(options.existingOfficerAssignment ?? null),
      create: vi.fn().mockResolvedValue({})
    }
  };
  type TransactionCallback = (client: typeof tx) => unknown;
  const prisma = {
    $transaction: vi.fn((callback: TransactionCallback) => callback(tx)),
    identityAccessReview: {
      findMany: vi.fn().mockResolvedValue([reviewRecord]),
      findFirst: vi.fn().mockResolvedValue(reviewRecord),
      updateMany: vi.fn().mockResolvedValue({ count: options.rejectCount ?? 1 })
    },
    identityAccessApproverAssignment: {
      findFirst: vi.fn().mockResolvedValue({ id: "approver-1" })
    },
    user: tx.user,
    userRole: tx.userRole,
    candidateProfile: tx.candidateProfile,
    membership: tx.membership,
    officerAssignment: tx.officerAssignment
  };

  return prisma;
}
