import type {
  AdminRoadmapAssignmentDetailDto,
  AdminRoadmapAssignmentDetailResponseDto,
  AdminRoadmapAssignmentListResponseDto,
  AdminRoadmapAssignmentSummaryDto,
  AdminRoadmapDefinitionDetailDto,
  AdminRoadmapDefinitionDetailResponseDto,
  AdminRoadmapDefinitionListResponseDto,
  AdminRoadmapDefinitionSummaryDto,
  AdminRoadmapSubmissionDetailDto,
  AdminRoadmapSubmissionDetailResponseDto,
  AdminRoadmapSubmissionErasureResponseDto,
  AdminRoadmapSubmissionExportDto,
  AdminRoadmapSubmissionExportResponseDto,
  AdminRoadmapSubmissionListResponseDto,
  AdminRoadmapSubmissionSummaryDto,
  AssignedRoadmapDto,
  AssignedRoadmapResponseDto,
  CreateAdminRoadmapAssignmentRequestDto,
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

export interface ErasedRoadmapSubmission {
  id: string;
  organizationUnitId: string | null;
  status: AdminRoadmapSubmissionDetail["status"];
  archivedAt: string | null;
}

export interface AdminRoadmapDefinitionLookup {
  id: string;
}

export interface AdminRoadmapAssignmentLookup {
  id: string;
}

export interface AdminRoadmapDefinitionAssignmentTarget {
  id: string;
  title: string;
  targetRole: RoadmapTargetRole;
}

export interface AdminRoadmapAssignmentAssigneeLookup {
  userId: string;
  targetRole: RoadmapTargetRole;
  organizationUnitId: string | null;
}

export interface AdminRoadmapAssignmentDuplicateLookup {
  assigneeUserId: string;
  roadmapDefinitionId: string;
  organizationUnitId: string | null;
}

export interface CreateAdminRoadmapAssignmentInput
  extends AdminRoadmapAssignmentDuplicateLookup {
  assignedByUserId: string;
}

export type AssignedRoadmap = AssignedRoadmapDto;
export type AssignedRoadmapResponse = AssignedRoadmapResponseDto;
export type CreateRoadmapSubmissionRequest = CreateRoadmapSubmissionRequestDto;
export type RoadmapSubmissionSummary = RoadmapSubmissionSummaryDto;
export type RoadmapSubmissionResponse = RoadmapSubmissionResponseDto;
export type AdminRoadmapSubmissionSummary = AdminRoadmapSubmissionSummaryDto;
export type AdminRoadmapSubmissionDetail = AdminRoadmapSubmissionDetailDto;
export type AdminRoadmapSubmissionExport = AdminRoadmapSubmissionExportDto;
export type AdminRoadmapSubmissionListResponse = AdminRoadmapSubmissionListResponseDto;
export type AdminRoadmapSubmissionDetailResponse = AdminRoadmapSubmissionDetailResponseDto;
export type AdminRoadmapSubmissionExportResponse = AdminRoadmapSubmissionExportResponseDto;
export type AdminRoadmapSubmissionErasureResponse = AdminRoadmapSubmissionErasureResponseDto;
export type ReviewRoadmapSubmissionRequest = ReviewRoadmapSubmissionRequestDto;
export type AdminRoadmapDefinitionSummary = AdminRoadmapDefinitionSummaryDto;
export type AdminRoadmapDefinitionDetail = AdminRoadmapDefinitionDetailDto;
export type AdminRoadmapDefinitionListResponse = AdminRoadmapDefinitionListResponseDto;
export type AdminRoadmapDefinitionDetailResponse = AdminRoadmapDefinitionDetailResponseDto;
export type AdminRoadmapAssignmentSummary = AdminRoadmapAssignmentSummaryDto;
export type AdminRoadmapAssignmentDetail = AdminRoadmapAssignmentDetailDto;
export type AdminRoadmapAssignmentListResponse = AdminRoadmapAssignmentListResponseDto;
export type AdminRoadmapAssignmentDetailResponse = AdminRoadmapAssignmentDetailResponseDto;
export type CreateAdminRoadmapAssignmentRequest = CreateAdminRoadmapAssignmentRequestDto;
