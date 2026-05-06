import {
  adminEventDetailResponseSchema,
  adminEventListResponseSchema,
  adminPrayerDetailResponseSchema,
  adminPrayerListResponseSchema,
  type AdminEventDetailResponseDto,
  type AdminEventListResponseDto,
  type AdminPrayerDetailResponseDto,
  type AdminPrayerListResponseDto,
  type CreateAdminEventRequestDto,
  type CreateAdminPrayerRequestDto,
  type UpdateAdminEventRequestDto,
  type UpdateAdminPrayerRequestDto
} from "@jp2/shared-validation";

export const DEFAULT_ADMIN_API_BASE_URL = "http://localhost:3000/api/";

export type AdminContentScreenState =
  | "ready"
  | "loading"
  | "empty"
  | "error"
  | "offline"
  | "forbidden";

export interface AdminContentFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export interface AdminContentFetchInit {
  method?: "GET" | "POST" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
}

export type AdminContentFetch = (
  input: string,
  init?: AdminContentFetchInit
) => Promise<AdminContentFetchResponse>;

export interface AdminContentRequestOptions {
  baseUrl?: string;
  authToken?: string;
  authCookie?: string;
  fetchImpl?: AdminContentFetch;
}

export async function fetchAdminPrayers(
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerListResponseDto> {
  const response = await requestAdminContent("admin/prayers", options);

  return adminPrayerListResponseSchema.parse(await response.json());
}

export async function createAdminPrayer(
  data: CreateAdminPrayerRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  const response = await requestAdminContent("admin/prayers", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return adminPrayerDetailResponseSchema.parse(await response.json());
}

export async function updateAdminPrayer(
  id: string,
  data: UpdateAdminPrayerRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  const response = await requestAdminContent(`admin/prayers/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminPrayerDetailResponseSchema.parse(await response.json());
}

export async function fetchAdminEvents(
  options: AdminContentRequestOptions = {}
): Promise<AdminEventListResponseDto> {
  const response = await requestAdminContent("admin/events", options);

  return adminEventListResponseSchema.parse(await response.json());
}

export async function createAdminEvent(
  data: CreateAdminEventRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  const response = await requestAdminContent("admin/events", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return adminEventDetailResponseSchema.parse(await response.json());
}

export async function updateAdminEvent(
  id: string,
  data: UpdateAdminEventRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  const response = await requestAdminContent(`admin/events/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminEventDetailResponseSchema.parse(await response.json());
}

export function buildAdminContentUrl(path: string, baseUrl = DEFAULT_ADMIN_API_BASE_URL): string {
  return new URL(path, normalizeBaseUrl(baseUrl)).toString();
}

export function adminContentFailureState(error: unknown): AdminContentScreenState {
  if (error instanceof TypeError) {
    return "offline";
  }

  if (
    error instanceof AdminContentHttpError &&
    (error.status === 401 || error.status === 403)
  ) {
    return "forbidden";
  }

  return "error";
}

export class AdminContentHttpError extends Error {
  constructor(readonly status: number) {
    super(`Admin content request failed with HTTP ${status}.`);
  }
}

async function requestAdminContent(
  path: string,
  options: AdminContentRequestOptions,
  init: AdminContentFetchInit = {}
): Promise<AdminContentFetchResponse> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const fetchInit: AdminContentFetchInit = {
    method: init.method ?? "GET",
    headers: buildHeaders(options.authToken, options.authCookie, init.body)
  };

  if (init.body !== undefined) {
    fetchInit.body = init.body;
  }

  const response = await fetcher(buildAdminContentUrl(path, options.baseUrl), fetchInit);

  if (!response.ok) {
    throw new AdminContentHttpError(response.status);
  }

  return response;
}

function buildHeaders(
  authToken: string | undefined,
  authCookie: string | undefined,
  body: string | undefined
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (body) {
    headers["content-type"] = "application/json";
  }

  if (authToken) {
    headers.authorization = `Bearer ${authToken}`;
  }

  if (authCookie) {
    headers.cookie = authCookie;
  }

  return headers;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): AdminContentFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
