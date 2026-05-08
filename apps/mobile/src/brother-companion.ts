import {
  brotherAnnouncementListResponseSchema,
  brotherEventDetailResponseSchema,
  brotherEventListResponseSchema,
  brotherPrayerListResponseSchema,
  brotherProfileResponseSchema,
  brotherTodayResponseSchema,
  myOrganizationUnitsResponseSchema,
  type BrotherAnnouncementListResponseDto,
  type BrotherEventDetailResponseDto,
  type BrotherEventListResponseDto,
  type BrotherPrayerListResponseDto,
  type BrotherProfileResponseDto,
  type BrotherTodayResponseDto,
  type MyOrganizationUnitsResponseDto
} from "@jp2/shared-validation";

const fallbackOrganizationUnit = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "CHORAGIEW",
  parentUnitId: null,
  name: "Pilot Choragiew",
  city: "Riga",
  country: "Latvia",
  parish: null,
  publicDescription: "Pilot community",
  status: "active"
} as const;

export const fallbackBrotherProfile = brotherProfileResponseSchema.parse({
  profile: {
    id: "22222222-2222-4222-8222-222222222222",
    displayName: "Demo Brother",
    email: "brother@example.test",
    phone: null,
    preferredLanguage: "en",
    status: "active",
    roles: ["BROTHER"],
    memberships: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        currentDegree: "First Degree",
        joinedAt: "2026-01-15",
        organizationUnit: fallbackOrganizationUnit
      }
    ]
  }
}) satisfies BrotherProfileResponseDto;

export const fallbackBrotherToday = brotherTodayResponseSchema.parse({
  profileSummary: {
    displayName: "Demo Brother",
    currentDegree: "First Degree",
    organizationUnitName: "Pilot Choragiew"
  },
  cards: [
    {
      id: "profile",
      label: "Review profile",
      body: "Your current degree is First Degree.",
      targetRoute: "BrotherProfile",
      priority: "normal"
    },
    {
      id: "organization-units",
      label: "My choragiew",
      body: "You are assigned to Pilot Choragiew.",
      targetRoute: "MyOrganizationUnits",
      priority: "normal"
    },
    {
      id: "events",
      label: "Upcoming events",
      body: "Review public, brother, and own choragiew events visible to you.",
      targetRoute: "BrotherEvents",
      priority: "normal"
    }
  ],
  upcomingEvents: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Brother Gathering",
      type: "formation",
      startAt: "2026-06-01T10:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "ORGANIZATION_UNIT"
    }
  ],
  organizationUnits: [fallbackOrganizationUnit]
}) satisfies BrotherTodayResponseDto;

export const fallbackBrotherEvents = brotherEventListResponseSchema.parse({
  events: fallbackBrotherToday.upcomingEvents,
  pagination: {
    limit: 20,
    offset: 0
  }
}) satisfies BrotherEventListResponseDto;

export const fallbackBrotherAnnouncements = brotherAnnouncementListResponseSchema.parse({
  announcements: [
    {
      id: "77777777-7777-4777-8777-777777777777",
      title: "Brother Formation Notice",
      body: "A brother formation note is available for Pilot Choragiew.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: fallbackOrganizationUnit.id,
      pinned: true,
      publishedAt: "2026-05-07T12:00:00.000Z"
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
}) satisfies BrotherAnnouncementListResponseDto;

export const fallbackBrotherPrayers = brotherPrayerListResponseSchema.parse({
  categories: [
    {
      id: "99999999-9999-4999-8999-999999999999",
      slug: "daily-brother-prayers",
      title: "Daily Brother Prayers",
      language: "en"
    }
  ],
  prayers: [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Prayer for Fraternal Service",
      excerpt: "Lord, guide our service in truth, fraternity, and charity.",
      language: "en",
      visibility: "BROTHER",
      targetOrganizationUnitId: null,
      category: {
        id: "99999999-9999-4999-8999-999999999999",
        slug: "daily-brother-prayers",
        title: "Daily Brother Prayers",
        language: "en"
      }
    },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      title: "Pilot Choragiew Prayer",
      excerpt: "Bless this local brotherhood and its service.",
      language: "en",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: fallbackOrganizationUnit.id,
      category: null
    }
  ],
  pagination: {
    limit: 20,
    offset: 0
  }
}) satisfies BrotherPrayerListResponseDto;

export const fallbackBrotherEventDetail = brotherEventDetailResponseSchema.parse({
  event: {
    ...fallbackBrotherToday.upcomingEvents[0],
    description: "Private formation gathering for brothers assigned to the pilot choragiew.",
    currentUserParticipation: {
      id: "88888888-8888-4888-8888-888888888888",
      eventId: fallbackBrotherToday.upcomingEvents[0]!.id,
      intentStatus: "planning_to_attend",
      createdAt: "2026-05-06T12:00:00.000Z",
      cancelledAt: null
    }
  }
}) satisfies BrotherEventDetailResponseDto;

export const fallbackMyOrganizationUnits = myOrganizationUnitsResponseSchema.parse({
  organizationUnits: [fallbackOrganizationUnit]
}) satisfies MyOrganizationUnitsResponseDto;
