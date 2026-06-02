import {
  type AdminAuditLogListQueryDto,
  adminAuditLogListResponseSchema,
  type AdminAuditLogListResponseDto
} from "@jp2/shared-validation";
import { requestAdminApi, type AdminContentRequestOptions } from "./admin-content-api.js";

export type AdminAuditLogQueryParams = Partial<
  Record<keyof AdminAuditLogListQueryDto, string | number>
>;

export interface FetchAdminAuditLogsOptions extends AdminContentRequestOptions {
  query?: AdminAuditLogQueryParams;
}

export async function fetchAdminAuditLogs(
  options: FetchAdminAuditLogsOptions = {}
): Promise<AdminAuditLogListResponseDto> {
  const { query, ...requestOptions } = options;
  const response = await requestAdminApi(adminAuditLogPath(query), requestOptions);

  return adminAuditLogListResponseSchema.parse(await response.json());
}

function adminAuditLogPath(query: AdminAuditLogQueryParams | undefined): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }

  const queryString = search.toString();

  return queryString ? `admin/audit-logs?${queryString}` : "admin/audit-logs";
}
