import { ROADMAP_SUBMISSION_STATUS_METADATA } from "@jp2/shared-types";
import type { AdminRoadmapSubmissionDetailDto } from "@jp2/shared-validation";
import { adminCopy } from "./admin-i18n.js";
import { formatAdminStatusMetadataLabel } from "./admin-status-labels.js";

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
  name: keyof AdminRoadmapSubmissionDetailDto | "reviewStatus" | "reviewCommentInput";
  label: string;
  value: string;
  readOnly: boolean;
  multiline: boolean;
}

export function adminRoadmapSubmissionBackAction(): AdminRoadmapSubmissionAction {
  return {
    id: "refresh",
    label: adminCopy("admin.roadmapSubmissions.back"),
    targetRoute: "AdminRoadmapSubmissionList"
  };
}

export function formatAdminRoadmapSubmissionDateTime(value: string): string {
  return new Date(value).toISOString();
}

export function roadmapSubmissionStatusLabel(
  status: AdminRoadmapSubmissionDetailDto["status"]
): string {
  return formatAdminStatusMetadataLabel(ROADMAP_SUBMISSION_STATUS_METADATA, status);
}
