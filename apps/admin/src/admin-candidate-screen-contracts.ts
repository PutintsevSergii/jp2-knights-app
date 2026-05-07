import type { AdminCandidateProfileDetailDto } from "@jp2/shared-validation";

export type AdminCandidateRoute = "AdminCandidateList" | "AdminCandidateDetail";
export type AdminCandidateActionId = "refresh" | "view" | "save" | "pause" | "activate" | "archive";

export interface AdminCandidateAction {
  id: AdminCandidateActionId;
  label: string;
  targetRoute: AdminCandidateRoute;
  targetId?: string | undefined;
}

export interface AdminCandidateRow {
  id: string;
  title: string;
  primaryMeta: string;
  secondaryMeta: string;
  status: string;
  assignedOrganizationUnitName: string;
  responsibleOfficerName: string;
  actions: AdminCandidateAction[];
}

export interface AdminCandidateField {
  name:
    | keyof AdminCandidateProfileDetailDto
    | "status"
    | "assignedOrganizationUnitId"
    | "responsibleOfficerId";
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
}

export function adminCandidateBackAction(): AdminCandidateAction {
  return { id: "refresh", label: "Back to List", targetRoute: "AdminCandidateList" };
}

export function formatAdminCandidateDateTime(value: string): string {
  return new Date(value).toISOString();
}
