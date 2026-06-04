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

  it("loads notification preferences with defaults for candidate profile export", async () => {
    const { notificationPreferenceFindMany, prisma } = prismaMock();
    notificationPreferenceFindMany.mockResolvedValueOnce([
      { category: "events", enabled: false },
      { category: "roadmap_updates", enabled: true }
    ]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).findNotificationPreferencesForUser(
        profileRecord.userId
      )
    ).resolves.toEqual({
      events: false,
      announcements: true,
      roadmapUpdates: true,
      prayerReminders: false
    });
    expect(notificationPreferenceFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId }
    });
  });

  it("loads provider account mirrors for candidate profile export", async () => {
    const { identityProviderAccountFindMany, prisma } = prismaMock();
    identityProviderAccountFindMany.mockResolvedValueOnce([
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        provider: "firebase",
        providerSubject: "firebase-subject-1",
        email: "anna@example.test",
        emailVerified: true,
        phone: "+37120000000",
        displayName: "Anna Provider",
        photoUrl: "https://example.test/photo.png",
        lastSignInAt: new Date("2026-05-25T07:00:00.000Z"),
        createdAt: new Date("2026-05-01T07:00:00.000Z"),
        updatedAt: new Date("2026-05-25T07:00:00.000Z"),
        revokedAt: null
      }
    ]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).listProviderAccountsForUser(profileRecord.userId)
    ).resolves.toEqual([
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        provider: "firebase",
        providerSubject: "firebase-subject-1",
        email: "anna@example.test",
        emailVerified: true,
        phone: "+37120000000",
        displayName: "Anna Provider",
        photoUrl: "https://example.test/photo.png",
        lastSignInAt: "2026-05-25T07:00:00.000Z",
        createdAt: "2026-05-01T07:00:00.000Z",
        updatedAt: "2026-05-25T07:00:00.000Z",
        revokedAt: null
      }
    ]);
    expect(identityProviderAccountFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        provider: true,
        providerSubject: true,
        email: true,
        emailVerified: true,
        phone: true,
        displayName: true,
        photoUrl: true,
        lastSignInAt: true,
        createdAt: true,
        updatedAt: true,
        revokedAt: true
      }
    });
  });

  it("loads safe device token metadata for candidate profile export", async () => {
    const { deviceTokenFindMany, prisma } = prismaMock();
    deviceTokenFindMany.mockResolvedValueOnce([
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        platform: "ios",
        tokenHash: "must-not-export",
        tokenLast4: "1234",
        lastSeenAt: new Date("2026-05-26T07:00:00.000Z"),
        createdAt: new Date("2026-05-02T07:00:00.000Z"),
        updatedAt: new Date("2026-05-26T07:00:00.000Z"),
        revokedAt: new Date("2026-05-27T07:00:00.000Z")
      }
    ]);

    const exported = await new PrismaAdminCandidateRepository(prisma).listDeviceTokensForUser(
      profileRecord.userId
    );

    expect(exported).toEqual([
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        platform: "ios",
        lastSeenAt: "2026-05-26T07:00:00.000Z",
        createdAt: "2026-05-02T07:00:00.000Z",
        updatedAt: "2026-05-26T07:00:00.000Z",
        revokedAt: "2026-05-27T07:00:00.000Z"
      }
    ]);
    expect(JSON.stringify(exported)).not.toContain("must-not-export");
    expect(JSON.stringify(exported)).not.toContain("1234");
    expect(deviceTokenFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ lastSeenAt: "desc" }],
      select: {
        id: true,
        platform: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        revokedAt: true
      }
    });
  });

  it("loads local role lifecycle metadata for candidate profile export", async () => {
    const { userRoleFindMany, prisma } = prismaMock();
    userRoleFindMany.mockResolvedValueOnce([
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        role: "CANDIDATE",
        createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        createdAt: new Date("2026-05-03T07:00:00.000Z"),
        revokedAt: new Date("2026-05-27T07:00:00.000Z")
      }
    ]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).listUserRolesForUser(profileRecord.userId)
    ).resolves.toEqual([
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        role: "CANDIDATE",
        createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        createdAt: "2026-05-03T07:00:00.000Z",
        revokedAt: "2026-05-27T07:00:00.000Z"
      }
    ]);
    expect(userRoleFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        role: true,
        createdBy: true,
        createdAt: true,
        revokedAt: true
      }
    });
  });

  it("loads identity access review lifecycle metadata for candidate profile export", async () => {
    const { identityAccessReviewFindMany, prisma } = prismaMock();
    identityAccessReviewFindMany.mockResolvedValueOnce([
      {
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        providerAccountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "confirmed",
        scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        requestedRole: "CANDIDATE",
        assignedRole: "CANDIDATE",
        expiresAt: new Date("2026-06-02T07:00:00.000Z"),
        decidedBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        decidedAt: new Date("2026-05-04T07:00:00.000Z"),
        decisionNote: "Approved for candidate onboarding.",
        createdAt: new Date("2026-05-03T07:00:00.000Z"),
        updatedAt: new Date("2026-05-04T07:00:00.000Z")
      },
      {
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        providerAccountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "pending",
        scopeOrganizationUnitId: null,
        requestedRole: null,
        assignedRole: null,
        expiresAt: new Date("2026-06-03T07:00:00.000Z"),
        decidedBy: null,
        decidedAt: null,
        decisionNote: null,
        createdAt: new Date("2026-05-04T07:00:00.000Z"),
        updatedAt: new Date("2026-05-04T07:00:00.000Z")
      }
    ]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).listIdentityAccessReviewsForUser(
        profileRecord.userId
      )
    ).resolves.toEqual([
      {
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        providerAccountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "confirmed",
        scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        requestedRole: "CANDIDATE",
        assignedRole: "CANDIDATE",
        expiresAt: "2026-06-02T07:00:00.000Z",
        decidedBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        decidedAt: "2026-05-04T07:00:00.000Z",
        decisionNote: "Approved for candidate onboarding.",
        createdAt: "2026-05-03T07:00:00.000Z",
        updatedAt: "2026-05-04T07:00:00.000Z"
      },
      {
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        providerAccountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "pending",
        scopeOrganizationUnitId: null,
        requestedRole: null,
        assignedRole: null,
        expiresAt: "2026-06-03T07:00:00.000Z",
        decidedBy: null,
        decidedAt: null,
        decisionNote: null,
        createdAt: "2026-05-04T07:00:00.000Z",
        updatedAt: "2026-05-04T07:00:00.000Z"
      }
    ]);
    expect(identityAccessReviewFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        providerAccountId: true,
        status: true,
        scopeOrganizationUnitId: true,
        requestedRole: true,
        assignedRole: true,
        expiresAt: true,
        decidedBy: true,
        decidedAt: true,
        decisionNote: true,
        createdAt: true,
        updatedAt: true
      }
    });
  });

  it("loads membership lifecycle metadata for candidate profile export", async () => {
    const { membershipFindMany, prisma } = prismaMock();
    membershipFindMany.mockResolvedValueOnce([
      {
        id: "99999999-9999-4999-8999-999999999999",
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "active",
        currentDegree: "First Degree",
        joinedAt: new Date("2026-05-05T00:00:00.000Z"),
        createdAt: new Date("2026-05-05T07:00:00.000Z"),
        updatedAt: new Date("2026-05-06T07:00:00.000Z"),
        archivedAt: null
      },
      {
        id: "99999999-9999-4999-8999-999999999998",
        organizationUnitId: "22222222-2222-4222-8222-222222222222",
        status: "inactive",
        currentDegree: null,
        joinedAt: null,
        createdAt: new Date("2026-04-05T07:00:00.000Z"),
        updatedAt: new Date("2026-04-06T07:00:00.000Z"),
        archivedAt: new Date("2026-04-07T07:00:00.000Z")
      }
    ]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).listMembershipsForUser(profileRecord.userId)
    ).resolves.toEqual([
      {
        id: "99999999-9999-4999-8999-999999999999",
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "active",
        currentDegree: "First Degree",
        joinedAt: "2026-05-05",
        createdAt: "2026-05-05T07:00:00.000Z",
        updatedAt: "2026-05-06T07:00:00.000Z",
        archivedAt: null
      },
      {
        id: "99999999-9999-4999-8999-999999999998",
        organizationUnitId: "22222222-2222-4222-8222-222222222222",
        status: "inactive",
        currentDegree: null,
        joinedAt: null,
        createdAt: "2026-04-05T07:00:00.000Z",
        updatedAt: "2026-04-06T07:00:00.000Z",
        archivedAt: "2026-04-07T07:00:00.000Z"
      }
    ]);
    expect(membershipFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        organizationUnitId: true,
        status: true,
        currentDegree: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true
      }
    });
  });

  it("loads officer assignment lifecycle metadata for candidate profile export", async () => {
    const { officerAssignmentFindMany, prisma } = prismaMock();
    officerAssignmentFindMany.mockResolvedValueOnce([
      {
        id: "12121212-1212-4121-8121-121212121212",
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        title: "Secretary",
        startsAt: new Date("2026-05-01T00:00:00.000Z"),
        endsAt: new Date("2026-12-31T00:00:00.000Z"),
        createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        createdAt: new Date("2026-04-30T07:00:00.000Z")
      },
      {
        id: "34343434-3434-4343-8343-343434343434",
        organizationUnitId: "22222222-2222-4222-8222-222222222222",
        title: null,
        startsAt: new Date("2026-06-01T00:00:00.000Z"),
        endsAt: null,
        createdBy: null,
        createdAt: new Date("2026-05-30T07:00:00.000Z")
      }
    ]);

    await expect(
      new PrismaAdminCandidateRepository(prisma).listOfficerAssignmentsForUser(
        profileRecord.userId
      )
    ).resolves.toEqual([
      {
        id: "12121212-1212-4121-8121-121212121212",
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        title: "Secretary",
        startsAt: "2026-05-01",
        endsAt: "2026-12-31",
        createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        createdAt: "2026-04-30T07:00:00.000Z"
      },
      {
        id: "34343434-3434-4343-8343-343434343434",
        organizationUnitId: "22222222-2222-4222-8222-222222222222",
        title: null,
        startsAt: "2026-06-01",
        endsAt: null,
        createdBy: null,
        createdAt: "2026-05-30T07:00:00.000Z"
      }
    ]);
    expect(officerAssignmentFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        organizationUnitId: true,
        title: true,
        startsAt: true,
        endsAt: true,
        createdBy: true,
        createdAt: true
      }
    });
  });

  it("loads roadmap assignment lifecycle metadata for candidate profile export without submitted bodies", async () => {
    const { roadmapAssignmentFindMany, prisma } = prismaMock();
    roadmapAssignmentFindMany.mockResolvedValueOnce([
      {
        id: "56565656-5656-4565-8565-565656565656",
        roadmapDefinitionId: "78787878-7878-4787-8787-787878787878",
        roadmapDefinition: {
          targetRole: "CANDIDATE",
          status: "PUBLISHED"
        },
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "active",
        assignedBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        assignedAt: new Date("2026-05-07T07:00:00.000Z"),
        completedAt: null,
        createdAt: new Date("2026-05-07T07:00:00.000Z"),
        updatedAt: new Date("2026-05-08T07:00:00.000Z"),
        archivedAt: null,
        submissions: [
          { status: "pending_review" },
          { status: "approved" }
        ]
      }
    ]);

    const exported = await new PrismaAdminCandidateRepository(prisma).listRoadmapAssignmentsForUser(
      profileRecord.userId
    );

    expect(exported).toEqual([
      {
        id: "56565656-5656-4565-8565-565656565656",
        roadmapDefinitionId: "78787878-7878-4787-8787-787878787878",
        roadmapTargetRole: "CANDIDATE",
        roadmapStatus: "PUBLISHED",
        organizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "active",
        assignedByUserId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        assignedAt: "2026-05-07T07:00:00.000Z",
        completedAt: null,
        submissionCount: 2,
        pendingSubmissionCount: 1,
        createdAt: "2026-05-07T07:00:00.000Z",
        updatedAt: "2026-05-08T07:00:00.000Z",
        archivedAt: null
      }
    ]);
    expect(JSON.stringify(exported)).not.toContain("body");
    expect(JSON.stringify(exported)).not.toContain("attachment");
    expect(roadmapAssignmentFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ assignedAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        roadmapDefinitionId: true,
        roadmapDefinition: {
          select: {
            targetRole: true,
            status: true
          }
        },
        organizationUnitId: true,
        status: true,
        assignedBy: true,
        assignedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true,
        submissions: {
          select: {
            status: true
          }
        }
      }
    });
  });

  it("loads own event participation lifecycle metadata without participant lists", async () => {
    const { eventParticipationFindMany, prisma } = prismaMock();
    eventParticipationFindMany.mockResolvedValueOnce([
      {
        id: "67676767-6767-4676-8676-676767676767",
        eventId: "89898989-8989-4898-8989-898989898989",
        intentStatus: "planning_to_attend",
        createdAt: new Date("2026-05-09T07:00:00.000Z"),
        updatedAt: new Date("2026-05-10T07:00:00.000Z"),
        cancelledAt: null,
        event: {
          title: "Candidate Formation Evening",
          type: "formation",
          visibility: "CANDIDATE",
          status: "published",
          targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
          startAt: new Date("2026-05-20T17:00:00.000Z"),
          endAt: new Date("2026-05-20T19:00:00.000Z")
        },
        participations: [{ userId: "must-not-export" }]
      }
    ]);

    const exported =
      await new PrismaAdminCandidateRepository(prisma).listEventParticipationsForUser(
        profileRecord.userId
      );

    expect(exported).toEqual([
      {
        id: "67676767-6767-4676-8676-676767676767",
        eventId: "89898989-8989-4898-8989-898989898989",
        eventTitle: "Candidate Formation Evening",
        eventType: "formation",
        eventVisibility: "CANDIDATE",
        eventStatus: "published",
        eventTargetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        eventStartAt: "2026-05-20T17:00:00.000Z",
        eventEndAt: "2026-05-20T19:00:00.000Z",
        intentStatus: "planning_to_attend",
        createdAt: "2026-05-09T07:00:00.000Z",
        updatedAt: "2026-05-10T07:00:00.000Z",
        cancelledAt: null
      }
    ]);
    expect(JSON.stringify(exported)).not.toContain("must-not-export");
    expect(eventParticipationFindMany).toHaveBeenCalledWith({
      where: { userId: profileRecord.userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        eventId: true,
        intentStatus: true,
        createdAt: true,
        updatedAt: true,
        cancelledAt: true,
        event: {
          select: {
            title: true,
            type: true,
            visibility: true,
            status: true,
            targetOrganizationUnitId: true,
            startAt: true,
            endAt: true
          }
        }
      }
    });
  });

  it("fails closed when export lifecycle rows contain unknown enum values", async () => {
    const {
      deviceTokenFindMany,
      eventParticipationFindMany,
      roadmapAssignmentFindMany,
      userRoleFindMany,
      prisma
    } = prismaMock();
    const repository = new PrismaAdminCandidateRepository(prisma);

    userRoleFindMany.mockResolvedValueOnce([
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        role: "UNKNOWN",
        createdBy: null,
        createdAt: new Date("2026-05-03T07:00:00.000Z"),
        revokedAt: null
      }
    ]);
    await expect(repository.listUserRolesForUser(profileRecord.userId)).rejects.toThrow(
      "Repository returned an unknown user role."
    );

    deviceTokenFindMany.mockResolvedValueOnce([
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        platform: "desktop",
        lastSeenAt: new Date("2026-05-26T07:00:00.000Z"),
        createdAt: new Date("2026-05-02T07:00:00.000Z"),
        updatedAt: new Date("2026-05-26T07:00:00.000Z"),
        revokedAt: null
      }
    ]);
    await expect(repository.listDeviceTokensForUser(profileRecord.userId)).rejects.toThrow(
      "Repository returned an unknown device token platform."
    );

    roadmapAssignmentFindMany.mockResolvedValueOnce([
      {
        id: "56565656-5656-4565-8565-565656565656",
        roadmapDefinitionId: "78787878-7878-4787-8787-787878787878",
        roadmapDefinition: {
          targetRole: "OFFICER",
          status: "PUBLISHED"
        },
        organizationUnitId: null,
        status: "active",
        assignedBy: null,
        assignedAt: new Date("2026-05-07T07:00:00.000Z"),
        completedAt: null,
        createdAt: new Date("2026-05-07T07:00:00.000Z"),
        updatedAt: new Date("2026-05-08T07:00:00.000Z"),
        archivedAt: null,
        submissions: []
      }
    ]);
    await expect(repository.listRoadmapAssignmentsForUser(profileRecord.userId)).rejects.toThrow(
      "Repository returned an unknown roadmap target role."
    );

    eventParticipationFindMany.mockResolvedValueOnce([
      {
        id: "67676767-6767-4676-8676-676767676767",
        eventId: "89898989-8989-4898-8989-898989898989",
        intentStatus: "invited",
        createdAt: new Date("2026-05-09T07:00:00.000Z"),
        updatedAt: new Date("2026-05-10T07:00:00.000Z"),
        cancelledAt: null,
        event: {
          title: "Candidate Formation Evening",
          type: "formation",
          visibility: "CANDIDATE",
          status: "published",
          targetOrganizationUnitId: null,
          startAt: new Date("2026-05-20T17:00:00.000Z"),
          endAt: null
        }
      }
    ]);
    await expect(repository.listEventParticipationsForUser(profileRecord.userId)).rejects.toThrow(
      "Repository returned an unknown event participation status."
    );
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
      notificationPreferenceDeleteMany,
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
    expect(notificationPreferenceDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: profileRecord.userId
      }
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
  deviceTokenFindMany: ReturnType<typeof vi.fn>;
  deviceTokenUpdateMany: ReturnType<typeof vi.fn>;
  eventParticipationFindMany: ReturnType<typeof vi.fn>;
  identityProviderAccountFindMany: ReturnType<typeof vi.fn>;
  identityProviderAccountUpdateMany: ReturnType<typeof vi.fn>;
  identityAccessReviewFindMany: ReturnType<typeof vi.fn>;
  membershipFindFirst: ReturnType<typeof vi.fn>;
  membershipFindMany: ReturnType<typeof vi.fn>;
  notificationPreferenceDeleteMany: ReturnType<typeof vi.fn>;
  notificationPreferenceFindMany: ReturnType<typeof vi.fn>;
  officerAssignmentFindMany: ReturnType<typeof vi.fn>;
  officerAssignmentFindFirst: ReturnType<typeof vi.fn>;
  roadmapAssignmentFindMany: ReturnType<typeof vi.fn>;
  userRoleFindMany: ReturnType<typeof vi.fn>;
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
  const deviceTokenFindMany = vi.fn(() => Promise.resolve([]));
  const deviceTokenUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const eventParticipationFindMany = vi.fn(() => Promise.resolve([]));
  const identityProviderAccountFindMany = vi.fn(() => Promise.resolve([]));
  const identityProviderAccountUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const identityAccessReviewFindMany = vi.fn(() => Promise.resolve([]));
  const membershipFindFirst = vi.fn(() => Promise.resolve(null));
  const membershipFindMany = vi.fn(() => Promise.resolve([]));
  const notificationPreferenceDeleteMany = vi.fn(() => Promise.resolve({ count: 4 }));
  const notificationPreferenceFindMany = vi.fn(() => Promise.resolve([]));
  const officerAssignmentFindMany = vi.fn(() => Promise.resolve([]));
  const officerAssignmentFindFirst = vi.fn(() => Promise.resolve(null));
  const roadmapAssignmentFindMany = vi.fn(() => Promise.resolve([]));
  const userRoleFindMany = vi.fn(() => Promise.resolve([]));
  const userRoleFindFirst = vi.fn(() => Promise.resolve(null));
  const userRoleUpdateMany = vi.fn(() => Promise.resolve({ count: 1 }));
  const userUpdate = vi.fn(() => Promise.resolve({}));
  const tx = {
    candidateProfile: {
      findUnique: candidateProfileFindUnique,
      updateMany: candidateProfileUpdateMany
    },
    deviceToken: {
      findMany: deviceTokenFindMany,
      updateMany: deviceTokenUpdateMany
    },
    identityProviderAccount: {
      findMany: identityProviderAccountFindMany,
      updateMany: identityProviderAccountUpdateMany
    },
    identityAccessReview: {
      findMany: identityAccessReviewFindMany
    },
    eventParticipation: {
      findMany: eventParticipationFindMany
    },
    notificationPreference: {
      deleteMany: notificationPreferenceDeleteMany
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
    deviceTokenFindMany,
    deviceTokenUpdateMany,
    eventParticipationFindMany,
    identityProviderAccountFindMany,
    identityProviderAccountUpdateMany,
    identityAccessReviewFindMany,
    membershipFindFirst,
    membershipFindMany,
    notificationPreferenceDeleteMany,
    notificationPreferenceFindMany,
    officerAssignmentFindMany,
    officerAssignmentFindFirst,
    roadmapAssignmentFindMany,
    userRoleFindMany,
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
        findMany: deviceTokenFindMany,
        updateMany: deviceTokenUpdateMany
      },
      identityProviderAccount: {
        findMany: identityProviderAccountFindMany,
        updateMany: identityProviderAccountUpdateMany
      },
      identityAccessReview: {
        findMany: identityAccessReviewFindMany
      },
      eventParticipation: {
        findMany: eventParticipationFindMany
      },
      notificationPreference: {
        deleteMany: notificationPreferenceDeleteMany,
        findMany: notificationPreferenceFindMany
      },
      membership: {
        findFirst: membershipFindFirst,
        findMany: membershipFindMany
      },
      officerAssignment: {
        findFirst: officerAssignmentFindFirst,
        findMany: officerAssignmentFindMany
      },
      roadmapAssignment: {
        findMany: roadmapAssignmentFindMany
      },
      user: {
        update: userUpdate
      },
      userRole: {
        findMany: userRoleFindMany,
        findFirst: userRoleFindFirst,
        updateMany: userRoleUpdateMany
      }
    } as unknown as PrismaService
  };
}
