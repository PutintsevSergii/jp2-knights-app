import {
  publicContentPageResponseSchema,
  type PublicContentPageResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  requestPublicMobileApi,
  type MobileApiFetchResponse,
  type MobilePublicFetch
} from "./mobile-api-client.js";

export type PublicContentPageFetchResponse = MobileApiFetchResponse;

export type PublicContentPageFetch = MobilePublicFetch;

export interface FetchPublicContentPageOptions {
  slug: string;
  baseUrl?: string;
  language?: string;
  fetchImpl?: PublicContentPageFetch;
}

export async function fetchPublicContentPage(
  options: FetchPublicContentPageOptions
): Promise<PublicContentPageResponseDto> {
  const response = await requestPublicMobileApi<PublicContentPageFetchResponse>(
    buildPublicContentPageUrl(options.slug, options.baseUrl, options.language),
    options.fetchImpl,
    (status) => new PublicContentPageHttpError(status)
  );

  return publicContentPageResponseSchema.parse(await response.json());
}

export function buildPublicContentPageUrl(
  slug: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  language?: string
) {
  const url = new URL(buildMobileApiUrl(`public/content-pages/${encodeURIComponent(slug)}`, baseUrl));

  if (language) {
    url.searchParams.set("language", language);
  }

  return url.toString();
}

export function publicContentPageLoadFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicContentPageHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public content page request failed with HTTP ${status}.`);
  }
}
