import { describe, expect, it, vi } from "vitest";
import {
  buildPublicEventListUrl,
  buildPublicPrayerListUrl,
  fetchPublicEvents,
  fetchPublicPrayers,
  PublicContentListHttpError,
  publicContentListLoadFailureState
} from "./public-content-list-api.js";

const prayersPayload = {
  categories: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "daily",
      title: "Daily Prayer",
      language: "en"
    }
  ],
  prayers: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Morning Offering",
      excerpt: "A public morning prayer.",
      language: "en",
      category: {
        id: "22222222-2222-4222-8222-222222222222",
        slug: "daily",
        title: "Daily Prayer",
        language: "en"
      }
    }
  ],
  pagination: { limit: 20, offset: 0 }
};

const eventsPayload = {
  events: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      type: "open-evening",
      startAt: "2026-06-10T18:00:00.000Z",
      endAt: "2026-06-10T20:00:00.000Z",
      locationLabel: "Riga",
      visibility: "PUBLIC"
    }
  ],
  pagination: { limit: 20, offset: 0 }
};

describe("mobile public prayer/event list API clients", () => {
  it("builds public prayer list URLs with safe query parameters", () => {
    expect(
      buildPublicPrayerListUrl("https://api.example.test", {
        language: "en",
        q: "morning",
        categoryId: "22222222-2222-4222-8222-222222222222",
        limit: 10,
        offset: 20
      })
    ).toBe(
      "https://api.example.test/public/prayers?language=en&q=morning&categoryId=22222222-2222-4222-8222-222222222222&limit=10&offset=20"
    );
  });

  it("builds public event list URLs with safe query parameters", () => {
    expect(
      buildPublicEventListUrl("https://api.example.test/", {
        from: "2026-06-01T00:00:00.000Z",
        type: "open-evening",
        limit: 10,
        offset: 0
      })
    ).toBe(
      "https://api.example.test/public/events?from=2026-06-01T00%3A00%3A00.000Z&type=open-evening&limit=10&offset=0"
    );
  });

  it("fetches and validates public prayers and events with shared DTO schemas", async () => {
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

    await expect(
      fetchPublicPrayers({ baseUrl: "https://api.example.test", fetchImpl: prayerFetch })
    ).resolves.toEqual(prayersPayload);
    await expect(
      fetchPublicEvents({ baseUrl: "https://api.example.test", fetchImpl: eventFetch })
    ).resolves.toEqual(eventsPayload);
  });

  it("rejects invalid public event visibility and maps failures into screen states", async () => {
    const invalidEventFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            ...eventsPayload,
            events: [{ ...eventsPayload.events[0], visibility: "BROTHER" }]
          })
      })
    );
    const httpFailureFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        json: () => Promise.resolve({})
      })
    );

    await expect(fetchPublicEvents({ fetchImpl: invalidEventFetch })).rejects.toThrow();
    await expect(fetchPublicPrayers({ fetchImpl: httpFailureFetch })).rejects.toBeInstanceOf(
      PublicContentListHttpError
    );
    expect(publicContentListLoadFailureState(new PublicContentListHttpError(503))).toBe("error");
    expect(publicContentListLoadFailureState(new TypeError("Network request failed"))).toBe(
      "offline"
    );
  });
});
