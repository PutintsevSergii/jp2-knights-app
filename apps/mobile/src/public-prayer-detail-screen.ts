import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicPrayerDetailResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  publicPrayersAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface PublicPrayerDetailScreen {
  route: "PublicPrayerDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildPublicPrayerDetailScreenOptions {
  state: MobileScreenState;
  response?: PublicPrayerDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildPublicPrayerDetailScreen(
  options: BuildPublicPrayerDetailScreenOptions
): PublicPrayerDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicPrayerDetail(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyPublicPrayerDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "PublicPrayerDetail",
    state: "ready",
    title: options.response.prayer.title,
    body: "Published public prayer.",
    sections: [
      {
        id: "prayer-body",
        title: options.response.prayer.category?.title ?? "Prayer",
        body: options.response.prayer.body
      }
    ],
    actions: [publicPrayersAction, homeAction],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyPublicPrayerDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicPrayerDetailScreen {
  const copy = publicStateCopy("prayerDetail", state);

  return {
    route: "PublicPrayerDetail",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}
