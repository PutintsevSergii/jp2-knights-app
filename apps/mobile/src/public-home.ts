import { publicHomeResponseSchema, type PublicHomeResponseDto } from "@jp2/shared-validation";

export const fallbackPublicHome = publicHomeResponseSchema.parse({
  intro: {
    title: "JP2 App",
    body: "Public discovery content is being prepared for approval."
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
}) satisfies PublicHomeResponseDto;
