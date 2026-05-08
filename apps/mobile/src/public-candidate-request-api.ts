import {
  createPublicCandidateRequestSchema,
  publicCandidateRequestResponseSchema,
  type PublicCandidateRequestResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  DEFAULT_PUBLIC_API_BASE_URL,
  buildMobileApiUrl,
  requestPublicJsonMobileApi,
  type MobileApiFetch,
  type MobileApiFetchResponse
} from "./mobile-api-client.js";

export type PublicCandidateRequestFetchResponse = MobileApiFetchResponse;

export interface PublicCandidateRequestFetchInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export type PublicCandidateRequestFetch = MobileApiFetch;

export interface SubmitPublicCandidateRequestOptions {
  baseUrl?: string;
  request: unknown;
  fetchImpl?: PublicCandidateRequestFetch;
}

export async function submitPublicCandidateRequest(
  options: SubmitPublicCandidateRequestOptions
): Promise<PublicCandidateRequestResponseDto> {
  const request = createPublicCandidateRequestSchema.parse(options.request);
  const response = await requestPublicJsonMobileApi<PublicCandidateRequestFetchResponse>(
    buildPublicCandidateRequestUrl(options.baseUrl),
    options.fetchImpl,
    JSON.stringify(request),
    (status) => new PublicCandidateRequestHttpError(status)
  );

  return publicCandidateRequestResponseSchema.parse(await response.json());
}

export function buildPublicCandidateRequestUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL) {
  return buildMobileApiUrl("public/candidate-requests", baseUrl);
}

export function publicCandidateRequestSubmitFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicCandidateRequestHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public candidate request failed with HTTP ${status}.`);
  }
}
