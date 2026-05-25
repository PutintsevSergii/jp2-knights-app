import type {
  AdminRoadmapAssignmentDetailDto,
  CreateAdminRoadmapAssignmentRequestDto
} from "@jp2/shared-validation";
import { formatAdminStatusLabel } from "./admin-status-labels.js";

export type AdminRoadmapAssignmentRoute =
  | "AdminRoadmapAssignmentList"
  | "AdminRoadmapAssignmentDetail"
  | "AdminRoadmapAssignmentEditor";

export type AdminRoadmapAssignmentActionId = "create" | "refresh" | "view";

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

export interface AdminRoadmapAssignmentFormField {
  name: keyof CreateAdminRoadmapAssignmentRequestDto;
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
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
