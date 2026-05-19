import {
  assignedRoadmapResponseSchema,
  type AssignedRoadmapResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  requestMobileApi,
  type MobileApiFetch,
  type MobileApiFetchInit,
  type MobileApiFetchResponse,
  type MobilePrivateAccessErrorCode
} from "./mobile-api-client.js";

export type RoadmapFetchResponse = MobileApiFetchResponse;

export type RoadmapFetchInit = MobileApiFetchInit;

export type RoadmapFetch = MobileApiFetch;

export interface FetchRoadmapOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: RoadmapFetch;
}

export async function fetchCandidateRoadmap(
  options: FetchRoadmapOptions = {}
): Promise<AssignedRoadmapResponseDto> {
  const response = await fetchRoadmapApi(buildCandidateRoadmapUrl(options.baseUrl), options);

  return assignedRoadmapResponseSchema.parse(await response.json());
}

export async function fetchBrotherRoadmap(
  options: FetchRoadmapOptions = {}
): Promise<AssignedRoadmapResponseDto> {
  const response = await fetchRoadmapApi(buildBrotherRoadmapUrl(options.baseUrl), options);

  return assignedRoadmapResponseSchema.parse(await response.json());
}

export function buildCandidateRoadmapUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("candidate/roadmap", baseUrl);
}

export function buildBrotherRoadmapUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL): string {
  return buildMobileApiUrl("brother/roadmap", baseUrl);
}

export function roadmapLoadFailureState(error: unknown): MobileScreenState {
  if (error instanceof TypeError) {
    return "offline";
  }

  if (error instanceof RoadmapHttpError && error.code === "IDLE_APPROVAL_REQUIRED") {
    return "idleApproval";
  }

  if (error instanceof RoadmapHttpError && (error.status === 401 || error.status === 403)) {
    return "forbidden";
  }

  if (error instanceof RoadmapHttpError && error.status === 404) {
    return "empty";
  }

  return "error";
}

export class RoadmapHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: MobilePrivateAccessErrorCode | null = null
  ) {
    super(`Roadmap request failed with HTTP ${status}.`);
  }
}

async function fetchRoadmapApi(
  url: string,
  options: FetchRoadmapOptions,
  method: RoadmapFetchInit["method"] = "GET"
): Promise<RoadmapFetchResponse> {
  return requestMobileApi<RoadmapFetchResponse>(
    url,
    options,
    method,
    (status, code) => new RoadmapHttpError(status, code)
  );
}
