import { ForbiddenException, NotFoundException } from "@nestjs/common";
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
  lastScope: readonly string[] | null | undefined;

  listCandidateProfiles(scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? [profile] : []);
  }

  findCandidateProfile(_id: string, scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? profile : null);
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
