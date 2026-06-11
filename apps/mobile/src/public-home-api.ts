import { publicHomeResponseSchema, type PublicHomeResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL as DEFAULT_MOBILE_API_BASE_URL,
  normalizeBaseUrl,
  requestPublicMobileApi,
  type MobileApiFetchResponse,
  type MobilePublicFetch
} from "./mobile-api-client.js";

export { DEFAULT_PUBLIC_API_BASE_URL } from "./mobile-api-client.js";

export type PublicHomeFetchResponse = MobileApiFetchResponse;

export type PublicHomeFetch = MobilePublicFetch;

export interface FetchPublicHomeOptions {
  baseUrl?: string;
  language?: string;
  date?: string;
  country?: string;
  fetchImpl?: PublicHomeFetch;
}

export async function fetchPublicHome(
  options: FetchPublicHomeOptions = {}
): Promise<PublicHomeResponseDto> {
  const response = await requestPublicMobileApi<PublicHomeFetchResponse>(
    buildPublicHomeUrl(options.baseUrl, {
      country: options.country,
      date: options.date,
      language: options.language
    }),
    options.fetchImpl,
    (status) => new PublicHomeHttpError(status)
  );

  return publicHomeResponseSchema.parse(await response.json());
}

export interface BuildPublicHomeUrlOptions {
  language?: string | undefined;
  date?: string | undefined;
  country?: string | undefined;
}

export function buildPublicHomeUrl(
  baseUrl = DEFAULT_MOBILE_API_BASE_URL,
  options: BuildPublicHomeUrlOptions | string = {}
) {
  const url = new URL("public/home", normalizeBaseUrl(baseUrl));
  const query = typeof options === "string" ? { language: options } : options;

  if (query.language) {
    url.searchParams.set("language", query.language);
  }

  if (query.date) {
    url.searchParams.set("date", query.date);
  }

  if (query.country) {
    url.searchParams.set("country", query.country);
  }

  return url.toString();
}

export function readPublicApiBaseUrl(env: Record<string, unknown> = process.env) {
  const expoUrl = readEnvString(env, "EXPO_PUBLIC_API_BASE_URL");
  const genericUrl = readEnvString(env, "API_BASE_URL");

  return expoUrl ?? genericUrl ?? DEFAULT_MOBILE_API_BASE_URL;
}

export function publicHomeLoadFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicHomeHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public home request failed with HTTP ${status}.`);
  }
}

function readEnvString(env: Record<string, unknown>, key: string) {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}
