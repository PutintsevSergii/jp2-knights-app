import type {
  BrotherSilentPrayerEventSummaryDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto,
  PublicSilentPrayerEventSummaryDto,
  PublicSilentPrayerJoinRequestDto,
  PublicSilentPrayerJoinResponseDto,
  PublicSilentPrayerListResponseDto,
  SilentPrayerPaginationQueryDto,
  SilentPrayerPresenceDto
} from "@jp2/shared-validation";

export type SilentPrayerListQuery = SilentPrayerPaginationQueryDto;
export type PublicSilentPrayerJoinRequest = PublicSilentPrayerJoinRequestDto;
export type SilentPrayerPresence = SilentPrayerPresenceDto;
export type PublicSilentPrayerEventSummary = PublicSilentPrayerEventSummaryDto;
export type BrotherSilentPrayerEventSummary = BrotherSilentPrayerEventSummaryDto;
export type PublicSilentPrayerListResponse = PublicSilentPrayerListResponseDto;
export type BrotherSilentPrayerListResponse = BrotherSilentPrayerListResponseDto;
export type PublicSilentPrayerJoinResponse = PublicSilentPrayerJoinResponseDto;
export type BrotherSilentPrayerJoinResponse = BrotherSilentPrayerJoinResponseDto;
