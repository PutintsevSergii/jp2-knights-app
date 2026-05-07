import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherEventListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherEventBody,
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherEventsScreen {
  route: "BrotherEvents";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherEventsScreen(options: {
  state: MobileScreenState;
  response?: BrotherEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherEventsScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherEvents(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.events.length === 0) {
    return stateOnlyBrotherEvents("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherEvents",
    state: "ready",
    title: "Brother Events",
    body: eventCountBody(options.response.events.length),
    sections: options.response.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: brotherEventBody(event)
    })),
    actions: [
      openFirstBrotherEventAction(options.response.events[0]?.id),
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      },
      {
        id: "organization-units",
        label: "My choragiew",
        targetRoute: "MyOrganizationUnits"
      }
    ].filter((action): action is BrotherScreenAction => Boolean(action)),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherEvents(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherEventsScreen {
  const copy = brotherStateCopy("events", state);

  return {
    route: "BrotherEvents",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function eventCountBody(count: number): string {
  return count === 1 ? "1 brother-visible event" : `${count} brother-visible events`;
}

function openFirstBrotherEventAction(
  id: string | undefined
): BrotherScreenAction | undefined {
  return id
    ? {
        id: "open-first-event",
        label: "Open first event",
        targetRoute: "BrotherEventDetail",
        targetId: id
      }
    : undefined;
}
