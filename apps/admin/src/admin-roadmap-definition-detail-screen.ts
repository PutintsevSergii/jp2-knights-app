import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminRoadmapDefinitionDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
import {
  adminRoadmapDefinitionBackAction,
  roadmapDefinitionStatusLabel,
  type AdminRoadmapDefinitionAction,
  type AdminRoadmapDefinitionSection
} from "./admin-roadmap-definition-screen-contracts.js";

export interface AdminRoadmapDefinitionDetailScreen {
  route: "AdminRoadmapDefinitionDetail";
  state: AdminContentScreenState;
  title: string;
  body: string;
  roadmapDefinitionId: string | null;
  sections: AdminRoadmapDefinitionSection[];
  actions: AdminRoadmapDefinitionAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapDefinitionDetailScreenOptions {
  state: AdminContentScreenState;
  roadmapDefinition?: AdminRoadmapDefinitionDetailDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildAdminRoadmapDefinitionDetailScreen(
  options: BuildAdminRoadmapDefinitionDetailScreenOptions
): AdminRoadmapDefinitionDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapDefinitionDetail(options.state, options.runtimeMode);
  }

  if (!options.roadmapDefinition) {
    return stateOnlyRoadmapDefinitionDetail("empty", options.runtimeMode);
  }

  return {
    route: "AdminRoadmapDefinitionDetail",
    state: "ready",
    title: adminCopy("admin.roadmapDefinitions.detail.title", {
      title: options.roadmapDefinition.title
    }),
    body: `${options.roadmapDefinition.targetRole} · ${roadmapDefinitionStatusLabel(options.roadmapDefinition.status)} · ${options.roadmapDefinition.language}`,
    roadmapDefinitionId: options.roadmapDefinition.id,
    sections: buildSections(options.roadmapDefinition),
    actions: [adminRoadmapDefinitionBackAction()],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildSections(
  definition: AdminRoadmapDefinitionDetailDto
): AdminRoadmapDefinitionSection[] {
  return definition.stages.flatMap((stage) => [
    {
      id: `stage-${stage.id}`,
      title: stage.title,
      body: adminCopy("roadmap.step.count", { count: stage.steps.length })
    },
    ...stage.steps.map((step) => ({
      id: `step-${step.id}`,
      title: step.title,
      body: [
        step.description ?? adminCopy("admin.roadmapDefinitions.detail.noDescription"),
        step.requiresSubmission
          ? adminCopy("roadmap.step.submissionRequired")
          : adminCopy("roadmap.step.readOnly"),
        roadmapDefinitionStatusLabel(step.status)
      ].join(" ")
    }))
  ]);
}

function stateOnlyRoadmapDefinitionDetail(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapDefinitionDetailScreen {
  const copy = roadmapDefinitionDetailStateCopy[state];

  return {
    route: "AdminRoadmapDefinitionDetail",
    state,
    title: copy.title,
    body: copy.body,
    roadmapDefinitionId: null,
    sections: [],
    actions: state === "forbidden" ? [] : [adminRoadmapDefinitionBackAction()],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const roadmapDefinitionDetailStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: adminCopy("admin.roadmapDefinitions.detail.fallbackTitle"),
    body: adminCopy("admin.roadmapDefinitions.detail.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapDefinitions.detail.loading.title"),
    body: adminCopy("admin.roadmapDefinitions.detail.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapDefinitions.detail.empty.title"),
    body: adminCopy("admin.roadmapDefinitions.detail.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapDefinitions.detail.error.title"),
    body: adminCopy("admin.roadmapDefinitions.detail.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapDefinitions.detail.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapDefinitions.forbidden.body")
  }
};
