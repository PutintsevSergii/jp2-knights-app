import type {
  AdminAuditLogListQueryDto,
  AdminAuditLogListResponseDto
} from "@jp2/shared-validation";

export type AdminAuditLogListQuery = AdminAuditLogListQueryDto;
export type AdminAuditLogListResponse = AdminAuditLogListResponseDto;
export type AdminAuditLogSummary = AdminAuditLogListResponse["auditLogs"][number];
