import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminCandidateRepository } from "./admin-candidate.repository.js";
import { AdminCandidateService } from "./admin-candidate.service.js";
import type { AdminCandidateProfileDetail } from "./admin-candidate.types.js";

const profile: AdminCandidateProfileDetail = {
  id: "77777777-7777-4777-8777-777777777777",
  userId: "88888888-8888-4888-8888-888888888888",
  candidateRequestId: "55555555-5555-4555-8555-555555555555",
  displayName: "Anna Nowak",
  email: "anna@example.test",
  preferredLanguage: "en",
  assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  assignedOrganizationUnitName: "Riga Choragiew",
  responsibleOfficerId: "officer_1",
  responsibleOfficerName: "Demo Officer",
  status: "active",
  createdAt: "2026-05-05T10:05:00.000Z",
  updatedAt: "2026-05-05T10:05:00.000Z",
  archivedAt: null
};

const officer: CurrentUserPrincipal = {
  id: "officer_1",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

const superAdmin: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminCandidateService", () => {
  it("lists and reads candidate profiles in scoped admin access", async () => {
    const repository = new FakeRepository();
    const service = new AdminCandidateService(repository, auditLog());

    await expect(service.listCandidateProfiles(superAdmin)).resolves.toEqual({
      candidateProfiles: [profile]
    });
    expect(repository.lastScope).toBeNull();
    await expect(service.getCandidateProfile(officer, profile.id)).resolves.toEqual({
      candidateProfile: profile
    });
    expect(repository.lastScope).toEqual(officer.officerOrganizationUnitIds);
  });

  it("updates candidate status and writes redacted audit summaries", async () => {
    const repository = new FakeRepository();
    const auditLog = new FakeAuditLog();
    const service = new AdminCandidateService(repository, auditLog as unknown as AuditLogService);

    await expect(
      service.updateCandidateProfile(officer, profile.id, {
        status: "paused",
        responsibleOfficerId: officer.id
      })
    ).resolves.toEqual({
      candidateProfile: {
        ...profile,
        status: "paused",
        responsibleOfficerId: officer.id
      }
    });
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.candidateProfile.update",
      entityType: "candidate_profile",
      entityId: profile.id,
      scopeOrganizationUnitId: profile.assignedOrganizationUnitId
    });
    expect(JSON.stringify(auditLog.records[0])).not.toContain("anna@example.test");
  });

  it("converts a scoped active candidate profile to brother and audits redacted metadata", async () => {
    const repository = new FakeRepository();
    const auditLog = new FakeAuditLog();
    const service = new AdminCandidateService(repository, auditLog as unknown as AuditLogService);

    await expect(
      service.convertCandidateProfileToBrother(officer, profile.id, {
        joinedAt: "2026-06-11",
        currentDegree: "First Degree"
      })
    ).resolves.toEqual({
      candidateProfile: {
        ...profile,
        status: "converted_to_brother"
      },
      membership: repository.brotherMembership
    });
    expect(repository.lastConversion).toMatchObject({
      id: profile.id,
      data: {
        joinedAt: "2026-06-11",
        currentDegree: "First Degree"
      },
      actorUserId: officer.id,
      scopeOrganizationUnitIds: officer.officerOrganizationUnitIds
    });
    expect(repository.lastConversion?.convertedAt).toBeInstanceOf(Date);
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.candidateProfile.convertToBrother",
      entityType: "candidate_profile",
      entityId: profile.id,
      scopeOrganizationUnitId: profile.assignedOrganizationUnitId,
      beforeSummary: {
        candidateProfileId: profile.id,
        userId: profile.userId,
        status: "active"
      },
      afterSummary: {
        candidateProfileId: profile.id,
        userId: profile.userId,
        status: "converted_to_brother",
        membershipId: repository.brotherMembership.id,
        membershipOrganizationUnitId: profile.assignedOrganizationUnitId,
        candidateAccessRevoked: true,
        brotherAccessGranted: true
      }
    });
    expect(JSON.stringify(auditLog.records[0])).not.toContain("anna@example.test");
    expect(JSON.stringify(auditLog.records[0])).not.toContain("Anna Nowak");
  });

  it("rejects candidate-to-brother conversion for duplicate, archived, or unassigned profiles", async () => {
    const service = new AdminCandidateService(new FakeRepository(), auditLog());

    await expect(
      service.convertCandidateProfileToBrother(
        superAdmin,
        profile.id,
        {}
      )
    ).resolves.toMatchObject({
      candidateProfile: { status: "converted_to_brother" }
    });

    const convertedRepository = new FakeRepository();
    convertedRepository.findRecord = { ...profile, status: "converted_to_brother" };
    await expect(
      new AdminCandidateService(convertedRepository, auditLog()).convertCandidateProfileToBrother(
        superAdmin,
        profile.id,
        {}
      )
    ).rejects.toBeInstanceOf(ConflictException);
    expect(convertedRepository.lastConversion).toBeUndefined();

    const archivedRepository = new FakeRepository();
    archivedRepository.findRecord = {
      ...profile,
      status: "archived",
      archivedAt: "2026-06-01T00:00:00.000Z"
    };
    await expect(
      new AdminCandidateService(archivedRepository, auditLog()).convertCandidateProfileToBrother(
        superAdmin,
        profile.id,
        {}
      )
    ).rejects.toBeInstanceOf(ConflictException);
    expect(archivedRepository.lastConversion).toBeUndefined();

    const unassignedRepository = new FakeRepository();
    unassignedRepository.findRecord = {
      ...profile,
      assignedOrganizationUnitId: null,
      assignedOrganizationUnitName: null
    };
    await expect(
      new AdminCandidateService(unassignedRepository, auditLog()).convertCandidateProfileToBrother(
        superAdmin,
        profile.id,
        {}
      )
    ).rejects.toBeInstanceOf(ConflictException);
    expect(unassignedRepository.lastConversion).toBeUndefined();
  });

  it("exports archived candidate profile personal data for Super Admins and audits redacted metadata", async () => {
    const repository = new FakeRepository();
    repository.exportRecord = {
      ...profile,
      status: "archived",
      archivedAt: "2026-05-30T08:00:00.000Z"
    };
    const auditLog = new FakeAuditLog();
    const service = new AdminCandidateService(repository, auditLog as unknown as AuditLogService);

    const response = await service.exportCandidateProfile(superAdmin, profile.id);

    expect(response.candidateProfile).toEqual(repository.exportRecord);
    expect(response.providerAccounts).toEqual(repository.providerAccounts);
    expect(response.deviceTokens).toEqual(repository.deviceTokens);
    expect(response.userRoles).toEqual(repository.userRoles);
    expect(response.identityAccessReviews).toEqual(repository.identityAccessReviews);
    expect(response.memberships).toEqual(repository.memberships);
    expect(response.officerAssignments).toEqual(repository.officerAssignments);
    expect(response.roadmapAssignments).toEqual(repository.roadmapAssignments);
    expect(response.eventParticipations).toEqual(repository.eventParticipations);
    expect(response.notificationPreferences).toEqual({
      events: false,
      announcements: true,
      roadmapUpdates: true,
      prayerReminders: false
    });
    expect(response.retentionBucket).toBe("sensitive_review");
    expect(response.exportedAt).toEqual(expect.any(String));
    expect(repository.lastExportId).toBe(profile.id);
    expect(repository.lastProviderAccountUserId).toBe(profile.userId);
    expect(repository.lastDeviceTokenUserId).toBe(profile.userId);
    expect(repository.lastUserRoleUserId).toBe(profile.userId);
    expect(repository.lastIdentityAccessReviewUserId).toBe(profile.userId);
    expect(repository.lastMembershipUserId).toBe(profile.userId);
    expect(repository.lastOfficerAssignmentUserId).toBe(profile.userId);
    expect(repository.lastRoadmapAssignmentUserId).toBe(profile.userId);
    expect(repository.lastEventParticipationUserId).toBe(profile.userId);
    expect(repository.lastNotificationPreferenceUserId).toBe(profile.userId);
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.candidateProfile.export",
      entityType: "candidate_profile",
      entityId: profile.id,
      scopeOrganizationUnitId: profile.assignedOrganizationUnitId,
      beforeSummary: null,
      afterSummary: {
        candidateProfileId: profile.id,
        userId: profile.userId,
        candidateRequestId: profile.candidateRequestId,
        assignedOrganizationUnitId: profile.assignedOrganizationUnitId,
        responsibleOfficerId: profile.responsibleOfficerId,
        status: "archived",
        archived: true,
        includesPersonalData: true
      }
    });
    expect(JSON.stringify(auditLog.records[0])).not.toContain("anna@example.test");
    expect(JSON.stringify(auditLog.records[0])).not.toContain("Anna Nowak");
  });

  it("blocks officers from exporting candidate profile personal data before loading rows", async () => {
    const repository = new FakeRepository();

    await expect(
      new AdminCandidateService(repository, auditLog()).exportCandidateProfile(officer, profile.id)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.lastExportId).toBeUndefined();
  });

  it("erases candidate-only profile personal identifiers and audits without erased values", async () => {
    const repository = new FakeRepository();
    repository.erasedRecord = {
      ...profile,
      displayName: "Erased candidate",
      email: "erased-candidate-profile+77777777-7777-4777-8777-777777777777@privacy.local",
      preferredLanguage: null,
      status: "archived",
      archivedAt: "2026-06-01T17:05:00.000Z"
    };
    const auditLog = new FakeAuditLog();
    const service = new AdminCandidateService(repository, auditLog as unknown as AuditLogService);

    const response = await service.eraseCandidateProfile(superAdmin, profile.id);

    expect(response).toMatchObject({
      candidateProfileId: profile.id,
      userId: profile.userId,
      retentionBucket: "sensitive_review",
      archivedAt: "2026-06-01T17:05:00.000Z"
    });
    expect(response.erasedAt).toEqual(expect.any(String));
    expect(repository.lastExportId).toBe(profile.id);
    expect(repository.lastNonCandidateAccessUserId).toBe(profile.userId);
    expect(repository.lastErasureId).toBe(profile.id);
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.candidateProfile.erase",
      entityType: "candidate_profile",
      entityId: profile.id,
      beforeSummary: {
        candidateProfileId: profile.id,
        userId: profile.userId,
        status: "active",
        hadPersonalData: true
      },
      afterSummary: {
        candidateProfileId: profile.id,
        userId: profile.userId,
        status: "archived",
        erasedPersonalData: true,
        revokedCandidateAccess: true
      }
    });
    expect(JSON.stringify(auditLog.records[0])).not.toContain("anna@example.test");
    expect(JSON.stringify(auditLog.records[0])).not.toContain("Anna Nowak");
  });

  it("rejects candidate profile erasure when the linked user has active non-candidate access", async () => {
    const repository = new FakeRepository();
    repository.hasActiveNonCandidateAccess = true;

    await expect(
      new AdminCandidateService(repository, auditLog()).eraseCandidateProfile(
        superAdmin,
        profile.id
      )
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.lastErasureId).toBeUndefined();
  });

  it("rejects converted candidate profile erasure before checking linked access", async () => {
    const repository = new FakeRepository();
    repository.exportRecord = { ...profile, status: "converted_to_brother" };

    await expect(
      new AdminCandidateService(repository, auditLog()).eraseCandidateProfile(
        superAdmin,
        profile.id
      )
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.lastNonCandidateAccessUserId).toBeUndefined();
    expect(repository.lastErasureId).toBeUndefined();
  });

  it("blocks officers from erasing candidate profile personal data before loading rows", async () => {
    const repository = new FakeRepository();

    await expect(
      new AdminCandidateService(repository, auditLog()).eraseCandidateProfile(officer, profile.id)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.lastExportId).toBeUndefined();
    expect(repository.lastErasureId).toBeUndefined();
  });

  it("returns not found when a Super Admin exports a missing candidate profile", async () => {
    const repository = new FakeRepository();
    repository.exportRecord = null;

    await expect(
      new AdminCandidateService(repository, auditLog()).exportCandidateProfile(
        superAdmin,
        profile.id
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns not found when a Super Admin erases a missing candidate profile", async () => {
    const repository = new FakeRepository();
    repository.exportRecord = null;

    await expect(
      new AdminCandidateService(repository, auditLog()).eraseCandidateProfile(
        superAdmin,
        profile.id
      )
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.lastErasureId).toBeUndefined();
  });

  it("rejects non-admin access and out-of-scope officer assignment changes", async () => {
    const service = new AdminCandidateService(new FakeRepository(), auditLog());

    await expect(
      service.listCandidateProfiles({ ...officer, roles: ["BROTHER"] })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateCandidateProfile(officer, profile.id, {
        assignedOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateCandidateProfile(officer, profile.id, {
        responsibleOfficerId: "99999999-9999-4999-8999-999999999999"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns not found for candidate profiles outside current scope", async () => {
    const repository = new FakeRepository();
    repository.visible = false;
    const service = new AdminCandidateService(repository, auditLog());

    await expect(service.getCandidateProfile(officer, profile.id)).rejects.toBeInstanceOf(
      NotFoundException
    );
    await expect(
      service.updateCandidateProfile(officer, profile.id, { status: "paused" })
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.convertCandidateProfileToBrother(officer, profile.id, {})
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

class FakeRepository implements AdminCandidateRepository {
  visible = true;
  findRecord: AdminCandidateProfileDetail = profile;
  exportRecord: AdminCandidateProfileDetail | null = profile;
  brotherMembership = {
    id: "34343434-3434-4343-8343-343434343434",
    userId: profile.userId,
    organizationUnitId: profile.assignedOrganizationUnitId ?? "11111111-1111-4111-8111-111111111111",
    status: "active" as const,
    currentDegree: "First Degree",
    joinedAt: "2026-06-11",
    createdAt: "2026-06-11T07:00:00.000Z",
    updatedAt: "2026-06-11T07:00:00.000Z",
    archivedAt: null
  };
  providerAccounts = [
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
  ];
  deviceTokens = [
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      platform: "ios" as const,
      lastSeenAt: "2026-05-26T07:00:00.000Z",
      createdAt: "2026-05-02T07:00:00.000Z",
      updatedAt: "2026-05-26T07:00:00.000Z",
      revokedAt: null
    }
  ];
  userRoles = [
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      role: "CANDIDATE" as const,
      createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      createdAt: "2026-05-03T07:00:00.000Z",
      revokedAt: null
    }
  ];
  identityAccessReviews = [
    {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      providerAccountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      status: "confirmed" as const,
      scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      requestedRole: "CANDIDATE" as const,
      assignedRole: "CANDIDATE" as const,
      expiresAt: "2026-06-02T07:00:00.000Z",
      decidedBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      decidedAt: "2026-05-04T07:00:00.000Z",
      decisionNote: "Approved for candidate onboarding.",
      createdAt: "2026-05-03T07:00:00.000Z",
      updatedAt: "2026-05-04T07:00:00.000Z"
    }
  ];
  memberships = [
    {
      id: "99999999-9999-4999-8999-999999999999",
      organizationUnitId: "11111111-1111-4111-8111-111111111111",
      status: "active" as const,
      currentDegree: "First Degree",
      joinedAt: "2026-05-05",
      createdAt: "2026-05-05T07:00:00.000Z",
      updatedAt: "2026-05-06T07:00:00.000Z",
      archivedAt: null
    }
  ];
  officerAssignments = [
    {
      id: "12121212-1212-4121-8121-121212121212",
      organizationUnitId: "11111111-1111-4111-8111-111111111111",
      title: "Secretary",
      startsAt: "2026-05-01",
      endsAt: null,
      createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      createdAt: "2026-04-30T07:00:00.000Z"
    }
  ];
  roadmapAssignments = [
    {
      id: "56565656-5656-4565-8565-565656565656",
      roadmapDefinitionId: "78787878-7878-4787-8787-787878787878",
      roadmapTargetRole: "CANDIDATE" as const,
      roadmapStatus: "PUBLISHED" as const,
      organizationUnitId: "11111111-1111-4111-8111-111111111111",
      status: "active" as const,
      assignedByUserId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      assignedAt: "2026-05-07T07:00:00.000Z",
      completedAt: null,
      submissionCount: 2,
      pendingSubmissionCount: 1,
      createdAt: "2026-05-07T07:00:00.000Z",
      updatedAt: "2026-05-08T07:00:00.000Z",
      archivedAt: null
    }
  ];
  eventParticipations = [
    {
      id: "67676767-6767-4676-8676-676767676767",
      eventId: "89898989-8989-4898-8989-898989898989",
      eventTitle: "Candidate Formation Evening",
      eventType: "formation",
      eventVisibility: "CANDIDATE" as const,
      eventStatus: "published" as const,
      eventTargetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      eventStartAt: "2026-05-20T17:00:00.000Z",
      eventEndAt: "2026-05-20T19:00:00.000Z",
      intentStatus: "planning_to_attend" as const,
      createdAt: "2026-05-09T07:00:00.000Z",
      updatedAt: "2026-05-10T07:00:00.000Z",
      cancelledAt: null
    }
  ];
  erasedRecord: AdminCandidateProfileDetail | null = { ...profile, status: "archived" };
  hasActiveNonCandidateAccess = false;
  lastScope: readonly string[] | null | undefined;
  lastExportId: string | undefined;
  lastErasureId: string | undefined;
  lastProviderAccountUserId: string | undefined;
  lastDeviceTokenUserId: string | undefined;
  lastUserRoleUserId: string | undefined;
  lastIdentityAccessReviewUserId: string | undefined;
  lastMembershipUserId: string | undefined;
  lastOfficerAssignmentUserId: string | undefined;
  lastRoadmapAssignmentUserId: string | undefined;
  lastEventParticipationUserId: string | undefined;
  lastNonCandidateAccessUserId: string | undefined;
  lastNotificationPreferenceUserId: string | undefined;
  lastConversion:
    | {
        id: string;
        data: { joinedAt?: string; currentDegree?: string | null };
        actorUserId: string;
        convertedAt: Date;
        scopeOrganizationUnitIds: readonly string[] | null;
      }
    | undefined;

  listCandidateProfiles(scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? [profile] : []);
  }

  findCandidateProfile(_id: string, scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? this.findRecord : null);
  }

  findCandidateProfileForExport(id: string) {
    this.lastExportId = id;
    return Promise.resolve(this.exportRecord);
  }

  listProviderAccountsForUser(userId: string) {
    this.lastProviderAccountUserId = userId;
    return Promise.resolve(this.providerAccounts);
  }

  listDeviceTokensForUser(userId: string) {
    this.lastDeviceTokenUserId = userId;
    return Promise.resolve(this.deviceTokens);
  }

  listUserRolesForUser(userId: string) {
    this.lastUserRoleUserId = userId;
    return Promise.resolve(this.userRoles);
  }

  listIdentityAccessReviewsForUser(userId: string) {
    this.lastIdentityAccessReviewUserId = userId;
    return Promise.resolve(this.identityAccessReviews);
  }

  listMembershipsForUser(userId: string) {
    this.lastMembershipUserId = userId;
    return Promise.resolve(this.memberships);
  }

  listOfficerAssignmentsForUser(userId: string) {
    this.lastOfficerAssignmentUserId = userId;
    return Promise.resolve(this.officerAssignments);
  }

  listRoadmapAssignmentsForUser(userId: string) {
    this.lastRoadmapAssignmentUserId = userId;
    return Promise.resolve(this.roadmapAssignments);
  }

  listEventParticipationsForUser(userId: string) {
    this.lastEventParticipationUserId = userId;
    return Promise.resolve(this.eventParticipations);
  }

  findNotificationPreferencesForUser(userId: string) {
    this.lastNotificationPreferenceUserId = userId;
    return Promise.resolve({
      events: false,
      announcements: true,
      roadmapUpdates: true,
      prayerReminders: false
    });
  }

  candidateProfileUserHasActiveNonCandidateAccess(userId: string) {
    this.lastNonCandidateAccessUserId = userId;
    return Promise.resolve(this.hasActiveNonCandidateAccess);
  }

  eraseCandidateProfile(id: string) {
    this.lastErasureId = id;
    return Promise.resolve(this.erasedRecord);
  }

  convertCandidateProfileToBrother(
    id: string,
    data: { joinedAt?: string; currentDegree?: string | null },
    actorUserId: string,
    convertedAt: Date,
    scopeOrganizationUnitIds: readonly string[] | null
  ) {
    this.lastConversion = {
      id,
      data,
      actorUserId,
      convertedAt,
      scopeOrganizationUnitIds
    };
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(
      this.visible
        ? {
            candidateProfile: { ...this.findRecord, status: "converted_to_brother" as const },
            membership: this.brotherMembership
          }
        : null
    );
  }

  updateCandidateProfile(
    _id: string,
    data: { status?: "active" | "paused" | "archived"; responsibleOfficerId?: string | null },
    scopeOrganizationUnitIds: readonly string[] | null
  ) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? { ...profile, ...data } : null);
  }
}

class FakeAuditLog implements Pick<AuditLogService, "record"> {
  records: Parameters<AuditLogService["record"]>[0][] = [];

  record(input: Parameters<AuditLogService["record"]>[0]) {
    this.records.push(input);
    return Promise.resolve();
  }
}

function auditLog(): AuditLogService {
  return new FakeAuditLog() as unknown as AuditLogService;
}
