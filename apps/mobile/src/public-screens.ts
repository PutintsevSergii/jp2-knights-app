import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicHomeResponseDto } from "@jp2/shared-validation";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";

export type PublicRoute =
  | "PublicHome"
  | "AboutOrder"
  | "PublicPrayerCategories"
  | "PublicEventsList"
  | "JoinRequestForm"
  | "Login";

export interface PublicScreenAction {
  id: string;
  label: string;
  targetRoute: PublicRoute;
}

export interface PublicScreenSection {
  id: string;
  title: string;
  body: string;
}

export interface PublicScreenTheme {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  primaryAction: string;
  primaryActionText: string;
  spacing: number;
  radius: number;
}

export interface PublicHomeScreen {
  route: "PublicHome";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export function buildPublicHomeScreen(launchState: MobileLaunchState): PublicHomeScreen {
  if (launchState.mode !== "public") {
    return stateOnlyPublicHome("forbidden", launchState.demoChromeVisible);
  }

  if (launchState.state !== "ready") {
    return stateOnlyPublicHome(launchState.state, launchState.demoChromeVisible);
  }

  const publicHome = launchState.publicHome;

  if (!publicHome) {
    return stateOnlyPublicHome("empty", launchState.demoChromeVisible);
  }

  return {
    route: "PublicHome",
    state: "ready",
    title: publicHome.intro.title,
    body: publicHome.intro.body,
    sections: buildPublicHomeSections(publicHome),
    actions: publicHome.ctas.map((cta) => ({
      id: cta.id,
      label: cta.label,
      targetRoute: toPublicRoute(cta.targetRoute)
    })),
    demoChromeVisible: launchState.demoChromeVisible,
    theme: publicScreenTheme
  };
}

function buildPublicHomeSections(publicHome: PublicHomeResponseDto): PublicScreenSection[] {
  const sections: PublicScreenSection[] = [];

  if (publicHome.prayerOfDay) {
    sections.push({
      id: "prayer-of-day",
      title: publicHome.prayerOfDay.title,
      body: publicHome.prayerOfDay.body
    });
  } else {
    sections.push({
      id: "prayer-empty",
      title: "Prayer",
      body: "Public prayer content is being prepared."
    });
  }

  if (publicHome.nextEvents.length > 0) {
    const nextEvent = publicHome.nextEvents[0];

    if (nextEvent) {
      sections.push({
        id: "next-event",
        title: nextEvent.title,
        body: nextEvent.locationLabel ?? "Public event details are available."
      });
    }
  } else {
    sections.push({
      id: "events-empty",
      title: "Events",
      body: "No public events are listed yet."
    });
  }

  return sections;
}

function stateOnlyPublicHome(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicHomeScreen {
  const copy = publicHomeStateCopy[state];

  return {
    route: "PublicHome",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function toPublicRoute(route: string): PublicRoute {
  if (publicRoutes.includes(route as PublicRoute)) {
    return route as PublicRoute;
  }

  return "PublicHome";
}

const publicRoutes: readonly PublicRoute[] = [
  "PublicHome",
  "AboutOrder",
  "PublicPrayerCategories",
  "PublicEventsList",
  "JoinRequestForm",
  "Login"
];

const publicHomeStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "JP2 App",
    body: "Public discovery content is being prepared for approval."
  },
  loading: {
    title: "Loading",
    body: "Public content is loading."
  },
  empty: {
    title: "JP2 App",
    body: "Public content is being prepared."
  },
  error: {
    title: "Unable to Load",
    body: "Public content could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "This public screen cannot show private content."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh public content."
  }
};

const publicScreenTheme: PublicScreenTheme = {
  background: designTokens.color.background.app,
  surface: designTokens.color.background.surface,
  text: designTokens.color.text.primary,
  mutedText: designTokens.color.text.muted,
  primaryAction: designTokens.color.action.primary,
  primaryActionText: designTokens.color.action.primaryText,
  spacing: designTokens.space[4],
  radius: designTokens.radius.md
};
