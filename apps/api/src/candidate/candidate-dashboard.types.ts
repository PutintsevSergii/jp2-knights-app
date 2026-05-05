import type {
  CandidateDashboardEventSummaryDto,
  CandidateDashboardResponseDto
} from "@jp2/shared-validation";

export type CandidateDashboardResponse = CandidateDashboardResponseDto;
export type CandidateDashboardProfile = CandidateDashboardResponse["profile"];
export type CandidateDashboardEventSummary = CandidateDashboardEventSummaryDto;

