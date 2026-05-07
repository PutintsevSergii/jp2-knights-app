import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherEventDetailResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherEventBody,
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherEventDetailScreen {
  route: "BrotherEventDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherEventDetailScreen(options: {
  state: MobileScreenState;
  response?: BrotherEventDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherEventDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherEventDetail(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyBrotherEventDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherEventDetail",
    state: "ready",
    title: options.response.event.title,
    body: brotherEventDetailBody(options.response.event),
    sections: buildBrotherEventDetailSections(options.response),
    actions: [
      participationAction(options.response),
      {
        id: "events",
        label: "Brother Events",
        targetRoute: "BrotherEvents"
      },
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

function stateOnlyBrotherEventDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherEventDetailScreen {
  const copy = brotherStateCopy("eventDetail", state);

  return {
    route: "BrotherEventDetail",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function buildBrotherEventDetailSections(
  response: BrotherEventDetailResponseDto
): BrotherScreenSection[] {
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

function brotherEventDetailBody(event: BrotherEventDetailResponseDto["event"]) {
  const base = brotherEventBody(event);
  return event.currentUserParticipation?.intentStatus === "planning_to_attend"
    ? `${base} - planning to attend`
    : base;
}

function participationAction(response: BrotherEventDetailResponseDto): BrotherScreenAction {
  if (response.event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      id: "cancel-participation",
      label: "Cancel intent",
      targetRoute: "BrotherEventDetail",
      targetId: response.event.id
    };
  }

  return {
    id: "plan-to-attend",
    label: "Plan to attend",
    targetRoute: "BrotherEventDetail",
    targetId: response.event.id
  };
}
