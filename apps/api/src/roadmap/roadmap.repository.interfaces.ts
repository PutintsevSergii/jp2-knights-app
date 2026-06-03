import type {
  AssignedRoadmap,
  AssignedRoadmapLookup,
  AdminRoadmapAssignmentAssigneeLookup,
  AdminRoadmapAssignmentDuplicateLookup,
  AdminRoadmapAssignmentDetail,
  AdminRoadmapAssignmentLookup,
  AdminRoadmapAssignmentSummary,
  AdminRoadmapDefinitionDetail,
  AdminRoadmapDefinitionAssignmentTarget,
  AdminRoadmapDefinitionLookup,
  AdminRoadmapDefinitionSummary,
  AdminRoadmapSubmissionDetail,
  AdminRoadmapSubmissionDetailLookup,
  AdminRoadmapSubmissionExport,
  AdminRoadmapSubmissionLookup,
  AdminRoadmapSubmissionSummary,
  BrotherRoadmapSubmissionTargetLookup,
  CreateAdminRoadmapAssignmentInput,
  CreateRoadmapSubmissionInput,
  ErasedRoadmapSubmission,
  PendingRoadmapSubmissionLookup,
  ReviewRoadmapSubmissionInput,
  RoadmapBrotherAccessProfile,
  RoadmapCandidateAccessProfile,
  RoadmapSubmissionSummary,
  RoadmapSubmissionTarget
} from "./roadmap.types.js";

export abstract class RoadmapAccessRepository {
  abstract findActiveCandidateAccessProfile(
    userId: string
  ): Promise<RoadmapCandidateAccessProfile | null>;
  abstract findActiveBrotherAccessProfile(
    userId: string
  ): Promise<RoadmapBrotherAccessProfile | null>;
  abstract findAssignedRoadmap(lookup: AssignedRoadmapLookup): Promise<AssignedRoadmap | null>;
}

export abstract class RoadmapSubmissionRepository {
  abstract findBrotherRoadmapSubmissionTarget(
    lookup: BrotherRoadmapSubmissionTargetLookup
  ): Promise<RoadmapSubmissionTarget | null>;
  abstract findPendingRoadmapSubmission(
    lookup: PendingRoadmapSubmissionLookup
  ): Promise<RoadmapSubmissionSummary | null>;
  abstract createRoadmapSubmission(
    input: CreateRoadmapSubmissionInput
  ): Promise<RoadmapSubmissionSummary>;
}

export abstract class AdminRoadmapSubmissionRepository {
  abstract listAdminRoadmapSubmissions(
    lookup: AdminRoadmapSubmissionLookup
  ): Promise<AdminRoadmapSubmissionSummary[]>;
  abstract findAdminRoadmapSubmission(
    lookup: AdminRoadmapSubmissionDetailLookup
  ): Promise<AdminRoadmapSubmissionDetail | null>;
  abstract findAdminRoadmapSubmissionForExport(
    id: string
  ): Promise<AdminRoadmapSubmissionExport | null>;
  abstract eraseAdminRoadmapSubmission(
    id: string,
    erasedAt: Date
  ): Promise<ErasedRoadmapSubmission | null>;
  abstract reviewRoadmapSubmission(
    input: ReviewRoadmapSubmissionInput
  ): Promise<AdminRoadmapSubmissionDetail | null>;
}

export abstract class AdminRoadmapAssignmentRepository {
  abstract listAdminRoadmapAssignments(): Promise<AdminRoadmapAssignmentSummary[]>;
  abstract findAdminRoadmapAssignment(
    lookup: AdminRoadmapAssignmentLookup
  ): Promise<AdminRoadmapAssignmentDetail | null>;
  abstract findPublishedRoadmapDefinitionAssignmentTarget(
    id: string
  ): Promise<AdminRoadmapDefinitionAssignmentTarget | null>;
  abstract findEligibleRoadmapAssignmentAssignee(
    lookup: AdminRoadmapAssignmentAssigneeLookup
  ): Promise<{ id: string } | null>;
  abstract findActiveRoadmapAssignmentDuplicate(
    lookup: AdminRoadmapAssignmentDuplicateLookup
  ): Promise<{ id: string } | null>;
  abstract createAdminRoadmapAssignment(
    input: CreateAdminRoadmapAssignmentInput
  ): Promise<AdminRoadmapAssignmentDetail>;
}

export abstract class AdminRoadmapDefinitionRepository {
  abstract listAdminRoadmapDefinitions(): Promise<AdminRoadmapDefinitionSummary[]>;
  abstract findAdminRoadmapDefinition(
    lookup: AdminRoadmapDefinitionLookup
  ): Promise<AdminRoadmapDefinitionDetail | null>;
}

export type RoadmapRepository = RoadmapAccessRepository &
  RoadmapSubmissionRepository &
  AdminRoadmapSubmissionRepository &
  AdminRoadmapAssignmentRepository &
  AdminRoadmapDefinitionRepository;
