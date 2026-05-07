import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicEventDetailResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  publicEventBody,
  publicEventsAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface PublicEventDetailScreen {
  route: "PublicEventDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildPublicEventDetailScreenOptions {
  state: MobileScreenState;
  response?: PublicEventDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildPublicEventDetailScreen(
  options: BuildPublicEventDetailScreenOptions
): PublicEventDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicEventDetail(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyPublicEventDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "PublicEventDetail",
    state: "ready",
    title: options.response.event.title,
    body: "Published public event.",
    sections: [
      {
        id: "event-time-location",
        title: "When and Where",
        body: publicEventBody(options.response.event)
      },
      {
        id: "event-description",
        title: "Details",
        body: options.response.event.description ?? "Public event details are available."
      }
    ],
    actions: [publicEventsAction, homeAction],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyPublicEventDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicEventDetailScreen {
  const copy = publicStateCopy("eventDetail", state);

  return {
    route: "PublicEventDetail",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}
