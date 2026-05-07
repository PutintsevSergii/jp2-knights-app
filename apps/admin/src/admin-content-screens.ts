import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminAnnouncementListResponseDto,
  AdminAnnouncementSummaryDto,
  CreateAdminAnnouncementRequestDto,
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

export interface AdminAnnouncementFormField {
  name: keyof CreateAdminAnnouncementRequestDto;
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
}

export interface AdminAnnouncementEditorScreen {
  route: "AdminAnnouncementEditor";
  state: AdminContentScreenState;
  mode: "create" | "edit" | "readonly";
  title: string;
  body: string;
  announcementId: string | null;
  fields: AdminAnnouncementFormField[];
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

export interface BuildAdminAnnouncementListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminAnnouncementListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export interface BuildAdminAnnouncementEditorScreenOptions {
  state: AdminContentScreenState;
  announcement?: AdminAnnouncementSummaryDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  mode: "create" | "edit";
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
    actions: buildListActions("AdminAnnouncementEditor", options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

export function buildAdminAnnouncementEditorScreen(
  options: BuildAdminAnnouncementEditorScreenOptions
): AdminAnnouncementEditorScreen {
  if (options.state !== "ready") {
    return stateOnlyAdminAnnouncementEditor(options.state, options.runtimeMode);
  }

  if (options.mode === "edit" && !options.announcement) {
    return stateOnlyAdminAnnouncementEditor("empty", options.runtimeMode);
  }

  const canMutate = options.canWrite;
  const mode = canMutate ? options.mode : "readonly";
  const announcement = options.announcement;

  return {
    route: "AdminAnnouncementEditor",
    state: "ready",
    mode,
    title:
      mode === "create"
        ? "Create Announcement"
        : `Announcement: ${announcement?.title ?? "New"}`,
    body:
      mode === "readonly"
        ? "Review the scoped announcement. Write access is required to change it."
        : "Set the announcement audience, pinning, status, and body for one-way delivery.",
    announcementId: announcement?.id ?? null,
    fields: buildAnnouncementFields(announcement, mode === "readonly"),
    actions: buildAnnouncementEditorActions(mode, announcement?.id),
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

function announcementRow(
  announcement: AdminAnnouncementSummaryDto,
  canWrite: boolean
): AdminContentRow {
  return {
    id: announcement.id,
    title: announcement.title,
    primaryMeta: `${announcement.pinned ? "Pinned" : "Unpinned"} / ${formatVisibility(
      announcement.visibility
    )}`,
    secondaryMeta: announcement.targetOrganizationUnitId
      ? `Scoped to ${announcement.targetOrganizationUnitId}`
      : "Global announcement",
    status: announcement.status,
    visibility: announcement.visibility,
    targetOrganizationUnitId: announcement.targetOrganizationUnitId,
    actions: buildRowActions(
      "AdminAnnouncementEditor",
      announcement.id,
      announcement.status,
      canWrite
    )
  };
}

type AdminContentEditorRoute =
  | "AdminPrayerEditor"
  | "AdminEventEditor"
  | "AdminAnnouncementEditor";

function buildListActions(
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

function buildRowActions(
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

function stateOnlyAdminContentList(
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
    actions: state === "forbidden" ? [] : buildListActions(editorRouteFor(route), false),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function stateOnlyAdminAnnouncementEditor(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminAnnouncementEditorScreen {
  const copy = announcementEditorStateCopy[state];

  return {
    route: "AdminAnnouncementEditor",
    state,
    mode: "readonly",
    title: copy.title,
    body: copy.body,
    announcementId: null,
    fields: [],
    actions: state === "forbidden" ? [] : buildAnnouncementEditorActions("readonly"),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildAnnouncementFields(
  announcement: AdminAnnouncementSummaryDto | undefined,
  readOnly: boolean
): AdminAnnouncementFormField[] {
  return [
    {
      name: "title",
      label: "Title",
      value: announcement?.title ?? "",
      required: true,
      readOnly
    },
    {
      name: "body",
      label: "Body",
      value: announcement?.body ?? "",
      required: true,
      readOnly
    },
    {
      name: "visibility",
      label: "Visibility",
      value: announcement?.visibility ?? "ORGANIZATION_UNIT",
      required: true,
      readOnly
    },
    {
      name: "targetOrganizationUnitId",
      label: "Target Organization Unit",
      value: announcement?.targetOrganizationUnitId ?? "",
      required: false,
      readOnly
    },
    {
      name: "pinned",
      label: "Pinned",
      value: announcement?.pinned ? "true" : "false",
      required: false,
      readOnly
    },
    {
      name: "status",
      label: "Status",
      value: announcement?.status ?? "DRAFT",
      required: true,
      readOnly
    }
  ];
}

function buildAnnouncementEditorActions(
  mode: AdminAnnouncementEditorScreen["mode"],
  targetId?: string
): AdminContentAction[] {
  const actions: AdminContentAction[] = [
    {
      id: "refresh",
      label: "Back to List",
      targetRoute: "AdminAnnouncementList"
    }
  ];

  if (mode === "create") {
    actions.unshift({
      id: "create",
      label: "Create",
      targetRoute: "AdminAnnouncementEditor"
    });
  }

  if (mode === "edit" && targetId) {
    actions.unshift({
      id: "edit",
      label: "Save",
      targetRoute: "AdminAnnouncementEditor",
      targetId
    });
    actions.push({
      id: "publish",
      label: "Publish",
      targetRoute: "AdminAnnouncementEditor",
      targetId
    });
    actions.push({
      id: "archive",
      label: "Archive",
      targetRoute: "AdminAnnouncementEditor",
      targetId
    });
  }

  return actions;
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

const announcementEditorStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Announcement",
    body: "Announcement editor is ready."
  },
  loading: {
    title: "Loading Announcement",
    body: "Announcement detail is loading."
  },
  empty: {
    title: "Announcement Not Found",
    body: "No announcement is available in the current admin scope."
  },
  error: {
    title: "Unable to Load Announcement",
    body: "Announcement detail could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this announcement."
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
