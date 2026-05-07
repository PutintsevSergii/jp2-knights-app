import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminAnnouncementListResponseDto,
  AdminAnnouncementSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import {
  adminContentTheme,
  buildAdminContentListActions,
  buildAdminContentRowActions,
  formatAdminVisibility,
  stateOnlyAdminContentList,
  type AdminContentListScreen,
  type AdminContentRow
} from "./admin-content-screen-contracts.js";

export interface BuildAdminAnnouncementListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminAnnouncementListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminAnnouncementListScreen(
  options: BuildAdminAnnouncementListScreenOptions
): AdminContentListScreen {
  if (options.state !== "ready") {
    return stateOnlyAdminContentList("AdminAnnouncementList", options.state, options.runtimeMode);
  }

  if (!options.response || options.response.announcements.length === 0) {
    return stateOnlyAdminContentList("AdminAnnouncementList", "empty", options.runtimeMode);
  }

  return {
    route: "AdminAnnouncementList",
    state: "ready",
    title: "Announcements",
    body: "Manage one-way announcements with explicit audience, pinning, and archive actions.",
    rows: options.response.announcements.map((announcement) =>
      announcementRow(announcement, options.canWrite)
    ),
    actions: buildAdminContentListActions("AdminAnnouncementEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function announcementRow(
  announcement: AdminAnnouncementSummaryDto,
  canWrite: boolean
): AdminContentRow {
  return {
    id: announcement.id,
    title: announcement.title,
    primaryMeta: `${announcement.pinned ? "Pinned" : "Unpinned"} / ${formatAdminVisibility(
      announcement.visibility
    )}`,
    secondaryMeta: announcement.targetOrganizationUnitId
      ? `Scoped to ${announcement.targetOrganizationUnitId}`
      : "Global announcement",
    status: announcement.status,
    visibility: announcement.visibility,
    targetOrganizationUnitId: announcement.targetOrganizationUnitId,
    actions: buildAdminContentRowActions(
      "AdminAnnouncementEditor",
      announcement.id,
      announcement.status,
      canWrite
    )
  };
}
