import { ForbiddenException, Injectable } from "@nestjs/common";
import { canAccessCandidateMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { CandidateDashboardRepository } from "./candidate-dashboard.repository.js";
import type { CandidateDashboardResponse } from "./candidate-dashboard.types.js";

@Injectable()
export class CandidateDashboardService {
  constructor(private readonly candidateDashboardRepository: CandidateDashboardRepository) {}

  async getDashboard(principal: CurrentUserPrincipal): Promise<CandidateDashboardResponse> {
    if (!canAccessCandidateMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Candidate access is required.");
    }

    const profile = await this.candidateDashboardRepository.findActiveProfile(principal.id);

    if (!profile) {
      throw new ForbiddenException("An active candidate profile is required.");
    }

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
