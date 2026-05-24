import {
  adminRoadmapSubmissionDetailResponseSchema,
  adminRoadmapSubmissionListResponseSchema,
  type AdminRoadmapSubmissionDetailResponseDto,
  type AdminRoadmapSubmissionListResponseDto,
  type ReviewRoadmapSubmissionRequestDto
} from "@jp2/shared-validation";
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
