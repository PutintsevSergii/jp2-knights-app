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
    expect(response.exportedAt).toEqual(expect.any(String));
    expect(repository.lastExportId).toBe(profile.id);
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
  });
});

class FakeRepository implements AdminCandidateRepository {
  visible = true;
  exportRecord: AdminCandidateProfileDetail | null = profile;
  erasedRecord: AdminCandidateProfileDetail | null = { ...profile, status: "archived" };
  hasActiveNonCandidateAccess = false;
  lastScope: readonly string[] | null | undefined;
  lastExportId: string | undefined;
  lastErasureId: string | undefined;
  lastNonCandidateAccessUserId: string | undefined;

  listCandidateProfiles(scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? [profile] : []);
  }

  findCandidateProfile(_id: string, scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? profile : null);
  }

  findCandidateProfileForExport(id: string) {
    this.lastExportId = id;
    return Promise.resolve(this.exportRecord);
  }

  candidateProfileUserHasActiveNonCandidateAccess(userId: string) {
    this.lastNonCandidateAccessUserId = userId;
    return Promise.resolve(this.hasActiveNonCandidateAccess);
  }

  eraseCandidateProfile(id: string) {
    this.lastErasureId = id;
    return Promise.resolve(this.erasedRecord);
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
