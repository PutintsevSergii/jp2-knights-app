import { publicHomeResponseSchema, type PublicHomeResponseDto } from "@jp2/shared-validation";

export const fallbackPublicHome = publicHomeResponseSchema.parse({
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
      id: "silent-prayer",
      label: "Silent Prayer",
      action: "pray",
      targetRoute: "PublicSilentPrayer"
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
}) satisfies PublicHomeResponseDto;
