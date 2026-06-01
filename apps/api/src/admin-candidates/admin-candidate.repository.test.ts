import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  PrismaAdminCandidateRepository,
  scopedCandidateProfileWhere
} from "./admin-candidate.repository.js";

const profileRecord = {
  id: "77777777-7777-4777-8777-777777777777",
  userId: "88888888-8888-4888-8888-888888888888",
  candidateRequestId: "55555555-5555-4555-8555-555555555555",
  assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  assignedOrganizationUnit: { name: "Riga Choragiew" },
  responsibleOfficerId: "officer_1",
  responsibleOfficer: { displayName: "Demo Officer" },
  status: "active",
  createdAt: new Date("2026-05-05T10:05:00.000Z"),
  updatedAt: new Date("2026-05-05T10:06:00.000Z"),
  archivedAt: null,
  user: {
    displayName: "Anna Nowak",
    email: "anna@example.test",
    preferredLanguage: "en"
  }
} as const;

describe("scopedCandidateProfileWhere", () => {
  it("limits candidate profiles to active records and optional officer scope", () => {
    expect(scopedCandidateProfileWhere(null)).toEqual({ archivedAt: null });
    expect(scopedCandidateProfileWhere(["11111111-1111-4111-8111-111111111111"])).toEqual({
      archivedAt: null,
      assignedOrganizationUnitId: {
        in: ["11111111-1111-4111-8111-111111111111"]
      }
    });
  });
});

describe("PrismaAdminCandidateRepository", () => {
  it("lists scoped candidate profiles with mapped user and assignment fields", async () => {
    const { candidateProfileFindMany, prisma } = prismaMock();
    candidateProfileFindMany.mockResolvedValueOnce([profileRecord]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).listCandidateProfiles([
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toEqual([
      {
        id: profileRecord.id,
        userId: profileRecord.userId,
        candidateRequestId: profileRecord.candidateRequestId,
        displayName: "Anna Nowak",
        email: "anna@example.test",
        preferredLanguage: "en",
        assignedOrganizationUnitId: profileRecord.assignedOrganizationUnitId,
        assignedOrganizationUnitName: "Riga Choragiew",
        responsibleOfficerId: "officer_1",
        responsibleOfficerName: "Demo Officer",
        status: "active",
        createdAt: "2026-05-05T10:05:00.000Z",
        updatedAt: "2026-05-05T10:06:00.000Z",
        archivedAt: null
      }
    ]);
    expect(candidateProfileFindMany).toHaveBeenCalledWith({
      where: {
        archivedAt: null,
        assignedOrganizationUnitId: {
          in: ["11111111-1111-4111-8111-111111111111"]
        }
      },
      include: expect.any(Object) as unknown,
      orderBy: [{ updatedAt: "desc" }]
    });
  });

  it("finds one candidate profile and maps nullable relation fields", async () => {
    const { candidateProfileFindFirst, prisma } = prismaMock();
    candidateProfileFindFirst.mockResolvedValueOnce({
      ...profileRecord,
      assignedOrganizationUnitId: null,
      assignedOrganizationUnit: null,
      responsibleOfficerId: null,
      responsibleOfficer: null,
      archivedAt: new Date("2026-05-06T10:05:00.000Z"),
      user: {
        ...profileRecord.user,
        preferredLanguage: null
      }
    });

    await expect(
      new PrismaAdminCandidateRepository(prisma).findCandidateProfile(profileRecord.id, null)
    ).resolves.toEqual({
      id: profileRecord.id,
      userId: profileRecord.userId,
      candidateRequestId: profileRecord.candidateRequestId,
      displayName: "Anna Nowak",
      email: "anna@example.test",
      preferredLanguage: null,
      assignedOrganizationUnitId: null,
      assignedOrganizationUnitName: null,
      responsibleOfficerId: null,
      responsibleOfficerName: null,
      status: "active",
      createdAt: "2026-05-05T10:05:00.000Z",
      updatedAt: "2026-05-05T10:06:00.000Z",
      archivedAt: "2026-05-06T10:05:00.000Z"
    });
    expect(candidateProfileFindFirst).toHaveBeenCalledWith({
      where: {
        archivedAt: null,
        id: profileRecord.id
      },
      include: expect.any(Object) as unknown
    });
  });

  it("returns null when scoped reads or updates cannot find a profile", async () => {
    const { candidateProfileFindFirst, candidateProfileUpdate, prisma } = prismaMock();

    await expect(
      new PrismaAdminCandidateRepository(prisma).findCandidateProfile(profileRecord.id, [
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toBeNull();
    await expect(
      new PrismaAdminCandidateRepository(prisma).updateCandidateProfile(
        profileRecord.id,
        { status: "paused" },
        ["11111111-1111-4111-8111-111111111111"]
      )
    ).resolves.toBeNull();
    expect(candidateProfileFindFirst).toHaveBeenCalledTimes(2);
    expect(candidateProfileUpdate).not.toHaveBeenCalled();
  });

  it("finds candidate profiles for Super Admin export without active/scope filtering", async () => {
    const { candidateProfileFindUnique, prisma } = prismaMock();
    candidateProfileFindUnique.mockResolvedValueOnce({
      ...profileRecord,
      status: "archived",
      archivedAt: new Date("2026-05-06T10:05:00.000Z")
    });

    await expect(
      new PrismaAdminCandidateRepository(prisma).findCandidateProfileForExport(profileRecord.id)
    ).resolves.toMatchObject({
      id: profileRecord.id,
      email: "anna@example.test",
      status: "archived",
      archivedAt: "2026-05-06T10:05:00.000Z"
    });
    expect(candidateProfileFindUnique).toHaveBeenCalledWith({
      where: { id: profileRecord.id },
      include: expect.any(Object) as unknown
    });
  });

  it("detects active non-candidate access before profile erasure", async () => {
    const { membershipFindFirst, officerAssignmentFindFirst, prisma, userRoleFindFirst } =
      prismaMock();
    userRoleFindFirst.mockResolvedValueOnce({ id: "role_1" });

    await expect(
      new PrismaAdminCandidateRepository(prisma).candidateProfileUserHasActiveNonCandidateAccess(
        profileRecord.userId,
        new Date("2026-06-01T17:05:00.000Z")
      )
    ).resolves.toBe(true);
    expect(userRoleFindFirst).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        role: { in: ["BROTHER", "OFFICER", "SUPER_ADMIN"] },
        revokedAt: null
      },
      select: { id: true }
    });
    expect(membershipFindFirst).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        status: "active",
        archivedAt: null
      },
      select: { id: true }
    });
    expect(officerAssignmentFindFirst).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        OR: [
          { endsAt: null },
          { endsAt: { gte: new Date("2026-06-01T17:05:00.000Z") } }
        ]
      },
      select: { id: true }
    });
  });

  it("anonymizes linked candidate-only user identity and archives profiles during erasure", async () => {
    const {
      candidateProfileFindUnique,
      candidateProfileUpdateMany,
      deviceTokenUpdateMany,
      identityProviderAccountUpdateMany,
      prisma,
      userRoleUpdateMany,
      userUpdate
    } = prismaMock();
    const erasedAt = new Date("2026-06-01T17:05:00.000Z");
    candidateProfileFindUnique
      .mockResolvedValueOnce({ id: profileRecord.id, userId: profileRecord.userId })
      .mockResolvedValueOnce({
        ...profileRecord,
        status: "archived",
        archivedAt: erasedAt,
        user: {
          displayName: "Erased candidate",
          email: "erased-candidate-profile+77777777-7777-4777-8777-777777777777@privacy.local",
          preferredLanguage: null
        }
      });

    await expect(
      new PrismaAdminCandidateRepository(prisma).eraseCandidateProfile(profileRecord.id, erasedAt)
    ).resolves.toMatchObject({
      id: profileRecord.id,
      userId: profileRecord.userId,
      displayName: "Erased candidate",
      email: "erased-candidate-profile+77777777-7777-4777-8777-777777777777@privacy.local",
      status: "archived",
      archivedAt: "2026-06-01T17:05:00.000Z"
    });
    expect(userRoleUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        role: "CANDIDATE",
        revokedAt: null
      },
      data: { revokedAt: erasedAt }
    });
    expect(identityProviderAccountUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        revokedAt: null
      },
      data: {
        provider: "erased",
        providerSubject: `erased-candidate-profile:${profileRecord.id}`,
        email: null,
        emailVerified: null,
        phone: null,
        displayName: null,
        photoUrl: null,
        revokedAt: erasedAt
      }
    });
    expect(deviceTokenUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        revokedAt: null
      },
      data: { revokedAt: erasedAt }
    });
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: profileRecord.userId },
      data: {
        email: `erased-candidate-profile+${profileRecord.id}@privacy.local`,
        phone: null,
        displayName: "Erased candidate",
        preferredLanguage: null,
        status: "archived",
        archivedAt: erasedAt
      }
    });
    expect(candidateProfileUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId,
        status: { in: ["active", "paused"] }
      },
      data: {
        status: "archived",
        archivedAt: erasedAt
      }
    });
  });

  it("does not update a missing candidate profile during erasure", async () => {
    const { candidateProfileFindUnique, userUpdate, prisma } = prismaMock();
    candidateProfileFindUnique.mockResolvedValueOnce(null);

    await expect(
      new PrismaAdminCandidateRepository(prisma).eraseCandidateProfile(
        profileRecord.id,
        new Date("2026-06-01T17:05:00.000Z")
      )
    ).resolves.toBeNull();
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("updates only provided profile management fields and lifecycle archive state", async () => {
    const { candidateProfileFindFirst, candidateProfileUpdate, prisma } = prismaMock();
    candidateProfileFindFirst.mockResolvedValue({ id: profileRecord.id });
    candidateProfileUpdate.mockResolvedValueOnce({
      ...profileRecord,
      status: "archived",
      assignedOrganizationUnitId: null,
      assignedOrganizationUnit: null,
      responsibleOfficerId: null,
      responsibleOfficer: null,
      archivedAt: new Date("2026-05-06T10:05:00.000Z")
    });

    await expect(
      new PrismaAdminCandidateRepository(prisma).updateCandidateProfile(
        profileRecord.id,
        {
          status: "archived",
          assignedOrganizationUnitId: null,
          responsibleOfficerId: null
        },
        null
      )
    ).resolves.toEqual({
      id: profileRecord.id,
      userId: profileRecord.userId,
      candidateRequestId: profileRecord.candidateRequestId,
      displayName: "Anna Nowak",
      email: "anna@example.test",
      preferredLanguage: "en",
      assignedOrganizationUnitId: null,
      assignedOrganizationUnitName: null,
      responsibleOfficerId: null,
      responsibleOfficerName: null,
      status: "archived",
      createdAt: "2026-05-05T10:05:00.000Z",
      updatedAt: "2026-05-05T10:06:00.000Z",
      archivedAt: "2026-05-06T10:05:00.000Z"
    });
    expect(candidateProfileUpdate).toHaveBeenLastCalledWith({
      where: { id: profileRecord.id },
      data: {
        status: "archived",
        archivedAt: expect.any(Date) as Date,
        assignedOrganizationUnitId: null,
        responsibleOfficerId: null
      },
      include: expect.any(Object) as unknown
    });

    candidateProfileUpdate.mockResolvedValueOnce(profileRecord);
    await new PrismaAdminCandidateRepository(prisma).updateCandidateProfile(
      profileRecord.id,
      { status: "active" },
      null
    );
    expect(candidateProfileUpdate).toHaveBeenLastCalledWith({
      where: { id: profileRecord.id },
      data: {
        status: "active",
        archivedAt: null
      },
      include: expect.any(Object) as unknown
    });
  });
});

function prismaMock(): {
  candidateProfileFindFirst: ReturnType<typeof vi.fn>;
  candidateProfileFindMany: ReturnType<typeof vi.fn>;
  candidateProfileFindUnique: ReturnType<typeof vi.fn>;
  candidateProfileUpdate: ReturnType<typeof vi.fn>;
  candidateProfileUpdateMany: ReturnType<typeof vi.fn>;
  deviceTokenUpdateMany: ReturnType<typeof vi.fn>;
  identityProviderAccountUpdateMany: ReturnType<typeof vi.fn>;
  membershipFindFirst: ReturnType<typeof vi.fn>;
  officerAssignmentFindFirst: ReturnType<typeof vi.fn>;
  userRoleFindFirst: ReturnType<typeof vi.fn>;
  userRoleUpdateMany: ReturnType<typeof vi.fn>;
  userUpdate: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const candidateProfileFindFirst = vi.fn(() => Promise.resolve(null));
  const candidateProfileFindMany = vi.fn(() => Promise.resolve([]));
  const candidateProfileFindUnique = vi.fn(() => Promise.resolve(null));
  const candidateProfileUpdate = vi.fn(() => Promise.resolve(profileRecord));
  const candidateProfileUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const deviceTokenUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const identityProviderAccountUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const membershipFindFirst = vi.fn(() => Promise.resolve(null));
  const officerAssignmentFindFirst = vi.fn(() => Promise.resolve(null));
  const userRoleFindFirst = vi.fn(() => Promise.resolve(null));
  const userRoleUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const userUpdate = vi.fn(() => Promise.resolve({}));
  const tx = {
    candidateProfile: {
      findUnique: candidateProfileFindUnique,
      updateMany: candidateProfileUpdateMany
    },
    deviceToken: {
      updateMany: deviceTokenUpdateMany
    },
    identityProviderAccount: {
      updateMany: identityProviderAccountUpdateMany
    },
    user: {
      update: userUpdate
    },
    userRole: {
      updateMany: userRoleUpdateMany
    }
  };

  return {
    candidateProfileFindFirst,
    candidateProfileFindMany,
    candidateProfileFindUnique,
    candidateProfileUpdate,
    candidateProfileUpdateMany,
    deviceTokenUpdateMany,
    identityProviderAccountUpdateMany,
    membershipFindFirst,
    officerAssignmentFindFirst,
    userRoleFindFirst,
    userRoleUpdateMany,
    userUpdate,
    prisma: {
      $transaction: (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
      candidateProfile: {
        findFirst: candidateProfileFindFirst,
        findMany: candidateProfileFindMany,
        findUnique: candidateProfileFindUnique,
        update: candidateProfileUpdate,
        updateMany: candidateProfileUpdateMany
      },
      deviceToken: {
        updateMany: deviceTokenUpdateMany
      },
      identityProviderAccount: {
        updateMany: identityProviderAccountUpdateMany
      },
      membership: {
        findFirst: membershipFindFirst
      },
      officerAssignment: {
        findFirst: officerAssignmentFindFirst
      },
      user: {
        update: userUpdate
      },
      userRole: {
        findFirst: userRoleFindFirst,
        updateMany: userRoleUpdateMany
      }
    } as unknown as PrismaService
  };
}
