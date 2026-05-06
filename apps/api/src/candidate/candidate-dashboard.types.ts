import type {
  CandidateEventDetailResponseDto,
  CandidateEventListQueryDto,
  CandidateEventListResponseDto,
  CandidateEventSummaryDto,
  CandidateDashboardEventSummaryDto,
  CandidateDashboardResponseDto
} from "@jp2/shared-validation";

export type CandidateDashboardResponse = CandidateDashboardResponseDto;
export type CandidateDashboardProfile = CandidateDashboardResponse["profile"];
export type CandidateDashboardEventSummary = CandidateDashboardEventSummaryDto;
export type CandidateEventListQuery = CandidateEventListQueryDto;
export type CandidateEventSummary = CandidateEventSummaryDto;
export type CandidateEventListResponse = CandidateEventListResponseDto;
export type CandidateEventDetail = CandidateEventDetailResponseDto["event"];
export type CandidateEventDetailResponse = CandidateEventDetailResponseDto;
