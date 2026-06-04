import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminAnnouncementSummaryDto,
  AdminEventSummaryDto,
  AdminPrayerSummaryDto,
  AdminSilentPrayerEventSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import {
  adminContentTheme,
  buildAdminContentStatusActions,
  type AdminContentAction,
  type AdminContentListScreen,
  type AdminContentEditorRoute,
  type AdminContentTheme
} from "./admin-content-screen-contracts.js";

export type AdminContentEditorKind = "prayer" | "event" | "announcement" | "silentPrayer";

type AdminEditableContent =
  | AdminPrayerSummaryDto
  | AdminEventSummaryDto
  | AdminAnnouncementSummaryDto
  | AdminSilentPrayerEventSummaryDto;

export interface AdminContentEditorField {
  name: string;
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
  multiline: boolean;
}

export interface AdminContentEditorScreen {
  route: AdminContentEditorRoute;
  state: AdminContentScreenState;
  kind: AdminContentEditorKind;
  mode: "create" | "edit" | "readonly";
  title: string;
  body: string;
  contentId: string | null;
  listPath: string;
  fields: AdminContentEditorField[];
  actions: AdminContentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminContentEditorScreenOptions {
  kind: AdminContentEditorKind;
  state: AdminContentScreenState;
  item?: AdminEditableContent | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  mode: "create" | "edit";
}

export function buildAdminContentEditorScreen(
  options: BuildAdminContentEditorScreenOptions
): AdminContentEditorScreen {
  if (options.state !== "ready") {
    return stateOnlyAdminContentEditor(options.kind, options.state, options.runtimeMode);
  }

  if (options.mode === "edit" && !options.item) {
    return stateOnlyAdminContentEditor(options.kind, "empty", options.runtimeMode);
  }

  const mode = options.canWrite ? options.mode : "readonly";
  const config = editorConfigFor(options.kind);

  return {
    route: config.route,
    state: "ready",
    kind: options.kind,
    mode,
    title:
      mode === "create"
        ? `Create ${config.singularLabel}`
        : `${config.singularLabel}: ${options.item?.title ?? "New"}`,
    body:
      mode === "readonly"
        ? `Review the scoped ${config.lowerLabel}. Write access is required to change it.`
        : config.body,
    contentId: options.item?.id ?? null,
    listPath: config.listPath,
    fields: config.fields(options.item, mode === "readonly"),
    actions: buildEditorActions(config, mode, options.item),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function stateOnlyAdminContentEditor(
  kind: AdminContentEditorKind,
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminContentEditorScreen {
  const config = editorConfigFor(kind);
  const copy = stateCopyFor(config, state);

  return {
    route: config.route,
    state,
    kind,
    mode: "readonly",
    title: copy.title,
    body: copy.body,
    contentId: null,
    listPath: config.listPath,
    fields: [],
    actions: state === "forbidden" ? [] : buildEditorActions(config, "readonly"),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

interface EditorConfig {
  route: AdminContentEditorRoute;
  listRoute: AdminContentListScreen["route"];
  singularLabel: string;
  lowerLabel: string;
  listPath: string;
  body: string;
  fields: (
    item: AdminEditableContent | undefined,
    readOnly: boolean
  ) => AdminContentEditorField[];
}

function editorConfigFor(kind: AdminContentEditorKind): EditorConfig {
  if (kind === "prayer") {
    return {
      route: "AdminPrayerEditor",
      listRoute: "AdminPrayerList",
      singularLabel: "Prayer",
      lowerLabel: "prayer",
      listPath: "/admin/prayers",
      body: "Set the prayer category, audience, language, status, and approved body text.",
      fields: prayerFields
    };
  }

  if (kind === "event") {
    return {
      route: "AdminEventEditor",
      listRoute: "AdminEventList",
      singularLabel: "Event",
      lowerLabel: "event",
      listPath: "/admin/events",
      body: "Set the event type, schedule, location, audience, and lifecycle status.",
      fields: eventFields
    };
  }

  if (kind === "silentPrayer") {
    return {
      route: "AdminSilentPrayerEditor",
      listRoute: "AdminSilentPrayerList",
      singularLabel: "Silent Prayer Event",
      lowerLabel: "silent-prayer event",
      listPath: "/admin/silent-prayer-events",
      body: "Set aggregate-only silent-prayer timing, intention, audience, and lifecycle status.",
      fields: silentPrayerFields
    };
  }

  return {
    route: "AdminAnnouncementEditor",
    listRoute: "AdminAnnouncementList",
    singularLabel: "Announcement",
    lowerLabel: "announcement",
    listPath: "/admin/announcements",
    body: "Set the announcement audience, pinning, status, and body for one-way delivery.",
    fields: announcementFields
  };
}

function prayerFields(
  item: AdminEditableContent | undefined,
  readOnly: boolean
): AdminContentEditorField[] {
  const prayer = item as AdminPrayerSummaryDto | undefined;

  return [
    field("categoryId", "Category", prayer?.categoryId ?? "", false, readOnly),
    field("title", "Title", prayer?.title ?? "", true, readOnly),
    field("body", "Body", prayer?.body ?? "", true, readOnly, true),
    field("language", "Language", prayer?.language ?? "en", true, readOnly),
    field("visibility", "Visibility", prayer?.visibility ?? "PUBLIC", true, readOnly),
    field(
      "targetOrganizationUnitId",
      "Target Organization Unit",
      prayer?.targetOrganizationUnitId ?? "",
      false,
      readOnly
    ),
    field("status", "Status", prayer?.status ?? "DRAFT", true, readOnly),
    ...approvalLifecycleFields(prayer)
  ];
}

function eventFields(
  item: AdminEditableContent | undefined,
  readOnly: boolean
): AdminContentEditorField[] {
  const event = item as AdminEventSummaryDto | undefined;

  return [
    field("title", "Title", event?.title ?? "", true, readOnly),
    field("description", "Description", event?.description ?? "", false, readOnly, true),
    field("type", "Type", event?.type ?? "", true, readOnly),
    field("startAt", "Start", event?.startAt ?? "", true, readOnly),
    field("endAt", "End", event?.endAt ?? "", false, readOnly),
    field("locationLabel", "Location", event?.locationLabel ?? "", false, readOnly),
    field("visibility", "Visibility", event?.visibility ?? "PUBLIC", true, readOnly),
    field(
      "targetOrganizationUnitId",
      "Target Organization Unit",
      event?.targetOrganizationUnitId ?? "",
      false,
      readOnly
    ),
    field("status", "Status", event?.status ?? "draft", true, readOnly),
    ...approvalLifecycleFields(event)
  ];
}

function announcementFields(
  item: AdminEditableContent | undefined,
  readOnly: boolean
): AdminContentEditorField[] {
  const announcement = item as AdminAnnouncementSummaryDto | undefined;

  return [
    field("title", "Title", announcement?.title ?? "", true, readOnly),
    field("body", "Body", announcement?.body ?? "", true, readOnly, true),
    field("visibility", "Visibility", announcement?.visibility ?? "ORGANIZATION_UNIT", true, readOnly),
    field(
      "targetOrganizationUnitId",
      "Target Organization Unit",
      announcement?.targetOrganizationUnitId ?? "",
      false,
      readOnly
    ),
    field("pinned", "Pinned", announcement?.pinned ? "true" : "false", false, readOnly),
    field("status", "Status", announcement?.status ?? "DRAFT", true, readOnly),
    ...approvalLifecycleFields(announcement)
  ];
}

function silentPrayerFields(
  item: AdminEditableContent | undefined,
  readOnly: boolean
): AdminContentEditorField[] {
  const silentPrayer = item as AdminSilentPrayerEventSummaryDto | undefined;

  return [
    field("title", "Title", silentPrayer?.title ?? "", true, readOnly),
    field("intention", "Intention", silentPrayer?.intention ?? "", false, readOnly, true),
    field("visibility", "Visibility", silentPrayer?.visibility ?? "ORGANIZATION_UNIT", true, readOnly),
    field(
      "targetOrganizationUnitId",
      "Target Organization Unit",
      silentPrayer?.targetOrganizationUnitId ?? "",
      false,
      readOnly
    ),
    field("status", "Status", silentPrayer?.status ?? "DRAFT", true, readOnly),
    field("startsAt", "Starts", silentPrayer?.startsAt ?? "", true, readOnly),
    field("endsAt", "Ends", silentPrayer?.endsAt ?? "", false, readOnly),
    ...approvalLifecycleFields(silentPrayer)
  ];
}

function approvalLifecycleFields(
  item: AdminEditableContent | undefined
): AdminContentEditorField[] {
  if (!item) {
    return [];
  }

  return [
    field("approvedAt", "Approved At", item.approvedAt ?? "", false, true),
    field("approvedByUserId", "Approved By User ID", item.approvedByUserId ?? "", false, true),
    field("publishedAt", "Published At", item.publishedAt ?? "", false, true),
    field("publishedByUserId", "Published By User ID", item.publishedByUserId ?? "", false, true)
  ];
}

function field(
  name: string,
  label: string,
  value: string,
  required: boolean,
  readOnly: boolean,
  multiline = false
): AdminContentEditorField {
  return { name, label, value, required, readOnly, multiline };
}

function buildEditorActions(
  config: EditorConfig,
  mode: AdminContentEditorScreen["mode"],
  item?: AdminEditableContent
): AdminContentAction[] {
  const actions: AdminContentAction[] = [
    {
      id: "refresh",
      label: "Back to List",
      targetRoute: config.listRoute
    }
  ];

  if (mode === "create") {
    actions.unshift({
      id: "create",
      label: "Create",
      targetRoute: config.route
    });
  }

  if (mode === "edit" && item) {
    actions.unshift({
      id: "edit",
      label: "Save",
      targetRoute: config.route,
      targetId: item.id
    });
    actions.push(
      ...buildAdminContentStatusActions({
        targetRoute: config.route,
        targetId: item.id,
        status: item.status,
        approvedAt: "approvedAt" in item ? item.approvedAt : null
      })
    );
  }

  return actions;
}

function stateCopyFor(
  config: EditorConfig,
  state: AdminContentScreenState
): { title: string; body: string } {
  if (state === "ready") {
    return {
      title: config.singularLabel,
      body: `${config.singularLabel} editor is ready.`
    };
  }

  if (state === "loading") {
    return {
      title: `Loading ${config.singularLabel}`,
      body: `${config.singularLabel} detail is loading.`
    };
  }

  if (state === "empty") {
    return {
      title: `${config.singularLabel} Not Found`,
      body: `No ${config.lowerLabel} is available in the current admin scope.`
    };
  }

  if (state === "offline") {
    return {
      title: "Offline",
      body: `Reconnect to refresh this ${config.lowerLabel}.`
    };
  }

  if (state === "forbidden") {
    return {
      title: "Access Denied",
      body: `Admin Lite access is required to manage ${config.lowerLabel}s.`
    };
  }

  return {
    title: `Unable to Load ${config.singularLabel}`,
    body: `${config.singularLabel} detail could not be loaded.`
  };
}
