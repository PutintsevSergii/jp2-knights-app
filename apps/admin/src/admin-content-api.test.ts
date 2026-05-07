import { describe, expect, it, vi } from "vitest";
import {
  AdminContentHttpError,
  adminContentFailureState,
  buildAdminContentUrl,
  createAdminAnnouncement,
  createAdminEvent,
  fetchAdminAnnouncements,
  fetchAdminEvents,
  fetchAdminPrayers,
  updateAdminAnnouncement,
  updateAdminPrayer
} from "./admin-content-api.js";

const prayersPayload = {
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

const eventsPayload = {
  events: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      description: "Public introduction evening.",
      type: "open-evening",
      startAt: "2026-06-10T18:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "FAMILY_OPEN",
      targetOrganizationUnitId: null,
      status: "draft",
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};

const announcementsPayload = {
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

describe("admin content API client", () => {
  it("builds admin content URLs under the API prefix", () => {
    expect(buildAdminContentUrl("admin/prayers", "https://api.example.test")).toBe(
      "https://api.example.test/admin/prayers"
    );
  });

  it("fetches and validates admin prayer, event, and announcement lists", async () => {
    const prayerFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(prayersPayload)
      })
    );
    const eventFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(eventsPayload)
      })
    );
    const announcementFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(announcementsPayload)
      })
    );

    await expect(
      fetchAdminPrayers({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: prayerFetch
      })
    ).resolves.toEqual(prayersPayload);
    await expect(
      fetchAdminEvents({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: eventFetch
      })
    ).resolves.toEqual(eventsPayload);
    await expect(
      fetchAdminAnnouncements({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: announcementFetch
      })
    ).resolves.toEqual(announcementsPayload);

    expect(prayerFetch).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
    expect(announcementFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/announcements",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("sends create and update mutations with JSON bodies", async () => {
    const createFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ event: eventsPayload.events[0] })
      })
    );
    const updateFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ prayer: { ...prayersPayload.prayers[0], status: "PUBLISHED" } })
      })
    );
    const createAnnouncementFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ announcement: announcementsPayload.announcements[0] })
      })
    );
    const updateAnnouncementFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            announcement: { ...announcementsPayload.announcements[0], status: "PUBLISHED" }
          })
      })
    );

    await createAdminEvent(
      {
        title: "Open Evening",
        type: "open-evening",
        startAt: "2026-06-10T18:00:00.000Z",
        visibility: "PUBLIC",
        status: "draft"
      },
      { baseUrl: "https://api.example.test", fetchImpl: createFetch }
    );
    await updateAdminPrayer(
      "33333333-3333-4333-8333-333333333333",
      { status: "PUBLISHED" },
      { baseUrl: "https://api.example.test", fetchImpl: updateFetch }
    );
    await createAdminAnnouncement(
      {
        title: "Service Schedule Update",
        body: "The June service rota has been updated.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        pinned: true,
        status: "DRAFT"
      },
      { baseUrl: "https://api.example.test", fetchImpl: createAnnouncementFetch }
    );
    await updateAdminAnnouncement(
      "55555555-5555-4555-8555-555555555555",
      { status: "PUBLISHED" },
      { baseUrl: "https://api.example.test", fetchImpl: updateAnnouncementFetch }
    );

    expect(createFetch).toHaveBeenCalledWith("https://api.example.test/admin/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Open Evening",
        type: "open-evening",
        startAt: "2026-06-10T18:00:00.000Z",
        visibility: "PUBLIC",
        status: "draft"
      })
    });
    expect(updateFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/prayers/33333333-3333-4333-8333-333333333333",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" })
      }
    );
    expect(createAnnouncementFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/announcements",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Service Schedule Update",
          body: "The June service rota has been updated.",
          visibility: "ORGANIZATION_UNIT",
          targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
          pinned: true,
          status: "DRAFT"
        })
      }
    );
    expect(updateAnnouncementFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/announcements/55555555-5555-4555-8555-555555555555",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" })
      }
    );
  });

  it("rejects invalid admin content and maps failures into screen states", async () => {
    const invalidFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            prayers: [{ ...prayersPayload.prayers[0], visibility: "UNKNOWN" }]
          })
      })
    );
    const forbiddenFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      })
    );

    await expect(fetchAdminPrayers({ fetchImpl: invalidFetch })).rejects.toThrow();
    await expect(fetchAdminEvents({ fetchImpl: forbiddenFetch })).rejects.toBeInstanceOf(
      AdminContentHttpError
    );
    expect(adminContentFailureState(new AdminContentHttpError(403))).toBe("forbidden");
    expect(adminContentFailureState(new AdminContentHttpError(500))).toBe("error");
    expect(adminContentFailureState(new TypeError("Network request failed"))).toBe("offline");
  });
});
