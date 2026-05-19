import type { RuntimeMode } from "@jp2/shared-types";
import type { AssignedRoadmapResponseDto } from "@jp2/shared-validation";
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
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
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
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}
