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

  it("serves public prayers and events without an authenticated principal", async () => {
    const controller = controllerWith();

    await expect(
      controller.listPublicPrayers({
        categoryId: "22222222-2222-4222-8222-222222222222",
        language: "en",
        limit: 20,
        offset: 0
      })
    ).resolves.toEqual({
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
    });

    await expect(controller.getPublicPrayer("33333333-3333-4333-8333-333333333333")).resolves
      .toMatchObject({
        prayer: {
          id: "33333333-3333-4333-8333-333333333333",
          body: "A public morning prayer."
        }
      });

    await expect(controller.listPublicEvents({ limit: 20, offset: 0 })).resolves.toEqual({
      events: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          title: "Open Evening",
          type: "open-evening",
          startAt: "2026-05-10T18:00:00.000Z",
          endAt: null,
          locationLabel: "Riga",
          visibility: "PUBLIC"
        }
      ],
      pagination: { limit: 20, offset: 0 }
    });

    await expect(controller.getPublicEvent("44444444-4444-4444-8444-444444444444")).resolves
      .toMatchObject({
        event: {
          id: "44444444-4444-4444-8444-444444444444",
          description: "Public introduction evening."
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
      },
      listPrayers: () => {
        return Promise.resolve({
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
        });
      },
      getPrayer: () => {
        return Promise.resolve({
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
        });
      },
      listEvents: () => {
        return Promise.resolve({
          events: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              title: "Open Evening",
              type: "open-evening",
              startAt: "2026-05-10T18:00:00.000Z",
              endAt: null,
              locationLabel: "Riga",
              visibility: "PUBLIC"
            }
          ],
          pagination: { limit: 20, offset: 0 }
        });
      },
      getEvent: () => {
        return Promise.resolve({
          event: {
            id: "44444444-4444-4444-8444-444444444444",
            title: "Open Evening",
            type: "open-evening",
            startAt: "2026-05-10T18:00:00.000Z",
            endAt: null,
            locationLabel: "Riga",
            visibility: "PUBLIC",
            description: "Public introduction evening."
          }
        });
      }
    } as unknown as PublicContentService)
  );
}
