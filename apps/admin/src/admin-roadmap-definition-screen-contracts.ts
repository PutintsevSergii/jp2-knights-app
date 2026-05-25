import type { AdminRoadmapDefinitionDetailDto } from "@jp2/shared-validation";
import { adminCopy } from "./admin-i18n.js";

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
    label: adminCopy("admin.roadmapDefinitions.back"),
    targetRoute: "AdminRoadmapDefinitionList"
  };
}

export function formatAdminRoadmapDefinitionDateTime(value: string | null): string {
  return value ? new Date(value).toISOString() : adminCopy("admin.roadmapDefinitions.notPublished");
}

export function roadmapDefinitionStatusLabel(
  status: AdminRoadmapDefinitionDetailDto["status"]
): string {
  if (status === "DRAFT") {
    return adminCopy("content.status.draft");
  }

  if (status === "REVIEW") {
    return adminCopy("content.status.review");
  }

  if (status === "APPROVED") {
    return adminCopy("content.status.approved");
  }

  if (status === "PUBLISHED") {
    return adminCopy("content.status.published");
  }

  return adminCopy("content.status.archived");
}
