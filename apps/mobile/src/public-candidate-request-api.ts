import {
  createPublicCandidateRequestSchema,
  publicCandidateRequestResponseSchema,
  type PublicCandidateRequestResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import { DEFAULT_PUBLIC_API_BASE_URL } from "./public-home-api.js";

export interface PublicCandidateRequestFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export interface PublicCandidateRequestFetchInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export type PublicCandidateRequestFetch = (
  input: string,
  init?: PublicCandidateRequestFetchInit
) => Promise<PublicCandidateRequestFetchResponse>;

export interface SubmitPublicCandidateRequestOptions {
  baseUrl?: string;
  request: unknown;
  fetchImpl?: PublicCandidateRequestFetch;
}

export async function submitPublicCandidateRequest(
  options: SubmitPublicCandidateRequestOptions
): Promise<PublicCandidateRequestResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const request = createPublicCandidateRequestSchema.parse(options.request);
  const response = await fetcher(buildPublicCandidateRequestUrl(options.baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new PublicCandidateRequestHttpError(response.status);
  }

  return publicCandidateRequestResponseSchema.parse(await response.json());
}

export function buildPublicCandidateRequestUrl(baseUrl = DEFAULT_PUBLIC_API_BASE_URL) {
  return new URL("public/candidate-requests", normalizeBaseUrl(baseUrl)).toString();
}

export function publicCandidateRequestSubmitFailureState(error: unknown): MobileScreenState {
  return error instanceof TypeError ? "offline" : "error";
}

export class PublicCandidateRequestHttpError extends Error {
  constructor(readonly status: number) {
    super(`Public candidate request failed with HTTP ${status}.`);
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getGlobalFetch(): PublicCandidateRequestFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
