import type {
  AdminRoadmapSubmissionDetailDto,
  AdminRoadmapSubmissionDetailResponseDto,
  AdminRoadmapSubmissionListResponseDto,
  AdminRoadmapSubmissionSummaryDto,
  AssignedRoadmapDto,
  AssignedRoadmapResponseDto,
  CreateRoadmapSubmissionRequestDto,
  RoadmapAttachmentMetadataDto,
  RoadmapSubmissionResponseDto,
  RoadmapSubmissionSummaryDto,
  ReviewRoadmapSubmissionRequestDto
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

export interface AdminRoadmapSubmissionLookup {
  scopeOrganizationUnitIds: readonly string[] | null;
}

export interface AdminRoadmapSubmissionDetailLookup extends AdminRoadmapSubmissionLookup {
  id: string;
}

export interface ReviewRoadmapSubmissionInput extends AdminRoadmapSubmissionDetailLookup {
  reviewerUserId: string;
  status: "approved" | "rejected";
  reviewComment: string | null;
}

export type AssignedRoadmap = AssignedRoadmapDto;
export type AssignedRoadmapResponse = AssignedRoadmapResponseDto;
export type CreateRoadmapSubmissionRequest = CreateRoadmapSubmissionRequestDto;
export type RoadmapSubmissionSummary = RoadmapSubmissionSummaryDto;
export type RoadmapSubmissionResponse = RoadmapSubmissionResponseDto;
export type AdminRoadmapSubmissionSummary = AdminRoadmapSubmissionSummaryDto;
export type AdminRoadmapSubmissionDetail = AdminRoadmapSubmissionDetailDto;
export type AdminRoadmapSubmissionListResponse = AdminRoadmapSubmissionListResponseDto;
export type AdminRoadmapSubmissionDetailResponse = AdminRoadmapSubmissionDetailResponseDto;
export type ReviewRoadmapSubmissionRequest = ReviewRoadmapSubmissionRequestDto;
