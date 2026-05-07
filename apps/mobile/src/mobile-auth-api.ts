import {
  currentUserResponseSchema,
  type CurrentUserResponseDto
} from "@jp2/shared-validation";
import type { MobilePrincipal, MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface MobileAuthFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export interface MobileAuthFetchInit {
  headers?: Record<string, string>;
}

export type MobileAuthFetch = (
  input: string,
  init?: MobileAuthFetchInit
) => Promise<MobileAuthFetchResponse>;

export interface FetchCurrentUserOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: MobileAuthFetch;
}

export async function fetchCurrentUser(
  options: FetchCurrentUserOptions = {}
): Promise<CurrentUserResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetcher(buildCurrentUserUrl(options.baseUrl), { headers });

  if (!response.ok) {
    throw new MobileAuthHttpError(response.status);
  }

  return currentUserResponseSchema.parse(await response.json());
}

export function buildCurrentUserUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("auth/me", normalizeBaseUrl(baseUrl)).toString();
}

export function currentUserLoadFailureState(error: unknown): MobileScreenState {
  if (error instanceof TypeError) {
    return "offline";
  }

  if (error instanceof MobileAuthHttpError && (error.status === 401 || error.status === 403)) {
    return "ready";
  }

  return "error";
}

export function toMobilePrincipal(response: CurrentUserResponseDto): MobilePrincipal {
  return {
    id: response.user.id,
    roles: response.user.roles,
    status: response.user.status,
    candidateOrganizationUnitId: response.access.candidateOrganizationUnitId,
    memberOrganizationUnitIds: response.access.memberOrganizationUnitIds,
    officerOrganizationUnitIds: response.access.officerOrganizationUnitIds,
    approval: response.access.approval
  };
}

export function readMobileAuthToken(env: Record<string, unknown> = process.env): string | undefined {
  return readEnvString(env, "EXPO_PUBLIC_AUTH_TOKEN") ?? readEnvString(env, "APP_AUTH_TOKEN");
}

export class MobileAuthHttpError extends Error {
  constructor(readonly status: number) {
    super(`Current user request failed with HTTP ${status}.`);
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function readEnvString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function getGlobalFetch(): MobileAuthFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
