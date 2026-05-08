import {
  candidateAnnouncementListResponseSchema,
  candidateEventDetailResponseSchema,
  candidateEventListResponseSchema,
  candidateDashboardResponseSchema,
  eventParticipationResponseSchema,
  type CandidateAnnouncementListResponseDto,
  type CandidateEventDetailResponseDto,
  type CandidateEventListResponseDto,
  type CandidateDashboardResponseDto
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

export type CandidateDashboardFetchResponse = MobileApiFetchResponse;

export type CandidateDashboardFetchInit = MobileApiFetchInit;

export type CandidateDashboardFetch = MobileApiFetch;

export interface FetchCandidateDashboardOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: CandidateDashboardFetch;
}

export interface CandidateEventListUrlQuery {
  from?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface CandidateAnnouncementListUrlQuery {
  limit?: number;
  offset?: number;
}

export interface FetchCandidateEventsOptions
  extends FetchCandidateDashboardOptions,
    CandidateEventListUrlQuery {}

export interface FetchCandidateAnnouncementsOptions
  extends FetchCandidateDashboardOptions,
    CandidateAnnouncementListUrlQuery {}

export async function fetchCandidateDashboard(
  options: FetchCandidateDashboardOptions = {}
): Promise<CandidateDashboardResponseDto> {
  const response = await fetchCandidateApi(buildCandidateDashboardUrl(options.baseUrl), options);

  return candidateDashboardResponseSchema.parse(await response.json());
}

export async function fetchCandidateEvents(
  options: FetchCandidateEventsOptions = {}
): Promise<CandidateEventListResponseDto> {
  const response = await fetchCandidateApi(buildCandidateEventsUrl(options.baseUrl, options), options);

  return candidateEventListResponseSchema.parse(await response.json());
}

export async function fetchCandidateAnnouncements(
  options: FetchCandidateAnnouncementsOptions = {}
): Promise<CandidateAnnouncementListResponseDto> {
  const response = await fetchCandidateApi(
    buildCandidateAnnouncementsUrl(options.baseUrl, options),
    options
  );

  return candidateAnnouncementListResponseSchema.parse(await response.json());
}

export async function fetchCandidateEvent(options: {
  id: string;
} & FetchCandidateDashboardOptions): Promise<CandidateEventDetailResponseDto> {
  const response = await fetchCandidateApi(
    buildCandidateEventDetailUrl(options.id, options.baseUrl),
    options
  );

  return candidateEventDetailResponseSchema.parse(await response.json());
}

export async function markCandidateEventParticipation(options: {
  id: string;
} & FetchCandidateDashboardOptions) {
  const response = await fetchCandidateApi(
    buildCandidateEventParticipationUrl(options.id, options.baseUrl),
    options,
    "POST"
  );

  return eventParticipationResponseSchema.parse(await response.json());
}

export async function cancelCandidateEventParticipation(options: {
  id: string;
} & FetchCandidateDashboardOptions) {
  const response = await fetchCandidateApi(
    buildCandidateEventParticipationUrl(options.id, options.baseUrl),
    options,
    "DELETE"
  );

  return eventParticipationResponseSchema.parse(await response.json());
}

export function buildCandidateDashboardUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("candidate/dashboard", baseUrl);
}

export function buildCandidateEventsUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: CandidateEventListUrlQuery = {}
): string {
  const url = new URL("candidate/events", normalizeBaseUrl(baseUrl));
  setOptionalParam(url, "from", query.from);
  setOptionalParam(url, "type", query.type);
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildCandidateAnnouncementsUrl(
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL,
  query: CandidateAnnouncementListUrlQuery = {}
): string {
  const url = new URL("candidate/announcements", normalizeBaseUrl(baseUrl));
  setOptionalNumberParam(url, "limit", query.limit);
  setOptionalNumberParam(url, "offset", query.offset);

  return url.toString();
}

export function buildCandidateEventDetailUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(`candidate/events/${encodeURIComponent(id)}`, baseUrl);
}

export function buildCandidateEventParticipationUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return buildMobileApiUrl(`candidate/events/${encodeURIComponent(id)}/participation`, baseUrl);
}

export function candidateDashboardLoadFailureState(error: unknown): MobileScreenState {
  if (error instanceof TypeError) {
    return "offline";
  }

  if (
    error instanceof CandidateDashboardHttpError &&
    error.code === "IDLE_APPROVAL_REQUIRED"
  ) {
    return "idleApproval";
  }

  if (
    error instanceof CandidateDashboardHttpError &&
    (error.status === 401 || error.status === 403)
  ) {
    return "forbidden";
  }

  if (error instanceof CandidateDashboardHttpError && error.status === 404) {
    return "empty";
  }

  return "error";
}

export class CandidateDashboardHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: MobilePrivateAccessErrorCode | null = null
  ) {
    super(`Candidate dashboard request failed with HTTP ${status}.`);
  }
}

async function fetchCandidateApi(
  url: string,
  options: FetchCandidateDashboardOptions,
  method: CandidateDashboardFetchInit["method"] = "GET"
): Promise<CandidateDashboardFetchResponse> {
  return requestMobileApi<CandidateDashboardFetchResponse>(
    url,
    options,
    method,
    (status, code) => new CandidateDashboardHttpError(status, code)
  );
}
