import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminOrganizationUnitListResponseDto,
  CreateOrganizationUnitRequestDto,
  OrganizationUnitSummaryDto
} from "@jp2/shared-validation";
import type {
  AdminContentAction,
  AdminContentRow
} from "./admin-content-screens.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import type { AdminContentScreenState } from "./admin-content-api.js";

export type AdminOrganizationUnitRoute =
  | "AdminOrganizationUnitList"
  | "AdminOrganizationUnitEditor";

export interface AdminOrganizationUnitListScreen {
  route: "AdminOrganizationUnitList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminContentRow[];
  actions: AdminContentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface AdminOrganizationUnitFormField {
  name: keyof CreateOrganizationUnitRequestDto | "status";
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
}

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

export interface BuildAdminOrganizationUnitListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminOrganizationUnitListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export interface BuildAdminOrganizationUnitEditorScreenOptions {
  state: AdminContentScreenState;
  organizationUnit?: OrganizationUnitSummaryDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  mode: "create" | "edit";
}

export function buildAdminOrganizationUnitListScreen(
  options: BuildAdminOrganizationUnitListScreenOptions
): AdminOrganizationUnitListScreen {
  if (options.state !== "ready") {
    return stateOnlyOrganizationUnitList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.organizationUnits.length === 0) {
    return stateOnlyOrganizationUnitList("empty", options.runtimeMode);
  }

  return {
    route: "AdminOrganizationUnitList",
    state: "ready",
    title: "Organization Units",
    body: "Review choragiew records with Super Admin create, edit, and archive actions.",
    rows: options.response.organizationUnits.map((unit) =>
      organizationUnitRow(unit, options.canWrite)
    ),
    actions: buildOrganizationUnitActions(options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
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

function organizationUnitRow(
  unit: OrganizationUnitSummaryDto,
  canWrite: boolean
): AdminContentRow {
  return {
    id: unit.id,
    title: unit.name,
    primaryMeta: `${unit.type} / ${unit.city}, ${unit.country}`,
    secondaryMeta: unit.parish ?? unit.publicDescription ?? "No public context set",
    status: unit.status,
    visibility: "ADMIN",
    targetOrganizationUnitId: unit.id,
    actions: buildOrganizationUnitRowActions(unit.id, unit.status, canWrite)
  };
}

function buildOrganizationUnitActions(canWrite: boolean): AdminContentAction[] {
  const actions: AdminContentAction[] = [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminOrganizationUnitEditor"
    }
  ];

  if (canWrite) {
    actions.unshift({
      id: "create",
      label: "Create",
      targetRoute: "AdminOrganizationUnitEditor"
    });
  }

  return actions;
}

function buildOrganizationUnitRowActions(
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
      targetRoute: "AdminOrganizationUnitEditor",
      targetId
    }
  ];

  if (status !== "archived") {
    actions.push({
      id: "archive",
      label: "Archive",
      targetRoute: "AdminOrganizationUnitEditor",
      targetId
    });
  }

  return actions;
}

function stateOnlyOrganizationUnitList(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminOrganizationUnitListScreen {
  const copy = organizationUnitStateCopy[state];

  return {
    route: "AdminOrganizationUnitList",
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildOrganizationUnitActions(false),
    demoChromeVisible: runtimeMode === "demo",
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

const organizationUnitStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: {
    title: "Organization Units",
    body: "Organization units are ready."
  },
  loading: {
    title: "Loading Organization Units",
    body: "Organization units are loading."
  },
  empty: {
    title: "Organization Units",
    body: "No organization units are available in the current admin scope."
  },
  error: {
    title: "Unable to Load Organization Units",
    body: "Organization units could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh organization units."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to review organization units."
  }
};

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
