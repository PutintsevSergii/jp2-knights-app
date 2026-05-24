import type { AdminRoadmapSubmissionDetailDto } from "@jp2/shared-validation";

export type AdminRoadmapSubmissionRoute =
  | "AdminRoadmapSubmissionList"
  | "AdminRoadmapSubmissionDetail";

export type AdminRoadmapSubmissionActionId = "refresh" | "view" | "approve" | "reject";

export interface AdminRoadmapSubmissionAction {
  id: AdminRoadmapSubmissionActionId;
  label: string;
  targetRoute: AdminRoadmapSubmissionRoute;
  targetId?: string | undefined;
}

export interface AdminRoadmapSubmissionRow {
  id: string;
  title: string;
  submitter: string;
  roadmapMeta: string;
  organizationUnitName: string;
  status: AdminRoadmapSubmissionDetailDto["status"];
  statusLabel: string;
  bodyPreview: string;
  attachmentLabel: string;
  createdAt: string;
  actions: AdminRoadmapSubmissionAction[];
}

export interface AdminRoadmapSubmissionField {
  name:
    | keyof AdminRoadmapSubmissionDetailDto
    | "reviewStatus"
    | "reviewCommentInput";
  label: string;
  value: string;
  readOnly: boolean;
  multiline: boolean;
}

export function adminRoadmapSubmissionBackAction(): AdminRoadmapSubmissionAction {
  return {
    id: "refresh",
    label: "Back to Queue",
    targetRoute: "AdminRoadmapSubmissionList"
  };
}

export function formatAdminRoadmapSubmissionDateTime(value: string): string {
  return new Date(value).toISOString();
}

export function roadmapSubmissionStatusLabel(
  status: AdminRoadmapSubmissionDetailDto["status"]
): string {
  return status.replaceAll("_", " ").toUpperCase();
}
