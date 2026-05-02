import { publicHomeResponseSchema, type PublicHomeResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";

export const DEFAULT_PUBLIC_API_BASE_URL = "http://localhost:3000";

export interface PublicHomeFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export type PublicHomeFetch = (input: string) => Promise<PublicHomeFetchResponse>;

export interface FetchPublicHomeOptions {
  baseUrl?: string;
  language?: string;
  fetchImpl?: PublicHomeFetch;
}

export async function fetchPublicHome(
  options: FetchPublicHomeOptions = {}
): Promise<PublicHomeResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const response = await fetcher(buildPublicHomeUrl(options.baseUrl, options.language));

  if (!response.ok) {
    throw new PublicHomeHttpError(response.status);
  }

  return publicHomeResponseSchema.parse(await response.json());
}

export function buildPublicHomeUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL, language?: string) {
  const url = new URL("public/home", normalizeBaseUrl(baseUrl));

  if (language) {
    url.searchParams.set("language", language);
  }

  return url.toString();
}

export function readPublicApiBaseUrl(env: Record<string, unknown> = process.env) {
  const expoUrl = readEnvString(env, "EXPO_PUBLIC_API_BASE_URL");
  const genericUrl = readEnvString(env, "API_BASE_URL");

  return expoUrl ?? genericUrl ?? DEFAULT_PUBLIC_API_BASE_URL;
}

export function publicHomeLoadFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicHomeHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public home request failed with HTTP ${status}.`);
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function readEnvString(env: Record<string, unknown>, key: string) {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function getGlobalFetch(): PublicHomeFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input) => globalThis.fetch(input);
}
