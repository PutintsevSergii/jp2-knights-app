import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
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
    title: adminCopy("admin.roadmapAssignments.editor.title"),
    body: adminCopy("admin.roadmapAssignments.editor.body"),
    fields: buildRoadmapAssignmentFields(),
    actions: [
      {
        id: "create",
        label: adminCopy("admin.roadmapAssignments.create.submit"),
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
      label: adminCopy("admin.roadmapAssignments.editor.assigneeUserId"),
      value: "",
      required: true,
      readOnly: false
    },
    {
      name: "roadmapDefinitionId",
      label: adminCopy("admin.roadmapAssignments.editor.roadmapDefinitionId"),
      value: "",
      required: true,
      readOnly: false
    },
    {
      name: "organizationUnitId",
      label: adminCopy("admin.roadmapAssignments.editor.organizationUnitId"),
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
    title: adminCopy("admin.roadmapAssignments.editor.title"),
    body: adminCopy("admin.roadmapAssignments.editor.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapAssignments.editor.loading.title"),
    body: adminCopy("admin.roadmapAssignments.editor.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapAssignments.editor.title"),
    body: adminCopy("admin.roadmapAssignments.editor.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapAssignments.editor.error.title"),
    body: adminCopy("admin.roadmapAssignments.editor.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapAssignments.editor.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapAssignments.editor.forbidden.body")
  }
};
