import {
  publicContentPageResponseSchema,
  type PublicContentPageResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface PublicContentPageFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export type PublicContentPageFetch = (input: string) => Promise<PublicContentPageFetchResponse>;

export interface FetchPublicContentPageOptions {
  slug: string;
  baseUrl?: string;
  language?: string;
  fetchImpl?: PublicContentPageFetch;
}

export async function fetchPublicContentPage(
  options: FetchPublicContentPageOptions
): Promise<PublicContentPageResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const response = await fetcher(
    buildPublicContentPageUrl(options.slug, options.baseUrl, options.language)
  );

  if (!response.ok) {
    throw new PublicContentPageHttpError(response.status);
  }

  return publicContentPageResponseSchema.parse(await response.json());
}

export function buildPublicContentPageUrl(
  slug: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  language?: string
) {
  const url = new URL(
    `public/content-pages/${encodeURIComponent(slug)}`,
    normalizeBaseUrl(baseUrl)
  );

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

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): PublicContentPageFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input) => globalThis.fetch(input);
}
