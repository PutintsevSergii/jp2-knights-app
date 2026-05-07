import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminContentScreenState } from "./admin-content-api.js";

export type AdminContentRoute =
  | "AdminPrayerList"
  | "AdminPrayerEditor"
  | "AdminEventList"
  | "AdminEventEditor"
  | "AdminAnnouncementList"
  | "AdminAnnouncementEditor"
  | "AdminOrganizationUnitList"
  | "AdminOrganizationUnitEditor";

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
  route:
    | "AdminPrayerList"
    | "AdminEventList"
    | "AdminAnnouncementList"
    | "AdminOrganizationUnitList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminContentRow[];
  actions: AdminContentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export type AdminContentEditorRoute =
  | "AdminPrayerEditor"
  | "AdminEventEditor"
  | "AdminAnnouncementEditor";

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

export function buildAdminContentListActions(
  targetRoute: AdminContentEditorRoute,
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

export function buildAdminContentRowActions(
  targetRoute: AdminContentEditorRoute,
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

export function stateOnlyAdminContentList(
  route: "AdminPrayerList" | "AdminEventList" | "AdminAnnouncementList",
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminContentListScreen {
  const copy = stateCopyForRoute(route)[state];

  return {
    route,
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions:
      state === "forbidden" ? [] : buildAdminContentListActions(editorRouteFor(route), false),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

export function formatAdminVisibility(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function formatAdminDateTime(value: string): string {
  return new Date(value).toISOString();
}

function editorRouteFor(
  route: "AdminPrayerList" | "AdminEventList" | "AdminAnnouncementList"
): AdminContentEditorRoute {
  if (route === "AdminPrayerList") {
    return "AdminPrayerEditor";
  }

  if (route === "AdminEventList") {
    return "AdminEventEditor";
  }

  return "AdminAnnouncementEditor";
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

const announcementStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: {
    title: "Announcements",
    body: "Announcement content is ready."
  },
  loading: {
    title: "Loading Announcements",
    body: "Announcements are loading."
  },
  empty: {
    title: "Announcements",
    body: "No manageable announcements are available."
  },
  error: {
    title: "Unable to Load Announcements",
    body: "Announcements could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh announcements."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to manage announcements."
  }
};

function stateCopyForRoute(
  route: "AdminPrayerList" | "AdminEventList" | "AdminAnnouncementList"
): Record<AdminContentScreenState, { title: string; body: string }> {
  if (route === "AdminPrayerList") {
    return prayerStateCopy;
  }

  if (route === "AdminEventList") {
    return eventStateCopy;
  }

  return announcementStateCopy;
}
