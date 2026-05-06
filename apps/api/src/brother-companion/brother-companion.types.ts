import type {
  BrotherAnnouncementListQueryDto,
  BrotherAnnouncementListResponseDto,
  BrotherAnnouncementSummaryDto,
  BrotherEventListQueryDto,
  BrotherEventListResponseDto,
  BrotherEventDetailResponseDto,
  BrotherEventSummaryDto,
  BrotherPrayerListQueryDto,
  BrotherPrayerListResponseDto,
  BrotherPrayerSummaryDto,
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
export type BrotherEventListQuery = BrotherEventListQueryDto;
export type BrotherEventSummary = BrotherEventSummaryDto;
export type BrotherEventListResponse = BrotherEventListResponseDto;
export type BrotherEventDetail = BrotherEventDetailResponseDto["event"];
export type BrotherEventDetailResponse = BrotherEventDetailResponseDto;
export type BrotherAnnouncementListQuery = BrotherAnnouncementListQueryDto;
export type BrotherAnnouncementSummary = BrotherAnnouncementSummaryDto;
export type BrotherAnnouncementListResponse = BrotherAnnouncementListResponseDto;
export type BrotherPrayerListQuery = BrotherPrayerListQueryDto;
export type BrotherPrayerSummary = BrotherPrayerSummaryDto;
export type BrotherPrayerCategorySummary = BrotherPrayerListResponseDto["categories"][number];
export type BrotherPrayerListResponse = BrotherPrayerListResponseDto;
