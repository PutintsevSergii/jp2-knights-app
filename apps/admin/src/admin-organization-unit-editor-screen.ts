import type { RuntimeMode } from "@jp2/shared-types";
import type { OrganizationUnitSummaryDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import type { AdminContentAction } from "./admin-content-screens.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import type { AdminOrganizationUnitFormField } from "./admin-organization-unit-screen-contracts.js";

export interface AdminOrganizationUnitEditorScreen {
  route: "AdminOrganizationUnitEditor";
  state: AdminContentScreenState;
  mode: "create" | "edit" | "readonly";
  title: string;
  body: string;
  organizationUnitId: string | null;
  fields: AdminOrganizationUnitFormField[];
  actions: AdminContentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminOrganizationUnitEditorScreenOptions {
  state: AdminContentScreenState;
  organizationUnit?: OrganizationUnitSummaryDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  mode: "create" | "edit";
}

export function buildAdminOrganizationUnitEditorScreen(
  options: BuildAdminOrganizationUnitEditorScreenOptions
): AdminOrganizationUnitEditorScreen {
  if (options.state !== "ready") {
    return stateOnlyOrganizationUnitEditor(options.state, options.runtimeMode);
  }

  if (options.mode === "edit" && !options.organizationUnit) {
    return stateOnlyOrganizationUnitEditor("empty", options.runtimeMode);
  }

  const canMutate = options.canWrite;
  const mode = canMutate ? options.mode : "readonly";
  const organizationUnit = options.organizationUnit;

  return {
    route: "AdminOrganizationUnitEditor",
    state: "ready",
    mode,
    title:
      mode === "create"
        ? "Create Organization Unit"
        : `Organization Unit: ${organizationUnit?.name ?? "New"}`,
    body:
      mode === "readonly"
        ? "Review the scoped organization-unit record. Super Admin access is required to change it."
        : "Set the organization-unit fields used by scoped Admin Lite workflows.",
    organizationUnitId: organizationUnit?.id ?? null,
    fields: buildOrganizationUnitFields(organizationUnit, mode === "readonly"),
    actions: buildEditorActions(mode, organizationUnit?.id),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function stateOnlyOrganizationUnitEditor(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminOrganizationUnitEditorScreen {
  const copy = organizationUnitEditorStateCopy[state];

  return {
    route: "AdminOrganizationUnitEditor",
    state,
    mode: "readonly",
    title: copy.title,
    body: copy.body,
    organizationUnitId: null,
    fields: [],
    actions: state === "forbidden" ? [] : buildEditorActions("readonly"),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildOrganizationUnitFields(
  unit: OrganizationUnitSummaryDto | undefined,
  readOnly: boolean
): AdminOrganizationUnitFormField[] {
  return [
    {
      name: "type",
      label: "Type",
      value: unit?.type ?? "CHORAGIEW",
      required: true,
      readOnly
    },
    {
      name: "name",
      label: "Name",
      value: unit?.name ?? "",
      required: true,
      readOnly
    },
    {
      name: "city",
      label: "City",
      value: unit?.city ?? "",
      required: true,
      readOnly
    },
    {
      name: "country",
      label: "Country",
      value: unit?.country ?? "",
      required: true,
      readOnly
    },
    {
      name: "parish",
      label: "Parish",
      value: unit?.parish ?? "",
      required: false,
      readOnly
    },
    {
      name: "publicDescription",
      label: "Public Description",
      value: unit?.publicDescription ?? "",
      required: false,
      readOnly
    },
    {
      name: "status",
      label: "Status",
      value: unit?.status ?? "active",
      required: true,
      readOnly
    }
  ];
}

function buildEditorActions(
  mode: AdminOrganizationUnitEditorScreen["mode"],
  targetId?: string
): AdminContentAction[] {
  const actions: AdminContentAction[] = [
    {
      id: "refresh",
      label: "Back to List",
      targetRoute: "AdminOrganizationUnitList"
    }
  ];

  if (mode === "create") {
    actions.unshift({
      id: "create",
      label: "Create",
      targetRoute: "AdminOrganizationUnitEditor"
    });
  }

  if (mode === "edit" && targetId) {
    actions.unshift({
      id: "edit",
      label: "Save",
      targetRoute: "AdminOrganizationUnitEditor",
      targetId
    });
    actions.push({
      id: "archive",
      label: "Archive",
      targetRoute: "AdminOrganizationUnitEditor",
      targetId
    });
  }

  return actions;
}

const organizationUnitEditorStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Organization Unit",
    body: "Organization-unit editor is ready."
  },
  loading: {
    title: "Loading Organization Unit",
    body: "Organization-unit detail is loading."
  },
  empty: {
    title: "Organization Unit Not Found",
    body: "No organization unit is available in the current admin scope."
  },
  error: {
    title: "Unable to Load Organization Unit",
    body: "Organization-unit detail could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this organization unit."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to review organization units."
  }
};
