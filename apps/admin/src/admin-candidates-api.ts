import {
  adminCandidateProfileDetailResponseSchema,
  adminCandidateProfileListResponseSchema,
  type AdminCandidateProfileDetailResponseDto,
  type AdminCandidateProfileListResponseDto,
  type UpdateAdminCandidateProfileDto
} from "@jp2/shared-validation";
import {
  AdminContentHttpError,
  buildAdminContentUrl,
  type AdminContentFetch,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminCandidateProfiles(
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateProfileListResponseDto> {
  const response = await requestAdminCandidate("admin/candidates", options);

  return adminCandidateProfileListResponseSchema.parse(await response.json());
}

export async function fetchAdminCandidateProfile(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateProfileDetailResponseDto> {
  const response = await requestAdminCandidate(`admin/candidates/${id}`, options);

  return adminCandidateProfileDetailResponseSchema.parse(await response.json());
}

export async function updateAdminCandidateProfile(
  id: string,
  data: UpdateAdminCandidateProfileDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateProfileDetailResponseDto> {
  const response = await requestAdminCandidate(`admin/candidates/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminCandidateProfileDetailResponseSchema.parse(await response.json());
}

async function requestAdminCandidate(
  path: string,
  options: AdminContentRequestOptions,
  init: { method?: "GET" | "PATCH"; body?: string } = {}
) {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (init.body) {
    headers["content-type"] = "application/json";
  }

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  if (options.authCookie) {
    headers.cookie = options.authCookie;
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
