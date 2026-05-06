import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { BrotherCompanionController } from "./brother-companion.controller.js";
import type { BrotherCompanionService } from "./brother-companion.service.js";
import type {
  BrotherEventDetailResponse,
  BrotherEventListResponse,
  BrotherPrayerListResponse,
  BrotherProfileResponse,
  BrotherTodayResponse
} from "./brother-companion.types.js";

const principal: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

const profileResponse: BrotherProfileResponse = {
  profile: {
    id: principal.id,
    displayName: principal.displayName,
    email: principal.email,
    phone: null,
    preferredLanguage: "en",
    status: "active",
    roles: ["BROTHER"],
    memberships: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        currentDegree: "First Degree",
        joinedAt: "2026-01-15",
        organizationUnit: {
          id: "11111111-1111-4111-8111-111111111111",
          type: "CHORAGIEW",
          parentUnitId: null,
          name: "Pilot Choragiew",
          city: "Riga",
          country: "Latvia",
          parish: null,
          publicDescription: "Pilot community",
          status: "active"
        }
      }
    ]
  }
};

const todayResponse: BrotherTodayResponse = {
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
    }
  ],
  upcomingEvents: [],
  organizationUnits: [profileResponse.profile.memberships[0]!.organizationUnit]
};

const prayerResponse: BrotherPrayerListResponse = {
  categories: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      slug: "daily",
      title: "Daily Prayer",
      language: "en"
    }
  ],
  prayers: [
    {
      id: "66666666-6666-4666-8666-666666666666",
      title: "Brother Prayer",
      excerpt: "A brother-visible prayer.",
      language: "en",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: principal.memberOrganizationUnitIds![0]!,
      category: {
        id: "55555555-5555-4555-8555-555555555555",
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

const eventResponse: BrotherEventListResponse = {
  events: [
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
  pagination: {
    limit: 20,
    offset: 0
  }
};

const eventDetailResponse: BrotherEventDetailResponse = {
  event: {
    ...eventResponse.events[0]!,
    description: "Private formation gathering.",
    currentUserParticipation: {
      id: "88888888-8888-4888-8888-888888888888",
      eventId: eventResponse.events[0]!.id,
      intentStatus: "planning_to_attend",
      createdAt: "2026-05-06T12:00:00.000Z",
      cancelledAt: null
    }
  }
};

describe("BrotherCompanionController", () => {
  it("delegates brother requests using the guard-attached principal", async () => {
    const service = new FakeBrotherCompanionService();
    const controller = new BrotherCompanionController(
      service as unknown as BrotherCompanionService
    );

    await expect(controller.getProfile({ principal })).resolves.toEqual(profileResponse);
    await expect(controller.getToday({ principal })).resolves.toEqual(todayResponse);
    await expect(controller.listEvents({ principal }, { limit: 20, offset: 0 })).resolves.toEqual(
      eventResponse
    );
    await expect(
      controller.getEvent({ principal }, "44444444-4444-4444-8444-444444444444")
    ).resolves.toEqual(eventDetailResponse);
    await expect(controller.listPrayers({ principal }, { limit: 20, offset: 0 })).resolves.toEqual(
      prayerResponse
    );
    expect(service.principals).toEqual([principal, principal, principal, principal, principal]);
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new BrotherCompanionController(
      new FakeBrotherCompanionService() as unknown as BrotherCompanionService
    );

    expect(() => controller.getProfile({})).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() => controller.getToday({})).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() => controller.listEvents({}, { limit: 20, offset: 0 })).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.getEvent({}, "44444444-4444-4444-8444-444444444444")).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.listPrayers({}, { limit: 20, offset: 0 })).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
  });
});

class FakeBrotherCompanionService implements Pick<
  BrotherCompanionService,
  "getProfile" | "getToday" | "listEvents" | "getEvent" | "listPrayers"
> {
  principals: CurrentUserPrincipal[] = [];

  getProfile(input: CurrentUserPrincipal) {
    this.principals.push(input);
    return Promise.resolve(profileResponse);
  }

  getToday(input: CurrentUserPrincipal) {
    this.principals.push(input);
    return Promise.resolve(todayResponse);
  }

  listEvents(input: CurrentUserPrincipal) {
    this.principals.push(input);
    return Promise.resolve(eventResponse);
  }

  getEvent(input: CurrentUserPrincipal) {
    this.principals.push(input);
    return Promise.resolve(eventDetailResponse);
  }

  listPrayers(input: CurrentUserPrincipal) {
    this.principals.push(input);
    return Promise.resolve(prayerResponse);
  }
}
