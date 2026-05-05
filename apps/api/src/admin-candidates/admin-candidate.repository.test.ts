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
  candidateProfileUpdate: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const candidateProfileFindFirst = vi.fn(() => Promise.resolve(null));
  const candidateProfileFindMany = vi.fn(() => Promise.resolve([]));
  const candidateProfileUpdate = vi.fn(() => Promise.resolve(profileRecord));

  return {
    candidateProfileFindFirst,
    candidateProfileFindMany,
    candidateProfileUpdate,
    prisma: {
      candidateProfile: {
        findFirst: candidateProfileFindFirst,
        findMany: candidateProfileFindMany,
        update: candidateProfileUpdate
      }
    } as unknown as PrismaService
  };
}
