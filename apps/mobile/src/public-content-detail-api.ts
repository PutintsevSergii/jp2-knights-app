import {
  publicEventDetailResponseSchema,
  publicPrayerDetailResponseSchema,
  type PublicEventDetailResponseDto,
  type PublicPrayerDetailResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface PublicContentDetailFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export type PublicContentDetailFetch = (input: string) => Promise<PublicContentDetailFetchResponse>;

export interface FetchPublicContentDetailOptions {
  id: string;
  baseUrl?: string;
  fetchImpl?: PublicContentDetailFetch;
}

export async function fetchPublicPrayer(
  options: FetchPublicContentDetailOptions
): Promise<PublicPrayerDetailResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const response = await fetcher(buildPublicPrayerDetailUrl(options.id, options.baseUrl));

  if (!response.ok) {
    throw new PublicContentDetailHttpError(response.status);
  }

  return publicPrayerDetailResponseSchema.parse(await response.json());
}

export async function fetchPublicEvent(
  options: FetchPublicContentDetailOptions
): Promise<PublicEventDetailResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const response = await fetcher(buildPublicEventDetailUrl(options.id, options.baseUrl));

  if (!response.ok) {
    throw new PublicContentDetailHttpError(response.status);
  }

  return publicEventDetailResponseSchema.parse(await response.json());
}

export function buildPublicPrayerDetailUrl(id: string, baseUrl = DEFAULT_PUBLIC_API_BASE_URL) {
  return new URL(`public/prayers/${encodeURIComponent(id)}`, normalizeBaseUrl(baseUrl)).toString();
}

export function buildPublicEventDetailUrl(id: string, baseUrl = DEFAULT_PUBLIC_API_BASE_URL) {
  return new URL(`public/events/${encodeURIComponent(id)}`, normalizeBaseUrl(baseUrl)).toString();
}

export function publicContentDetailLoadFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicContentDetailHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public content detail request failed with HTTP ${status}.`);
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): PublicContentDetailFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input) => globalThis.fetch(input);
}
