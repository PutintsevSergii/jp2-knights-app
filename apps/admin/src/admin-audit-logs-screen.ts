import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminAuditLogListResponseDto, AdminAuditLogSummaryDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";

export type AdminAuditLogRoute = "AdminAuditLogList";

export interface AdminAuditLogRow {
  id: string;
  actorLabel: string;
  action: string;
  entityLabel: string;
  scopeLabel: string;
  beforeSummary: string;
  afterSummary: string;
  requestId: string;
  createdAt: string;
}

export interface AdminAuditLogListScreen {
  route: AdminAuditLogRoute;
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminAuditLogRow[];
  demoChromeVisible: boolean;
}

export interface BuildAdminAuditLogListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminAuditLogListResponseDto;
  runtimeMode: RuntimeMode;
}

export function buildAdminAuditLogListScreen(
  options: BuildAdminAuditLogListScreenOptions
): AdminAuditLogListScreen {
  const rows = options.response?.auditLogs.map(toAuditLogRow) ?? [];

  return {
    route: "AdminAuditLogList",
    state: options.state === "ready" && rows.length === 0 ? "empty" : options.state,
    title: "Audit Logs",
    body: "Latest redacted critical admin changes for Super Admin review.",
    rows,
    demoChromeVisible: options.runtimeMode === "demo"
  };
}

function toAuditLogRow(log: AdminAuditLogSummaryDto): AdminAuditLogRow {
  return {
    id: log.id,
    actorLabel: log.actorDisplayName ?? log.actorUserId ?? "System",
    action: log.action,
    entityLabel: `${log.entityType} ${log.entityId}`,
    scopeLabel: log.scopeOrganizationUnitId ?? "Global",
    beforeSummary: formatSummary(log.beforeSummary),
    afterSummary: formatSummary(log.afterSummary),
    requestId: log.requestId ?? "Not captured",
    createdAt: formatDate(log.createdAt)
  };
}

function formatSummary(summary: AdminAuditLogSummaryDto["beforeSummary"]): string {
  if (!summary || Object.keys(summary).length === 0) {
    return "None";
  }

  return Object.entries(summary)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("; ");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(value));
}
