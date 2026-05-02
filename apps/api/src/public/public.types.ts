import type {
  PublicContentPageQueryDto,
  PublicContentPageResponseDto,
  PublicHomeQueryDto,
  PublicHomeResponseDto
} from "@jp2/shared-validation";

export type PublicHomeQuery = PublicHomeQueryDto;
export type PublicHomeResponse = PublicHomeResponseDto;
export type PublicContentPageQuery = PublicContentPageQueryDto;
export type PublicContentPageResponse = PublicContentPageResponseDto;
export type PublicContentPage = PublicContentPageResponse["page"];
