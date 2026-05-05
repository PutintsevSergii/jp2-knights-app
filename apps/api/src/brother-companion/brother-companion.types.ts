import type {
  BrotherMembershipSummaryDto,
  BrotherProfileResponseDto,
  BrotherTodayEventSummaryDto,
  BrotherTodayResponseDto
} from "@jp2/shared-validation";

export type BrotherMembershipSummary = BrotherMembershipSummaryDto;
export type BrotherProfile = BrotherProfileResponseDto["profile"];
export type BrotherProfileResponse = BrotherProfileResponseDto;
export type BrotherTodayEventSummary = BrotherTodayEventSummaryDto;
export type BrotherTodayResponse = BrotherTodayResponseDto;
