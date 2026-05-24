export type AdminRoadmapAssignmentRoute =
  | "AdminRoadmapAssignmentList"
  | "AdminRoadmapAssignmentDetail";

export type AdminRoadmapAssignmentActionId = "refresh" | "view";

export interface AdminRoadmapAssignmentAction {
  id: AdminRoadmapAssignmentActionId;
  label: string;
  targetRoute: AdminRoadmapAssignmentRoute;
  targetId?: string | undefined;
}

export interface AdminRoadmapAssignmentRow {
  id: string;
  title: string;
  assignee: string;
  roadmapMeta: string;
  organizationUnitName: string;
  status: AdminRoadmapAssignmentDetailDto["status"];
  statusLabel: string;
  countsLabel: string;
  assignedAt: string;
  actions: AdminRoadmapAssignmentAction[];
}

export interface AdminRoadmapAssignmentSection {
  id: string;
  title: string;
  body: string;
}

export function adminRoadmapAssignmentBackAction(): AdminRoadmapAssignmentAction {
  return {
    id: "refresh",
    label: "Back to Assignments",
    targetRoute: "AdminRoadmapAssignmentList"
  };
}

export function formatAdminRoadmapAssignmentDateTime(value: string | null): string {
  return value ? new Date(value).toISOString() : "Not completed";
}

export function roadmapAssignmentStatusLabel(status: string): string {
  return formatAdminStatusLabel(status);
}
import type { AdminRoadmapAssignmentDetailDto } from "@jp2/shared-validation";
import { formatAdminStatusLabel } from "./admin-status-labels.js";
