import {
  adminRoadmapSubmissionDetailResponseSchema,
  adminRoadmapSubmissionErasureResponseSchema,
  adminRoadmapSubmissionExportResponseSchema,
  adminRoadmapSubmissionListResponseSchema,
  type AdminRoadmapSubmissionDetailResponseDto,
  type AdminRoadmapSubmissionErasureResponseDto,
  type AdminRoadmapSubmissionExportResponseDto,
  type AdminRoadmapSubmissionListResponseDto,
  type ReviewRoadmapSubmissionRequestDto
} from "@jp2/shared-validation";
import { adminPrivacyWorkflowOperationPath } from "@jp2/shared-types";
import { requestAdminApi, type AdminContentRequestOptions } from "./admin-content-api.js";

export async function fetchAdminRoadmapSubmissions(
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapSubmissionListResponseDto> {
  const response = await requestAdminApi("admin/roadmap-submissions", options);

  return adminRoadmapSubmissionListResponseSchema.parse(await response.json());
}

export async function fetchAdminRoadmapSubmission(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapSubmissionDetailResponseDto> {
  const response = await requestAdminApi(`admin/roadmap-submissions/${id}`, options);

  return adminRoadmapSubmissionDetailResponseSchema.parse(await response.json());
}

export async function exportAdminRoadmapSubmission(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapSubmissionExportResponseDto> {
  const response = await requestAdminApi(
    adminPrivacyWorkflowOperationPath("roadmapSubmission", id, "export"),
    options
  );

  return adminRoadmapSubmissionExportResponseSchema.parse(await response.json());
}

export async function eraseAdminRoadmapSubmission(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapSubmissionErasureResponseDto> {
  const response = await requestAdminApi(
    adminPrivacyWorkflowOperationPath("roadmapSubmission", id, "erase"),
    options,
    { method: "POST" }
  );

  return adminRoadmapSubmissionErasureResponseSchema.parse(await response.json());
}

export async function reviewAdminRoadmapSubmission(
  id: string,
  data: ReviewRoadmapSubmissionRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapSubmissionDetailResponseDto> {
  const response = await requestAdminApi(`admin/roadmap-submissions/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminRoadmapSubmissionDetailResponseSchema.parse(await response.json());
}
