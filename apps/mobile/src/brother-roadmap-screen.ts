import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AssignedRoadmapResponseDto,
  RoadmapStepSummaryDto,
  RoadmapSubmissionSummaryDto
} from "@jp2/shared-validation";
import { mobileCopy } from "./mobile-i18n.js";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";
import { buildRoadmapSections, roadmapSummaryBody } from "./roadmap-screen-utils.js";

export interface BrotherRoadmapScreen {
  route: "BrotherRoadmap";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  stepCards: BrotherRoadmapStepCard[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export interface BrotherRoadmapStepCard {
  id: string;
  stageTitle: string;
  title: string;
  body: string;
  statusLabel: string;
  submissionRequired: boolean;
  submissionAction?: BrotherScreenAction | undefined;
}

export function buildBrotherRoadmapScreen(options: {
  state: MobileScreenState;
  response?: AssignedRoadmapResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherRoadmapScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherRoadmap(options.state, options.runtimeMode === "demo");
  }

  if (!options.response?.roadmap) {
    return stateOnlyBrotherRoadmap("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherRoadmap",
    state: "ready",
    title: options.response.roadmap.definition.title,
    body: roadmapSummaryBody(options.response.roadmap),
    sections: buildRoadmapSections(options.response.roadmap),
    stepCards: options.response.roadmap.stages.flatMap((stage) =>
      stage.steps.map((step) => ({
        id: step.id,
        stageTitle: stage.title,
        title: step.title,
        body: step.description ?? mobileCopy("mobile.brother.roadmap.noStepDescription"),
        statusLabel: roadmapSubmissionStatusLabel(step.latestSubmission),
        submissionRequired: step.requiresSubmission,
        submissionAction: canSubmitRoadmapStep(step)
          ? {
              id: "submit-roadmap-step",
              label: mobileCopy("mobile.brother.roadmap.submitReflection"),
              targetRoute: "BrotherRoadmap",
              targetId: step.id
            }
          : undefined
      }))
    ),
    actions: [
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherRoadmap(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherRoadmapScreen {
  const copy =
    state === "empty"
      ? {
          title: mobileCopy("mobile.brother.roadmap.title"),
          body: mobileCopy("mobile.brother.roadmap.empty.body")
        }
      : brotherStateCopy("roadmap", state);

  return {
    route: "BrotherRoadmap",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    stepCards: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function canSubmitRoadmapStep(step: RoadmapStepSummaryDto): boolean {
  return (
    step.requiresSubmission &&
    (step.latestSubmission === null || step.latestSubmission.status === "rejected")
  );
}

function roadmapSubmissionStatusLabel(submission: RoadmapSubmissionSummaryDto | null): string {
  if (!submission) {
    return mobileCopy("roadmap.status.notStarted");
  }

  if (submission.status === "pending_review") {
    return mobileCopy("roadmap.status.pendingReview");
  }

  if (submission.status === "approved") {
    return mobileCopy("roadmap.status.approved");
  }

  return mobileCopy("roadmap.status.rejected");
}
