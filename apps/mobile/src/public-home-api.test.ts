import { describe, expect, it, vi } from "vitest";
import {
  buildPublicHomeUrl,
  fetchPublicHome,
  publicHomeLoadFailureState,
  PublicHomeHttpError,
  readPublicApiBaseUrl
} from "./public-home-api.js";

const publicHomePayload = {
  intro: {
    title: "JP2 App",
    body: "Approved public content"
  },
  today: {
    civilDate: {
      date: "2026-06-11",
      displayLabel: "Thursday, June 11"
    },
    liturgicalDay: {
      name: "Liturgical calendar unavailable",
      season: null,
      rank: null,
      color: null,
      source: "local-fallback",
      state: "fallback"
    }
  },
  prayerOfDay: null,
  nextEvents: [],
  ctas: [
    {
      id: "learn",
      label: "Learn",
      action: "learn",
      targetRoute: "AboutOrder"
    }
  ]
};

describe("mobile public home API client", () => {
  it("builds the public home URL from the configured API base URL", () => {
    expect(
      buildPublicHomeUrl("https://api.example.test", {
        country: "LV",
        date: "2026-06-11",
        language: "en"
      })
    ).toBe(
      "https://api.example.test/public/home?language=en&date=2026-06-11&country=LV"
    );
    expect(buildPublicHomeUrl("https://api.example.test/")).toBe(
      "https://api.example.test/public/home"
    );
  });

  it("prefers Expo public API base URL over the generic API base URL", () => {
    expect(
      readPublicApiBaseUrl({
        EXPO_PUBLIC_API_BASE_URL: " https://expo.example.test ",
        API_BASE_URL: "https://api.example.test"
      })
    ).toBe("https://expo.example.test");
    expect(readPublicApiBaseUrl({ API_BASE_URL: "https://api.example.test" })).toBe(
      "https://api.example.test"
    );
  });

  it("fetches and validates public home data with the shared DTO schema", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(publicHomePayload)
      })
    );

    await expect(
      fetchPublicHome({
        baseUrl: "https://api.example.test",
        country: "LV",
        date: "2026-06-11",
        fetchImpl
      })
    ).resolves.toEqual(publicHomePayload);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/public/home?date=2026-06-11&country=LV"
    );
  });

  it("rejects payloads that include non-public event visibility", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            ...publicHomePayload,
            nextEvents: [
              {
                id: "11111111-1111-4111-8111-111111111111",
                title: "Private Event",
                startAt: "2026-06-01T10:00:00.000Z",
                locationLabel: "Private",
                visibility: "BROTHER"
              }
            ]
          })
      })
    );

    await expect(fetchPublicHome({ fetchImpl })).rejects.toThrow();
  });

  it("maps HTTP and network failures into screen states", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        json: () => Promise.resolve({})
      })
    );

    await expect(fetchPublicHome({ fetchImpl })).rejects.toBeInstanceOf(PublicHomeHttpError);
    expect(publicHomeLoadFailureState(new PublicHomeHttpError(503))).toBe("error");
    expect(publicHomeLoadFailureState(new TypeError("Network request failed"))).toBe("offline");
  });
});
