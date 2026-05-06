import {
  brotherEventDetailResponseSchema,
  brotherEventListResponseSchema,
  eventParticipationResponseSchema,
  brotherProfileResponseSchema,
  brotherTodayResponseSchema,
  myOrganizationUnitsResponseSchema,
  type BrotherEventDetailResponseDto,
  type BrotherEventListResponseDto,
  type EventParticipationResponseDto,
  type BrotherProfileResponseDto,
  type BrotherTodayResponseDto,
  type MyOrganizationUnitsResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface BrotherCompanionFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type MobilePrivateAccessErrorCode = "IDLE_APPROVAL_REQUIRED";

export interface BrotherCompanionFetchInit {
  method?: "GET" | "POST" | "DELETE";
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

export interface BrotherEventListUrlQuery {
  from?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface FetchBrotherEventsOptions
  extends FetchBrotherCompanionOptions,
    BrotherEventListUrlQuery {}

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
  return new URL(`brother/events/${encodeURIComponent(id)}`, normalizeBaseUrl(baseUrl)).toString();
}

export function buildBrotherEventParticipationUrl(
  id: string,
  baseUrl = DEFAULT_PUBLIC_API_BASE_URL
): string {
  return new URL(
    `brother/events/${encodeURIComponent(id)}/participation`,
    normalizeBaseUrl(baseUrl)
  ).toString();
}

export function buildBrotherProfileUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("brother/profile", normalizeBaseUrl(baseUrl)).toString();
}

export function buildBrotherTodayUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("brother/today", normalizeBaseUrl(baseUrl)).toString();
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

export function buildMyOrganizationUnitsUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("brother/my-organization-units", normalizeBaseUrl(baseUrl)).toString();
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
    throw new BrotherCompanionHttpError(response.status, await readPrivateAccessErrorCode(response));
  }

  return response;
}

async function readPrivateAccessErrorCode(
  response: BrotherCompanionFetchResponse
): Promise<MobilePrivateAccessErrorCode | null> {
  try {
    const value = await response.json();
    return parsePrivateAccessErrorCode(value);
  } catch {
    return null;
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
