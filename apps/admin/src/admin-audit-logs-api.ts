import {
  adminAuditLogListResponseSchema,
  type AdminAuditLogListResponseDto
} from "@jp2/shared-validation";
import { requestAdminApi, type AdminContentRequestOptions } from "./admin-content-api.js";

export async function fetchAdminAuditLogs(
  options: AdminContentRequestOptions = {}
): Promise<AdminAuditLogListResponseDto> {
  const response = await requestAdminApi("admin/audit-logs", options);

  return adminAuditLogListResponseSchema.parse(await response.json());
}
