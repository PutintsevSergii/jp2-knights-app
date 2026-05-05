import {
  candidateDashboardResponseSchema,
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
  method?: "GET";
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

export async function fetchCandidateDashboard(
  options: FetchCandidateDashboardOptions = {}
): Promise<CandidateDashboardResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetcher(buildCandidateDashboardUrl(options.baseUrl), {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new CandidateDashboardHttpError(response.status, await readPrivateAccessErrorCode(response));
  }

  return candidateDashboardResponseSchema.parse(await response.json());
}

export function buildCandidateDashboardUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return new URL("candidate/dashboard", normalizeBaseUrl(baseUrl)).toString();
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

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): CandidateDashboardFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
