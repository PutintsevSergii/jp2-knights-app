import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminPrayerListResponseDto, AdminPrayerSummaryDto } from "@jp2/shared-validation";
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

export interface BuildAdminPrayerListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminPrayerListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminPrayerListScreen(
  options: BuildAdminPrayerListScreenOptions
): AdminContentListScreen {
  if (options.state !== "ready") {
    return stateOnlyAdminContentList("AdminPrayerList", options.state, options.runtimeMode);
  }

  if (!options.response || options.response.prayers.length === 0) {
    return stateOnlyAdminContentList("AdminPrayerList", "empty", options.runtimeMode);
  }

  return {
    route: "AdminPrayerList",
    state: "ready",
    title: "Prayers",
    body: "Manage prayer content with explicit status, visibility, and archive actions.",
    rows: options.response.prayers.map((prayer) => prayerRow(prayer, options.canWrite)),
    actions: buildAdminContentListActions("AdminPrayerEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function prayerRow(prayer: AdminPrayerSummaryDto, canWrite: boolean): AdminContentRow {
  return {
    id: prayer.id,
    title: prayer.title,
    primaryMeta: `${prayer.language.toUpperCase()} / ${formatAdminVisibility(prayer.visibility)}`,
    secondaryMeta: prayer.targetOrganizationUnitId
      ? `Scoped to ${prayer.targetOrganizationUnitId}`
      : "Global content",
    status: prayer.status,
    visibility: prayer.visibility,
    targetOrganizationUnitId: prayer.targetOrganizationUnitId,
    actions: buildAdminContentRowActions("AdminPrayerEditor", prayer.id, prayer.status, canWrite)
  };
}
