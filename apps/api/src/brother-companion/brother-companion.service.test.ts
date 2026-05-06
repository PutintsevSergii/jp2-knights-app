import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { BrotherCompanionRepository } from "./brother-companion.repository.js";
import { BrotherCompanionService } from "./brother-companion.service.js";
import type {
  BrotherPrayerSummary,
  BrotherProfile,
  BrotherTodayEventSummary
} from "./brother-companion.types.js";

const organizationUnit = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "CHORAGIEW" as const,
  parentUnitId: null,
  name: "Pilot Choragiew",
  city: "Riga",
  country: "Latvia",
  parish: null,
  publicDescription: "Pilot community",
  status: "active" as const
};

const profile: BrotherProfile = {
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
      organizationUnit
    }
  ]
};

const event: BrotherTodayEventSummary = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Brother Gathering",
  type: "formation",
  startAt: "2026-06-01T10:00:00.000Z",
  endAt: null,
  locationLabel: "Riga",
  visibility: "ORGANIZATION_UNIT"
};

const prayer: BrotherPrayerSummary = {
  id: "55555555-5555-4555-8555-555555555555",
  title: "Brother Prayer",
  excerpt: "A brother-visible prayer.",
  language: "en",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: organizationUnit.id,
  category: {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "daily",
    title: "Daily Prayer",
    language: "en"
  }
};

const brother: CurrentUserPrincipal = {
  id: profile.id,
  email: profile.email,
  displayName: profile.displayName,
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnit.id]
};

const idleUser: CurrentUserPrincipal = {
  id: "77777777-7777-4777-8777-777777777777",
  email: "idle@example.test",
  displayName: "Idle User",
  status: "active",
  roles: [],
  approval: {
    state: "pending",
    expiresAt: "2026-06-04T08:00:00.000Z",
    scopeOrganizationUnitId: organizationUnit.id
  }
};

describe("BrotherCompanionService", () => {
  it("returns the current brother's own read-only profile", async () => {
    await expect(service().getProfile(brother)).resolves.toEqual({
      profile
    });
  });

  it("builds today from active profile, membership scope, and brother-visible events", async () => {
    const repository = repositoryWith(profile, [event]);

    await expect(new BrotherCompanionService(repository).getToday(brother)).resolves.toEqual({
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
      upcomingEvents: [event],
      organizationUnits: [organizationUnit]
    });
    expect(repository.eventScopes).toEqual([[organizationUnit.id]]);
  });

  it("builds safe fallback today copy for missing degree and multiple memberships", async () => {
    const secondOrganizationUnit = {
      ...organizationUnit,
      id: "55555555-5555-4555-8555-555555555555",
      name: "Second Choragiew"
    };
    const profileWithoutDegree: BrotherProfile = {
      ...profile,
      memberships: [
        {
          ...profile.memberships[0]!,
          currentDegree: null
        },
        {
          id: "66666666-6666-4666-8666-666666666666",
          currentDegree: null,
          joinedAt: null,
          organizationUnit: secondOrganizationUnit
        }
      ]
    };

    const today = await new BrotherCompanionService(
      repositoryWith(profileWithoutDegree, [])
    ).getToday(brother);

    expect(today.profileSummary).toEqual({
      displayName: "Demo Brother",
      currentDegree: null,
      organizationUnitName: "Pilot Choragiew"
    });
    expect(today.cards.find((card) => card.id === "profile")?.body).toBe(
      "Your profile is active. Current degree details are not recorded yet."
    );
    expect(today.cards.find((card) => card.id === "organization-units")?.body).toBe(
      "You have 2 active organization-unit assignments."
    );
    expect(today.organizationUnits).toEqual([organizationUnit, secondOrganizationUnit]);
  });

  it("lists brother-visible prayers using active membership organization-unit scope", async () => {
    const repository = repositoryWith(profile, [event], [prayer]);

    await expect(
      new BrotherCompanionService(repository).listPrayers(brother, {
        language: "en",
        limit: 20,
        offset: 0
      })
    ).resolves.toEqual({
      categories: [prayer.category],
      prayers: [prayer],
      pagination: {
        limit: 20,
        offset: 0
      }
    });
    expect(repository.prayerScopes).toEqual([[organizationUnit.id]]);
  });

  it("blocks non-brothers and brothers without an active membership profile", async () => {
    const candidate: CurrentUserPrincipal = {
      ...brother,
      roles: ["CANDIDATE"],
      memberOrganizationUnitIds: []
    };

    await expect(service().getToday(candidate)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service(repositoryWith(null, [])).getProfile(brother)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("blocks idle users with the approval-required code before loading memberships", async () => {
    const repository = repositoryWith(profile, [event]);

    await expect(service(repository).getToday(idleUser)).rejects.toMatchObject({
      response: {
        code: IDLE_APPROVAL_REQUIRED_CODE
      }
    });
    expect(repository.profileLookups).toEqual([]);
    expect(repository.eventScopes).toEqual([]);
    expect(repository.prayerScopes).toEqual([]);
  });
});

function service(
  repository: BrotherCompanionRepository = repositoryWith(profile, [event])
): BrotherCompanionService {
  return new BrotherCompanionService(repository);
}

function repositoryWith(
  profileRecord: BrotherProfile | null,
  events: BrotherTodayEventSummary[],
  prayers: BrotherPrayerSummary[] = []
): BrotherCompanionRepository & {
  eventScopes: string[][];
  prayerScopes: string[][];
  profileLookups: string[];
} {
  return {
    eventScopes: [],
    prayerScopes: [],
    profileLookups: [],
    findActiveBrotherProfile(userId) {
      this.profileLookups.push(userId);
      return Promise.resolve(profileRecord);
    },
    findUpcomingEvents(organizationUnitIds) {
      this.eventScopes.push([...organizationUnitIds]);
      return Promise.resolve(events);
    },
    findPublishedBrotherPrayerCategories() {
      return Promise.resolve(prayers.map((item) => item.category).filter((item) => item !== null));
    },
    findVisibleBrotherPrayers(_query, organizationUnitIds) {
      this.prayerScopes.push([...organizationUnitIds]);
      return Promise.resolve(prayers);
    }
  };
}
