import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessBrotherMode } from "@jp2/shared-auth";
import type { OrganizationUnitSummaryDto } from "@jp2/shared-validation";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { BrotherCompanionRepository } from "./brother-companion.repository.js";
import type {
  BrotherEventDetailResponse,
  BrotherEventListQuery,
  BrotherEventListResponse,
  BrotherPrayerListQuery,
  BrotherPrayerListResponse,
  BrotherProfile,
  BrotherProfileResponse,
  BrotherTodayResponse
} from "./brother-companion.types.js";

@Injectable()
export class BrotherCompanionService {
  constructor(private readonly brotherCompanionRepository: BrotherCompanionRepository) {}

  async getProfile(principal: CurrentUserPrincipal): Promise<BrotherProfileResponse> {
    const profile = await this.loadProfile(principal);

    return { profile };
  }

  async getToday(principal: CurrentUserPrincipal): Promise<BrotherTodayResponse> {
    const profile = await this.loadProfile(principal);
    const organizationUnits = profile.memberships.map((membership) => membership.organizationUnit);
    const upcomingEvents = await this.brotherCompanionRepository.findUpcomingEvents(
      organizationUnits.map((organizationUnit) => organizationUnit.id)
    );
    const primaryMembership = profile.memberships[0];

    return {
      profileSummary: {
        displayName: profile.displayName,
        currentDegree: primaryMembership?.currentDegree ?? null,
        organizationUnitName: primaryMembership?.organizationUnit.name ?? null
      },
      cards: buildTodayCards(profile, organizationUnits),
      upcomingEvents,
      organizationUnits
    };
  }

  async listPrayers(
    principal: CurrentUserPrincipal,
    query: BrotherPrayerListQuery
  ): Promise<BrotherPrayerListResponse> {
    const profile = await this.loadProfile(principal);
    const organizationUnitIds = profile.memberships.map(
      (membership) => membership.organizationUnit.id
    );
    const [categories, prayers] = await Promise.all([
      this.brotherCompanionRepository.findPublishedBrotherPrayerCategories(query.language),
      this.brotherCompanionRepository.findVisibleBrotherPrayers(query, organizationUnitIds)
    ]);

    return {
      categories,
      prayers,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async listEvents(
    principal: CurrentUserPrincipal,
    query: BrotherEventListQuery
  ): Promise<BrotherEventListResponse> {
    const profile = await this.loadProfile(principal);
    const organizationUnitIds = profile.memberships.map(
      (membership) => membership.organizationUnit.id
    );
    const events = await this.brotherCompanionRepository.findVisibleBrotherEvents(
      query,
      organizationUnitIds
    );

    return {
      events,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async getEvent(principal: CurrentUserPrincipal, id: string): Promise<BrotherEventDetailResponse> {
    const profile = await this.loadProfile(principal);
    const organizationUnitIds = profile.memberships.map(
      (membership) => membership.organizationUnit.id
    );
    const event = await this.brotherCompanionRepository.findVisibleBrotherEvent(
      id,
      organizationUnitIds,
      principal.id
    );

    if (!event) {
      throw new NotFoundException("Brother event was not found in the current scope.");
    }

    return { event };
  }

  private async loadProfile(principal: CurrentUserPrincipal): Promise<BrotherProfile> {
    if (!canAccessBrotherMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Brother access is required.");
    }

    const profile = await this.brotherCompanionRepository.findActiveBrotherProfile(principal.id);

    if (!profile) {
      throw new NotFoundException("Active brother membership profile was not found.");
    }

    return profile;
  }
}

function buildTodayCards(
  profile: BrotherProfile,
  organizationUnits: OrganizationUnitSummaryDto[]
): BrotherTodayResponse["cards"] {
  const primaryMembership = profile.memberships[0];
  const cards: BrotherTodayResponse["cards"] = [
    {
      id: "profile",
      label: "Review profile",
      body: primaryMembership?.currentDegree
        ? `Your current degree is ${primaryMembership.currentDegree}.`
        : "Your profile is active. Current degree details are not recorded yet.",
      targetRoute: "BrotherProfile",
      priority: "normal"
    },
    {
      id: "organization-units",
      label: "My choragiew",
      body:
        organizationUnits.length === 1
          ? `You are assigned to ${organizationUnits[0]?.name ?? "your choragiew"}.`
          : `You have ${organizationUnits.length} active organization-unit assignments.`,
      targetRoute: "MyOrganizationUnits",
      priority: "normal"
    }
  ];

  cards.push({
    id: "events",
    label: "Upcoming events",
    body: "Review public, brother, and own choragiew events visible to you.",
    targetRoute: "BrotherEvents",
    priority: "normal"
  });

  return cards;
}
