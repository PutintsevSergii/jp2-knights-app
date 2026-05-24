import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { canAccessBrotherMode, canAccessCandidateMode } from "@jp2/shared-auth";
import { adminScopeFor, requireAdminLite, requireSuperAdmin } from "../admin/admin-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { RoadmapRepository } from "./roadmap.repository.js";
import type {
  AdminRoadmapAssignmentDetailResponse,
  AdminRoadmapAssignmentListResponse,
  AdminRoadmapDefinitionDetailResponse,
  AdminRoadmapDefinitionListResponse,
  AdminRoadmapSubmissionDetail,
  AdminRoadmapSubmissionDetailResponse,
  AdminRoadmapSubmissionListResponse,
  AssignedRoadmapResponse,
  CreateAdminRoadmapAssignmentRequest,
  CreateRoadmapSubmissionRequest,
  ReviewRoadmapSubmissionRequest,
  RoadmapSubmissionResponse
} from "./roadmap.types.js";

@Injectable()
export class RoadmapService {
  constructor(
    private readonly roadmapRepository: RoadmapRepository,
    private readonly auditLog: AuditLogService
  ) {}

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

  async listAdminRoadmapSubmissions(
    principal: CurrentUserPrincipal
  ): Promise<AdminRoadmapSubmissionListResponse> {
    requireAdminLite(principal);

    return {
      roadmapSubmissions: await this.roadmapRepository.listAdminRoadmapSubmissions({
        scopeOrganizationUnitIds: adminScopeFor(principal)
      })
    };
  }

  async getAdminRoadmapSubmission(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminRoadmapSubmissionDetailResponse> {
    requireAdminLite(principal);

    const roadmapSubmission = await this.roadmapRepository.findAdminRoadmapSubmission({
      id,
      scopeOrganizationUnitIds: adminScopeFor(principal)
    });

    if (!roadmapSubmission) {
      throw new NotFoundException("Roadmap submission was not found in the current admin scope.");
    }

    return { roadmapSubmission };
  }

  async reviewAdminRoadmapSubmission(
    principal: CurrentUserPrincipal,
    id: string,
    request: ReviewRoadmapSubmissionRequest
  ): Promise<AdminRoadmapSubmissionDetailResponse> {
    requireAdminLite(principal);

    const scopeOrganizationUnitIds = adminScopeFor(principal);
    const beforeSubmission = await this.roadmapRepository.findAdminRoadmapSubmission({
      id,
      scopeOrganizationUnitIds
    });

    if (!beforeSubmission) {
      throw new NotFoundException("Roadmap submission was not found in the current admin scope.");
    }

    if (beforeSubmission.status !== "pending_review") {
      throw new ConflictException("Only pending roadmap submissions can be reviewed.");
    }

    const roadmapSubmission = await this.roadmapRepository.reviewRoadmapSubmission({
      id,
      scopeOrganizationUnitIds,
      reviewerUserId: principal.id,
      status: request.status,
      reviewComment: request.reviewComment ?? null
    });

    if (!roadmapSubmission) {
      throw new NotFoundException("Roadmap submission was not found in the current admin scope.");
    }

    await this.auditLog.record({
      action: `admin.roadmapSubmission.${request.status}`,
      actorUserId: principal.id,
      entityType: "roadmap_submission",
      entityId: roadmapSubmission.id,
      scopeOrganizationUnitId: roadmapSubmission.organizationUnitId,
      beforeSummary: summarizeRoadmapSubmissionForAudit(beforeSubmission),
      afterSummary: summarizeRoadmapSubmissionForAudit(roadmapSubmission)
    });

    return { roadmapSubmission };
  }

  async listAdminRoadmapAssignments(
    principal: CurrentUserPrincipal
  ): Promise<AdminRoadmapAssignmentListResponse> {
    requireSuperAdmin(principal);

    return {
      roadmapAssignments: await this.roadmapRepository.listAdminRoadmapAssignments()
    };
  }

  async getAdminRoadmapAssignment(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminRoadmapAssignmentDetailResponse> {
    requireSuperAdmin(principal);

    const roadmapAssignment = await this.roadmapRepository.findAdminRoadmapAssignment({ id });

    if (!roadmapAssignment) {
      throw new NotFoundException("Roadmap assignment was not found.");
    }

    return { roadmapAssignment };
  }

  async createAdminRoadmapAssignment(
    principal: CurrentUserPrincipal,
    request: CreateAdminRoadmapAssignmentRequest
  ): Promise<AdminRoadmapAssignmentDetailResponse> {
    requireSuperAdmin(principal);

    const organizationUnitId = request.organizationUnitId ?? null;
    const roadmapDefinition =
      await this.roadmapRepository.findPublishedRoadmapDefinitionAssignmentTarget(
        request.roadmapDefinitionId
      );

    if (!roadmapDefinition) {
      throw new NotFoundException("Published roadmap definition was not found.");
    }

    const assignee = await this.roadmapRepository.findEligibleRoadmapAssignmentAssignee({
      userId: request.assigneeUserId,
      targetRole: roadmapDefinition.targetRole,
      organizationUnitId
    });

    if (!assignee) {
      throw new NotFoundException(
        "Eligible candidate or brother assignee was not found for this roadmap scope."
      );
    }

    const duplicate = await this.roadmapRepository.findActiveRoadmapAssignmentDuplicate({
      assigneeUserId: request.assigneeUserId,
      roadmapDefinitionId: request.roadmapDefinitionId,
      organizationUnitId
    });

    if (duplicate) {
      throw new ConflictException("An active roadmap assignment already exists for this scope.");
    }

    const roadmapAssignment = await this.roadmapRepository.createAdminRoadmapAssignment({
      assigneeUserId: request.assigneeUserId,
      roadmapDefinitionId: request.roadmapDefinitionId,
      organizationUnitId,
      assignedByUserId: principal.id
    });

    await this.auditLog.record({
      action: "admin.roadmapAssignment.create",
      actorUserId: principal.id,
      entityType: "roadmap_assignment",
      entityId: roadmapAssignment.id,
      scopeOrganizationUnitId: roadmapAssignment.organizationUnitId,
      beforeSummary: null,
      afterSummary: summarizeRoadmapAssignmentForAudit(roadmapAssignment)
    });

    return { roadmapAssignment };
  }

  async listAdminRoadmapDefinitions(
    principal: CurrentUserPrincipal
  ): Promise<AdminRoadmapDefinitionListResponse> {
    requireSuperAdmin(principal);

    return {
      roadmapDefinitions: await this.roadmapRepository.listAdminRoadmapDefinitions()
    };
  }

  async getAdminRoadmapDefinition(
    principal: CurrentUserPrincipal,
    id: string
  ): Promise<AdminRoadmapDefinitionDetailResponse> {
    requireSuperAdmin(principal);

    const roadmapDefinition = await this.roadmapRepository.findAdminRoadmapDefinition({ id });

    if (!roadmapDefinition) {
      throw new NotFoundException("Roadmap definition was not found.");
    }

    return { roadmapDefinition };
  }
}

function summarizeRoadmapAssignmentForAudit(
  assignment: AdminRoadmapAssignmentDetailResponse["roadmapAssignment"]
): AuditSummary {
  return {
    assignmentId: assignment.id,
    assigneeUserId: assignment.assigneeUserId,
    roadmapDefinitionId: assignment.roadmapDefinitionId,
    roadmapTargetRole: assignment.roadmapTargetRole,
    organizationUnitId: assignment.organizationUnitId,
    status: assignment.status,
    assignedByUserId: assignment.assignedByUserId,
    submissionCount: assignment.submissionCount,
    pendingSubmissionCount: assignment.pendingSubmissionCount
  };
}

function summarizeRoadmapSubmissionForAudit(
  submission: AdminRoadmapSubmissionDetail
): AuditSummary {
  return {
    submissionId: submission.id,
    assignmentId: submission.assignmentId,
    stepId: submission.stepId,
    submitterUserId: submission.submitterUserId,
    roadmapTargetRole: submission.roadmapTargetRole,
    organizationUnitId: submission.organizationUnitId,
    status: submission.status,
    attachmentCount: submission.attachmentCount,
    hasBody: Boolean(submission.body),
    hasReviewComment: Boolean(submission.reviewComment),
    reviewedAt: submission.reviewedAt
  };
}
