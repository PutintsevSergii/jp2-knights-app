import {
  brotherAnnouncementListResponseSchema,
  brotherEventDetailResponseSchema,
  brotherEventListResponseSchema,
  brotherPrayerListResponseSchema,
  eventParticipationResponseSchema,
  brotherProfileResponseSchema,
  brotherTodayResponseSchema,
  myOrganizationUnitsResponseSchema,
  type BrotherAnnouncementListResponseDto,
  type BrotherEventDetailResponseDto,
  type BrotherEventListResponseDto,
  type BrotherPrayerListResponseDto,
  type EventParticipationResponseDto,
  type BrotherProfileResponseDto,
  type BrotherTodayResponseDto,
  type MyOrganizationUnitsResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  normalizeBaseUrl,
  requestMobileApi,
  setOptionalNumberParam,
  setOptionalParam,
  type MobileApiFetch,
  type MobileApiFetchInit,
  type MobileApiFetchResponse,
  type MobilePrivateAccessErrorCode
} from "./mobile-api-client.js";

export type BrotherCompanionFetchResponse = MobileApiFetchResponse;

export type BrotherCompanionFetchInit = MobileApiFetchInit;

export type BrotherCompanionFetch = MobileApiFetch;

export interface FetchBrotherCompanionOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: BrotherCompanionFetch;
}

export interface BrotherEventListUrlQuery {
  from?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface BrotherAnnouncementListUrlQuery {
  limit?: number;
  offset?: number;
}

export interface BrotherPrayerListUrlQuery {
  categoryId?: string;
  q?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface FetchBrotherEventsOptions
  extends FetchBrotherCompanionOptions,
    BrotherEventListUrlQuery {}

export interface FetchBrotherAnnouncementsOptions
  extends FetchBrotherCompanionOptions,
    BrotherAnnouncementListUrlQuery {}

export interface FetchBrotherPrayersOptions
  extends FetchBrotherCompanionOptions,
    BrotherPrayerListUrlQuery {}

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

export async function fetchBrotherEvents(
  options: FetchBrotherEventsOptions = {}
): Promise<BrotherEventListResponseDto> {
  const response = await fetchBrotherCompanion(
    buildBrotherEventsUrl(options.baseUrl, options),
    options
  );

  return brotherEventListResponseSchema.parse(await response.json());
}

export async function fetchBrotherAnnouncements(
  options: FetchBrotherAnnouncementsOptions = {}
): Promise<BrotherAnnouncementListResponseDto> {
  const response = await fetchBrotherCompanion(
    buildBrotherAnnouncementsUrl(options.baseUrl, options),
    options
  );

  return brotherAnnouncementListResponseSchema.parse(await response.json());
}

export async function fetchBrotherPrayers(
  options: FetchBrotherPrayersOptions = {}
): Promise<BrotherPrayerListResponseDto> {
  const response = await fetchBrotherCompanion(
    buildBrotherPrayersUrl(options.baseUrl, options),
    options
  );

  return brotherPrayerListResponseSchema.parse(await response.json());
}

export async function fetchBrotherEvent(options: {
  id: string;
} & FetchBrotherCompanionOptions): Promise<BrotherEventDetailResponseDto> {
  const response = await fetchBrotherCompanion(
    buildBrotherEventDetailUrl(options.id, options.baseUrl),
    options
  );

  return brotherEventDetailResponseSchema.parse(await response.json());
}

export async function markBrotherEventParticipation(options: {
  id: string;
} & FetchBrotherCompanionOptions): Promise<EventParticipationResponseDto> {
  const response = await fetchBrotherCompanion(
    buildBrotherEventParticipationUrl(options.id, options.baseUrl),
    options,
    "POST"
  );

  return eventParticipationResponseSchema.parse(await response.json());
}

export async function cancelBrotherEventParticipation(options: {
  id: string;
} & FetchBrotherCompanionOptions): Promise<EventParticipationResponseDto> {
  const response = await fetchBrotherCompanion(
    buildBrotherEventParticipationUrl(options.id, options.baseUrl),
    options,
    "DELETE"
  );

  return eventParticipationResponseSchema.parse(await response.json());
}

export async function fetchMyOrganizationUnits(
  options: FetchBrotherCompanionOptions = {}
): Promise<MyOrganizationUnitsResponseDto> {
  const response = await fetchBrotherCompanion(buildMyOrganizationUnitsUrl(options.baseUrl), options);

  return myOrganizationUnitsResponseSchema.parse(await response.json());
}

export function buildBrotherEventDetailUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(`brother/events/${encodeURIComponent(id)}`, baseUrl);
}

export function buildBrotherEventParticipationUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(`brother/events/${encodeURIComponent(id)}/participation`, baseUrl);
}

export function buildBrotherProfileUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("brother/profile", baseUrl);
}

export function buildBrotherTodayUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("brother/today", baseUrl);
}

export function buildBrotherEventsUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: BrotherEventListUrlQuery = {}
): string {
  const url = new URL("brother/events", normalizeBaseUrl(baseUrl));
  setOptionalParam(url, "from", query.from);
  setOptionalParam(url, "type", query.type);
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildBrotherAnnouncementsUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: BrotherAnnouncementListUrlQuery = {}
): string {
  const url = new URL("brother/announcements", normalizeBaseUrl(baseUrl));
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildBrotherPrayersUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: BrotherPrayerListUrlQuery = {}
): string {
  const url = new URL("brother/prayers", normalizeBaseUrl(baseUrl));
  setOptionalParam(url, "categoryId", query.categoryId);
  setOptionalParam(url, "q", query.q);
  setOptionalParam(url, "language", query.language);
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildMyOrganizationUnitsUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("brother/my-organization-units", baseUrl);
}

export function brotherCompanionLoadFailureState(error: unknown): MobileScreenState {
  if (error instanceof TypeError) {
    return "offline";
  }

  if (
    error instanceof BrotherCompanionHttpError &&
    error.code === "IDLE_APPROVAL_REQUIRED"
  ) {
    return "idleApproval";
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
  constructor(
    readonly status: number,
    readonly code: MobilePrivateAccessErrorCode | null = null
  ) {
    super(`Brother companion request failed with HTTP ${status}.`);
  }
}

async function fetchBrotherCompanion(
  url: string,
  options: FetchBrotherCompanionOptions,
  method: BrotherCompanionFetchInit["method"] = "GET"
): Promise<BrotherCompanionFetchResponse> {
  return requestMobileApi<BrotherCompanionFetchResponse>(
    url,
    options,
    method,
    (status, code) => new BrotherCompanionHttpError(status, code)
  );
}
