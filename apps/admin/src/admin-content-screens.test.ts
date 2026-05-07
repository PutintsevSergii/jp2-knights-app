import { describe, expect, it } from "vitest";
import type {
  AdminAnnouncementListResponseDto,
  AdminEventListResponseDto,
  AdminPrayerListResponseDto
} from "@jp2/shared-validation";
import {
  adminContentTheme,
  buildAdminAnnouncementEditorScreen,
  buildAdminAnnouncementListScreen,
  buildAdminEventListScreen,
  buildAdminPrayerListScreen
} from "./admin-content-screens.js";

const prayerResponse: AdminPrayerListResponseDto = {
  prayers: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      categoryId: null,
      title: "Morning Offering",
      body: "A public morning prayer.",
      language: "en",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    }
  ]
};

const eventResponse: AdminEventListResponseDto = {
  events: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      description: "Public introduction evening.",
      type: "open-evening",
      startAt: "2026-06-10T18:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      status: "published",
      publishedAt: "2026-05-04T00:00:00.000Z",
      cancelledAt: null,
      archivedAt: null
    }
  ]
};

const announcementResponse: AdminAnnouncementListResponseDto = {
  announcements: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      title: "Service Schedule Update",
      body: "The June service rota has been updated.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      pinned: true,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    }
  ]
};

describe("admin content screen models", () => {
  it("builds a writable prayer list workflow from admin DTOs", () => {
    const screen = buildAdminPrayerListScreen({
      state: "ready",
      response: prayerResponse,
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminPrayerList",
      state: "ready",
      title: "Prayers",
      demoChromeVisible: false,
      theme: adminContentTheme
    });
    expect(screen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
    expect(screen.rows).toEqual([
      expect.objectContaining({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Morning Offering",
        primaryMeta: "EN / Public",
        secondaryMeta: "Global content",
        status: "DRAFT",
        visibility: "PUBLIC",
        actions: [
          expect.objectContaining({ id: "edit" }),
          expect.objectContaining({ id: "publish" }),
          expect.objectContaining({ id: "archive" })
        ]
      })
    ]);
  });

  it("builds a scoped event workflow with cancel/archive actions for published events", () => {
    const screen = buildAdminEventListScreen({
      state: "ready",
      response: eventResponse,
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen.rows[0]).toMatchObject({
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      primaryMeta: "open-evening / 2026-06-10T18:00:00.000Z",
      secondaryMeta: "Riga",
      status: "published",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "edit",
      "cancel",
      "archive"
    ]);
  });

  it("keeps read-only admin lists free of mutation actions", () => {
    const screen = buildAdminEventListScreen({
      state: "ready",
      response: eventResponse,
      runtimeMode: "api",
      canWrite: false
    });

    expect(screen.actions.map((action) => action.id)).toEqual(["refresh"]);
    expect(screen.rows[0]?.actions).toEqual([]);
  });

  it("builds a writable announcement list without chat or read-receipt actions", () => {
    const screen = buildAdminAnnouncementListScreen({
      state: "ready",
      response: announcementResponse,
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminAnnouncementList",
      state: "ready",
      title: "Announcements",
      demoChromeVisible: false
    });
    expect(screen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
    expect(screen.rows[0]).toMatchObject({
      id: "55555555-5555-4555-8555-555555555555",
      title: "Service Schedule Update",
      primaryMeta: "Pinned / Organization Unit",
      secondaryMeta: "Scoped to 11111111-1111-4111-8111-111111111111",
      status: "DRAFT",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "edit",
      "publish",
      "archive"
    ]);
  });

  it("builds announcement create, edit, and readonly editor models", () => {
    const createScreen = buildAdminAnnouncementEditorScreen({
      state: "ready",
      runtimeMode: "api",
      canWrite: true,
      mode: "create"
    });
    const editScreen = buildAdminAnnouncementEditorScreen({
      state: "ready",
      announcement: announcementResponse.announcements[0],
      runtimeMode: "api",
      canWrite: true,
      mode: "edit"
    });
    const readonlyScreen = buildAdminAnnouncementEditorScreen({
      state: "ready",
      announcement: announcementResponse.announcements[0],
      runtimeMode: "api",
      canWrite: false,
      mode: "edit"
    });

    expect(createScreen).toMatchObject({
      route: "AdminAnnouncementEditor",
      mode: "create",
      title: "Create Announcement",
      announcementId: null
    });
    expect(createScreen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
    expect(editScreen).toMatchObject({
      route: "AdminAnnouncementEditor",
      mode: "edit",
      title: "Announcement: Service Schedule Update",
      announcementId: "55555555-5555-4555-8555-555555555555"
    });
    expect(editScreen.fields.find((field) => field.name === "body")).toMatchObject({
      value: "The June service rota has been updated.",
      readOnly: false
    });
    expect(editScreen.actions.map((action) => action.id)).toEqual([
      "edit",
      "refresh",
      "publish",
      "archive"
    ]);
    expect(readonlyScreen).toMatchObject({
      mode: "readonly",
      actions: [expect.objectContaining({ id: "refresh" })]
    });
    expect(readonlyScreen.fields.every((field) => field.readOnly)).toBe(true);
  });

  it("maps empty, forbidden, and demo states into stable screen copy", () => {
    expect(
      buildAdminPrayerListScreen({
        state: "ready",
        response: { prayers: [] },
        runtimeMode: "demo",
        canWrite: true
      })
    ).toMatchObject({
      route: "AdminPrayerList",
      state: "empty",
      demoChromeVisible: true
    });
    expect(
      buildAdminAnnouncementListScreen({
        state: "ready",
        response: { announcements: [] },
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      route: "AdminAnnouncementList",
      state: "empty",
      actions: [expect.objectContaining({ id: "refresh" })]
    });
    expect(
      buildAdminAnnouncementEditorScreen({
        state: "ready",
        runtimeMode: "api",
        canWrite: true,
        mode: "edit"
      })
    ).toMatchObject({
      route: "AdminAnnouncementEditor",
      state: "empty",
      actions: [expect.objectContaining({ id: "refresh" })]
    });
    expect(
      buildAdminEventListScreen({
        state: "forbidden",
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      route: "AdminEventList",
      state: "forbidden",
      rows: [],
      actions: []
    });
  });
});
