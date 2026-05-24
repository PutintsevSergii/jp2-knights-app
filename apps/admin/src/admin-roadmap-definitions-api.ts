import {
  adminRoadmapDefinitionDetailResponseSchema,
  adminRoadmapDefinitionListResponseSchema,
  type AdminRoadmapDefinitionDetailResponseDto,
  type AdminRoadmapDefinitionListResponseDto
} from "@jp2/shared-validation";
import { requestAdminApi, type AdminContentRequestOptions } from "./admin-content-api.js";

export async function fetchAdminRoadmapDefinitions(
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapDefinitionListResponseDto> {
  const response = await requestAdminApi("admin/roadmap-definitions", options);

  return adminRoadmapDefinitionListResponseSchema.parse(await response.json());
}

export async function fetchAdminRoadmapDefinition(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminRoadmapDefinitionDetailResponseDto> {
  const response = await requestAdminApi(`admin/roadmap-definitions/${id}`, options);

  return adminRoadmapDefinitionDetailResponseSchema.parse(await response.json());
}
