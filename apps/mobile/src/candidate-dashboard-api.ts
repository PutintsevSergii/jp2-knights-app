import {
  candidateEventDetailResponseSchema,
  candidateEventListResponseSchema,
  candidateDashboardResponseSchema,
  eventParticipationResponseSchema,
  type CandidateEventDetailResponseDto,
  type CandidateEventListResponseDto,
  type CandidateDashboardResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface CandidateDashboardFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type MobilePrivateAccessErrorCode = "IDLE_APPROVAL_REQUIRED";

export interface CandidateDashboardFetchInit {
  method?: "GET" | "POST" | "DELETE";
  headers?: Record<string, string>;
}

export type CandidateDashboardFetch = (
  input: string,
  init?: CandidateDashboardFetchInit
) => Promise<CandidateDashboardFetchResponse>;

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

export interface FetchCandidateEventsOptions
  extends FetchCandidateDashboardOptions,
    CandidateEventListUrlQuery {}

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
  return new URL("candidate/dashboard", normalizeBaseUrl(baseUrl)).toString();
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

export function buildCandidateEventDetailUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return new URL(`candidate/events/${encodeURIComponent(id)}`, normalizeBaseUrl(baseUrl)).toString();
}

export function buildCandidateEventParticipationUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return new URL(
    `candidate/events/${encodeURIComponent(id)}/participation`,
    normalizeBaseUrl(baseUrl)
  ).toString();
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

async function readPrivateAccessErrorCode(
  response: CandidateDashboardFetchResponse
): Promise<MobilePrivateAccessErrorCode | null> {
  try {
    const value = await response.json();
    return parsePrivateAccessErrorCode(value);
  } catch {
    return null;
  }
}

async function fetchCandidateApi(
  url: string,
  options: FetchCandidateDashboardOptions,
  method: CandidateDashboardFetchInit["method"] = "GET"
): Promise<CandidateDashboardFetchResponse> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetcher(url, {
    method,
    headers
  });

  if (!response.ok) {
    throw new CandidateDashboardHttpError(
      response.status,
      await readPrivateAccessErrorCode(response)
    );
  }

  return response;
}

function parsePrivateAccessErrorCode(value: unknown): MobilePrivateAccessErrorCode | null {
  if (!isRecord(value)) {
    return null;
  }

  const error = value.error;

  if (!isRecord(error)) {
    return null;
  }

  return error.code === "IDLE_APPROVAL_REQUIRED" ? "IDLE_APPROVAL_REQUIRED" : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function setOptionalParam(url: URL, key: string, value: string | undefined) {
  if (value) {
    url.searchParams.set(key, value);
  }
}

function setOptionalNumberParam(url: URL, key: string, value: number | undefined) {
  if (typeof value === "number") {
    url.searchParams.set(key, String(value));
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): CandidateDashboardFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
