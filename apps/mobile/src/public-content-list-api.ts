import {
  publicEventListResponseSchema,
  publicPrayerListResponseSchema,
  type PublicEventListResponseDto,
  type PublicPrayerListResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface PublicContentListFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export type PublicContentListFetch = (input: string) => Promise<PublicContentListFetchResponse>;

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
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const response = await fetcher(buildPublicPrayerListUrl(options.baseUrl, options));

  if (!response.ok) {
    throw new PublicContentListHttpError(response.status);
  }

  return publicPrayerListResponseSchema.parse(await response.json());
}

export async function fetchPublicEvents(
  options: FetchPublicEventsOptions = {}
): Promise<PublicEventListResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const response = await fetcher(buildPublicEventListUrl(options.baseUrl, options));

  if (!response.ok) {
    throw new PublicContentListHttpError(response.status);
  }

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

function setOptionalParam(url: URL, key: string, value: string | undefined) {
  if (value) {
    url.searchParams.set(key, value);
  }
}

function setOptionalNumberParam(url: URL, key: string, value: number | undefined) {
  if (typeof value === "number") {
    url.searchParams.set(key, String(value));
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): PublicContentListFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input) => globalThis.fetch(input);
}
