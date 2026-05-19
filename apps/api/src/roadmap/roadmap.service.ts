import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { canAccessBrotherMode, canAccessCandidateMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { RoadmapRepository } from "./roadmap.repository.js";
import type {
  AssignedRoadmapResponse,
  CreateRoadmapSubmissionRequest,
  RoadmapSubmissionResponse
} from "./roadmap.types.js";

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

  async submitBrotherRoadmapStep(
    principal: CurrentUserPrincipal,
    stepId: string,
    request: CreateRoadmapSubmissionRequest
  ): Promise<RoadmapSubmissionResponse> {
    if (!canAccessBrotherMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Brother access is required.");
    }

    if (request.stepId !== stepId) {
      throw new BadRequestException("Request stepId must match the route stepId.");
    }

    const profile = await this.roadmapRepository.findActiveBrotherAccessProfile(principal.id);

    if (!profile) {
      throw new NotFoundException("Active brother membership profile was not found.");
    }

    const target = await this.roadmapRepository.findBrotherRoadmapSubmissionTarget({
      userId: principal.id,
      stepId,
      organizationUnitIds: profile.organizationUnitIds
    });

    if (!target) {
      throw new NotFoundException("Roadmap step was not found in the current brother scope.");
    }

    const pendingSubmission = await this.roadmapRepository.findPendingRoadmapSubmission({
      assignmentId: target.assignmentId,
      stepId: target.stepId
    });

    if (pendingSubmission) {
      throw new ConflictException("A pending roadmap submission already exists for this step.");
    }

    const submission = await this.roadmapRepository.createRoadmapSubmission({
      assignmentId: target.assignmentId,
      stepId: target.stepId,
      userId: principal.id,
      body: request.body,
      attachmentMetadata: request.attachmentMetadata
    });

    return { submission };
  }
}
