import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapDefinitionListResponseDto,
  AdminRoadmapDefinitionSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  formatAdminRoadmapDefinitionDateTime,
  roadmapDefinitionStatusLabel,
  type AdminRoadmapDefinitionAction,
  type AdminRoadmapDefinitionRow
} from "./admin-roadmap-definition-screen-contracts.js";

export interface AdminRoadmapDefinitionListScreen {
  route: "AdminRoadmapDefinitionList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminRoadmapDefinitionRow[];
  actions: AdminRoadmapDefinitionAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapDefinitionListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminRoadmapDefinitionListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildAdminRoadmapDefinitionListScreen(
  options: BuildAdminRoadmapDefinitionListScreenOptions
): AdminRoadmapDefinitionListScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapDefinitionList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.roadmapDefinitions.length === 0) {
    return stateOnlyRoadmapDefinitionList("empty", options.runtimeMode);
  }

  return {
    route: "AdminRoadmapDefinitionList",
    state: "ready",
    title: "Roadmap Definitions",
    body: "Inspect configured candidate and brother roadmaps. Editing remains gated until approved formation wording is confirmed.",
    rows: options.response.roadmapDefinitions.map(roadmapDefinitionRow),
    actions: buildListActions(),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function roadmapDefinitionRow(
  definition: AdminRoadmapDefinitionSummaryDto
): AdminRoadmapDefinitionRow {
  return {
    id: definition.id,
    title: definition.title,
    targetRole: definition.targetRole,
    language: definition.language,
    status: definition.status,
    statusLabel: roadmapDefinitionStatusLabel(definition.status),
    countsLabel: `${definition.stageCount} stages · ${definition.stepCount} steps · ${definition.assignmentCount} assignments`,
    publishedAt: formatAdminRoadmapDefinitionDateTime(definition.publishedAt),
    actions: [
      {
        id: "view",
        label: "View",
        targetRoute: "AdminRoadmapDefinitionDetail",
        targetId: definition.id
      }
    ]
  };
}

function buildListActions(): AdminRoadmapDefinitionAction[] {
  return [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminRoadmapDefinitionList"
    }
  ];
}

function stateOnlyRoadmapDefinitionList(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapDefinitionListScreen {
  const copy = roadmapDefinitionListStateCopy[state];

  return {
    route: "AdminRoadmapDefinitionList",
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const roadmapDefinitionListStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Roadmap Definitions",
    body: "Roadmap definitions are ready."
  },
  loading: {
    title: "Loading Roadmap Definitions",
    body: "Roadmap definitions are loading."
  },
  empty: {
    title: "Roadmap Definitions",
    body: "No roadmap definitions are configured."
  },
  error: {
    title: "Unable to Load Roadmap Definitions",
    body: "Roadmap definitions could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh roadmap definitions."
  },
  forbidden: {
    title: "Access Denied",
    body: "Super Admin access is required to inspect roadmap definitions."
  }
};
