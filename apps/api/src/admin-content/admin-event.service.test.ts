import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminEventRepository } from "./admin-event.repository.js";
import { AdminEventService } from "./admin-event.service.js";
import type { AdminEventSummary } from "./admin-event.types.js";

const publicEvent: AdminEventSummary = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  description: "Public introduction evening.",
  type: "open-evening",
  startAt: "2026-05-10T18:00:00.000Z",
  endAt: null,
  locationLabel: "Riga",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  status: "draft",
  publishedAt: null,
  cancelledAt: null,
  archivedAt: null
};

const scopedEvent: AdminEventSummary = {
  ...publicEvent,
  id: "55555555-5555-4555-8555-555555555555",
  title: "Scoped Retreat",
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

describe("AdminEventService", () => {
  it("lists events for officers using their assigned organization-unit scope", async () => {
    await expect(service().listAdminEvents(officer)).resolves.toEqual({
      events: [publicEvent, scopedEvent]
    });
  });

  it("allows super admins to list all manageable events", async () => {
    await expect(service().listAdminEvents(superAdmin)).resolves.toEqual({
      events: [publicEvent, scopedEvent]
    });
  });

  it("blocks non-admin principals from admin event listing", async () => {
    await expect(service().listAdminEvents(brother)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows scoped officers and super admins to create event records", async () => {
    await expect(
      service().createAdminEvent(officer, {
        title: "New Retreat",
        description: null,
        type: "retreat",
        startAt: "2026-05-10T18:00:00.000Z",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "draft"
      })
    ).resolves.toEqual({
      event: {
        ...publicEvent,
        title: "New Retreat",
        description: null,
        locationLabel: null,
        type: "retreat",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
      }
    });
    await expect(
      service().createAdminEvent(superAdmin, {
        title: "Global Event",
        type: "open-evening",
        startAt: "2026-05-10T18:00:00.000Z",
        visibility: "PUBLIC",
        status: "draft"
      })
    ).resolves.toEqual({
      event: {
        ...publicEvent,
        title: "Global Event",
        description: null,
        locationLabel: null,
        visibility: "PUBLIC"
      }
    });
  });

  it("blocks officers from creating or moving events outside assigned scope", async () => {
    await expect(
      service().createAdminEvent(officer, {
        title: "Unscoped",
        type: "open-evening",
        startAt: "2026-05-10T18:00:00.000Z",
        visibility: "PUBLIC",
        status: "draft"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service().updateAdminEvent(officer, scopedEvent.id, {
        targetOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("updates scoped records and hides events outside the current admin scope", async () => {
    await expect(
      service().updateAdminEvent(officer, scopedEvent.id, {
        status: "cancelled"
      })
    ).resolves.toEqual({
      event: {
        ...scopedEvent,
        status: "cancelled",
        cancelledAt: "2026-05-04T00:00:00.000Z"
      }
    });
    await expect(
      service(repository({ updateResult: null })).updateAdminEvent(officer, publicEvent.id, {
        status: "archived"
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function service(repositoryOverride: AdminEventRepository = repository()): AdminEventService {
  return new AdminEventService(repositoryOverride);
}

function repository(options: { updateResult?: AdminEventSummary | null } = {}): AdminEventRepository {
  return {
    listManageableEvents: () => Promise.resolve([publicEvent, scopedEvent]),
    createEvent: (data) =>
      Promise.resolve({
        ...publicEvent,
        ...data,
        description: data.description ?? null,
        endAt: data.endAt ?? null,
        locationLabel: data.locationLabel ?? null,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        publishedAt: data.status === "published" ? "2026-05-04T00:00:00.000Z" : null,
        cancelledAt: data.status === "cancelled" ? "2026-05-04T00:00:00.000Z" : null,
        archivedAt: data.status === "archived" ? "2026-05-04T00:00:00.000Z" : null
      }),
    updateEvent: (_id, data) => {
      if (options.updateResult !== undefined) {
        return Promise.resolve(options.updateResult);
      }

      const updated: AdminEventSummary = { ...scopedEvent };

      if (data.title !== undefined) updated.title = data.title;
      if (data.description !== undefined) updated.description = data.description;
      if (data.type !== undefined) updated.type = data.type;
      if (data.startAt !== undefined) updated.startAt = data.startAt;
      if (data.endAt !== undefined) updated.endAt = data.endAt;
      if (data.locationLabel !== undefined) updated.locationLabel = data.locationLabel;
      if (data.visibility !== undefined) updated.visibility = data.visibility;
      if (data.targetOrganizationUnitId !== undefined) {
        updated.targetOrganizationUnitId = data.targetOrganizationUnitId;
      }
      if (data.status !== undefined) updated.status = data.status;
      if (data.status === "cancelled") updated.cancelledAt = "2026-05-04T00:00:00.000Z";
      if (data.status === "archived") updated.archivedAt = "2026-05-04T00:00:00.000Z";

      return Promise.resolve(updated);
    }
  };
}
