import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { adminContentShellRoutes, renderAdminContentRoute } from "./admin-content-shell.js";

const prayerPayload = {
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
      approvedAt: null,
      publishedAt: null,
      archivedAt: null
    }
  ]
};

const approvedPrayerPayload = {
  prayers: [
    {
      ...prayerPayload.prayers[0],
      status: "APPROVED",
      approvedAt: "2026-06-03T10:00:00.000Z"
    }
  ]
};

const eventPayload = {
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
      status: "draft",
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};

const announcementPayload = {
  announcements: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      title: "Service Schedule Update",
      body: "The June service rota has been updated.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      pinned: true,
      status: "DRAFT",
      approvedAt: null,
      publishedAt: null,
      archivedAt: null
    }
  ]
};

const silentPrayerPayload = {
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
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};

describe("admin content shell routes", () => {
  it("exposes prayer, event, and announcement shell routes", () => {
    expect(adminContentShellRoutes).toEqual([
      {
        path: "/admin/prayers",
        label: "Prayers",
        screenRoute: "AdminPrayerList"
      },
      {
        path: "/admin/events",
        label: "Events",
        screenRoute: "AdminEventList"
      },
      {
        path: "/admin/silent-prayer-events",
        label: "Silent Prayer",
        screenRoute: "AdminSilentPrayerList"
      },
      {
        path: "/admin/announcements",
        label: "Announcements",
        screenRoute: "AdminAnnouncementList"
      }
    ]);
  });

  it("renders the prayer route through the API client and full HTML document shell", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(prayerPayload)
      })
    );

    const rendered = await renderAdminContentRoute({
      path: "/admin/prayers",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/prayers",
      route: "AdminPrayerList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<!doctype html>");
    expect(rendered.document).toContain("<title>Admin Prayers</title>");
    expect(rendered.document).toContain("Morning Offering");
    expect(rendered.document).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders demo events without a backend fetch and marks demo chrome", async () => {
    const fetchImpl = vi.fn();
    const rendered = await renderAdminContentRoute({
      path: "/admin/events",
      runtimeMode: "demo",
      canWrite: false,
      fetchImpl
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(rendered).toMatchObject({
      path: "/admin/events",
      route: "AdminEventList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<title>Admin Events</title>");
    expect(rendered.document).toContain("Open Evening");
    expect(rendered.document).toContain("Demo");
    expect(rendered.document).not.toContain('data-action="create"');
  });

  it("renders the announcement route through the API client", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(announcementPayload)
      })
    );

    const rendered = await renderAdminContentRoute({
      path: "/admin/announcements",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/announcements",
      route: "AdminAnnouncementList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<title>Admin Announcements</title>");
    expect(rendered.document).toContain("Service Schedule Update");
    expect(rendered.document).toContain("Pinned / Organization Unit");
    expect(rendered.document).toContain('data-target-route="AdminAnnouncementEditor"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/announcements", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders the silent-prayer route through the API client", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(silentPrayerPayload)
      })
    );

    const rendered = await renderAdminContentRoute({
      path: "/admin/silent-prayer-events",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      path: "/admin/silent-prayer-events",
      route: "AdminSilentPrayerList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("<title>Admin Silent Prayer Events</title>");
    expect(rendered.document).toContain("Evening Silent Prayer");
    expect(rendered.document).toContain('data-target-route="AdminSilentPrayerEditor"');
    expect(rendered.document).not.toContain("guest-");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/silent-prayer-events",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("renders announcement create and detail editor forms", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(announcementPayload)
      })
    );

    const createRendered = await renderAdminContentRoute({
      path: "/admin/announcements/new",
      runtimeMode: "api",
      canWrite: true,
      fetchImpl
    });
    const detailRendered = await renderAdminContentRoute({
      path: "/admin/announcements/55555555-5555-4555-8555-555555555555",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(createRendered).toMatchObject({
      path: "/admin/announcements/new",
      route: "AdminAnnouncementEditor",
      state: "ready",
      statusCode: 200
    });
    expect(createRendered.document).toContain("Create Announcement");
    expect(createRendered.document).toContain(
      'name="visibility" required value="ORGANIZATION_UNIT"'
    );
    expect(detailRendered).toMatchObject({
      path: "/admin/announcements/55555555-5555-4555-8555-555555555555",
      route: "AdminAnnouncementEditor",
      state: "ready",
      statusCode: 200
    });
    expect(detailRendered.document).toContain("Announcement: Service Schedule Update");
    expect(detailRendered.document).toContain(
      'data-content-id="55555555-5555-4555-8555-555555555555"'
    );
    expect(detailRendered.document).toContain(
      '<textarea class="admin-content__input admin-content__textarea" name="body" required>The June service rota has been updated.</textarea>'
    );
    expect(detailRendered.document).toContain('data-action="approve"');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/announcements", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders prayer create and detail editor forms with approval before publish", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(approvedPrayerPayload)
      })
    );

    const createRendered = await renderAdminContentRoute({
      path: "/admin/prayers/new",
      runtimeMode: "api",
      canWrite: true,
      fetchImpl
    });
    const detailRendered = await renderAdminContentRoute({
      path: "/admin/prayers/33333333-3333-4333-8333-333333333333",
      runtimeMode: "api",
      canWrite: true,
      authToken: "token_1",
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    expect(createRendered).toMatchObject({
      path: "/admin/prayers/new",
      route: "AdminPrayerEditor",
      state: "ready",
      statusCode: 200
    });
    expect(createRendered.document).toContain("Create Prayer");
    expect(detailRendered).toMatchObject({
      path: "/admin/prayers/33333333-3333-4333-8333-333333333333",
      route: "AdminPrayerEditor",
      state: "ready",
      statusCode: 200
    });
    expect(detailRendered.document).toContain("Prayer: Morning Offering");
    expect(detailRendered.document).toContain(
      'data-content-id="33333333-3333-4333-8333-333333333333"'
    );
    expect(detailRendered.document).toContain('data-action="publish"');
    expect(detailRendered.document).not.toContain('data-action="approve"');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders event and silent-prayer detail editors without participant or attendee actions", async () => {
    const eventFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(eventPayload)
      })
    );
    const silentPrayerFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(silentPrayerPayload)
      })
    );

    const eventRendered = await renderAdminContentRoute({
      path: "/admin/events/44444444-4444-4444-8444-444444444444",
      runtimeMode: "api",
      canWrite: true,
      fetchImpl: eventFetch
    });
    const silentPrayerRendered = await renderAdminContentRoute({
      path: "/admin/silent-prayer-events/66666666-6666-4666-8666-666666666667",
      runtimeMode: "api",
      canWrite: true,
      fetchImpl: silentPrayerFetch
    });

    expect(eventRendered).toMatchObject({
      route: "AdminEventEditor",
      state: "ready",
      statusCode: 200
    });
    expect(eventRendered.document).toContain("Event: Open Evening");
    expect(eventRendered.document).toContain('data-action="approve"');
    expect(eventRendered.document).not.toContain("Attendees");
    expect(silentPrayerRendered).toMatchObject({
      route: "AdminSilentPrayerEditor",
      state: "ready",
      statusCode: 200
    });
    expect(silentPrayerRendered.document).toContain("Silent Prayer Event: Evening Silent Prayer");
    expect(silentPrayerRendered.document).toContain('data-action="approve"');
    expect(silentPrayerRendered.document).not.toContain("Participants");
  });

  it("keeps announcement create forbidden for read-only admins and returns 404 for misses", async () => {
    await expect(
      renderAdminContentRoute({
        path: "/admin/announcements/new",
        runtimeMode: "api",
        canWrite: false
      })
    ).resolves.toMatchObject({
      route: "AdminAnnouncementEditor",
      state: "forbidden",
      statusCode: 403
    });
    await expect(
      renderAdminContentRoute({
        path: "/admin/announcements/99999999-9999-4999-8999-999999999999",
        runtimeMode: "demo",
        canWrite: true
      })
    ).resolves.toMatchObject({
      route: "AdminAnnouncementEditor",
      state: "empty",
      statusCode: 404
    });
  });

  it("maps API failures into rendered route status codes", async () => {
    await expect(
      renderAdminContentRoute({
        path: "/admin/events",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
    await expect(
      renderAdminContentRoute({
        path: "/admin/events",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () => {
          throw new TypeError("Network request failed");
        }
      })
    ).resolves.toMatchObject({
      state: "offline",
      statusCode: 503
    });
  });
});
