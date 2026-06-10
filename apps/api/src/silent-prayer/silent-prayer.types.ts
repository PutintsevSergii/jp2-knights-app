import type {
  BrotherSilentPrayerEventSummaryDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto,
  PublicSilentPrayerEventSummaryDto,
  PublicSilentPrayerJoinRequestDto,
  PublicSilentPrayerJoinResponseDto,
  PublicSilentPrayerListResponseDto,
  PublicSilentPrayerPresenceRequestDto,
  SilentPrayerEventPresenceRequestDto,
  SilentPrayerPresenceActionResponseDto,
  SilentPrayerPaginationQueryDto,
  SilentPrayerPresenceDto
} from "@jp2/shared-validation";

export type SilentPrayerListQuery = SilentPrayerPaginationQueryDto;
export type PublicSilentPrayerJoinRequest = PublicSilentPrayerJoinRequestDto;
export type PublicSilentPrayerPresenceRequest = PublicSilentPrayerPresenceRequestDto;
export type SilentPrayerEventPresenceRequest = SilentPrayerEventPresenceRequestDto;
export type SilentPrayerPresence = SilentPrayerPresenceDto;
export type PublicSilentPrayerEventSummary = PublicSilentPrayerEventSummaryDto;
export type BrotherSilentPrayerEventSummary = BrotherSilentPrayerEventSummaryDto;
export type PublicSilentPrayerListResponse = PublicSilentPrayerListResponseDto;
export type BrotherSilentPrayerListResponse = BrotherSilentPrayerListResponseDto;
export type PublicSilentPrayerJoinResponse = PublicSilentPrayerJoinResponseDto;
export type BrotherSilentPrayerJoinResponse = BrotherSilentPrayerJoinResponseDto;
export type SilentPrayerPresenceActionResponse = SilentPrayerPresenceActionResponseDto;
