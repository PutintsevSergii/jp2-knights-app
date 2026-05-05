import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { BrotherCompanionRepository } from "./brother-companion.repository.js";
import { BrotherCompanionService } from "./brother-companion.service.js";
import type { BrotherProfile, BrotherTodayEventSummary } from "./brother-companion.types.js";

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

const brother: CurrentUserPrincipal = {
  id: profile.id,
  email: profile.email,
  displayName: profile.displayName,
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnit.id]
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
});

function service(
  repository: BrotherCompanionRepository = repositoryWith(profile, [event])
): BrotherCompanionService {
  return new BrotherCompanionService(repository);
}

function repositoryWith(
  profileRecord: BrotherProfile | null,
  events: BrotherTodayEventSummary[]
): BrotherCompanionRepository & { eventScopes: string[][] } {
  return {
    eventScopes: [],
    findActiveBrotherProfile: () => Promise.resolve(profileRecord),
    findUpcomingEvents(organizationUnitIds) {
      this.eventScopes.push([...organizationUnitIds]);
      return Promise.resolve(events);
    }
  };
}
