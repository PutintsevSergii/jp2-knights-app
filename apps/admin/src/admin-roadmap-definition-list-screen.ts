import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapDefinitionListResponseDto,
  AdminRoadmapDefinitionSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
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
    title: adminCopy("admin.roadmapDefinitions.title"),
    body: adminCopy("admin.roadmapDefinitions.list.body"),
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
    countsLabel: adminCopy("admin.roadmapDefinitions.counts", {
      stageCount: definition.stageCount,
      stagePluralSuffix: definition.stageCount === 1 ? "" : "s",
      stepCount: definition.stepCount,
      stepPluralSuffix: definition.stepCount === 1 ? "" : "s",
      assignmentCount: definition.assignmentCount,
      assignmentPluralSuffix: definition.assignmentCount === 1 ? "" : "s"
    }),
    publishedAt: formatAdminRoadmapDefinitionDateTime(definition.publishedAt),
    actions: [
      {
        id: "view",
        label: adminCopy("admin.roadmapDefinitions.view"),
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
      label: adminCopy("common.refresh"),
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
    title: adminCopy("admin.roadmapDefinitions.title"),
    body: adminCopy("admin.roadmapDefinitions.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapDefinitions.loading.title"),
    body: adminCopy("admin.roadmapDefinitions.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapDefinitions.title"),
    body: adminCopy("admin.roadmapDefinitions.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapDefinitions.error.title"),
    body: adminCopy("admin.roadmapDefinitions.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapDefinitions.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapDefinitions.forbidden.body")
  }
};
