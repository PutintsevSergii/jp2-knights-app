import { describe, expect, it } from "vitest";
import { readLiturgicalCalendarConfig } from "./liturgical-calendar.config.js";

describe("liturgical calendar config", () => {
  it("uses local fallback mode by default", () => {
    expect(readLiturgicalCalendarConfig({})).toEqual({
      provider: "fallback",
      timeoutMs: 1500,
      retryAttempts: 1,
      cacheTtlMs: 21600000
    });
  });

  it("reads bounded HTTP provider settings", () => {
    expect(
      readLiturgicalCalendarConfig({
        LITURGICAL_CALENDAR_PROVIDER: "http",
        LITURGICAL_CALENDAR_URL: "https://calendar.example.test/today",
        LITURGICAL_CALENDAR_TIMEOUT_MS: "2000",
        LITURGICAL_CALENDAR_RETRY_ATTEMPTS: "2",
        LITURGICAL_CALENDAR_CACHE_TTL_MS: "60000"
      })
    ).toEqual({
      provider: "http",
      url: "https://calendar.example.test/today",
      timeoutMs: 2000,
      retryAttempts: 2,
      cacheTtlMs: 60000
    });
  });

  it("rejects HTTP mode without a URL", () => {
    expect(() =>
      readLiturgicalCalendarConfig({
        LITURGICAL_CALENDAR_PROVIDER: "http"
      })
    ).toThrow("LITURGICAL_CALENDAR_URL is required when LITURGICAL_CALENDAR_PROVIDER=http.");
  });

  it("rejects unsupported provider modes", () => {
    expect(() =>
      readLiturgicalCalendarConfig({
        LITURGICAL_CALENDAR_PROVIDER: "third-party"
      })
    ).toThrow("Unsupported LITURGICAL_CALENDAR_PROVIDER 'third-party'.");
  });

  it("falls back to defaults for out-of-range numeric settings", () => {
    expect(
      readLiturgicalCalendarConfig({
        LITURGICAL_CALENDAR_TIMEOUT_MS: "10",
        LITURGICAL_CALENDAR_RETRY_ATTEMPTS: "8",
        LITURGICAL_CALENDAR_CACHE_TTL_MS: "-1"
      })
    ).toMatchObject({
      timeoutMs: 1500,
      retryAttempts: 1,
      cacheTtlMs: 21600000
    });
  });
});
