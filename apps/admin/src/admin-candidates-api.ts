import {
  adminCandidateProfileDetailResponseSchema,
  adminCandidateProfileListResponseSchema,
  type AdminCandidateProfileDetailResponseDto,
  type AdminCandidateProfileListResponseDto,
  type UpdateAdminCandidateProfileDto
} from "@jp2/shared-validation";
import {
  requestAdminApi,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminCandidateProfiles(
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateProfileListResponseDto> {
  const response = await requestAdminApi("admin/candidates", options);

  return adminCandidateProfileListResponseSchema.parse(await response.json());
}

export async function fetchAdminCandidateProfile(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateProfileDetailResponseDto> {
  const response = await requestAdminApi(`admin/candidates/${id}`, options);

  return adminCandidateProfileDetailResponseSchema.parse(await response.json());
}

export async function updateAdminCandidateProfile(
  id: string,
  data: UpdateAdminCandidateProfileDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateProfileDetailResponseDto> {
  const response = await requestAdminApi(`admin/candidates/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminCandidateProfileDetailResponseSchema.parse(await response.json());
}
