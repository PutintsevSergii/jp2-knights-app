import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuditLogInput, AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminSilentPrayerRepository } from "./admin-silent-prayer.repository.js";
import { AdminSilentPrayerService } from "./admin-silent-prayer.service.js";
import type { AdminSilentPrayerEventSummary } from "./admin-silent-prayer.types.js";

const publicSilentPrayerEvent: AdminSilentPrayerEventSummary = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Morning Prayer",
  intention: "For peace.",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  status: "DRAFT",
  startsAt: "2026-05-10T18:00:00.000Z",
  endsAt: null,
  approvedAt: null,
  publishedAt: null,
  cancelledAt: null,
  archivedAt: null
};

const scopedSilentPrayerEvent: AdminSilentPrayerEventSummary = {
  ...publicSilentPrayerEvent,
  id: "55555555-5555-4555-8555-555555555555",
  title: "Scoped Prayer",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
};

const brother: CurrentUserPrincipal = {
  id: "brother_1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"]
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

describe("AdminSilentPrayerService", () => {
  it("lists silent-prayer events for officers using their assigned organization-unit scope", async () => {
    await expect(service().listAdminSilentPrayerEvents(officer)).resolves.toEqual({
      silentPrayerEvents: [publicSilentPrayerEvent, scopedSilentPrayerEvent]
    });
  });

  it("allows super admins to list all manageable silent-prayer events", async () => {
    await expect(service().listAdminSilentPrayerEvents(superAdmin)).resolves.toEqual({
      silentPrayerEvents: [publicSilentPrayerEvent, scopedSilentPrayerEvent]
    });
  });

  it("blocks non-admin principals from admin silent-prayer listing", async () => {
    await expect(service().listAdminSilentPrayerEvents(brother)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("allows scoped officers and super admins to create silent-prayer event records", async () => {
    const auditLog = auditLogRecorder();
    const adminSilentPrayerService = service(repository(), auditLog);

    await expect(
      adminSilentPrayerService.createAdminSilentPrayerEvent(officer, {
        title: "New Prayer",
        intention: "For the chapter.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "DRAFT",
        startsAt: "2026-05-10T18:00:00.000Z"
      })
    ).resolves.toEqual({
      silentPrayerEvent: {
        ...publicSilentPrayerEvent,
        title: "New Prayer",
        intention: "For the chapter.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
      }
    });
    await expect(
      adminSilentPrayerService.createAdminSilentPrayerEvent(superAdmin, {
        title: "Global Prayer",
        visibility: "PUBLIC",
        status: "DRAFT",
        startsAt: "2026-05-10T18:00:00.000Z"
      })
    ).resolves.toEqual({
      silentPrayerEvent: {
        ...publicSilentPrayerEvent,
        title: "Global Prayer",
        intention: null,
        visibility: "PUBLIC"
      }
    });

    expect(auditLog.records).toHaveLength(2);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.silent_prayer_event.create",
      actorUserId: officer.id,
      entityId: publicSilentPrayerEvent.id,
      entityType: "silent_prayer_event",
      scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      beforeSummary: null
    });
    expect(auditLog.records[0]?.afterSummary).toMatchObject({
      status: "DRAFT",
      title: "New Prayer",
      visibility: "ORGANIZATION_UNIT"
    });
    expect(auditLog.records[0]?.afterSummary).not.toHaveProperty("intention");
    expect(auditLog.records[1]).toMatchObject({
      action: "admin.silent_prayer_event.create",
      actorUserId: superAdmin.id,
      entityId: publicSilentPrayerEvent.id,
      entityType: "silent_prayer_event",
      scopeOrganizationUnitId: null,
      beforeSummary: null
    });
  });

  it("blocks officers from creating or moving silent-prayer events outside assigned scope", async () => {
    await expect(
      service().createAdminSilentPrayerEvent(officer, {
        title: "Unscoped",
        visibility: "PUBLIC",
        status: "DRAFT",
        startsAt: "2026-05-10T18:00:00.000Z"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service().updateAdminSilentPrayerEvent(officer, scopedSilentPrayerEvent.id, {
        targetOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("updates scoped records and hides silent-prayer events outside the current admin scope", async () => {
    const auditLog = auditLogRecorder();
    const adminSilentPrayerService = service(repository(), auditLog);

    await expect(
      adminSilentPrayerService.updateAdminSilentPrayerEvent(officer, scopedSilentPrayerEvent.id, {
        status: "ARCHIVED"
      })
    ).resolves.toEqual({
      silentPrayerEvent: {
        ...scopedSilentPrayerEvent,
        status: "ARCHIVED",
        archivedAt: "2026-05-04T00:00:00.000Z"
      }
    });
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.silent_prayer_event.update",
      actorUserId: officer.id,
      entityId: scopedSilentPrayerEvent.id,
      entityType: "silent_prayer_event",
      scopeOrganizationUnitId: scopedSilentPrayerEvent.targetOrganizationUnitId
    });
    expect(auditLog.records[0]?.beforeSummary).toMatchObject({
      status: "DRAFT",
      visibility: "ORGANIZATION_UNIT"
    });
    expect(auditLog.records[0]?.afterSummary).toMatchObject({
      status: "ARCHIVED",
      visibility: "ORGANIZATION_UNIT"
    });
    expect(auditLog.records[0]?.beforeSummary).not.toHaveProperty("intention");
    expect(auditLog.records[0]?.afterSummary).not.toHaveProperty("intention");

    await expect(
      service(repository({ updateResult: null })).updateAdminSilentPrayerEvent(
        officer,
        publicSilentPrayerEvent.id,
        {
          status: "ARCHIVED"
        }
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function service(
  repositoryOverride: AdminSilentPrayerRepository = repository(),
  auditLog: TestAuditLog = auditLogRecorder()
): AdminSilentPrayerService {
  return new AdminSilentPrayerService(
    repositoryOverride,
    auditLog as unknown as AuditLogService
  );
}

function repository(
  options: { updateResult?: AdminSilentPrayerEventSummary | null } = {}
): AdminSilentPrayerRepository {
  return {
    listManageableEvents: () =>
      Promise.resolve([publicSilentPrayerEvent, scopedSilentPrayerEvent]),
    createEvent: (data) =>
      Promise.resolve({
        ...publicSilentPrayerEvent,
        ...data,
        intention: data.intention ?? null,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        endsAt: data.endsAt ?? null,
        approvedAt:
          data.status === "APPROVED" || data.status === "PUBLISHED"
            ? "2026-05-04T00:00:00.000Z"
            : null,
        publishedAt: data.status === "PUBLISHED" ? "2026-05-04T00:00:00.000Z" : null,
        archivedAt: data.status === "ARCHIVED" ? "2026-05-04T00:00:00.000Z" : null
      }),
    updateEvent: (_id, data) => {
      if (options.updateResult !== undefined) {
        return Promise.resolve(options.updateResult);
      }

      const updated: AdminSilentPrayerEventSummary = { ...scopedSilentPrayerEvent };

      if (data.title !== undefined) updated.title = data.title;
      if (data.intention !== undefined) updated.intention = data.intention;
      if (data.visibility !== undefined) updated.visibility = data.visibility;
      if (data.targetOrganizationUnitId !== undefined) {
        updated.targetOrganizationUnitId = data.targetOrganizationUnitId;
      }
      if (data.status !== undefined) updated.status = data.status;
      if (data.startsAt !== undefined) updated.startsAt = data.startsAt;
      if (data.endsAt !== undefined) updated.endsAt = data.endsAt;
      if (data.status === "ARCHIVED") updated.archivedAt = "2026-05-04T00:00:00.000Z";

      return Promise.resolve(updated);
    },
    findEventForAudit: (id) => {
      if (id === scopedSilentPrayerEvent.id) {
        return Promise.resolve(scopedSilentPrayerEvent);
      }
      if (id === publicSilentPrayerEvent.id) {
        return Promise.resolve(publicSilentPrayerEvent);
      }

      return Promise.resolve(null);
    }
  };
}

type TestAuditLog = Pick<AuditLogService, "record"> & { records: AuditLogInput[] };

function auditLogRecorder(): TestAuditLog {
  const records: AuditLogInput[] = [];

  return {
    records,
    record: (input) => {
      records.push(input);

      return Promise.resolve();
    }
  };
}
