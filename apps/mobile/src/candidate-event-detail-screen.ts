import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateEventDetailResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateEventBody,
  candidateScreenTheme,
  candidateStateCopy,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

export interface CandidateEventDetailScreen {
  route: "CandidateEventDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export function buildCandidateEventDetailScreen(options: {
  state: MobileScreenState;
  response?: CandidateEventDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateEventDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateEventDetail(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyCandidateEventDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateEventDetail",
    state: "ready",
    title: options.response.event.title,
    body: candidateEventDetailBody(options.response.event),
    sections: buildCandidateEventDetailSections(options.response),
    actions: [
      candidateParticipationAction(options.response),
      {
        id: "events",
        label: "Candidate Events",
        targetRoute: "CandidateEvents"
      },
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

function stateOnlyCandidateEventDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateEventDetailScreen {
  const copy = candidateStateCopy("eventDetail", state);

  return {
    route: "CandidateEventDetail",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function buildCandidateEventDetailSections(
  response: CandidateEventDetailResponseDto
): CandidateScreenSection[] {
  const participation = response.event.currentUserParticipation;

  return [
    {
      id: "event-detail",
      title: response.event.type,
      body: response.event.description ?? "No event description is recorded yet."
    },
    {
      id: "participation",
      title: "Participation",
      body:
        participation?.intentStatus === "planning_to_attend"
          ? "You are planning to attend."
          : "You have not marked an attendance intent."
    }
  ];
}

function candidateEventDetailBody(event: CandidateEventDetailResponseDto["event"]) {
  const base = candidateEventBody(event);
  return event.currentUserParticipation?.intentStatus === "planning_to_attend"
    ? `${base} - planning to attend`
    : base;
}

function candidateParticipationAction(
  response: CandidateEventDetailResponseDto
): CandidateScreenAction {
  if (response.event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      id: "cancel-participation",
      label: "Cancel intent",
      targetRoute: "CandidateEventDetail",
      targetId: response.event.id
    };
  }

  return {
    id: "plan-to-attend",
    label: "Plan to attend",
    targetRoute: "CandidateEventDetail",
    targetId: response.event.id
  };
}
