import {
  publicEventDetailResponseSchema,
  publicPrayerDetailResponseSchema,
  type PublicEventDetailResponseDto,
  type PublicPrayerDetailResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  requestPublicMobileApi,
  type MobileApiFetchResponse,
  type MobilePublicFetch
} from "./mobile-api-client.js";

export type PublicContentDetailFetchResponse = MobileApiFetchResponse;

export type PublicContentDetailFetch = MobilePublicFetch;

export interface FetchPublicContentDetailOptions {
  id: string;
  baseUrl?: string;
  fetchImpl?: PublicContentDetailFetch;
}

export async function fetchPublicPrayer(
  options: FetchPublicContentDetailOptions
): Promise<PublicPrayerDetailResponseDto> {
  const response = await requestPublicMobileApi<PublicContentDetailFetchResponse>(
    buildPublicPrayerDetailUrl(options.id, options.baseUrl),
    options.fetchImpl,
    (status) => new PublicContentDetailHttpError(status)
  );

  return publicPrayerDetailResponseSchema.parse(await response.json());
}

export async function fetchPublicEvent(
  options: FetchPublicContentDetailOptions
): Promise<PublicEventDetailResponseDto> {
  const response = await requestPublicMobileApi<PublicContentDetailFetchResponse>(
    buildPublicEventDetailUrl(options.id, options.baseUrl),
    options.fetchImpl,
    (status) => new PublicContentDetailHttpError(status)
  );

  return publicEventDetailResponseSchema.parse(await response.json());
}

export function buildPublicPrayerDetailUrl(id: string, baseUrl = DEFAULT_PUBLIC_API_BASE_URL) {
  return buildMobileApiUrl(`public/prayers/${encodeURIComponent(id)}`, baseUrl);
}

export function buildPublicEventDetailUrl(id: string, baseUrl = DEFAULT_PUBLIC_API_BASE_URL) {
  return buildMobileApiUrl(`public/events/${encodeURIComponent(id)}`, baseUrl);
}

export function publicContentDetailLoadFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicContentDetailHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public content detail request failed with HTTP ${status}.`);
  }
}
