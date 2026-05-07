import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminAnnouncementSummaryDto,
  CreateAdminAnnouncementRequestDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import {
  adminContentTheme,
  type AdminContentAction,
  type AdminContentTheme
} from "./admin-content-screen-contracts.js";

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

export interface BuildAdminAnnouncementEditorScreenOptions {
  state: AdminContentScreenState;
  announcement?: AdminAnnouncementSummaryDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  mode: "create" | "edit";
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
