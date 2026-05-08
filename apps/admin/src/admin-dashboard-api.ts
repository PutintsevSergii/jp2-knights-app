import {
  adminDashboardResponseSchema,
  type AdminDashboardResponseDto
} from "@jp2/shared-validation";
import {
  adminContentFailureState,
  requestAdminApi,
  type AdminContentRequestOptions,
  type AdminContentScreenState
} from "./admin-content-api.js";

export async function fetchAdminDashboard(
  options: AdminContentRequestOptions = {}
): Promise<AdminDashboardResponseDto> {
  const response = await requestAdminApi("admin/dashboard", options);

  return adminDashboardResponseSchema.parse(await response.json());
}

export function adminDashboardFailureState(error: unknown): AdminContentScreenState {
  return adminContentFailureState(error);
}
