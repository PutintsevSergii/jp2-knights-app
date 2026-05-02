import type {
  PublicContentPageQueryDto,
  PublicContentPageResponseDto,
  PublicEventDetailResponseDto,
  PublicEventListQueryDto,
  PublicEventListResponseDto,
  PublicHomeQueryDto,
  PublicHomeResponseDto,
  PublicPrayerDetailResponseDto,
  PublicPrayerListQueryDto,
  PublicPrayerListResponseDto
} from "@jp2/shared-validation";

export type PublicHomeQuery = PublicHomeQueryDto;
export type PublicHomeResponse = PublicHomeResponseDto;
export type PublicContentPageQuery = PublicContentPageQueryDto;
export type PublicContentPageResponse = PublicContentPageResponseDto;
export type PublicContentPage = PublicContentPageResponse["page"];
export type PublicPrayerListQuery = PublicPrayerListQueryDto;
export type PublicPrayerListResponse = PublicPrayerListResponseDto;
export type PublicPrayerDetailResponse = PublicPrayerDetailResponseDto;
export type PublicPrayerSummary = PublicPrayerListResponse["prayers"][number];
export type PublicPrayerDetail = PublicPrayerDetailResponse["prayer"];
export type PublicPrayerCategorySummary = PublicPrayerListResponse["categories"][number];
export type PublicEventListQuery = PublicEventListQueryDto;
export type PublicEventListResponse = PublicEventListResponseDto;
export type PublicEventDetailResponse = PublicEventDetailResponseDto;
export type PublicEventSummary = PublicEventListResponse["events"][number];
export type PublicEventDetail = PublicEventDetailResponse["event"];
