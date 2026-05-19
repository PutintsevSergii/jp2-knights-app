import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessBrotherMode, canAccessCandidateMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { RoadmapRepository } from "./roadmap.repository.js";
import type { AssignedRoadmapResponse } from "./roadmap.types.js";

@Injectable()
export class RoadmapService {
  constructor(private readonly roadmapRepository: RoadmapRepository) {}

  async getCandidateRoadmap(principal: CurrentUserPrincipal): Promise<AssignedRoadmapResponse> {
    if (!canAccessCandidateMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Candidate access is required.");
    }

    const profile = await this.roadmapRepository.findActiveCandidateAccessProfile(principal.id);

    if (!profile) {
      throw new ForbiddenException("An active candidate profile is required.");
    }

    const roadmap = await this.roadmapRepository.findAssignedRoadmap({
      userId: principal.id,
      targetRole: "CANDIDATE",
      organizationUnitIds: profile.assignedOrganizationUnitId
        ? [profile.assignedOrganizationUnitId]
        : []
    });

    return { roadmap };
  }

  async getBrotherRoadmap(principal: CurrentUserPrincipal): Promise<AssignedRoadmapResponse> {
    if (!canAccessBrotherMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Brother access is required.");
    }

    const profile = await this.roadmapRepository.findActiveBrotherAccessProfile(principal.id);

    if (!profile) {
      throw new NotFoundException("Active brother membership profile was not found.");
    }

    const roadmap = await this.roadmapRepository.findAssignedRoadmap({
      userId: principal.id,
      targetRole: "BROTHER",
      organizationUnitIds: profile.organizationUnitIds
    });

    return { roadmap };
  }
}
