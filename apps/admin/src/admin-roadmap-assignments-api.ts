import {
  adminRoadmapAssignmentDetailResponseSchema,
  adminRoadmapAssignmentListResponseSchema,
  type AdminRoadmapAssignmentDetailResponseDto,
  type AdminRoadmapAssignmentListResponseDto
} from "@jp2/shared-validation";
import { requestAdminApi, type AdminContentRequestOptions } from "./admin-content-api.js";

export async function fetchAdminRoadmapAssignments(
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapAssignmentListResponseDto> {
  const response = await requestAdminApi("admin/roadmap-assignments", options);

  return adminRoadmapAssignmentListResponseSchema.parse(await response.json());
}

export async function fetchAdminRoadmapAssignment(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapAssignmentDetailResponseDto> {
  const response = await requestAdminApi(`admin/roadmap-assignments/${id}`, options);

  return adminRoadmapAssignmentDetailResponseSchema.parse(await response.json());
}
