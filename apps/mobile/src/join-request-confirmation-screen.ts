import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicCandidateRequestResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface JoinRequestConfirmationScreen {
  route: "JoinRequestConfirmation";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildJoinRequestConfirmationScreenOptions {
  state: MobileScreenState;
  response?: PublicCandidateRequestResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildJoinRequestConfirmationScreen(
  options: BuildJoinRequestConfirmationScreenOptions
): JoinRequestConfirmationScreen {
  if (options.state !== "ready") {
    return stateOnlyJoinRequestConfirmation(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyJoinRequestConfirmation("empty", options.runtimeMode === "demo");
  }

  return {
    route: "JoinRequestConfirmation",
    state: "ready",
    title: "Request Received",
    body: "Your interest request was received. A local officer will review it; this does not create an account or promise membership.",
    sections: [
      {
        id: "request-reference",
        title: "Reference",
        body: options.response.request.id
      }
    ],
    actions: [homeAction],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyJoinRequestConfirmation(
  state: MobileScreenState,
  demoChromeVisible: boolean
): JoinRequestConfirmationScreen {
  const copy = publicStateCopy("joinRequestConfirmation", state);

  return {
    route: "JoinRequestConfirmation",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [homeAction],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}
