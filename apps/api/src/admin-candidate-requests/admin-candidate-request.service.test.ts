import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminCandidateRequestRepository } from "./admin-candidate-request.repository.js";
import { AdminCandidateRequestService } from "./admin-candidate-request.service.js";
import type {
  AdminCandidateProfileDetail,
  AdminCandidateRequestDetail
} from "./admin-candidate-request.types.js";

const request: AdminCandidateRequestDetail = {
  id: "55555555-5555-4555-8555-555555555555",
  firstName: "Anna",
  lastName: "Nowak",
  email: "anna@example.test",
  phone: null,
  country: "Latvia",
  city: "Riga",
  messagePreview: "I would like to learn more.",
  preferredLanguage: "en",
  message: "I would like to learn more.",
  consentTextVersion: "candidate-request-v1",
  consentAt: "2026-05-05T10:00:00.000Z",
  status: "new",
  assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  assignedOrganizationUnitName: "Riga Choragiew",
  officerNote: null,
  createdAt: "2026-05-05T10:00:00.000Z",
  updatedAt: "2026-05-05T10:00:00.000Z",
  archivedAt: null
};

const superAdmin: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

const officer: CurrentUserPrincipal = {
  id: "officer_1",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

const candidateProfile: AdminCandidateProfileDetail = {
  id: "77777777-7777-4777-8777-777777777777",
  userId: "88888888-8888-4888-8888-888888888888",
  candidateRequestId: request.id,
  displayName: "Anna Nowak",
  email: request.email,
  preferredLanguage: request.preferredLanguage,
  assignedOrganizationUnitId: request.assignedOrganizationUnitId,
  assignedOrganizationUnitName: request.assignedOrganizationUnitName,
  responsibleOfficerId: officer.id,
  responsibleOfficerName: officer.displayName,
  status: "active",
  createdAt: "2026-05-05T10:05:00.000Z",
  updatedAt: "2026-05-05T10:05:00.000Z",
  archivedAt: null
};

describe("AdminCandidateRequestService", () => {
  it("lists candidate requests in Super Admin global scope", async () => {
    const repository = new FakeRepository();
    const service = new AdminCandidateRequestService(repository, auditLog());

    await expect(service.listCandidateRequests(superAdmin)).resolves.toEqual({
      candidateRequests: [toSummary(request)]
    });
    expect(repository.lastScope).toBeNull();
  });

  it("scopes officer candidate request reads to assigned organization units", async () => {
    const repository = new FakeRepository();
    const service = new AdminCandidateRequestService(repository, auditLog());

    await expect(service.getCandidateRequest(officer, request.id)).resolves.toEqual({
      candidateRequest: request
    });
    expect(repository.lastScope).toEqual(["11111111-1111-4111-8111-111111111111"]);
  });

  it("updates status and writes redacted audit summaries", async () => {
    const repository = new FakeRepository();
    const auditLog = new FakeAuditLog();
    const service = new AdminCandidateRequestService(
      repository,
      auditLog as unknown as AuditLogService
    );

    await expect(
      service.updateCandidateRequest(officer, request.id, {
        status: "contacted",
        officerNote: "Followed up by email."
      })
    ).resolves.toEqual({
      candidateRequest: {
        ...request,
        status: "contacted",
        officerNote: "Followed up by email."
      }
    });
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.candidateRequest.update",
      actorUserId: officer.id,
      entityType: "candidate_request",
      entityId: request.id,
      scopeOrganizationUnitId: request.assignedOrganizationUnitId
    });
    expect(JSON.stringify(auditLog.records[0])).not.toContain("anna@example.test");
    expect(JSON.stringify(auditLog.records[0])).not.toContain("I would like to learn more.");
  });

  it("converts an invited assigned request into a candidate profile and writes redacted audit", async () => {
    const repository = new FakeRepository();
    repository.record = {
      ...request,
      status: "invited"
    };
    const auditLog = new FakeAuditLog();
    const service = new AdminCandidateRequestService(
      repository,
      auditLog as unknown as AuditLogService
    );

    await expect(
      service.convertCandidateRequest(officer, request.id, {
        responsibleOfficerId: officer.id
      })
    ).resolves.toEqual({
      candidateProfile
    });
    expect(repository.lastConverted).toEqual({
      id: request.id,
      data: {
        assignedOrganizationUnitId: request.assignedOrganizationUnitId,
        responsibleOfficerId: officer.id
      },
      actorUserId: officer.id,
      scopeOrganizationUnitIds: officer.officerOrganizationUnitIds
    });
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.candidateRequest.convert",
      actorUserId: officer.id,
      entityType: "candidate_profile",
      entityId: candidateProfile.id,
      scopeOrganizationUnitId: request.assignedOrganizationUnitId
    });
    expect(JSON.stringify(auditLog.records[0])).not.toContain("anna@example.test");
    expect(JSON.stringify(auditLog.records[0])).not.toContain("I would like to learn more.");
  });

  it("rejects candidate request access without Admin Lite access", async () => {
    const service = new AdminCandidateRequestService(new FakeRepository(), auditLog());

    await expect(
      service.listCandidateRequests({
        ...officer,
        roles: ["BROTHER"],
        officerOrganizationUnitIds: []
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects officer assignment changes outside assigned organization units", async () => {
    const service = new AdminCandidateRequestService(new FakeRepository(), auditLog());

    await expect(
      service.updateCandidateRequest(officer, request.id, {
        assignedOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateCandidateRequest(officer, request.id, {
        assignedOrganizationUnitId: null
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects invalid candidate request lifecycle transitions", async () => {
    const service = new AdminCandidateRequestService(new FakeRepository(), auditLog());

    await expect(
      service.updateCandidateRequest(officer, request.id, { status: "invited" })
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.updateCandidateRequest(officer, request.id, { status: "rejected" })
    ).rejects.toBeInstanceOf(ConflictException);

    const contactedRepository = new FakeRepository();
    contactedRepository.record = {
      ...request,
      status: "contacted"
    };
    await expect(
      new AdminCandidateRequestService(contactedRepository, auditLog()).updateCandidateRequest(
        officer,
        request.id,
        { status: "invited" }
      )
    ).resolves.toMatchObject({
      candidateRequest: {
        status: "invited"
      }
    });
    await expect(
      new AdminCandidateRequestService(contactedRepository, auditLog()).updateCandidateRequest(
        officer,
        request.id,
        { status: "rejected", officerNote: "Candidate declined after follow-up." }
      )
    ).resolves.toMatchObject({
      candidateRequest: {
        status: "rejected",
        officerNote: "Candidate declined after follow-up."
      }
    });

    const rejectedRepository = new FakeRepository();
    rejectedRepository.record = {
      ...request,
      status: "rejected",
      officerNote: "Not a fit for V1 process."
    };
    await expect(
      new AdminCandidateRequestService(rejectedRepository, auditLog()).updateCandidateRequest(
        officer,
        request.id,
        { officerNote: "Changed after terminal status." }
      )
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects conversion without assignment, invitation, or from terminal request states", async () => {
    const unassignedRepository = new FakeRepository();
    unassignedRepository.record = {
      ...request,
      status: "invited",
      assignedOrganizationUnitId: null,
      assignedOrganizationUnitName: null
    };
    const service = new AdminCandidateRequestService(unassignedRepository, auditLog());

    await expect(
      service.convertCandidateRequest(superAdmin, request.id, {})
    ).rejects.toBeInstanceOf(ConflictException);

    const rejectedRepository = new FakeRepository();
    rejectedRepository.record = {
      ...request,
      status: "rejected"
    };
    await expect(
      new AdminCandidateRequestService(rejectedRepository, auditLog()).convertCandidateRequest(
        officer,
        request.id,
        {}
      )
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      new AdminCandidateRequestService(new FakeRepository(), auditLog()).convertCandidateRequest(
        officer,
        request.id,
        {}
      )
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects officer conversion outside assigned scope or responsible officer self-assignment", async () => {
    const service = new AdminCandidateRequestService(new FakeRepository(), auditLog());

    await expect(
      service.convertCandidateRequest(officer, request.id, {
        assignedOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.convertCandidateRequest(officer, request.id, {
        responsibleOfficerId: "99999999-9999-4999-8999-999999999999"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns not found for candidate requests outside current scope", async () => {
    const repository = new FakeRepository();
    repository.visible = false;
    const service = new AdminCandidateRequestService(repository, auditLog());

    await expect(service.getCandidateRequest(officer, request.id)).rejects.toBeInstanceOf(
      NotFoundException
    );
    await expect(
      service.updateCandidateRequest(officer, request.id, { status: "contacted" })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

class FakeRepository implements AdminCandidateRequestRepository {
  visible = true;
  record = request;
  lastScope: readonly string[] | null | undefined;
  lastConverted:
    | {
        id: string;
        data: {
          assignedOrganizationUnitId: string;
          responsibleOfficerId?: string | null | undefined;
        };
        actorUserId: string;
        scopeOrganizationUnitIds: readonly string[] | null;
      }
    | undefined;

  listCandidateRequests(scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? [toSummary(this.record)] : []);
  }

  findCandidateRequest(_id: string, scopeOrganizationUnitIds: readonly string[] | null) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? this.record : null);
  }

  updateCandidateRequest(
    _id: string,
    data: { status?: "new" | "contacted" | "invited" | "rejected"; officerNote?: string | null },
    scopeOrganizationUnitIds: readonly string[] | null
  ) {
    this.lastScope = scopeOrganizationUnitIds;
    return Promise.resolve(this.visible ? { ...this.record, ...data } : null);
  }

  convertCandidateRequest(
    id: string,
    data: { assignedOrganizationUnitId: string; responsibleOfficerId?: string | null },
    actorUserId: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ) {
    this.lastConverted = {
      id,
      data,
      actorUserId,
      scopeOrganizationUnitIds
    };

    return Promise.resolve(this.visible ? candidateProfile : null);
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

function toSummary(candidateRequest: AdminCandidateRequestDetail) {
  return {
    id: candidateRequest.id,
    firstName: candidateRequest.firstName,
    lastName: candidateRequest.lastName,
    email: candidateRequest.email,
    country: candidateRequest.country,
    city: candidateRequest.city,
    messagePreview: candidateRequest.messagePreview,
    status: candidateRequest.status,
    assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
    assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
    createdAt: candidateRequest.createdAt,
    updatedAt: candidateRequest.updatedAt,
    archivedAt: candidateRequest.archivedAt
  };
}
