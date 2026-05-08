export const DEFAULT_PUBLIC_API_BASE_URL = "http://localhost:3000";

export type MobilePrivateAccessErrorCode = "IDLE_APPROVAL_REQUIRED";

export interface MobileApiFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export interface MobileApiFetchInit {
  method?: "GET" | "POST" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
}

export type MobileApiFetch = (
  input: string,
  init?: MobileApiFetchInit
) => Promise<MobileApiFetchResponse>;

export type MobilePublicFetch = (input: string) => Promise<MobileApiFetchResponse>;

export interface MobileApiRequestOptions {
  authToken?: string;
  fetchImpl?: MobileApiFetch;
}

export async function requestMobileApi<TResponse extends MobileApiFetchResponse>(
  url: string,
  options: MobileApiRequestOptions,
  method: MobileApiFetchInit["method"],
  createHttpError: (
    status: number,
    code: MobilePrivateAccessErrorCode | null
  ) => Error
): Promise<TResponse> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const init: MobileApiFetchInit = { headers };

  if (method !== undefined) {
    init.method = method;
  }

  const response = (await fetcher(url, init)) as TResponse;

  if (!response.ok) {
    throw createHttpError(response.status, await readPrivateAccessErrorCode(response));
  }

  return response;
}

export async function requestPublicMobileApi<TResponse extends MobileApiFetchResponse>(
  url: string,
  fetchImpl: MobilePublicFetch | undefined,
  createHttpError: (status: number) => Error
): Promise<TResponse> {
  const fetcher = fetchImpl ?? getGlobalPublicFetch();
  const response = (await fetcher(url)) as TResponse;

  if (!response.ok) {
    throw createHttpError(response.status);
  }

  return response;
}

export async function requestPublicJsonMobileApi<TResponse extends MobileApiFetchResponse>(
  url: string,
  fetchImpl: MobileApiFetch | undefined,
  body: string,
  createHttpError: (status: number) => Error
): Promise<TResponse> {
  const fetcher = fetchImpl ?? getGlobalFetch();
  const response = (await fetcher(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body
  })) as TResponse;

  if (!response.ok) {
    throw createHttpError(response.status);
  }

  return response;
}

export function buildMobileApiUrl(path: string, baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL(path, normalizeBaseUrl(baseUrl)).toString();
}

export function setOptionalParam(url: URL, key: string, value: string | undefined) {
  if (value) {
    url.searchParams.set(key, value);
  }
}

export function setOptionalNumberParam(url: URL, key: string, value: number | undefined) {
  if (typeof value === "number") {
    url.searchParams.set(key, String(value));
  }
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

async function readPrivateAccessErrorCode(
  response: MobileApiFetchResponse
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getGlobalFetch(): MobileApiFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}

function getGlobalPublicFetch(): MobilePublicFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input) => globalThis.fetch(input);
}
