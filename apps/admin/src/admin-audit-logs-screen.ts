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

export type AdminAuditLogFilterName =
  | "limit"
  | "offset"
  | "action"
  | "entityType"
  | "actorUserId"
  | "entityId"
  | "scopeOrganizationUnitId"
  | "createdFrom"
  | "createdTo";

export interface AdminAuditLogFilterField {
  name: AdminAuditLogFilterName;
  label: string;
  value: string;
  options?: readonly AdminAuditLogFilterOption[];
}

export interface AdminAuditLogFilterOption {
  label: string;
  value: string;
}

export interface AdminAuditLogPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface AdminAuditLogListScreen {
  route: AdminAuditLogRoute;
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminAuditLogRow[];
  pagination: AdminAuditLogPagination;
  filters: AdminAuditLogFilterField[];
  hasActiveFilters: boolean;
  demoChromeVisible: boolean;
}

export interface BuildAdminAuditLogListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminAuditLogListResponseDto;
  runtimeMode: RuntimeMode;
  filters?: Partial<Record<AdminAuditLogFilterName, string>>;
}

const auditLogActionFilterOptions = [
  { label: "Any action", value: "" },
  { label: "Candidate request exported", value: "admin.candidateRequest.export" },
  { label: "Candidate request erased", value: "admin.candidateRequest.erase" },
  { label: "Candidate request updated", value: "admin.candidateRequest.update" },
  { label: "Candidate request converted", value: "admin.candidateRequest.convert" },
  { label: "Candidate profile exported", value: "admin.candidateProfile.export" },
  { label: "Candidate profile erased", value: "admin.candidateProfile.erase" },
  { label: "Candidate profile updated", value: "admin.candidateProfile.update" },
  { label: "Roadmap submission exported", value: "admin.roadmapSubmission.export" },
  { label: "Roadmap submission erased", value: "admin.roadmapSubmission.erase" },
  { label: "Roadmap submission approved", value: "admin.roadmapSubmission.approved" },
  { label: "Roadmap assignment created", value: "admin.roadmapAssignment.create" },
  { label: "Prayer approved", value: "admin.prayer.approve" },
  { label: "Prayer published", value: "admin.prayer.publish" },
  { label: "Prayer archived", value: "admin.prayer.archive" },
  { label: "Prayer updated", value: "admin.prayer.update" },
  { label: "Event approved", value: "admin.event.approve" },
  { label: "Event published", value: "admin.event.publish" },
  { label: "Event canceled", value: "admin.event.cancel" },
  { label: "Event archived", value: "admin.event.archive" },
  { label: "Event updated", value: "admin.event.update" },
  { label: "Announcement approved", value: "admin.announcement.approve" },
  { label: "Announcement published", value: "admin.announcement.publish" },
  { label: "Announcement archived", value: "admin.announcement.archive" },
  { label: "Announcement updated", value: "admin.announcement.update" },
  { label: "Silent-prayer event approved", value: "admin.silent_prayer_event.approve" },
  { label: "Silent-prayer event published", value: "admin.silent_prayer_event.publish" },
  { label: "Silent-prayer event archived", value: "admin.silent_prayer_event.archive" },
  { label: "Silent-prayer event updated", value: "admin.silent_prayer_event.update" },
  { label: "Identity access confirmed", value: "admin.identityAccess.confirm" },
  { label: "Organization unit created", value: "admin.organizationUnit.create" },
  { label: "Organization unit updated", value: "admin.organizationUnit.update" }
] as const satisfies readonly AdminAuditLogFilterOption[];

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
    pagination: auditLogPagination(options.response),
    filters: auditLogFilterFields(options.filters),
    hasActiveFilters: hasActiveFilters(options.filters),
    demoChromeVisible: options.runtimeMode === "demo"
  };
}

function auditLogPagination(
  response: AdminAuditLogListResponseDto | undefined
): AdminAuditLogPagination {
  return {
    limit: response?.pagination.limit ?? 50,
    offset: response?.pagination.offset ?? 0,
    total: response?.pagination.total ?? response?.auditLogs.length ?? 0
  };
}

function auditLogFilterFields(
  filters: Partial<Record<AdminAuditLogFilterName, string>> | undefined
): AdminAuditLogFilterField[] {
  const actionValue = filters?.action ?? "";

  return [
    {
      name: "action",
      label: "Action",
      value: actionValue,
      options: auditLogActionOptionsForValue(actionValue)
    },
    { name: "entityType", label: "Entity type", value: filters?.entityType ?? "" },
    { name: "actorUserId", label: "Actor user ID", value: filters?.actorUserId ?? "" },
    { name: "entityId", label: "Entity ID", value: filters?.entityId ?? "" },
    {
      name: "scopeOrganizationUnitId",
      label: "Scope organization unit ID",
      value: filters?.scopeOrganizationUnitId ?? ""
    },
    { name: "createdFrom", label: "Created from", value: filters?.createdFrom ?? "" },
    { name: "createdTo", label: "Created to", value: filters?.createdTo ?? "" },
    { name: "limit", label: "Limit", value: filters?.limit ?? "50" },
    { name: "offset", label: "Offset", value: filters?.offset ?? "0" }
  ];
}

function auditLogActionOptionsForValue(value: string): readonly AdminAuditLogFilterOption[] {
  if (value === "" || auditLogActionFilterOptions.some((option) => option.value === value)) {
    return auditLogActionFilterOptions;
  }

  return [
    ...auditLogActionFilterOptions,
    {
      label: `Custom: ${value}`,
      value
    }
  ];
}

function hasActiveFilters(
  filters: Partial<Record<AdminAuditLogFilterName, string>> | undefined
): boolean {
  return Object.entries(filters ?? {}).some(([key, value]) => {
    if (key === "limit") return value !== "" && value !== "50";
    if (key === "offset") return value !== "" && value !== "0";

    return value !== "";
  });
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
