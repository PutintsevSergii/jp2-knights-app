import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminEventListResponseDto, AdminEventSummaryDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import {
  adminContentTheme,
  buildAdminContentListActions,
  buildAdminContentRowActions,
  formatAdminDateTime,
  stateOnlyAdminContentList,
  type AdminContentListScreen,
  type AdminContentRow
} from "./admin-content-screen-contracts.js";

export interface BuildAdminEventListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminEventListScreen(
  options: BuildAdminEventListScreenOptions
): AdminContentListScreen {
  if (options.state !== "ready") {
    return stateOnlyAdminContentList("AdminEventList", options.state, options.runtimeMode);
  }

  if (!options.response || options.response.events.length === 0) {
    return stateOnlyAdminContentList("AdminEventList", "empty", options.runtimeMode);
  }

  return {
    route: "AdminEventList",
    state: "ready",
    title: "Events",
    body: "Manage event content with scoped writes and explicit publish, cancel, and archive actions.",
    rows: options.response.events.map((event) => eventRow(event, options.canWrite)),
    actions: buildAdminContentListActions("AdminEventEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function eventRow(event: AdminEventSummaryDto, canWrite: boolean): AdminContentRow {
  return {
    id: event.id,
    title: event.title,
    primaryMeta: `${event.type} / ${formatAdminDateTime(event.startAt)}`,
    secondaryMeta: event.locationLabel ?? "Location not set",
    status: event.status,
    visibility: event.visibility,
    targetOrganizationUnitId: event.targetOrganizationUnitId,
    actions: buildAdminContentRowActions("AdminEventEditor", event.id, event.status, canWrite)
  };
}
