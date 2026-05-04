import { describe, expect, it, vi } from "vitest";
import {
  buildPublicEventDetailUrl,
  buildPublicPrayerDetailUrl,
  fetchPublicEvent,
  fetchPublicPrayer,
  PublicContentDetailHttpError,
  publicContentDetailLoadFailureState
} from "./public-content-detail-api.js";

const prayerPayload = {
  prayer: {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Morning Offering",
    excerpt: "A public morning prayer.",
    body: "A public morning prayer.",
    language: "en",
    category: {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "daily",
      title: "Daily Prayer",
      language: "en"
    }
  }
};

const eventPayload = {
  event: {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Open Evening",
    type: "open-evening",
    startAt: "2026-06-10T18:00:00.000Z",
    endAt: "2026-06-10T20:00:00.000Z",
    locationLabel: "Riga",
    visibility: "PUBLIC",
    description: "A public introduction evening."
  }
};

describe("mobile public prayer/event detail API clients", () => {
  it("builds public detail URLs", () => {
    expect(
      buildPublicPrayerDetailUrl("33333333-3333-4333-8333-333333333333", "https://api.example.test")
    ).toBe("https://api.example.test/public/prayers/33333333-3333-4333-8333-333333333333");
    expect(
      buildPublicEventDetailUrl("44444444-4444-4444-8444-444444444444", "https://api.example.test/")
    ).toBe("https://api.example.test/public/events/44444444-4444-4444-8444-444444444444");
  });

  it("fetches and validates public prayer and event details with shared DTO schemas", async () => {
    const prayerFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(prayerPayload)
      })
    );
    const eventFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(eventPayload)
      })
    );

    await expect(
      fetchPublicPrayer({
        id: "33333333-3333-4333-8333-333333333333",
        baseUrl: "https://api.example.test",
        fetchImpl: prayerFetch
      })
    ).resolves.toEqual(prayerPayload);
    await expect(
      fetchPublicEvent({
        id: "44444444-4444-4444-8444-444444444444",
        baseUrl: "https://api.example.test",
        fetchImpl: eventFetch
      })
    ).resolves.toEqual(eventPayload);
  });

  it("rejects non-public event visibility and maps failures into screen states", async () => {
    const invalidEventFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            event: { ...eventPayload.event, visibility: "BROTHER" }
          })
      })
    );
    const httpFailureFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      })
    );

    await expect(
      fetchPublicEvent({
        id: "44444444-4444-4444-8444-444444444444",
        fetchImpl: invalidEventFetch
      })
    ).rejects.toThrow();
    await expect(
      fetchPublicPrayer({
        id: "33333333-3333-4333-8333-333333333333",
        fetchImpl: httpFailureFetch
      })
    ).rejects.toBeInstanceOf(PublicContentDetailHttpError);
    expect(publicContentDetailLoadFailureState(new PublicContentDetailHttpError(404))).toBe(
      "error"
    );
    expect(publicContentDetailLoadFailureState(new TypeError("Network request failed"))).toBe(
      "offline"
    );
  });
});
