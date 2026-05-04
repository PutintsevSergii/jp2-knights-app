import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminEventListResponseDto,
  AdminEventSummaryDto,
  AdminPrayerListResponseDto,
  AdminPrayerSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";

export type AdminContentRoute =
  | "AdminPrayerList"
  | "AdminPrayerEditor"
  | "AdminEventList"
  | "AdminEventEditor";

export type AdminContentActionId =
  | "create"
  | "edit"
  | "publish"
  | "cancel"
  | "archive"
  | "refresh";

export interface AdminContentAction {
  id: AdminContentActionId;
  label: string;
  targetRoute: AdminContentRoute;
  targetId?: string | undefined;
}

export interface AdminContentRow {
  id: string;
  title: string;
  primaryMeta: string;
  secondaryMeta: string;
  status: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  actions: AdminContentAction[];
}

export interface AdminContentTheme {
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  primaryAction: string;
  primaryActionText: string;
  warning: string;
  danger: string;
  spacing: number;
  radius: number;
}

export interface AdminContentListScreen {
  route: "AdminPrayerList" | "AdminEventList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminContentRow[];
  actions: AdminContentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminPrayerListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminPrayerListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export interface BuildAdminEventListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminEventListResponseDto | undefined;
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
    actions: buildListActions("AdminPrayerEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
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
    actions: buildListActions("AdminEventEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function prayerRow(prayer: AdminPrayerSummaryDto, canWrite: boolean): AdminContentRow {
  return {
    id: prayer.id,
    title: prayer.title,
    primaryMeta: `${prayer.language.toUpperCase()} / ${formatVisibility(prayer.visibility)}`,
    secondaryMeta: prayer.targetOrganizationUnitId
      ? `Scoped to ${prayer.targetOrganizationUnitId}`
      : "Global content",
    status: prayer.status,
    visibility: prayer.visibility,
    targetOrganizationUnitId: prayer.targetOrganizationUnitId,
    actions: buildRowActions("AdminPrayerEditor", prayer.id, prayer.status, canWrite)
  };
}

function eventRow(event: AdminEventSummaryDto, canWrite: boolean): AdminContentRow {
  return {
    id: event.id,
    title: event.title,
    primaryMeta: `${event.type} / ${formatDateTime(event.startAt)}`,
    secondaryMeta: event.locationLabel ?? "Location not set",
    status: event.status,
    visibility: event.visibility,
    targetOrganizationUnitId: event.targetOrganizationUnitId,
    actions: buildRowActions("AdminEventEditor", event.id, event.status, canWrite)
  };
}

function buildListActions(
  targetRoute: "AdminPrayerEditor" | "AdminEventEditor",
  canWrite: boolean
): AdminContentAction[] {
  const actions: AdminContentAction[] = [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute
    }
  ];

  if (canWrite) {
    actions.unshift({
      id: "create",
      label: "Create",
      targetRoute
    });
  }

  return actions;
}

function buildRowActions(
  targetRoute: "AdminPrayerEditor" | "AdminEventEditor",
  targetId: string,
  status: string,
  canWrite: boolean
): AdminContentAction[] {
  if (!canWrite) {
    return [];
  }

  const actions: AdminContentAction[] = [
    {
      id: "edit",
      label: "Edit",
      targetRoute,
      targetId
    }
  ];

  if (status !== "PUBLISHED" && status !== "published" && status !== "archived") {
    actions.push({
      id: "publish",
      label: "Publish",
      targetRoute,
      targetId
    });
  }

  if (targetRoute === "AdminEventEditor" && status === "published") {
    actions.push({
      id: "cancel",
      label: "Cancel",
      targetRoute,
      targetId
    });
  }

  if (status !== "ARCHIVED" && status !== "archived") {
    actions.push({
      id: "archive",
      label: "Archive",
      targetRoute,
      targetId
    });
  }

  return actions;
}

function stateOnlyAdminContentList(
  route: AdminContentListScreen["route"],
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminContentListScreen {
  const copy = route === "AdminPrayerList" ? prayerStateCopy[state] : eventStateCopy[state];

  return {
    route,
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(editorRouteFor(route), false),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function editorRouteFor(
  route: AdminContentListScreen["route"]
): "AdminPrayerEditor" | "AdminEventEditor" {
  return route === "AdminPrayerList" ? "AdminPrayerEditor" : "AdminEventEditor";
}

function formatVisibility(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatDateTime(value: string): string {
  return new Date(value).toISOString();
}

const prayerStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: {
    title: "Prayers",
    body: "Prayer content is ready."
  },
  loading: {
    title: "Loading Prayers",
    body: "Prayer content is loading."
  },
  empty: {
    title: "Prayers",
    body: "No manageable prayers are available."
  },
  error: {
    title: "Unable to Load Prayers",
    body: "Prayer content could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh prayer content."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to manage prayers."
  }
};

const eventStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: {
    title: "Events",
    body: "Event content is ready."
  },
  loading: {
    title: "Loading Events",
    body: "Event content is loading."
  },
  empty: {
    title: "Events",
    body: "No manageable events are available."
  },
  error: {
    title: "Unable to Load Events",
    body: "Event content could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh event content."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to manage events."
  }
};

export const adminContentTheme: AdminContentTheme = {
  background: designTokens.color.background.app,
  surface: designTokens.color.background.surface,
  border: designTokens.color.border.subtle,
  text: designTokens.color.text.primary,
  mutedText: designTokens.color.text.muted,
  primaryAction: designTokens.color.action.primary,
  primaryActionText: designTokens.color.action.primaryText,
  warning: designTokens.color.status.warning,
  danger: designTokens.color.status.danger,
  spacing: designTokens.space[4],
  radius: designTokens.radius.md
};
