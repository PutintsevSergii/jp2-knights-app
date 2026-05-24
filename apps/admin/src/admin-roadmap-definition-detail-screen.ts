import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminRoadmapDefinitionDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
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
    title: `Roadmap Definition: ${options.roadmapDefinition.title}`,
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
      body: `${stage.steps.length} roadmap steps`
    },
    ...stage.steps.map((step) => ({
      id: `step-${step.id}`,
      title: step.title,
      body: [
        step.description ?? "No description.",
        step.requiresSubmission ? "Submission required." : "Read-only step.",
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
    title: "Roadmap Definition",
    body: "Roadmap definition is ready."
  },
  loading: {
    title: "Loading Roadmap Definition",
    body: "Roadmap definition is loading."
  },
  empty: {
    title: "Roadmap Definition Not Found",
    body: "The requested roadmap definition is not available."
  },
  error: {
    title: "Unable to Load Roadmap Definition",
    body: "Roadmap definition could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this roadmap definition."
  },
  forbidden: {
    title: "Access Denied",
    body: "Super Admin access is required to inspect roadmap definitions."
  }
};
