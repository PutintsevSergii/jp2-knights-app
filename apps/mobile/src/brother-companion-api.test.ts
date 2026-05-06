import { describe, expect, it, vi } from "vitest";
import {
  BrotherCompanionHttpError,
  brotherCompanionLoadFailureState,
  buildBrotherEventsUrl,
  buildMyOrganizationUnitsUrl,
  buildBrotherProfileUrl,
  buildBrotherTodayUrl,
  fetchMyOrganizationUnits,
  fetchBrotherEvents,
  fetchBrotherProfile,
  fetchBrotherToday
} from "./brother-companion-api.js";
import {
  fallbackBrotherProfile,
  fallbackBrotherEvents,
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
  if (input.includes("/brother/profile")) {
    return fallbackBrotherProfile;
  }

  if (input.includes("/brother/events")) {
    return fallbackBrotherEvents;
  }

  if (input.includes("/brother/my-organization-units")) {
    return fallbackMyOrganizationUnits;
  }

  return fallbackBrotherToday;
}
