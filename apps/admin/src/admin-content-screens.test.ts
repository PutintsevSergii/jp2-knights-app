import { describe, expect, it } from "vitest";
import type { AdminEventListResponseDto, AdminPrayerListResponseDto } from "@jp2/shared-validation";
import {
  adminContentTheme,
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
