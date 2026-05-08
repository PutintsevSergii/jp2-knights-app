import {
  adminCandidateRequestDetailResponseSchema,
  adminCandidateRequestListResponseSchema,
  type AdminCandidateRequestDetailResponseDto,
  type AdminCandidateRequestListResponseDto,
  type UpdateAdminCandidateRequestDto
} from "@jp2/shared-validation";
import {
  requestAdminApi,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminCandidateRequests(
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateRequestListResponseDto> {
  const response = await requestAdminApi("admin/candidate-requests", options);

  return adminCandidateRequestListResponseSchema.parse(await response.json());
}

export async function fetchAdminCandidateRequest(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateRequestDetailResponseDto> {
  const response = await requestAdminApi(`admin/candidate-requests/${id}`, options);

  return adminCandidateRequestDetailResponseSchema.parse(await response.json());
}

export async function updateAdminCandidateRequest(
  id: string,
  data: UpdateAdminCandidateRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminCandidateRequestDetailResponseDto> {
  const response = await requestAdminApi(`admin/candidate-requests/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminCandidateRequestDetailResponseSchema.parse(await response.json());
}
