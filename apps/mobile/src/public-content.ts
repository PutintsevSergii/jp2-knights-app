import type {
  PublicContentPageResponseDto,
  PublicEventDetailResponseDto,
  PublicEventListResponseDto,
  PublicPrayerDetailResponseDto,
  PublicPrayerListResponseDto
} from "@jp2/shared-validation";

export const fallbackAboutOrderContentPage: PublicContentPageResponseDto["page"] = {
  id: "00000000-0000-0000-0000-000000000004",
  slug: "about-order",
  title: "About the Order",
  body: "Approved public information about the Order is prepared here for local development.",
  language: "en"
};

export const fallbackPublicPrayers: PublicPrayerListResponseDto = {
  categories: [
    {
      id: "00000000-0000-0000-0000-000000000005",
      slug: "daily",
      title: "Daily Prayer",
      language: "en"
    }
  ],
  prayers: [
    {
      id: "00000000-0000-0000-0000-000000000006",
      title: "Morning Offering",
      excerpt: "Lord, receive this day and guide our service in truth, fraternity, and charity.",
      language: "en",
      category: {
        id: "00000000-0000-0000-0000-000000000005",
        slug: "daily",
        title: "Daily Prayer",
        language: "en"
      }
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
};

export const fallbackPublicPrayerDetail: PublicPrayerDetailResponseDto = {
  prayer: {
    id: "00000000-0000-0000-0000-000000000006",
    title: "Morning Offering",
    excerpt: "Lord, receive this day and guide our service in truth, fraternity, and charity.",
    body: "Lord, receive this day and guide our service in truth, fraternity, and charity.",
    language: "en",
    category: {
      id: "00000000-0000-0000-0000-000000000005",
      slug: "daily",
      title: "Daily Prayer",
      language: "en"
    }
  }
};

export const fallbackPublicEvents: PublicEventListResponseDto = {
  events: [
    {
      id: "00000000-0000-0000-0000-000000000008",
      title: "Open Evening",
      type: "open-evening",
      startAt: "2026-06-10T18:00:00.000Z",
      endAt: "2026-06-10T20:00:00.000Z",
      locationLabel: "Riga",
      visibility: "PUBLIC"
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
};

export const fallbackPublicEventDetail: PublicEventDetailResponseDto = {
  event: {
    id: "00000000-0000-0000-0000-000000000008",
    title: "Open Evening",
    type: "open-evening",
    startAt: "2026-06-10T18:00:00.000Z",
    endAt: "2026-06-10T20:00:00.000Z",
    locationLabel: "Riga",
    visibility: "PUBLIC",
    description: "A public introduction evening for people exploring the Order."
  }
};
