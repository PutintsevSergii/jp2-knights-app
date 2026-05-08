import { describe, expect, it, vi } from "vitest";
import {
  BrotherCompanionHttpError,
  brotherCompanionLoadFailureState,
  buildBrotherAnnouncementsUrl,
  buildBrotherEventDetailUrl,
  buildBrotherEventParticipationUrl,
  buildBrotherEventsUrl,
  buildBrotherPrayersUrl,
  buildMyOrganizationUnitsUrl,
  buildBrotherProfileUrl,
  buildBrotherTodayUrl,
  cancelBrotherEventParticipation,
  fetchBrotherAnnouncements,
  fetchMyOrganizationUnits,
  fetchBrotherEvent,
  fetchBrotherEvents,
  fetchBrotherProfile,
  fetchBrotherPrayers,
  fetchBrotherToday,
  markBrotherEventParticipation
} from "./brother-companion-api.js";
import {
  fallbackBrotherAnnouncements,
  fallbackBrotherEventDetail,
  fallbackBrotherProfile,
  fallbackBrotherEvents,
  fallbackBrotherPrayers,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";

describe("brother companion api", () => {
  it("fetches and validates brother profile and today responses", async () => {
    const fetchImpl = vi.fn((input: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(responseForBrotherUrl(input))
      })
    );

    await expect(
      fetchBrotherProfile({
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherProfile);
    await expect(
      fetchBrotherToday({
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherToday);
    await expect(
      fetchMyOrganizationUnits({
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackMyOrganizationUnits);
    await expect(
      fetchBrotherEvents({
        baseUrl: "https://api.example.test",
        authToken: "token",
        from: "2026-06-01T00:00:00.000Z",
        type: "formation",
        limit: 10,
        offset: 5,
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherEvents);
    await expect(
      fetchBrotherAnnouncements({
        baseUrl: "https://api.example.test",
        authToken: "token",
        limit: 5,
        offset: 10,
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherAnnouncements);
    await expect(
      fetchBrotherPrayers({
        baseUrl: "https://api.example.test",
        authToken: "token",
        categoryId: fallbackBrotherPrayers.categories[0]!.id,
        q: "service",
        language: "en",
        limit: 5,
        offset: 10,
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherPrayers);
    await expect(
      fetchBrotherEvent({
        id: fallbackBrotherEvents.events[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherEventDetail);
    await expect(
      markBrotherEventParticipation({
        id: fallbackBrotherEvents.events[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual({
      participation: fallbackBrotherEventDetail.event.currentUserParticipation
    });
    await expect(
      cancelBrotherEventParticipation({
        id: fallbackBrotherEvents.events[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual({
      participation: fallbackBrotherEventDetail.event.currentUserParticipation
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(1, "https://api.example.test/brother/profile", {
      method: "GET",
      headers: { authorization: "Bearer token" }
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(2, "https://api.example.test/brother/today", {
      method: "GET",
      headers: { authorization: "Bearer token" }
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      "https://api.example.test/brother/my-organization-units",
      {
        method: "GET",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      4,
      "https://api.example.test/brother/events?from=2026-06-01T00%3A00%3A00.000Z&type=formation&limit=10&offset=5",
      {
        method: "GET",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      5,
      "https://api.example.test/brother/announcements?limit=5&offset=10",
      {
        method: "GET",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      6,
      "https://api.example.test/brother/prayers?categoryId=99999999-9999-4999-8999-999999999999&q=service&language=en&limit=5&offset=10",
      {
        method: "GET",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      7,
      "https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444",
      {
        method: "GET",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      8,
      "https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444/participation",
      {
        method: "POST",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      9,
      "https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444/participation",
      {
        method: "DELETE",
        headers: { authorization: "Bearer token" }
      }
    );
  });

  it("builds URLs and maps load failures", async () => {
    expect(buildBrotherProfileUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/profile"
    );
    expect(buildBrotherTodayUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/today"
    );
    expect(
      buildBrotherEventsUrl("https://api.example.test", {
        from: "2026-06-01T00:00:00.000Z",
        type: "formation",
        limit: 10,
        offset: 5
      })
    ).toBe(
      "https://api.example.test/brother/events?from=2026-06-01T00%3A00%3A00.000Z&type=formation&limit=10&offset=5"
    );
    expect(
      buildBrotherAnnouncementsUrl("https://api.example.test", {
        limit: 5,
        offset: 10
      })
    ).toBe("https://api.example.test/brother/announcements?limit=5&offset=10");
    expect(
      buildBrotherPrayersUrl("https://api.example.test", {
        categoryId: "99999999-9999-4999-8999-999999999999",
        q: "service",
        language: "en",
        limit: 5,
        offset: 10
      })
    ).toBe(
      "https://api.example.test/brother/prayers?categoryId=99999999-9999-4999-8999-999999999999&q=service&language=en&limit=5&offset=10"
    );
    expect(
      buildBrotherEventDetailUrl(
        "44444444-4444-4444-8444-444444444444",
        "https://api.example.test"
      )
    ).toBe("https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444");
    expect(
      buildBrotherEventParticipationUrl(
        "44444444-4444-4444-8444-444444444444",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444/participation"
    );
    expect(buildMyOrganizationUnitsUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/my-organization-units"
    );

    await expect(
      fetchBrotherToday({
        fetchImpl: () =>
          Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({})
          })
      })
    ).rejects.toBeInstanceOf(BrotherCompanionHttpError);
    expect(brotherCompanionLoadFailureState(new BrotherCompanionHttpError(401))).toBe("forbidden");
    expect(brotherCompanionLoadFailureState(new BrotherCompanionHttpError(404))).toBe("empty");
    expect(brotherCompanionLoadFailureState(new TypeError("offline"))).toBe("offline");
    expect(brotherCompanionLoadFailureState(new Error("boom"))).toBe("error");
  });

  it("maps idle approval API errors into an idle approval state", async () => {
    await expect(
      fetchBrotherToday({
        fetchImpl: () =>
          Promise.resolve({
            ok: false,
            status: 403,
            json: () =>
              Promise.resolve({
                error: {
                  code: "IDLE_APPROVAL_REQUIRED"
                }
              })
          })
      })
    ).rejects.toMatchObject({
      code: "IDLE_APPROVAL_REQUIRED"
    });
    expect(
      brotherCompanionLoadFailureState(
        new BrotherCompanionHttpError(403, "IDLE_APPROVAL_REQUIRED")
      )
    ).toBe("idleApproval");
  });
});

function responseForBrotherUrl(input: string) {
  if (input.includes("/participation")) {
    return {
      participation: fallbackBrotherEventDetail.event.currentUserParticipation
    };
  }

  if (input.includes("/brother/profile")) {
    return fallbackBrotherProfile;
  }

  if (input.includes("/brother/events/")) {
    return fallbackBrotherEventDetail;
  }

  if (input.includes("/brother/announcements")) {
    return fallbackBrotherAnnouncements;
  }

  if (input.includes("/brother/prayers")) {
    return fallbackBrotherPrayers;
  }

  if (input.includes("/brother/events")) {
    return fallbackBrotherEvents;
  }

  if (input.includes("/brother/my-organization-units")) {
    return fallbackMyOrganizationUnits;
  }

  return fallbackBrotherToday;
}
