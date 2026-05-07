import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuditLogInput, AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AnnouncementPushRecipientRepository } from "../notifications/announcement-push-recipient.repository.js";
import type {
  PushNotificationAdapter,
  PushNotificationMessage
} from "../notifications/push-notification.adapter.js";
import type { AdminAnnouncementRepository } from "./admin-announcement.repository.js";
import { AdminAnnouncementService } from "./admin-announcement.service.js";
import type { AdminAnnouncementSummary } from "./admin-announcement.types.js";

const publicAnnouncement: AdminAnnouncementSummary = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  body: "Public introduction evening.",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  pinned: false,
  status: "DRAFT",
  publishedAt: null,
  archivedAt: null
};

const scopedAnnouncement: AdminAnnouncementSummary = {
  ...publicAnnouncement,
  id: "55555555-5555-4555-8555-555555555555",
  title: "Scoped Formation",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  pinned: true
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

describe("AdminAnnouncementService", () => {
  it("lists announcements for officers using their assigned organization-unit scope", async () => {
    await expect(service().listAdminAnnouncements(officer)).resolves.toEqual({
      announcements: [publicAnnouncement, scopedAnnouncement]
    });
  });

  it("allows super admins to list all manageable announcements", async () => {
    await expect(service().listAdminAnnouncements(superAdmin)).resolves.toEqual({
      announcements: [publicAnnouncement, scopedAnnouncement]
    });
  });

  it("blocks non-admin principals from admin announcement listing", async () => {
    await expect(service().listAdminAnnouncements(brother)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("allows scoped officers and super admins to create announcement records", async () => {
    const auditLog = auditLogRecorder();
    const adminAnnouncementService = service(repository(), auditLog);

    await expect(
      adminAnnouncementService.createAdminAnnouncement(officer, {
        title: "New Formation",
        body: "Scoped formation reminder.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        pinned: true,
        status: "DRAFT"
      })
    ).resolves.toEqual({
      announcement: {
        ...publicAnnouncement,
        title: "New Formation",
        body: "Scoped formation reminder.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        pinned: true
      }
    });
    await expect(
      adminAnnouncementService.createAdminAnnouncement(superAdmin, {
        title: "Global",
        body: "Global announcement.",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).resolves.toEqual({
      announcement: {
        ...publicAnnouncement,
        title: "Global",
        body: "Global announcement.",
        visibility: "PUBLIC"
      }
    });

    expect(auditLog.records).toHaveLength(2);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.announcement.create",
      actorUserId: officer.id,
      entityId: publicAnnouncement.id,
      entityType: "announcement",
      scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      beforeSummary: null
    });
    expect(auditLog.records[0]?.afterSummary).toMatchObject({
      pinned: true,
      status: "DRAFT",
      title: "New Formation",
      visibility: "ORGANIZATION_UNIT"
    });
    expect(auditLog.records[0]?.afterSummary).not.toHaveProperty("body");
    expect(auditLog.records[1]).toMatchObject({
      action: "admin.announcement.create",
      actorUserId: superAdmin.id,
      entityId: publicAnnouncement.id,
      entityType: "announcement",
      scopeOrganizationUnitId: null,
      beforeSummary: null
    });
  });

  it("blocks officers from creating or moving announcements outside assigned scope", async () => {
    await expect(
      service().createAdminAnnouncement(officer, {
        title: "Unscoped",
        body: "Public announcement.",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service().updateAdminAnnouncement(officer, scopedAnnouncement.id, {
        targetOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("updates scoped records and hides announcements outside the current admin scope", async () => {
    const auditLog = auditLogRecorder();
    const adminAnnouncementService = service(repository(), auditLog);

    await expect(
      adminAnnouncementService.updateAdminAnnouncement(officer, scopedAnnouncement.id, {
        status: "ARCHIVED"
      })
    ).resolves.toEqual({
      announcement: {
        ...scopedAnnouncement,
        status: "ARCHIVED",
        archivedAt: "2026-05-04T00:00:00.000Z"
      }
    });
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.announcement.update",
      actorUserId: officer.id,
      entityId: scopedAnnouncement.id,
      entityType: "announcement",
      scopeOrganizationUnitId: scopedAnnouncement.targetOrganizationUnitId
    });
    expect(auditLog.records[0]?.beforeSummary).toMatchObject({
      status: "DRAFT",
      visibility: "ORGANIZATION_UNIT"
    });
    expect(auditLog.records[0]?.afterSummary).toMatchObject({
      status: "ARCHIVED",
      visibility: "ORGANIZATION_UNIT"
    });

    await expect(
      service(repository({ updateResult: null })).updateAdminAnnouncement(
        officer,
        publicAnnouncement.id,
        {
          status: "ARCHIVED"
        }
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("dispatches audience-safe push metadata when an announcement is first published", async () => {
    const auditLog = auditLogRecorder();
    const pushRecipients = pushRecipientRepository(["token_1", "token_2"]);
    const pushAdapter = pushNotificationAdapter();
    const adminAnnouncementService = service(
      repository(),
      auditLog,
      pushRecipients,
      pushAdapter
    );

    await expect(
      adminAnnouncementService.updateAdminAnnouncement(officer, scopedAnnouncement.id, {
        status: "PUBLISHED"
      })
    ).resolves.toEqual({
      announcement: {
        ...scopedAnnouncement,
        status: "PUBLISHED",
        publishedAt: "2026-05-04T00:00:00.000Z"
      }
    });

    expect(pushRecipients.requests).toEqual([
      {
        ...scopedAnnouncement,
        status: "PUBLISHED",
        publishedAt: "2026-05-04T00:00:00.000Z"
      }
    ]);
    expect(pushAdapter.messages).toEqual([
      {
        tokenIds: ["token_1", "token_2"],
        category: "announcements",
        title: "New announcement",
        body: "Open the app to read the latest announcement.",
        deepLinkPath: `/announcements/${scopedAnnouncement.id}`,
        recordId: scopedAnnouncement.id
      }
    ]);
    expect(auditLog.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "admin.announcement.push_dispatch",
          actorUserId: officer.id,
          entityId: scopedAnnouncement.id,
          afterSummary: {
            category: "announcements",
            attempted: 2,
            accepted: 2,
            failed: 0
          }
        })
      ])
    );
  });

  it("does not redispatch push notifications for already-published announcements", async () => {
    const pushRecipients = pushRecipientRepository(["token_1"]);
    const adminAnnouncementService = service(
      repository({ beforeResult: { ...scopedAnnouncement, status: "PUBLISHED" } }),
      auditLogRecorder(),
      pushRecipients,
      pushNotificationAdapter()
    );

    await expect(
      adminAnnouncementService.updateAdminAnnouncement(officer, scopedAnnouncement.id, {
        title: "Retitled"
      })
    ).resolves.toEqual({
      announcement: {
        ...scopedAnnouncement,
        title: "Retitled"
      }
    });
    expect(pushRecipients.requests).toEqual([]);
  });
});

function service(
  repositoryOverride: AdminAnnouncementRepository = repository(),
  auditLog: TestAuditLog = auditLogRecorder(),
  pushRecipients: TestPushRecipientRepository = pushRecipientRepository(),
  pushAdapter: TestPushNotificationAdapter = pushNotificationAdapter()
): AdminAnnouncementService {
  return new AdminAnnouncementService(
    repositoryOverride,
    pushRecipients,
    pushAdapter,
    auditLog as unknown as AuditLogService
  );
}

function repository(
  options: {
    updateResult?: AdminAnnouncementSummary | null;
    beforeResult?: AdminAnnouncementSummary | null;
  } = {}
): AdminAnnouncementRepository {
  return {
    listManageableAnnouncements: () =>
      Promise.resolve([publicAnnouncement, scopedAnnouncement]),
    createAnnouncement: (data) =>
      Promise.resolve({
        ...publicAnnouncement,
        ...data,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        pinned: data.pinned ?? false,
        publishedAt: data.status === "PUBLISHED" ? "2026-05-04T00:00:00.000Z" : null,
        archivedAt: data.status === "ARCHIVED" ? "2026-05-04T00:00:00.000Z" : null
      }),
    updateAnnouncement: (_id, data) => {
      if (options.updateResult !== undefined) {
        return Promise.resolve(options.updateResult);
      }

      const updated: AdminAnnouncementSummary = { ...scopedAnnouncement };

      if (data.title !== undefined) updated.title = data.title;
      if (data.body !== undefined) updated.body = data.body;
      if (data.visibility !== undefined) updated.visibility = data.visibility;
      if (data.targetOrganizationUnitId !== undefined) {
        updated.targetOrganizationUnitId = data.targetOrganizationUnitId;
      }
      if (data.pinned !== undefined) updated.pinned = data.pinned;
      if (data.status !== undefined) updated.status = data.status;
      if (data.status === "PUBLISHED") updated.publishedAt = "2026-05-04T00:00:00.000Z";
      if (data.status === "ARCHIVED") updated.archivedAt = "2026-05-04T00:00:00.000Z";

      return Promise.resolve(updated);
    },
    findAnnouncementForAudit: (id) => {
      if (options.beforeResult !== undefined) {
        return Promise.resolve(options.beforeResult);
      }
      if (id === scopedAnnouncement.id) {
        return Promise.resolve(scopedAnnouncement);
      }
      if (id === publicAnnouncement.id) {
        return Promise.resolve(publicAnnouncement);
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

type TestPushRecipientRepository = AnnouncementPushRecipientRepository & {
  requests: AdminAnnouncementSummary[];
};

function pushRecipientRepository(
  tokenIds: string[] = []
): TestPushRecipientRepository {
  const requests: AdminAnnouncementSummary[] = [];

  return {
    requests,
    findRecipientTokenIds: (announcement) => {
      requests.push(announcement as AdminAnnouncementSummary);

      return Promise.resolve(tokenIds);
    }
  };
}

type TestPushNotificationAdapter = PushNotificationAdapter & {
  messages: PushNotificationMessage[];
};

function pushNotificationAdapter(): TestPushNotificationAdapter {
  const messages: PushNotificationMessage[] = [];

  return {
    messages,
    dispatch: (message) => {
      messages.push(message);

      return Promise.resolve({
        attempted: message.tokenIds.length,
        accepted: message.tokenIds.length,
        failed: 0
      });
    }
  };
}
