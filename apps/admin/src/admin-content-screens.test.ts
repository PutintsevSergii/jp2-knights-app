import { describe, expect, it } from "vitest";
import type {
  AdminAnnouncementListResponseDto,
  AdminEventListResponseDto,
  AdminPrayerListResponseDto,
  AdminSilentPrayerEventListResponseDto
} from "@jp2/shared-validation";
import {
  adminContentTheme,
  approvalWarningForAdminContent,
  buildAdminContentEditorScreen,
  buildAdminAnnouncementListScreen,
  buildAdminEventListScreen,
  buildAdminPrayerListScreen,
  buildAdminSilentPrayerListScreen
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
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
      approvedByUserId: "99999999-9999-4999-8999-999999999999",
      publishedByUserId: "99999999-9999-4999-8999-999999999999",
      approvedAt: "2026-05-03T23:55:00.000Z",
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
      publishedAt: null,
      archivedAt: null
    }
  ]
};

const silentPrayerResponse: AdminSilentPrayerEventListResponseDto = {
  silentPrayerEvents: [
    {
      id: "66666666-6666-4666-8666-666666666667",
      title: "Evening Silent Prayer",
      intention: "For pilot families and brothers.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      status: "DRAFT",
      startsAt: "2026-06-12T18:00:00.000Z",
      endsAt: "2026-06-12T18:30:00.000Z",
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};

describe("admin content screen models", () => {
  it("flags only published content rows that lack approval metadata", () => {
    expect(
      approvalWarningForAdminContent({
        status: "PUBLISHED",
        approvedAt: null
      })
    ).toBe(
      "Published without approval metadata. Archive or correct approval evidence before normal lifecycle actions."
    );
    expect(
      approvalWarningForAdminContent({
        status: "published",
        approvedAt: "2026-05-04T00:00:00.000Z"
      })
    ).toBeUndefined();
    expect(
      approvalWarningForAdminContent({
        status: "APPROVED",
        approvedAt: null
      })
    ).toBeUndefined();
  });

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
          expect.objectContaining({ id: "approve" }),
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
      "approve",
      "archive"
    ]);
  });

  it("builds a writable silent-prayer list without participant identity actions", () => {
    const screen = buildAdminSilentPrayerListScreen({
      state: "ready",
      response: silentPrayerResponse,
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminSilentPrayerList",
      state: "ready",
      title: "Silent Prayer Events",
      demoChromeVisible: false
    });
    expect(screen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
    expect(screen.rows[0]).toMatchObject({
      id: "66666666-6666-4666-8666-666666666667",
      title: "Evening Silent Prayer",
      primaryMeta: "Organization Unit / 2026-06-12T18:00:00.000Z",
      secondaryMeta: "Ends 2026-06-12T18:30:00.000Z",
      status: "DRAFT",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "edit",
      "approve",
      "archive"
    ]);
    expect(screen.rows[0]?.actions.map((action) => action.label)).not.toContain("Participants");
  });

  it("shows publish only after approval metadata is present", () => {
    const approvedPrayerResponse: AdminPrayerListResponseDto = {
      prayers: [
        {
          ...prayerResponse.prayers[0]!,
          status: "APPROVED",
          approvedAt: "2026-05-04T00:00:00.000Z"
        }
      ]
    };
    const approvedEventResponse: AdminEventListResponseDto = {
      events: [
        {
          ...eventResponse.events[0]!,
          status: "draft",
          approvedAt: "2026-05-04T00:00:00.000Z",
          publishedAt: null
        }
      ]
    };

    expect(
      buildAdminPrayerListScreen({
        state: "ready",
        response: approvedPrayerResponse,
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.actions.map((action) => action.id)
    ).toEqual(["edit", "publish", "archive"]);
    expect(
      buildAdminEventListScreen({
        state: "ready",
        response: approvedEventResponse,
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.actions.map((action) => action.id)
    ).toEqual(["edit", "publish", "archive"]);
    expect(
      buildAdminSilentPrayerListScreen({
        state: "ready",
        response: {
          silentPrayerEvents: [
            {
              ...silentPrayerResponse.silentPrayerEvents[0]!,
              status: "APPROVED",
              approvedAt: "2026-05-04T00:00:00.000Z"
            }
          ]
        },
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.actions.map((action) => action.id)
    ).toEqual(["edit", "publish", "archive"]);
  });

  it("does not show normal cancel or publish actions for legacy published rows without approval evidence", () => {
    const unapprovedPublishedEventResponse: AdminEventListResponseDto = {
      events: [
        {
          ...eventResponse.events[0]!,
          approvedAt: null,
          approvedByUserId: null,
          publishedByUserId: "99999999-9999-4999-8999-999999999999",
          status: "published"
        }
      ]
    };
    const unapprovedPublishedSilentPrayerResponse: AdminSilentPrayerEventListResponseDto = {
      silentPrayerEvents: [
        {
          ...silentPrayerResponse.silentPrayerEvents[0]!,
          approvedAt: null,
          approvedByUserId: null,
          publishedByUserId: "99999999-9999-4999-8999-999999999999",
          status: "PUBLISHED",
          publishedAt: "2026-06-12T17:55:00.000Z"
        }
      ]
    };

    expect(
      buildAdminEventListScreen({
        state: "ready",
        response: unapprovedPublishedEventResponse,
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.actions.map((action) => action.id)
    ).toEqual(["edit", "archive"]);
    expect(
      buildAdminEventListScreen({
        state: "ready",
        response: unapprovedPublishedEventResponse,
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.approvalWarning
    ).toBe(
      "Published without approval metadata. Archive or correct approval evidence before normal lifecycle actions."
    );
    expect(
      buildAdminSilentPrayerListScreen({
        state: "ready",
        response: unapprovedPublishedSilentPrayerResponse,
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.actions.map((action) => action.id)
    ).toEqual(["edit", "archive"]);
    expect(
      buildAdminSilentPrayerListScreen({
        state: "ready",
        response: unapprovedPublishedSilentPrayerResponse,
        runtimeMode: "api",
        canWrite: true
      }).rows[0]?.approvalWarning
    ).toBe(
      "Published without approval metadata. Archive or correct approval evidence before normal lifecycle actions."
    );
  });

  it("builds content create, edit, and readonly editor models", () => {
    const createScreen = buildAdminContentEditorScreen({
      kind: "announcement",
      state: "ready",
      runtimeMode: "api",
      canWrite: true,
      mode: "create"
    });
    const editScreen = buildAdminContentEditorScreen({
      kind: "announcement",
      state: "ready",
      item: announcementResponse.announcements[0],
      runtimeMode: "api",
      canWrite: true,
      mode: "edit"
    });
    const readonlyScreen = buildAdminContentEditorScreen({
      kind: "announcement",
      state: "ready",
      item: announcementResponse.announcements[0],
      runtimeMode: "api",
      canWrite: false,
      mode: "edit"
    });
    const approvedPrayerScreen = buildAdminContentEditorScreen({
      kind: "prayer",
      state: "ready",
      item: {
        ...prayerResponse.prayers[0]!,
        status: "APPROVED",
        approvedByUserId: "99999999-9999-4999-8999-999999999999",
        approvedAt: "2026-06-03T10:00:00.000Z"
      },
      runtimeMode: "api",
      canWrite: true,
      mode: "edit"
    });

    expect(createScreen).toMatchObject({
      route: "AdminAnnouncementEditor",
      mode: "create",
      title: "Create Announcement",
      contentId: null
    });
    expect(createScreen.actions.map((action) => action.id)).toEqual(["create", "refresh"]);
    expect(editScreen).toMatchObject({
      route: "AdminAnnouncementEditor",
      mode: "edit",
      title: "Announcement: Service Schedule Update",
      contentId: "55555555-5555-4555-8555-555555555555"
    });
    expect(editScreen.fields.find((field) => field.name === "body")).toMatchObject({
      value: "The June service rota has been updated.",
      readOnly: false
    });
    expect(editScreen.actions.map((action) => action.id)).toEqual([
      "edit",
      "refresh",
      "approve",
      "archive"
    ]);
    expect(readonlyScreen).toMatchObject({
      mode: "readonly",
      actions: [expect.objectContaining({ id: "refresh" })]
    });
    expect(readonlyScreen.fields.every((field) => field.readOnly)).toBe(true);
    expect(approvedPrayerScreen).toMatchObject({
      route: "AdminPrayerEditor",
      mode: "edit",
      title: "Prayer: Morning Offering",
      contentId: "33333333-3333-4333-8333-333333333333"
    });
    expect(approvedPrayerScreen.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "approvedByUserId",
          value: "99999999-9999-4999-8999-999999999999",
          readOnly: true
        }),
        expect.objectContaining({
          name: "publishedByUserId",
          value: "",
          readOnly: true
        })
      ])
    );
    expect(approvedPrayerScreen.actions.map((action) => action.id)).toEqual([
      "edit",
      "refresh",
      "publish",
      "archive"
    ]);
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
      buildAdminContentEditorScreen({
        kind: "announcement",
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
    expect(
      buildAdminSilentPrayerListScreen({
        state: "ready",
        response: { silentPrayerEvents: [] },
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      route: "AdminSilentPrayerList",
      state: "empty",
      actions: [expect.objectContaining({ id: "refresh" })]
    });
  });
});
