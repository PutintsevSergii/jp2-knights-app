import type { AdminAuditLogListResponseDto } from "@jp2/shared-validation";

export type AdminAuditLogListResponse = AdminAuditLogListResponseDto;
export type AdminAuditLogSummary = AdminAuditLogListResponse["auditLogs"][number];
