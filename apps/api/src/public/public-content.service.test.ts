import { NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { PublicContentRepository } from "./public-content.repository.js";
import { PublicContentService } from "./public-content.service.js";
import type {
  PublicContentPage,
  PublicEventDetail,
  PublicEventSummary,
  PublicPrayerCategorySummary,
  PublicPrayerDetail,
  PublicPrayerSummary
} from "./public.types.js";

const aboutPage: PublicContentPage = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "about-order",
  title: "About the Order",
  body: "Approved public information.",
  language: "en"
};

const prayerCategory: PublicPrayerCategorySummary = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "daily",
  title: "Daily Prayer",
  language: "en"
};

const prayer: PublicPrayerDetail = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Morning Offering",
  excerpt: "A public morning prayer.",
  body: "A public morning prayer.",
  language: "en",
  category: prayerCategory
};

const event: PublicEventDetail = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  type: "open-evening",
  startAt: "2026-05-10T18:00:00.000Z",
  endAt: null,
  locationLabel: "Riga",
  visibility: "PUBLIC",
  description: "Public introduction evening."
};

describe("PublicContentService", () => {
  it("returns published public content page details", async () => {
    await expect(
      new PublicContentService(repository(aboutPage)).getContentPage("about-order", {
        language: "en"
      })
    ).resolves.toEqual({ page: aboutPage });
  });

  it("returns 404 when the public page is missing or not visible", async () => {
    await expect(
      new PublicContentService(repository(null)).getContentPage("private-page", {})
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lists published public prayer categories and prayers", async () => {
    await expect(
      new PublicContentService(repository(aboutPage, {
        categories: [prayerCategory],
        prayers: [prayer]
      })).listPrayers({ language: "en", limit: 20, offset: 0 })
    ).resolves.toEqual({
      categories: [prayerCategory],
      prayers: [prayer],
      pagination: { limit: 20, offset: 0 }
    });
  });

  it("returns public prayer details or 404s hidden prayers", async () => {
    await expect(new PublicContentService(repository(aboutPage, { prayer })).getPrayer(prayer.id))
      .resolves.toEqual({ prayer });
    await expect(new PublicContentService(repository(aboutPage)).getPrayer(prayer.id)).rejects
      .toBeInstanceOf(NotFoundException);
  });

  it("lists public events and returns event details", async () => {
    await expect(
      new PublicContentService(repository(aboutPage, { events: [event], event })).listEvents({
        limit: 20,
        offset: 0
      })
    ).resolves.toEqual({
      events: [event],
      pagination: { limit: 20, offset: 0 }
    });

    await expect(new PublicContentService(repository(aboutPage, { event })).getEvent(event.id))
      .resolves.toEqual({ event });
  });
});

function repository(
  page: PublicContentPage | null,
  options: {
    categories?: PublicPrayerCategorySummary[];
    prayers?: PublicPrayerSummary[];
    prayer?: PublicPrayerDetail | null;
    events?: PublicEventSummary[];
    event?: PublicEventDetail | null;
  } = {}
): PublicContentRepository {
  return {
    findPublishedPublicContentPage: () => Promise.resolve(page),
    findPublishedPublicPrayerCategories: () => Promise.resolve(options.categories ?? []),
    findPublishedPublicPrayers: () => Promise.resolve(options.prayers ?? []),
    findPublishedPublicPrayer: () => Promise.resolve(options.prayer ?? null),
    findPublishedPublicEvents: () => Promise.resolve(options.events ?? []),
    findPublishedPublicEvent: () => Promise.resolve(options.event ?? null)
  };
}
