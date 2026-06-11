import { describe, expect, it, vi } from "vitest";
import type { PublicHomeToday } from "./liturgical-calendar.provider.js";
import {
  CachedHttpLiturgicalCalendarProvider,
  createConfiguredLiturgicalCalendarProvider,
  LocalFallbackLiturgicalCalendarProvider,
  type LiturgicalCalendarFetch
} from "./liturgical-calendar.provider.js";

describe("LocalFallbackLiturgicalCalendarProvider", () => {
  it("formats the requested civil date without exposing invented liturgical data", async () => {
    await expect(
      new LocalFallbackLiturgicalCalendarProvider().getToday({
        date: "2026-06-11",
        language: "en"
      })
    ).resolves.toEqual({
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
    });
  });
});

describe("CachedHttpLiturgicalCalendarProvider", () => {
  it("requests normalized today data with date, language, and country query params", async () => {
    const fetchImpl = vi.fn<LiturgicalCalendarFetch>().mockResolvedValue(
      jsonResponse(
        today({
          name: "Saint Barnabas, Apostle",
          source: "calendar-proxy",
          state: "ready"
        })
      )
    );
    const provider = providerWith(fetchImpl);

    await expect(
      provider.getToday({
        country: "LV",
        date: "2026-06-11",
        language: "pl"
      })
    ).resolves.toMatchObject({
      liturgicalDay: {
        name: "Saint Barnabas, Apostle",
        source: "calendar-proxy",
        state: "ready"
      }
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] ?? [];

    expect(url?.toString()).toBe(
      "https://calendar.example.test/today?date=2026-06-11&language=pl&country=LV"
    );
    expect(init?.headers).toEqual({ accept: "application/json" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("caches successful provider responses by date, language, and country", async () => {
    const fetchImpl = vi.fn<LiturgicalCalendarFetch>().mockResolvedValue(
      jsonResponse(
        today({
          name: "Thursday of the Tenth Week in Ordinary Time",
          source: "calendar-proxy",
          state: "ready"
        })
      )
    );
    const provider = providerWith(fetchImpl);

    const context = {
      country: "LV",
      date: "2026-06-11",
      language: "en"
    };

    await expect(provider.getToday(context)).resolves.toMatchObject({
      liturgicalDay: {
        name: "Thursday of the Tenth Week in Ordinary Time"
      }
    });
    await expect(provider.getToday(context)).resolves.toMatchObject({
      liturgicalDay: {
        name: "Thursday of the Tenth Week in Ordinary Time"
      }
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("retries bounded provider failures before returning normalized data", async () => {
    const fetchImpl = vi
      .fn<LiturgicalCalendarFetch>()
      .mockRejectedValueOnce(new Error("temporary network failure"))
      .mockResolvedValueOnce(
        jsonResponse(
          today({
            name: "Friday of the Tenth Week in Ordinary Time",
            source: "calendar-proxy",
            state: "ready"
          })
        )
      );
    const provider = providerWith(fetchImpl);

    await expect(
      provider.getToday({
        date: "2026-06-12",
        language: "en"
      })
    ).resolves.toMatchObject({
      liturgicalDay: {
        name: "Friday of the Tenth Week in Ordinary Time",
        state: "ready"
      }
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("falls back when the provider returns invalid data", async () => {
    const fetchImpl = vi
      .fn<LiturgicalCalendarFetch>()
      .mockResolvedValue(jsonResponse({ civilDate: { date: "2026-06-11" } }));
    const provider = providerWith(fetchImpl);

    await expect(
      provider.getToday({
        date: "2026-06-11",
        language: "en"
      })
    ).resolves.toEqual({
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
    });
  });

  it("falls back after HTTP errors are exhausted", async () => {
    const fetchImpl = vi.fn<LiturgicalCalendarFetch>().mockResolvedValue(
      new Response("upstream unavailable", {
        status: 503
      })
    );
    const provider = providerWith(fetchImpl, { retryAttempts: 0 });

    await expect(
      provider.getToday({
        date: "2026-06-11",
        language: "en"
      })
    ).resolves.toMatchObject({
      liturgicalDay: {
        source: "local-fallback",
        state: "fallback"
      }
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});

describe("createConfiguredLiturgicalCalendarProvider", () => {
  it("creates the local fallback provider when no HTTP provider is configured", () => {
    expect(createConfiguredLiturgicalCalendarProvider({})).toBeInstanceOf(
      LocalFallbackLiturgicalCalendarProvider
    );
  });

  it("creates the cached HTTP provider for explicit HTTP mode", () => {
    expect(
      createConfiguredLiturgicalCalendarProvider({
        LITURGICAL_CALENDAR_PROVIDER: "http",
        LITURGICAL_CALENDAR_URL: "https://calendar.example.test/today"
      })
    ).toBeInstanceOf(CachedHttpLiturgicalCalendarProvider);
  });
});

function providerWith(
  fetchImpl: LiturgicalCalendarFetch,
  overrides: Partial<ConstructorParameters<typeof CachedHttpLiturgicalCalendarProvider>[0]> = {}
) {
  return new CachedHttpLiturgicalCalendarProvider(
    {
      provider: "http",
      url: "https://calendar.example.test/today",
      timeoutMs: 1500,
      retryAttempts: 1,
      cacheTtlMs: 60000,
      ...overrides
    },
    new LocalFallbackLiturgicalCalendarProvider(),
    fetchImpl
  );
}

function today(
  liturgicalDay: Pick<PublicHomeToday["liturgicalDay"], "name" | "source" | "state">
): PublicHomeToday {
  return {
    civilDate: {
      date: "2026-06-11",
      displayLabel: "Thursday, June 11"
    },
    liturgicalDay: {
      name: liturgicalDay.name,
      season: "Ordinary Time",
      rank: null,
      color: "Green",
      source: liturgicalDay.source,
      state: liturgicalDay.state
    }
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json"
    },
    status: 200
  });
}
