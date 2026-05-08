import {
  publicEventListResponseSchema,
  publicPrayerListResponseSchema,
  type PublicEventListResponseDto,
  type PublicPrayerListResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  normalizeBaseUrl,
  requestPublicMobileApi,
  setOptionalNumberParam,
  setOptionalParam,
  type MobileApiFetchResponse,
  type MobilePublicFetch
} from "./mobile-api-client.js";

export type PublicContentListFetchResponse = MobileApiFetchResponse;

export type PublicContentListFetch = MobilePublicFetch;

export interface PublicPrayerListUrlQuery {
  categoryId?: string;
  q?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface PublicEventListUrlQuery {
  from?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface FetchPublicPrayersOptions extends PublicPrayerListUrlQuery {
  baseUrl?: string;
  fetchImpl?: PublicContentListFetch;
}

export interface FetchPublicEventsOptions extends PublicEventListUrlQuery {
  baseUrl?: string;
  fetchImpl?: PublicContentListFetch;
}

export async function fetchPublicPrayers(
  options: FetchPublicPrayersOptions = {}
): Promise<PublicPrayerListResponseDto> {
  const response = await requestPublicMobileApi<PublicContentListFetchResponse>(
    buildPublicPrayerListUrl(options.baseUrl, options),
    options.fetchImpl,
    (status) => new PublicContentListHttpError(status)
  );

  return publicPrayerListResponseSchema.parse(await response.json());
}

export async function fetchPublicEvents(
  options: FetchPublicEventsOptions = {}
): Promise<PublicEventListResponseDto> {
  const response = await requestPublicMobileApi<PublicContentListFetchResponse>(
    buildPublicEventListUrl(options.baseUrl, options),
    options.fetchImpl,
    (status) => new PublicContentListHttpError(status)
  );

  return publicEventListResponseSchema.parse(await response.json());
}

export function buildPublicPrayerListUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: PublicPrayerListUrlQuery = {}
) {
  const url = new URL("public/prayers", normalizeBaseUrl(baseUrl));
  setOptionalParam(url, "language", query.language);
  setOptionalParam(url, "q", query.q);
  setOptionalParam(url, "categoryId", query.categoryId);
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildPublicEventListUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: PublicEventListUrlQuery = {}
) {
  const url = new URL("public/events", normalizeBaseUrl(baseUrl));
  setOptionalParam(url, "from", query.from);
  setOptionalParam(url, "type", query.type);
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function publicContentListLoadFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicContentListHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public content list request failed with HTTP ${status}.`);
  }
}
