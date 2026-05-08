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

export async function requestAdminApi(
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
