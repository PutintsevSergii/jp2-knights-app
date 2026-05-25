import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  adminRoadmapAssignmentBackAction,
  type AdminRoadmapAssignmentAction,
  type AdminRoadmapAssignmentFormField
} from "./admin-roadmap-assignment-screen-contracts.js";

export interface AdminRoadmapAssignmentEditorScreen {
  route: "AdminRoadmapAssignmentEditor";
  state: AdminContentScreenState;
  mode: "create";
  title: string;
  body: string;
  fields: AdminRoadmapAssignmentFormField[];
  actions: AdminRoadmapAssignmentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapAssignmentEditorScreenOptions {
  state: AdminContentScreenState;
  runtimeMode: RuntimeMode;
}

export function buildAdminRoadmapAssignmentEditorScreen(
  options: BuildAdminRoadmapAssignmentEditorScreenOptions
): AdminRoadmapAssignmentEditorScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapAssignmentEditor(options.state, options.runtimeMode);
  }

  return {
    route: "AdminRoadmapAssignmentEditor",
    state: "ready",
    mode: "create",
    title: "Create Roadmap Assignment",
    body: "Assign an already-published candidate or brother roadmap to an eligible user in the matching scope.",
    fields: buildRoadmapAssignmentFields(),
    actions: [
      {
        id: "create",
        label: "Create",
        targetRoute: "AdminRoadmapAssignmentEditor"
      },
      adminRoadmapAssignmentBackAction()
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function stateOnlyRoadmapAssignmentEditor(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapAssignmentEditorScreen {
  const copy = roadmapAssignmentEditorStateCopy[state];

  return {
    route: "AdminRoadmapAssignmentEditor",
    state,
    mode: "create",
    title: copy.title,
    body: copy.body,
    fields: [],
    actions: state === "forbidden" ? [] : [adminRoadmapAssignmentBackAction()],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildRoadmapAssignmentFields(): AdminRoadmapAssignmentFormField[] {
  return [
    {
      name: "assigneeUserId",
      label: "Assignee User ID",
      value: "",
      required: true,
      readOnly: false
    },
    {
      name: "roadmapDefinitionId",
      label: "Roadmap Definition ID",
      value: "",
      required: true,
      readOnly: false
    },
    {
      name: "organizationUnitId",
      label: "Organization Unit ID",
      value: "",
      required: false,
      readOnly: false
    }
  ];
}

const roadmapAssignmentEditorStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Create Roadmap Assignment",
    body: "Roadmap assignment form is ready."
  },
  loading: {
    title: "Loading Roadmap Assignment Form",
    body: "Roadmap assignment form is loading."
  },
  empty: {
    title: "Create Roadmap Assignment",
    body: "No roadmap assignment form is available."
  },
  error: {
    title: "Unable to Load Roadmap Assignment Form",
    body: "Roadmap assignment form could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to create a roadmap assignment."
  },
  forbidden: {
    title: "Access Denied",
    body: "Super Admin access is required to create roadmap assignments."
  }
};
