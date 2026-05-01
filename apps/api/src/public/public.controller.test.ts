import { describe, expect, it } from "vitest";
import { PublicController } from "./public.controller.js";

describe("PublicController", () => {
  it("serves public home without an authenticated principal", () => {
    const controller = new PublicController({
      getHome: (query) => {
        expect(query).toEqual({ language: "en" });
        return {
          intro: {
            title: "JP2 App",
            body: "Public discovery content is being prepared for approval."
          },
          prayerOfDay: null,
          nextEvents: [],
          ctas: [
            {
              id: "join",
              label: "Join",
              action: "join",
              targetRoute: "JoinRequestForm"
            }
          ]
        };
      }
    });

    expect(controller.getPublicHome({ language: "en" })).toEqual({
      intro: {
        title: "JP2 App",
        body: "Public discovery content is being prepared for approval."
      },
      prayerOfDay: null,
      nextEvents: [],
      ctas: [
        {
          id: "join",
          label: "Join",
          action: "join",
          targetRoute: "JoinRequestForm"
        }
      ]
    });
  });
});
