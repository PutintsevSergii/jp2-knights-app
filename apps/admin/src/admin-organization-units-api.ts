import {
  adminOrganizationUnitListResponseSchema,
  organizationUnitDetailResponseSchema,
  type AdminOrganizationUnitListResponseDto,
  type CreateOrganizationUnitRequestDto,
  type OrganizationUnitDetailResponseDto,
  type UpdateOrganizationUnitRequestDto
} from "@jp2/shared-validation";
import {
  AdminContentHttpError,
  buildAdminContentUrl,
  type AdminContentFetch,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminOrganizationUnits(
  options: AdminContentRequestOptions = {}
): Promise<AdminOrganizationUnitListResponseDto> {
  const response = await requestAdminOrganizationUnit("admin/organization-units", options);

  return adminOrganizationUnitListResponseSchema.parse(await response.json());
}

export async function createAdminOrganizationUnit(
  data: CreateOrganizationUnitRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<OrganizationUnitDetailResponseDto> {
  const response = await requestAdminOrganizationUnit("admin/organization-units", options, {
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
  const response = await requestAdminOrganizationUnit(`admin/organization-units/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return organizationUnitDetailResponseSchema.parse(await response.json());
}

async function requestAdminOrganizationUnit(
  path: string,
  options: AdminContentRequestOptions,
  init: {
    method?: "GET" | "POST" | "PATCH";
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
