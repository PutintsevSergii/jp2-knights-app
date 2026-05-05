import {
  adminCandidateRequestDetailResponseSchema,
  adminCandidateRequestListResponseSchema,
  type AdminCandidateRequestDetailResponseDto,
  type AdminCandidateRequestListResponseDto,
  type UpdateAdminCandidateRequestDto
} from "@jp2/shared-validation";
import {
  AdminContentHttpError,
  buildAdminContentUrl,
  type AdminContentFetch,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminCandidateRequests(
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateRequestListResponseDto> {
  const response = await requestAdminCandidateRequest("admin/candidate-requests", options);

  return adminCandidateRequestListResponseSchema.parse(await response.json());
}

export async function fetchAdminCandidateRequest(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateRequestDetailResponseDto> {
  const response = await requestAdminCandidateRequest(
    `admin/candidate-requests/${id}`,
    options
  );

  return adminCandidateRequestDetailResponseSchema.parse(await response.json());
}

export async function updateAdminCandidateRequest(
  id: string,
  data: UpdateAdminCandidateRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateRequestDetailResponseDto> {
  const response = await requestAdminCandidateRequest(
    `admin/candidate-requests/${id}`,
    options,
    {
      method: "PATCH",
      body: JSON.stringify(data)
    }
  );

  return adminCandidateRequestDetailResponseSchema.parse(await response.json());
}

async function requestAdminCandidateRequest(
  path: string,
  options: AdminContentRequestOptions,
  init: {
    method?: "GET" | "PATCH";
    body?: string;
  } = {}
) {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (init.body) {
    headers["content-type"] = "application/json";
  }

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetcher(buildAdminContentUrl(path, options.baseUrl), {
    method: init.method ?? "GET",
    headers,
    ...(init.body ? { body: init.body } : {})
  });

  if (!response.ok) {
    throw new AdminContentHttpError(response.status);
  }

  return response;
}

function getGlobalFetch(): AdminContentFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
