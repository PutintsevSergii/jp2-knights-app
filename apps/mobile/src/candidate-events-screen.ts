import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateEventListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateEventBody,
  candidateEventCountBody,
  candidateScreenTheme,
  candidateStateCopy,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

export interface CandidateEventsScreen {
  route: "CandidateEvents";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export function buildCandidateEventsScreen(options: {
  state: MobileScreenState;
  response?: CandidateEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateEventsScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateEvents(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.events.length === 0) {
    return stateOnlyCandidateEvents("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateEvents",
    state: "ready",
    title: "Candidate Events",
    body: candidateEventCountBody(options.response.events.length),
    sections: options.response.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: candidateEventBody(event)
    })),
    actions: [
      openFirstCandidateEventAction(options.response.events[0]?.id),
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ].filter((action): action is CandidateScreenAction => Boolean(action)),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

function stateOnlyCandidateEvents(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateEventsScreen {
  const copy = candidateStateCopy("events", state);

  return {
    route: "CandidateEvents",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function openFirstCandidateEventAction(
  id: string | undefined
): CandidateScreenAction | undefined {
  return id
    ? {
        id: "open-first-event",
        label: "Open first event",
        targetRoute: "CandidateEventDetail",
        targetId: id
      }
    : undefined;
}
