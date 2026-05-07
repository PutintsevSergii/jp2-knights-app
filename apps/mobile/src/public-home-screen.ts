import type { PublicHomeResponseDto } from "@jp2/shared-validation";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";
import {
  idleApprovalAction,
  idleApprovalBody,
  publicScreenTheme,
  publicStateCopy,
  toPublicRoute,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

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

  if (launchState.state !== "ready" && launchState.state !== "idleApproval") {
    return stateOnlyPublicHome(launchState.state, launchState.demoChromeVisible);
  }

  const publicHome = launchState.publicHome;

  if (!publicHome) {
    return stateOnlyPublicHome("empty", launchState.demoChromeVisible);
  }

  return {
    route: "PublicHome",
    state: launchState.state,
    title: publicHome.intro.title,
    body: publicHome.intro.body,
    sections: [
      ...(launchState.idleApproval ? [buildIdleApprovalSection(launchState)] : []),
      ...buildPublicHomeSections(publicHome)
    ],
    actions: [
      ...(launchState.idleApproval ? [idleApprovalAction] : []),
      ...publicHome.ctas.map((cta) => ({
        id: cta.id,
        label: cta.label,
        targetRoute: toPublicRoute(cta.targetRoute)
      }))
    ],
    demoChromeVisible: launchState.demoChromeVisible,
    theme: publicScreenTheme
  };
}

function buildIdleApprovalSection(launchState: MobileLaunchState): PublicScreenSection {
  return {
    id: "identity-approval",
    title: "Account Approval Pending",
    body: idleApprovalBody(launchState)
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
  const copy = publicStateCopy("home", state);

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
