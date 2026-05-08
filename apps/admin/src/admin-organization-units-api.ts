import {
  adminOrganizationUnitListResponseSchema,
  organizationUnitDetailResponseSchema,
  type AdminOrganizationUnitListResponseDto,
  type CreateOrganizationUnitRequestDto,
  type OrganizationUnitDetailResponseDto,
  type UpdateOrganizationUnitRequestDto
} from "@jp2/shared-validation";
import {
  requestAdminApi,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminOrganizationUnits(
  options: AdminContentRequestOptions = {}
): Promise<AdminOrganizationUnitListResponseDto> {
  const response = await requestAdminApi("admin/organization-units", options);

  return adminOrganizationUnitListResponseSchema.parse(await response.json());
}

export async function createAdminOrganizationUnit(
  data: CreateOrganizationUnitRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<OrganizationUnitDetailResponseDto> {
  const response = await requestAdminApi("admin/organization-units", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return organizationUnitDetailResponseSchema.parse(await response.json());
}

export async function updateAdminOrganizationUnit(
  id: string,
  data: UpdateOrganizationUnitRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<OrganizationUnitDetailResponseDto> {
  const response = await requestAdminApi(`admin/organization-units/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return organizationUnitDetailResponseSchema.parse(await response.json());
}
