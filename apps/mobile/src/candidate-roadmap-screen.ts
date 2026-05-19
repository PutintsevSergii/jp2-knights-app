import type { RuntimeMode } from "@jp2/shared-types";
import type { AssignedRoadmapResponseDto } from "@jp2/shared-validation";
import { mobileCopy } from "./mobile-i18n.js";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateScreenTheme,
  candidateStateCopy,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";
import { buildRoadmapSections, roadmapSummaryBody } from "./roadmap-screen-utils.js";

export interface CandidateRoadmapScreen {
  route: "CandidateRoadmap";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export function buildCandidateRoadmapScreen(options: {
  state: MobileScreenState;
  response?: AssignedRoadmapResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateRoadmapScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateRoadmap(options.state, options.runtimeMode === "demo");
  }

  if (!options.response?.roadmap) {
    return stateOnlyCandidateRoadmap("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateRoadmap",
    state: "ready",
    title: options.response.roadmap.definition.title,
    body: roadmapSummaryBody(options.response.roadmap),
    sections: buildRoadmapSections(options.response.roadmap),
    actions: [
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

function stateOnlyCandidateRoadmap(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateRoadmapScreen {
  const copy =
    state === "empty"
      ? {
          title: mobileCopy("mobile.candidate.roadmap.title"),
          body: mobileCopy("mobile.candidate.roadmap.empty.body")
        }
      : candidateStateCopy("roadmap", state);

  return {
    route: "CandidateRoadmap",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}
