import type { AdminRoadmapDefinitionDetailDto } from "@jp2/shared-validation";
import { formatAdminStatusLabel } from "./admin-status-labels.js";

export type AdminRoadmapDefinitionRoute =
  | "AdminRoadmapDefinitionList"
  | "AdminRoadmapDefinitionDetail";

export type AdminRoadmapDefinitionActionId = "refresh" | "view";

export interface AdminRoadmapDefinitionAction {
  id: AdminRoadmapDefinitionActionId;
  label: string;
  targetRoute: AdminRoadmapDefinitionRoute;
  targetId?: string | undefined;
}

export interface AdminRoadmapDefinitionRow {
  id: string;
  title: string;
  targetRole: string;
  language: string;
  status: AdminRoadmapDefinitionDetailDto["status"];
  statusLabel: string;
  countsLabel: string;
  publishedAt: string;
  actions: AdminRoadmapDefinitionAction[];
}

export interface AdminRoadmapDefinitionSection {
  id: string;
  title: string;
  body: string;
}

export function adminRoadmapDefinitionBackAction(): AdminRoadmapDefinitionAction {
  return {
    id: "refresh",
    label: "Back to Definitions",
    targetRoute: "AdminRoadmapDefinitionList"
  };
}

export function formatAdminRoadmapDefinitionDateTime(value: string | null): string {
  return value ? new Date(value).toISOString() : "Not published";
}

export function roadmapDefinitionStatusLabel(
  status: AdminRoadmapDefinitionDetailDto["status"]
): string {
  return formatAdminStatusLabel(status);
}
