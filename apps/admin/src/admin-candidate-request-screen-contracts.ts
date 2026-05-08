import type { AdminCandidateRequestDetailDto } from "@jp2/shared-validation";

export type AdminCandidateRequestRoute =
  | "AdminCandidateRequestList"
  | "AdminCandidateRequestDetail";

export type AdminCandidateRequestActionId =
  | "refresh"
  | "view"
  | "contact"
  | "invite"
  | "reject"
  | "save";

export interface AdminCandidateRequestAction {
  id: AdminCandidateRequestActionId;
  label: string;
  targetRoute: AdminCandidateRequestRoute;
  targetId?: string | undefined;
}

export interface AdminCandidateRequestRow {
  id: string;
  title: string;
  initials: string;
  primaryMeta: string;
  secondaryMeta: string;
  locationMeta: string;
  messagePreview: string;
  status: string;
  statusLabel: string;
  assignedOrganizationUnitName: string;
  createdAt: string;
  actions: AdminCandidateRequestAction[];
}

export interface AdminCandidateRequestMetric {
  id: "new" | "contacted" | "invited" | "rejected";
  label: string;
  count: number;
  description: string;
  tone: "attention" | "warning" | "success" | "danger";
}

export interface AdminCandidateRequestField {
  name:
    | keyof AdminCandidateRequestDetailDto
    | "status"
    | "assignedOrganizationUnitId"
    | "officerNote";
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
  multiline: boolean;
}

export function adminCandidateRequestBackAction(): AdminCandidateRequestAction {
  return {
    id: "refresh",
    label: "Back to List",
    targetRoute: "AdminCandidateRequestList"
  };
}

export function formatAdminCandidateRequestDateTime(value: string): string {
  return new Date(value).toISOString();
}
