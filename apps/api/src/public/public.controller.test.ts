import { describe, expect, it } from "vitest";
import type { PublicContentService } from "./public-content.service.js";
import { PublicController } from "./public.controller.js";
import type { PublicContentPageQuery } from "./public.types.js";

describe("PublicController", () => {
  it("serves public home without an authenticated principal", () => {
    const controller = controllerWith();

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

  it("serves published public content pages without an authenticated principal", async () => {
    const controller = controllerWith();

    await expect(
      controller.getPublicContentPage("about-order", { language: "pl" })
    ).resolves.toEqual({
      page: {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "about-order",
        title: "About the Order",
        body: "Approved public information.",
        language: "en"
      }
    });
  });
});

function controllerWith(): PublicController {
  return new PublicController(
    {
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
    },
    ({
      getContentPage: (slug: string, query: PublicContentPageQuery) => {
        expect(slug).toBe("about-order");
        expect(query).toEqual({ language: "pl" });
        return Promise.resolve({
          page: {
            id: "11111111-1111-4111-8111-111111111111",
            slug: "about-order",
            title: "About the Order",
            body: "Approved public information.",
            language: "en"
          }
        });
      }
    } as unknown as PublicContentService)
  );
}
