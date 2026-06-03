import {
  ADMIN_AUDIT_ACTIONS,
  type AdminAuditAction,
  type RuntimeMode
} from "@jp2/shared-types";
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

const auditLogActionLabels = {
  "admin.candidateRequest.export": "Candidate request exported",
  "admin.candidateRequest.erase": "Candidate request erased",
  "admin.candidateRequest.update": "Candidate request updated",
  "admin.candidateRequest.convert": "Candidate request converted",
  "admin.candidateProfile.export": "Candidate profile exported",
  "admin.candidateProfile.erase": "Candidate profile erased",
  "admin.candidateProfile.update": "Candidate profile updated",
  "admin.roadmapSubmission.export": "Roadmap submission exported",
  "admin.roadmapSubmission.erase": "Roadmap submission erased",
  "admin.roadmapSubmission.approved": "Roadmap submission approved",
  "admin.roadmapSubmission.rejected": "Roadmap submission rejected",
  "admin.roadmapAssignment.create": "Roadmap assignment created",
  "admin.identityAccess.confirm": "Identity access confirmed",
  "admin.identityAccess.reject": "Identity access rejected",
  "admin.organizationUnit.create": "Organization unit created",
  "admin.organizationUnit.update": "Organization unit updated",
  "admin.prayer.create": "Prayer created",
  "admin.prayer.approve": "Prayer approved",
  "admin.prayer.publish": "Prayer published",
  "admin.prayer.archive": "Prayer archived",
  "admin.prayer.update": "Prayer updated",
  "admin.event.create": "Event created",
  "admin.event.approve": "Event approved",
  "admin.event.publish": "Event published",
  "admin.event.cancel": "Event canceled",
  "admin.event.archive": "Event archived",
  "admin.event.update": "Event updated",
  "admin.announcement.create": "Announcement created",
  "admin.announcement.approve": "Announcement approved",
  "admin.announcement.publish": "Announcement published",
  "admin.announcement.push_dispatch": "Announcement push dispatched",
  "admin.announcement.archive": "Announcement archived",
  "admin.announcement.update": "Announcement updated",
  "admin.silent_prayer_event.create": "Silent-prayer event created",
  "admin.silent_prayer_event.approve": "Silent-prayer event approved",
  "admin.silent_prayer_event.publish": "Silent-prayer event published",
  "admin.silent_prayer_event.archive": "Silent-prayer event archived",
  "admin.silent_prayer_event.update": "Silent-prayer event updated"
} as const satisfies Record<AdminAuditAction, string>;

const auditLogActionFilterOptions = [
  { label: "Any action", value: "" },
  ...ADMIN_AUDIT_ACTIONS.map((value) => ({
    label: auditLogActionLabels[value],
    value
  }))
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
