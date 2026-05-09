import {
  authSessionResponseSchema,
  currentUserResponseSchema,
  type AuthSessionRequestDto,
  type AuthSessionResponseDto,
  type CurrentUserResponseDto
} from "@jp2/shared-validation";
import type { MobilePrincipal, MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  requestPublicJsonMobileApi,
  requestMobileApi,
  type MobileApiFetch,
  type MobileApiFetchInit,
  type MobileApiFetchResponse
} from "./mobile-api-client.js";

export type MobileAuthFetchResponse = MobileApiFetchResponse;

export type MobileAuthFetchInit = MobileApiFetchInit;

export type MobileAuthFetch = MobileApiFetch;

export interface FetchCurrentUserOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: MobileAuthFetch;
}

export interface CreateAuthSessionOptions {
  baseUrl?: string;
  request: AuthSessionRequestDto;
  fetchImpl?: MobileAuthFetch;
}

export async function fetchCurrentUser(
  options: FetchCurrentUserOptions = {}
): Promise<CurrentUserResponseDto> {
  const response = await requestMobileApi<MobileAuthFetchResponse>(
    buildCurrentUserUrl(options.baseUrl),
    options,
    undefined,
    (status) => new MobileAuthHttpError(status)
  );

  return currentUserResponseSchema.parse(await response.json());
}

export async function createAuthSession(
  options: CreateAuthSessionOptions
): Promise<AuthSessionResponseDto> {
  const response = await requestPublicJsonMobileApi<MobileAuthFetchResponse>(
    buildAuthSessionUrl(options.baseUrl),
    options.fetchImpl,
    JSON.stringify(options.request),
    (status) => new MobileAuthHttpError(status)
  );

  return authSessionResponseSchema.parse(await response.json());
}

export function buildCurrentUserUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("auth/me", baseUrl);
}

export function buildAuthSessionUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("auth/session", baseUrl);
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

export function authSessionFailureMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Reconnect to sign in with Google.";
  }

  if (error instanceof MobileAuthHttpError && (error.status === 401 || error.status === 403)) {
    return "Google sign-in was not accepted for private app access yet.";
  }

  return "Google sign-in could not be completed. Try again.";
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

function readEnvString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}
