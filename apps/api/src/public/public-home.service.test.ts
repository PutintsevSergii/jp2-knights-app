import { describe, expect, it } from "vitest";
import { LocalFallbackLiturgicalCalendarProvider } from "./liturgical-calendar.provider.js";
import { PublicHomeService } from "./public-home.service.js";

describe("PublicHomeService", () => {
  it("returns a public-safe discovery shell with API-owned today context", async () => {
    await expect(
      new PublicHomeService(new LocalFallbackLiturgicalCalendarProvider()).getHome({
        country: "LV",
        date: "2026-06-11",
        language: "en"
      })
    ).resolves.toEqual({
      intro: {
        title: "JP2 App",
        body: "Public discovery content is being prepared for approval."
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
        },
        {
          id: "pray",
          label: "Pray",
          action: "pray",
          targetRoute: "PublicPrayerCategories"
        },
        {
          id: "join",
          label: "Join",
          action: "join",
          targetRoute: "JoinRequestForm"
        },
        {
          id: "login",
          label: "Login",
          action: "login",
          targetRoute: "Login"
        }
      ]
    });
  });
});
