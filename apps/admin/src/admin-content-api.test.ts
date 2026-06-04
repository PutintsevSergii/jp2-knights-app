import { describe, expect, it, vi } from "vitest";
import {
  AdminContentHttpError,
  adminContentFailureState,
  approveAdminAnnouncement,
  approveAdminEvent,
  approveAdminPrayer,
  approveAdminSilentPrayerEvent,
  archiveAdminAnnouncement,
  archiveAdminEvent,
  archiveAdminPrayer,
  archiveAdminSilentPrayerEvent,
  buildAdminContentUrl,
  cancelAdminEvent,
  cancelAdminSilentPrayerEvent,
  createAdminAnnouncement,
  createAdminEvent,
  createAdminSilentPrayerEvent,
  fetchAdminAnnouncements,
  fetchAdminEvents,
  fetchAdminPrayers,
  fetchAdminSilentPrayerEvents,
  publishAdminAnnouncement,
  publishAdminEvent,
  publishAdminPrayer,
  publishAdminSilentPrayerEvent,
  updateAdminAnnouncement,
  updateAdminPrayer,
  updateAdminSilentPrayerEvent
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
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
      approvedByUserId: null,
      publishedByUserId: null,
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
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

  it("fetches and validates admin prayer, event, announcement, and silent-prayer lists", async () => {
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
    const silentPrayerFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(silentPrayerPayload)
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
    await expect(
      fetchAdminSilentPrayerEvents({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: silentPrayerFetch
      })
    ).resolves.toEqual(silentPrayerPayload);

    expect(prayerFetch).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
    expect(announcementFetch).toHaveBeenCalledWith("https://api.example.test/admin/announcements", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
    expect(silentPrayerFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/silent-prayer-events",
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
        json: () =>
          Promise.resolve({ prayer: { ...prayersPayload.prayers[0], status: "PUBLISHED" } })
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
    const createSilentPrayerFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ silentPrayerEvent: silentPrayerPayload.silentPrayerEvents[0] })
      })
    );
    const updateSilentPrayerFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            silentPrayerEvent: {
              ...silentPrayerPayload.silentPrayerEvents[0],
              status: "PUBLISHED"
            }
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
    await createAdminSilentPrayerEvent(
      {
        title: "Evening Silent Prayer",
        intention: "For pilot families and brothers.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        status: "DRAFT",
        startsAt: "2026-06-12T18:00:00.000Z",
        endsAt: "2026-06-12T18:30:00.000Z"
      },
      { baseUrl: "https://api.example.test", fetchImpl: createSilentPrayerFetch }
    );
    await updateAdminSilentPrayerEvent(
      "66666666-6666-4666-8666-666666666667",
      { status: "PUBLISHED" },
      { baseUrl: "https://api.example.test", fetchImpl: updateSilentPrayerFetch }
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
    expect(createSilentPrayerFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/silent-prayer-events",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Evening Silent Prayer",
          intention: "For pilot families and brothers.",
          visibility: "ORGANIZATION_UNIT",
          targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
          status: "DRAFT",
          startsAt: "2026-06-12T18:00:00.000Z",
          endsAt: "2026-06-12T18:30:00.000Z"
        })
      }
    );
    expect(updateSilentPrayerFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/silent-prayer-events/66666666-6666-4666-8666-666666666667",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" })
      }
    );
  });

  it("sends typed lifecycle mutations for approve, publish, cancel, and archive actions", async () => {
    const prayerApproveFetch = jsonFetch({
      prayer: { ...prayersPayload.prayers[0], status: "APPROVED" }
    });
    const prayerPublishFetch = jsonFetch({
      prayer: { ...prayersPayload.prayers[0], status: "PUBLISHED" }
    });
    const prayerArchiveFetch = jsonFetch({
      prayer: { ...prayersPayload.prayers[0], status: "ARCHIVED" }
    });
    const eventApproveFetch = jsonFetch({
      event: {
        ...eventsPayload.events[0],
        approvedAt: "2026-06-01T17:00:00.000Z"
      }
    });
    const eventPublishFetch = jsonFetch({
      event: { ...eventsPayload.events[0], status: "published" }
    });
    const eventCancelFetch = jsonFetch({
      event: { ...eventsPayload.events[0], status: "cancelled" }
    });
    const eventArchiveFetch = jsonFetch({
      event: { ...eventsPayload.events[0], status: "archived" }
    });
    const announcementApproveFetch = jsonFetch({
      announcement: { ...announcementsPayload.announcements[0], status: "APPROVED" }
    });
    const announcementPublishFetch = jsonFetch({
      announcement: { ...announcementsPayload.announcements[0], status: "PUBLISHED" }
    });
    const announcementArchiveFetch = jsonFetch({
      announcement: { ...announcementsPayload.announcements[0], status: "ARCHIVED" }
    });
    const silentPrayerApproveFetch = jsonFetch({
      silentPrayerEvent: { ...silentPrayerPayload.silentPrayerEvents[0], status: "APPROVED" }
    });
    const silentPrayerPublishFetch = jsonFetch({
      silentPrayerEvent: { ...silentPrayerPayload.silentPrayerEvents[0], status: "PUBLISHED" }
    });
    const silentPrayerCancelFetch = jsonFetch({
      silentPrayerEvent: {
        ...silentPrayerPayload.silentPrayerEvents[0],
        cancelledAt: "2026-06-01T17:00:00.000Z"
      }
    });
    const silentPrayerArchiveFetch = jsonFetch({
      silentPrayerEvent: { ...silentPrayerPayload.silentPrayerEvents[0], status: "ARCHIVED" }
    });

    await approveAdminPrayer("33333333-3333-4333-8333-333333333333", {
      baseUrl: "https://api.example.test",
      fetchImpl: prayerApproveFetch
    });
    await publishAdminPrayer("33333333-3333-4333-8333-333333333333", {
      baseUrl: "https://api.example.test",
      fetchImpl: prayerPublishFetch
    });
    await archiveAdminPrayer("33333333-3333-4333-8333-333333333333", {
      baseUrl: "https://api.example.test",
      fetchImpl: prayerArchiveFetch
    });
    await approveAdminEvent("44444444-4444-4444-8444-444444444444", {
      baseUrl: "https://api.example.test",
      fetchImpl: eventApproveFetch,
      approvedAt: "2026-06-01T17:00:00.000Z"
    });
    await publishAdminEvent("44444444-4444-4444-8444-444444444444", {
      baseUrl: "https://api.example.test",
      fetchImpl: eventPublishFetch
    });
    await cancelAdminEvent("44444444-4444-4444-8444-444444444444", {
      baseUrl: "https://api.example.test",
      fetchImpl: eventCancelFetch
    });
    await archiveAdminEvent("44444444-4444-4444-8444-444444444444", {
      baseUrl: "https://api.example.test",
      fetchImpl: eventArchiveFetch
    });
    await approveAdminAnnouncement("55555555-5555-4555-8555-555555555555", {
      baseUrl: "https://api.example.test",
      fetchImpl: announcementApproveFetch
    });
    await publishAdminAnnouncement("55555555-5555-4555-8555-555555555555", {
      baseUrl: "https://api.example.test",
      fetchImpl: announcementPublishFetch
    });
    await archiveAdminAnnouncement("55555555-5555-4555-8555-555555555555", {
      baseUrl: "https://api.example.test",
      fetchImpl: announcementArchiveFetch
    });
    await approveAdminSilentPrayerEvent("66666666-6666-4666-8666-666666666667", {
      baseUrl: "https://api.example.test",
      fetchImpl: silentPrayerApproveFetch
    });
    await publishAdminSilentPrayerEvent("66666666-6666-4666-8666-666666666667", {
      baseUrl: "https://api.example.test",
      fetchImpl: silentPrayerPublishFetch
    });
    await cancelAdminSilentPrayerEvent("66666666-6666-4666-8666-666666666667", {
      baseUrl: "https://api.example.test",
      fetchImpl: silentPrayerCancelFetch
    });
    await archiveAdminSilentPrayerEvent("66666666-6666-4666-8666-666666666667", {
      baseUrl: "https://api.example.test",
      fetchImpl: silentPrayerArchiveFetch
    });

    expect(patchBody(prayerApproveFetch)).toEqual({ status: "APPROVED" });
    expect(patchBody(prayerPublishFetch)).toEqual({ status: "PUBLISHED" });
    expect(patchBody(prayerArchiveFetch)).toEqual({ status: "ARCHIVED" });
    expect(patchBody(eventApproveFetch)).toEqual({
      approvedAt: "2026-06-01T17:00:00.000Z"
    });
    expect(patchBody(eventPublishFetch)).toEqual({ status: "published" });
    expect(patchBody(eventCancelFetch)).toEqual({ status: "cancelled" });
    expect(patchBody(eventArchiveFetch)).toEqual({ status: "archived" });
    expect(patchBody(announcementApproveFetch)).toEqual({ status: "APPROVED" });
    expect(patchBody(announcementPublishFetch)).toEqual({ status: "PUBLISHED" });
    expect(patchBody(announcementArchiveFetch)).toEqual({ status: "ARCHIVED" });
    expect(patchBody(silentPrayerApproveFetch)).toEqual({ status: "APPROVED" });
    expect(patchBody(silentPrayerPublishFetch)).toEqual({ status: "PUBLISHED" });
    expect(patchBody(silentPrayerCancelFetch)).toEqual({
      cancelledAt: expect.any(String) as string
    });
    expect(patchBody(silentPrayerArchiveFetch)).toEqual({ status: "ARCHIVED" });
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

type JsonFetchInit = {
  method?: "GET" | "POST" | "PATCH" | undefined;
  headers?: Record<string, string> | undefined;
  body?: string | undefined;
};

type JsonFetch = (
  url: string,
  init?: JsonFetchInit
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

function jsonFetch(payload: unknown) {
  return vi.fn<JsonFetch>(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload)
    })
  );
}

function patchBody(fetchImpl: ReturnType<typeof jsonFetch>) {
  const init = fetchImpl.mock.calls[0]?.[1];

  expect(init).toMatchObject({
    method: "PATCH",
    headers: { "content-type": "application/json" }
  });

  return JSON.parse(String(init?.body)) as unknown;
}
