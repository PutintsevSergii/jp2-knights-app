import {
  brotherEventListResponseSchema,
  brotherProfileResponseSchema,
  brotherTodayResponseSchema,
  myOrganizationUnitsResponseSchema,
  type BrotherEventListResponseDto,
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

export const fallbackMyOrganizationUnits = myOrganizationUnitsResponseSchema.parse({
  organizationUnits: [fallbackOrganizationUnit]
}) satisfies MyOrganizationUnitsResponseDto;
