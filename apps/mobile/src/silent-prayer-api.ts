import {
  brotherSilentPrayerJoinResponseSchema,
  brotherSilentPrayerListResponseSchema,
  publicSilentPrayerJoinResponseSchema,
  publicSilentPrayerListResponseSchema,
  silentPrayerPresenceActionResponseSchema,
  type BrotherSilentPrayerJoinResponseDto,
  type BrotherSilentPrayerListResponseDto,
  type PublicSilentPrayerJoinResponseDto,
  type PublicSilentPrayerListResponseDto,
  type SilentPrayerPresenceActionResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  normalizeBaseUrl,
  privateMobileLoadFailureState,
  publicMobileLoadFailureState,
  requestMobileApi,
  requestPrivateJsonMobileApi,
  requestPublicJsonMobileApi,
  requestPublicMobileApi,
  setOptionalNumberParam,
  type MobileApiFetch,
  type MobileApiFetchResponse,
  type MobilePrivateAccessErrorCode,
  type MobilePublicFetch
} from "./mobile-api-client.js";

export type PublicSilentPrayerFetch = MobilePublicFetch;
export type SilentPrayerFetch = MobileApiFetch;
export type SilentPrayerFetchResponse = MobileApiFetchResponse;

export interface SilentPrayerListUrlQuery {
  limit?: number;
  offset?: number;
}

export interface FetchPublicSilentPrayerSessionsOptions extends SilentPrayerListUrlQuery {
  baseUrl?: string;
  fetchImpl?: PublicSilentPrayerFetch;
}

export interface JoinPublicSilentPrayerSessionOptions {
  id: string;
  anonymousSessionId: string;
  baseUrl?: string;
  fetchImpl?: SilentPrayerFetch;
}

export type PublicSilentPrayerPresenceActionOptions = JoinPublicSilentPrayerSessionOptions;

export interface FetchBrotherSilentPrayerSessionsOptions extends SilentPrayerListUrlQuery {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: SilentPrayerFetch;
}

export interface JoinBrotherSilentPrayerSessionOptions {
  id: string;
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: SilentPrayerFetch;
}

export type BrotherSilentPrayerPresenceActionOptions = JoinBrotherSilentPrayerSessionOptions;

export async function fetchPublicSilentPrayerSessions(
  options: FetchPublicSilentPrayerSessionsOptions = {}
): Promise<PublicSilentPrayerListResponseDto> {
  const response = await requestPublicMobileApi<SilentPrayerFetchResponse>(
    buildPublicSilentPrayerSessionsUrl(options.baseUrl, options),
    options.fetchImpl,
    (status) => new PublicSilentPrayerHttpError(status)
  );

  return publicSilentPrayerListResponseSchema.parse(await response.json());
}

export async function joinPublicSilentPrayerSession(
  options: JoinPublicSilentPrayerSessionOptions
): Promise<PublicSilentPrayerJoinResponseDto> {
  const response = await requestPublicJsonMobileApi<SilentPrayerFetchResponse>(
    buildPublicSilentPrayerJoinUrl(options.id, options.baseUrl),
    options.fetchImpl,
    JSON.stringify({ anonymousSessionId: options.anonymousSessionId }),
    (status) => new PublicSilentPrayerHttpError(status)
  );

  return publicSilentPrayerJoinResponseSchema.parse(await response.json());
}

export async function heartbeatPublicSilentPrayerSession(
  options: PublicSilentPrayerPresenceActionOptions
): Promise<SilentPrayerPresenceActionResponseDto> {
  return requestPublicSilentPrayerPresenceAction(options, "heartbeat");
}

export async function leavePublicSilentPrayerSession(
  options: PublicSilentPrayerPresenceActionOptions
): Promise<SilentPrayerPresenceActionResponseDto> {
  return requestPublicSilentPrayerPresenceAction(options, "leave");
}

export async function fetchBrotherSilentPrayerSessions(
  options: FetchBrotherSilentPrayerSessionsOptions = {}
): Promise<BrotherSilentPrayerListResponseDto> {
  const response = await requestMobileApi<SilentPrayerFetchResponse>(
    buildBrotherSilentPrayerSessionsUrl(options.baseUrl, options),
    options,
    "GET",
    (status, code) => new BrotherSilentPrayerHttpError(status, code)
  );

  return brotherSilentPrayerListResponseSchema.parse(await response.json());
}

export async function joinBrotherSilentPrayerSession(
  options: JoinBrotherSilentPrayerSessionOptions
): Promise<BrotherSilentPrayerJoinResponseDto> {
  const response = await requestPrivateJsonMobileApi<SilentPrayerFetchResponse>(
    buildBrotherSilentPrayerJoinUrl(options.id, options.baseUrl),
    options,
    JSON.stringify({}),
    (status, code) => new BrotherSilentPrayerHttpError(status, code)
  );

  return brotherSilentPrayerJoinResponseSchema.parse(await response.json());
}

export async function heartbeatBrotherSilentPrayerSession(
  options: BrotherSilentPrayerPresenceActionOptions
): Promise<SilentPrayerPresenceActionResponseDto> {
  return requestBrotherSilentPrayerPresenceAction(options, "heartbeat");
}

export async function leaveBrotherSilentPrayerSession(
  options: BrotherSilentPrayerPresenceActionOptions
): Promise<SilentPrayerPresenceActionResponseDto> {
  return requestBrotherSilentPrayerPresenceAction(options, "leave");
}

export function buildPublicSilentPrayerSessionsUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: SilentPrayerListUrlQuery = {}
): string {
  const url = new URL("public/silent-prayer-events", normalizeBaseUrl(baseUrl));
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildPublicSilentPrayerJoinUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(
    `public/silent-prayer-events/${encodeURIComponent(id)}/join`,
    baseUrl
  );
}

export function buildPublicSilentPrayerHeartbeatUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildPublicSilentPrayerPresenceActionUrl(id, "heartbeat", baseUrl);
}

export function buildPublicSilentPrayerLeaveUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildPublicSilentPrayerPresenceActionUrl(id, "leave", baseUrl);
}

export function buildBrotherSilentPrayerSessionsUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: SilentPrayerListUrlQuery = {}
): string {
  const url = new URL("brother/silent-prayer-events", normalizeBaseUrl(baseUrl));
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildBrotherSilentPrayerJoinUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(
    `brother/silent-prayer-events/${encodeURIComponent(id)}/join`,
    baseUrl
  );
}

export function buildBrotherSilentPrayerHeartbeatUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildBrotherSilentPrayerPresenceActionUrl(id, "heartbeat", baseUrl);
}

export function buildBrotherSilentPrayerLeaveUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildBrotherSilentPrayerPresenceActionUrl(id, "leave", baseUrl);
}

export function silentPrayerAnonymousSessionId(seed = Date.now()): string {
  return `anon-${seed.toString(36)}`;
}

export function publicSilentPrayerLoadFailureState(error: unknown): MobileScreenState {
  return publicMobileLoadFailureState(
    error,
    (value): value is PublicSilentPrayerHttpError =>
      value instanceof PublicSilentPrayerHttpError
  );
}

export function brotherSilentPrayerLoadFailureState(error: unknown): MobileScreenState {
  return privateMobileLoadFailureState(
    error,
    (value): value is BrotherSilentPrayerHttpError =>
      value instanceof BrotherSilentPrayerHttpError
  );
}

export class PublicSilentPrayerHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public silent-prayer request failed with HTTP ${status}.`);
  }
}

export class BrotherSilentPrayerHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: MobilePrivateAccessErrorCode | null = null
  ) {
    super(`Brother silent-prayer request failed with HTTP ${status}.`);
  }
}

async function requestPublicSilentPrayerPresenceAction(
  options: PublicSilentPrayerPresenceActionOptions,
  action: "heartbeat" | "leave"
): Promise<SilentPrayerPresenceActionResponseDto> {
  const response = await requestPublicJsonMobileApi<SilentPrayerFetchResponse>(
    buildPublicSilentPrayerPresenceActionUrl(options.id, action, options.baseUrl),
    options.fetchImpl,
    JSON.stringify({
      anonymousSessionId: options.anonymousSessionId,
      eventId: options.id
    }),
    (status) => new PublicSilentPrayerHttpError(status)
  );

  return silentPrayerPresenceActionResponseSchema.parse(await response.json());
}

async function requestBrotherSilentPrayerPresenceAction(
  options: BrotherSilentPrayerPresenceActionOptions,
  action: "heartbeat" | "leave"
): Promise<SilentPrayerPresenceActionResponseDto> {
  const response = await requestPrivateJsonMobileApi<SilentPrayerFetchResponse>(
    buildBrotherSilentPrayerPresenceActionUrl(options.id, action, options.baseUrl),
    options,
    JSON.stringify({ eventId: options.id }),
    (status, code) => new BrotherSilentPrayerHttpError(status, code)
  );

  return silentPrayerPresenceActionResponseSchema.parse(await response.json());
}

function buildPublicSilentPrayerPresenceActionUrl(
  id: string,
  action: "heartbeat" | "leave",
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(
    `public/silent-prayer-events/${encodeURIComponent(id)}/${action}`,
    baseUrl
  );
}

function buildBrotherSilentPrayerPresenceActionUrl(
  id: string,
  action: "heartbeat" | "leave",
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(
    `brother/silent-prayer-events/${encodeURIComponent(id)}/${action}`,
    baseUrl
  );
}
