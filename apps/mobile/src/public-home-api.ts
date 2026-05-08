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
  fetchImpl?: PublicHomeFetch;
}

export async function fetchPublicHome(
  options: FetchPublicHomeOptions = {}
): Promise<PublicHomeResponseDto> {
  const response = await requestPublicMobileApi<PublicHomeFetchResponse>(
    buildPublicHomeUrl(options.baseUrl, options.language),
    options.fetchImpl,
    (status) => new PublicHomeHttpError(status)
  );

  return publicHomeResponseSchema.parse(await response.json());
}

export function buildPublicHomeUrl(baseUrl = DEFAULT_MOBILE_API_BASE_URL, language?: string) {
  const url = new URL("public/home", normalizeBaseUrl(baseUrl));

  if (language) {
    url.searchParams.set("language", language);
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
