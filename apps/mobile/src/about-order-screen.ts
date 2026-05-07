import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicContentPageResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface AboutOrderScreen {
  route: "AboutOrder";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildAboutOrderScreenOptions {
  state: MobileScreenState;
  page?: PublicContentPageResponseDto["page"] | undefined;
  runtimeMode: RuntimeMode;
}

export function buildAboutOrderScreen(options: BuildAboutOrderScreenOptions): AboutOrderScreen {
  if (options.state !== "ready") {
    return stateOnlyAboutOrder(options.state, options.runtimeMode === "demo");
  }

  if (!options.page) {
    return stateOnlyAboutOrder("empty", options.runtimeMode === "demo");
  }

  return {
    route: "AboutOrder",
    state: "ready",
    title: options.page.title,
    body: "Public information approved for guest discovery.",
    sections: [
      {
        id: "about-order-content",
        title: options.page.title,
        body: options.page.body
      }
    ],
    actions: [
      {
        id: "join",
        label: "Join",
        targetRoute: "JoinRequestForm"
      },
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyAboutOrder(
  state: MobileScreenState,
  demoChromeVisible: boolean
): AboutOrderScreen {
  const copy = publicStateCopy("aboutOrder", state);

  return {
    route: "AboutOrder",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}
