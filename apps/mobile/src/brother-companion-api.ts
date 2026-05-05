import {
  brotherProfileResponseSchema,
  brotherTodayResponseSchema,
  type BrotherProfileResponseDto,
  type BrotherTodayResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface BrotherCompanionFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export interface BrotherCompanionFetchInit {
  method?: "GET";
  headers?: Record<string, string>;
}

export type BrotherCompanionFetch = (
  input: string,
  init?: BrotherCompanionFetchInit
) => Promise<BrotherCompanionFetchResponse>;

export interface FetchBrotherCompanionOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: BrotherCompanionFetch;
}

export async function fetchBrotherProfile(
  options: FetchBrotherCompanionOptions = {}
): Promise<BrotherProfileResponseDto> {
  const response = await fetchBrotherCompanion(buildBrotherProfileUrl(options.baseUrl), options);

  return brotherProfileResponseSchema.parse(await response.json());
}

export async function fetchBrotherToday(
  options: FetchBrotherCompanionOptions = {}
): Promise<BrotherTodayResponseDto> {
  const response = await fetchBrotherCompanion(buildBrotherTodayUrl(options.baseUrl), options);

  return brotherTodayResponseSchema.parse(await response.json());
}

export function buildBrotherProfileUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("brother/profile", normalizeBaseUrl(baseUrl)).toString();
}

export function buildBrotherTodayUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("brother/today", normalizeBaseUrl(baseUrl)).toString();
}

export function brotherCompanionLoadFailureState(error: unknown): MobileScreenState {
  if (error instanceof TypeError) {
    return "offline";
  }

  if (
    error instanceof BrotherCompanionHttpError &&
    (error.status === 401 || error.status === 403)
  ) {
    return "forbidden";
  }

  if (error instanceof BrotherCompanionHttpError && error.status === 404) {
    return "empty";
  }

  return "error";
}

export class BrotherCompanionHttpError extends Error {
  constructor(readonly status: number) {
    super(`Brother companion request failed with HTTP ${status}.`);
  }
}

async function fetchBrotherCompanion(
  url: string,
  options: FetchBrotherCompanionOptions
): Promise<BrotherCompanionFetchResponse> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetcher(url, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new BrotherCompanionHttpError(response.status);
  }

  return response;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): BrotherCompanionFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
