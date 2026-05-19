import type {
  AssignedRoadmapDto,
  AssignedRoadmapResponseDto,
  CreateRoadmapSubmissionRequestDto,
  RoadmapAttachmentMetadataDto,
  RoadmapSubmissionResponseDto,
  RoadmapSubmissionSummaryDto
} from "@jp2/shared-validation";

export type RoadmapTargetRole = "CANDIDATE" | "BROTHER";

export interface RoadmapCandidateAccessProfile {
  assignedOrganizationUnitId: string | null;
}

export interface RoadmapBrotherAccessProfile {
  organizationUnitIds: readonly string[];
}

export interface AssignedRoadmapLookup {
  userId: string;
  targetRole: RoadmapTargetRole;
  organizationUnitIds: readonly string[];
  now?: Date;
}

export interface BrotherRoadmapSubmissionTargetLookup {
  userId: string;
  stepId: string;
  organizationUnitIds: readonly string[];
  now?: Date;
}

export interface RoadmapSubmissionTarget {
  assignmentId: string;
  stepId: string;
}

export interface PendingRoadmapSubmissionLookup {
  assignmentId: string;
  stepId: string;
}

export interface CreateRoadmapSubmissionInput {
  assignmentId: string;
  stepId: string;
  userId: string;
  body: string;
  attachmentMetadata: readonly RoadmapAttachmentMetadataDto[];
}

export type AssignedRoadmap = AssignedRoadmapDto;
export type AssignedRoadmapResponse = AssignedRoadmapResponseDto;
export type CreateRoadmapSubmissionRequest = CreateRoadmapSubmissionRequestDto;
export type RoadmapSubmissionSummary = RoadmapSubmissionSummaryDto;
export type RoadmapSubmissionResponse = RoadmapSubmissionResponseDto;
