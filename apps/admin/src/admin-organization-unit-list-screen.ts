import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminOrganizationUnitListResponseDto,
  OrganizationUnitSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import type { AdminContentAction, AdminContentRow } from "./admin-content-screens.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";

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

export interface BuildAdminOrganizationUnitListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminOrganizationUnitListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
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
