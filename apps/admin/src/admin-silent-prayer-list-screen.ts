import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminSilentPrayerEventListResponseDto,
  AdminSilentPrayerEventSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import {
  adminContentTheme,
  approvalWarningForAdminContent,
  buildAdminContentListActions,
  buildAdminContentRowActions,
  formatAdminDateTime,
  formatAdminVisibility,
  stateOnlyAdminContentList,
  type AdminContentListScreen,
  type AdminContentRow
} from "./admin-content-screen-contracts.js";

export interface BuildAdminSilentPrayerListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminSilentPrayerEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminSilentPrayerListScreen(
  options: BuildAdminSilentPrayerListScreenOptions
): AdminContentListScreen {
  if (options.state !== "ready") {
    return stateOnlyAdminContentList(
      "AdminSilentPrayerList",
      options.state,
      options.runtimeMode
    );
  }

  if (!options.response || options.response.silentPrayerEvents.length === 0) {
    return stateOnlyAdminContentList(
      "AdminSilentPrayerList",
      "empty",
      options.runtimeMode
    );
  }

  return {
    route: "AdminSilentPrayerList",
    state: "ready",
    title: "Silent Prayer Events",
    body: "Manage aggregate-only silent-prayer sessions with explicit approval, publish, cancel, and archive actions.",
    rows: options.response.silentPrayerEvents.map((event) =>
      silentPrayerRow(event, options.canWrite)
    ),
    actions: buildAdminContentListActions("AdminSilentPrayerEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function silentPrayerRow(
  event: AdminSilentPrayerEventSummaryDto,
  canWrite: boolean
): AdminContentRow {
  return {
    id: event.id,
    title: event.title,
    primaryMeta: `${formatAdminVisibility(event.visibility)} / ${formatAdminDateTime(
      event.startsAt
    )}`,
    secondaryMeta: event.endsAt
      ? `Ends ${formatAdminDateTime(event.endsAt)}`
      : "Open-ended session",
    approvalWarning: approvalWarningForAdminContent({
      status: event.status,
      approvedAt: event.approvedAt
    }),
    status: event.status,
    visibility: event.visibility,
    targetOrganizationUnitId: event.targetOrganizationUnitId,
    actions: buildAdminContentRowActions({
      targetRoute: "AdminSilentPrayerEditor",
      targetId: event.id,
      status: event.status,
      approvedAt: event.approvedAt,
      canWrite
    })
  };
}
