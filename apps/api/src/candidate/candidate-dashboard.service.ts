import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessCandidateMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { CandidateDashboardRepository } from "./candidate-dashboard.repository.js";
import type {
  CandidateDashboardProfile,
  CandidateDashboardResponse,
  CandidateEventDetailResponse,
  CandidateEventListQuery,
  CandidateEventListResponse
} from "./candidate-dashboard.types.js";

@Injectable()
export class CandidateDashboardService {
  constructor(private readonly candidateDashboardRepository: CandidateDashboardRepository) {}

  async getDashboard(principal: CurrentUserPrincipal): Promise<CandidateDashboardResponse> {
    const profile = await this.loadProfile(principal);

    const upcomingEvents = await this.candidateDashboardRepository.findUpcomingEvents(
      profile.assignedOrganizationUnit?.id ?? null
    );

    return {
      profile,
      nextStep: buildNextStep(profile),
      upcomingEvents,
      announcements: []
    };
  }

  async listEvents(
    principal: CurrentUserPrincipal,
    query: CandidateEventListQuery
  ): Promise<CandidateEventListResponse> {
    const profile = await this.loadProfile(principal);
    const events = await this.candidateDashboardRepository.findVisibleCandidateEvents(
      query,
      profile.assignedOrganizationUnit?.id ?? null
    );

    return {
      events,
      pagination: {
        limit: query.limit,
        offset: query.offset
      }
    };
  }

  async getEvent(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<CandidateEventDetailResponse> {
    const profile = await this.loadProfile(principal);
    const event = await this.candidateDashboardRepository.findVisibleCandidateEvent(
      id,
      profile.assignedOrganizationUnit?.id ?? null,
      principal.id
    );

    if (!event) {
      throw new NotFoundException("Candidate event was not found in the current scope.");
    }

    return { event };
  }

  private async loadProfile(principal: CurrentUserPrincipal): Promise<CandidateDashboardProfile> {
    if (!canAccessCandidateMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Candidate access is required.");
    }

    const profile = await this.candidateDashboardRepository.findActiveProfile(principal.id);

    if (!profile) {
      throw new ForbiddenException("An active candidate profile is required.");
    }

    return profile;
  }
}

function buildNextStep(profile: CandidateDashboardResponse["profile"]) {
  if (!profile.assignedOrganizationUnit) {
    return {
      id: "await-assignment",
      label: "Await local assignment",
      body: "A local officer still needs to assign your candidate profile to a choragiew.",
      targetRoute: "CandidateContact" as const,
      priority: "attention" as const
    };
  }

  if (!profile.responsibleOfficer) {
    return {
      id: "await-contact",
      label: "Await officer contact",
      body: `Your profile is assigned to ${profile.assignedOrganizationUnit.name}. A responsible officer contact is still being prepared.`,
      targetRoute: "CandidateContact" as const,
      priority: "attention" as const
    };
  }

  return {
    id: "review-roadmap",
    label: "Review your candidate path",
    body: `Stay in touch with ${profile.responsibleOfficer.displayName} and review upcoming candidate steps.`,
    targetRoute: "CandidateRoadmap" as const,
    priority: "normal" as const
  };
}
