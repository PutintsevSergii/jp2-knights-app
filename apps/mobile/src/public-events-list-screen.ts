import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicEventListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  isPublicScreenAction,
  publicEventBody,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface PublicEventsListScreen {
  route: "PublicEventsList";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildPublicEventsListScreenOptions {
  state: MobileScreenState;
  response?: PublicEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildPublicEventsListScreen(
  options: BuildPublicEventsListScreenOptions
): PublicEventsListScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicEventsList(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.events.length === 0) {
    return stateOnlyPublicEventsList("empty", options.runtimeMode === "demo");
  }

  return {
    route: "PublicEventsList",
    state: "ready",
    title: "Public Events",
    body: "Upcoming public and family-open events.",
    sections: options.response.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: publicEventBody(event)
    })),
    actions: [openFirstEventAction(options.response.events[0]?.id), homeAction].filter(
      isPublicScreenAction
    ),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyPublicEventsList(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicEventsListScreen {
  const copy = publicStateCopy("eventsList", state);

  return {
    route: "PublicEventsList",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function openFirstEventAction(id: string | undefined): PublicScreenAction | undefined {
  return id
    ? {
        id: "open-first-event",
        label: "Open First Event",
        targetRoute: "PublicEventDetail",
        targetId: id
      }
    : undefined;
}
