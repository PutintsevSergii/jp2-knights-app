import { describe, expect, it } from "vitest";
import { PublicHomeService } from "./public-home.service.js";

describe("PublicHomeService", () => {
  it("returns a public-safe discovery shell without private content", () => {
    expect(new PublicHomeService().getHome({ language: "en" })).toEqual({
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
    });
  });
});
