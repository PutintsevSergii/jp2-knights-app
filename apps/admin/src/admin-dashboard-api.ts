import {
  adminDashboardResponseSchema,
  type AdminDashboardResponseDto
} from "@jp2/shared-validation";
import {
  AdminContentHttpError,
  adminContentFailureState,
  buildAdminContentUrl,
  type AdminContentFetch,
  type AdminContentRequestOptions,
  type AdminContentScreenState
} from "./admin-content-api.js";

export async function fetchAdminDashboard(
  options: AdminContentRequestOptions = {}
): Promise<AdminDashboardResponseDto> {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const response = await fetcher(buildAdminContentUrl("admin/dashboard", options.baseUrl), {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new AdminContentHttpError(response.status);
  }

  return adminDashboardResponseSchema.parse(await response.json());
}

export function adminDashboardFailureState(error: unknown): AdminContentScreenState {
  return adminContentFailureState(error);
}

function getGlobalFetch(): AdminContentFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
