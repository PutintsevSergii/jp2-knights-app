import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherProfileResponseDto, BrotherTodayResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";

export type BrotherRoute =
  | "BrotherToday"
  | "BrotherProfile"
  | "MyOrganizationUnits"
  | "BrotherEvents"
  | "BrotherPrayers"
  | "SilentPrayer";

export interface BrotherScreenAction {
  id: string;
  label: string;
  targetRoute: BrotherRoute;
  targetId?: string | undefined;
}

export interface BrotherScreenSection {
  id: string;
  title: string;
  body: string;
}

export interface BrotherScreenTheme {
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  primaryAction: string;
  primaryActionText: string;
  spacing: number;
  radius: number;
}

export interface BrotherTodayScreen {
  route: "BrotherToday";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export interface BrotherProfileScreen {
  route: "BrotherProfile";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherTodayScreen(options: {
  state: MobileScreenState;
  response?: BrotherTodayResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherTodayScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherToday(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyBrotherToday("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherToday",
    state: "ready",
    title: "Brother Today",
    body: brotherTodayBody(options.response),
    sections: buildTodaySections(options.response),
    actions: options.response.cards.map((card) => ({
      id: card.id,
      label: card.label,
      targetRoute: card.targetRoute
    })),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

export function buildBrotherProfileScreen(options: {
  state: MobileScreenState;
  response?: BrotherProfileResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherProfileScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherProfile(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyBrotherProfile("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherProfile",
    state: "ready",
    title: "Brother Profile",
    body: `${options.response.profile.displayName} - ${options.response.profile.email}`,
    sections: buildProfileSections(options.response),
    actions: [
      {
        id: "organization-units",
        label: "My choragiew",
        targetRoute: "MyOrganizationUnits"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function buildTodaySections(response: BrotherTodayResponseDto): BrotherScreenSection[] {
  const sections = response.cards.map((card) => ({
    id: `card-${card.id}`,
    title: card.label,
    body: card.body
  }));

  if (response.upcomingEvents.length > 0) {
    sections.push(
      ...response.upcomingEvents.map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        body: brotherEventBody(event)
      }))
    );
  } else {
    sections.push({
      id: "events-empty",
      title: "Events",
      body: "No brother-visible events are listed yet."
    });
  }

  sections.push(
    ...response.organizationUnits.map((organizationUnit) => ({
      id: `organization-unit-${organizationUnit.id}`,
      title: organizationUnit.name,
      body: organizationUnit.parish
        ? `${organizationUnit.city}, ${organizationUnit.country} - ${organizationUnit.parish}`
        : `${organizationUnit.city}, ${organizationUnit.country}`
    }))
  );

  return sections;
}

function buildProfileSections(response: BrotherProfileResponseDto): BrotherScreenSection[] {
  const contact = [
    response.profile.phone ? `Phone: ${response.profile.phone}` : null,
    response.profile.preferredLanguage ? `Language: ${response.profile.preferredLanguage}` : null
  ].filter((item): item is string => Boolean(item));

  return [
    {
      id: "contact",
      title: "Contact",
      body: contact.length > 0 ? contact.join("\n") : "No optional contact details are recorded."
    },
    ...response.profile.memberships.map((membership) => ({
      id: `membership-${membership.id}`,
      title: membership.organizationUnit.name,
      body: membership.currentDegree
        ? `${membership.currentDegree}${membership.joinedAt ? ` - joined ${membership.joinedAt}` : ""}`
        : "Current degree is not recorded yet."
    }))
  ];
}

function stateOnlyBrotherToday(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherTodayScreen {
  const copy = brotherTodayStateCopy[state];

  return {
    route: "BrotherToday",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherProfile(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherProfileScreen {
  const copy = brotherProfileStateCopy[state];

  return {
    route: "BrotherProfile",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function brotherTodayBody(response: BrotherTodayResponseDto): string {
  const degree = response.profileSummary.currentDegree ?? "degree pending";
  const organizationUnit = response.profileSummary.organizationUnitName ?? "choragiew pending";

  return `${response.profileSummary.displayName} - ${degree} - ${organizationUnit}`;
}

function brotherEventBody(event: BrotherTodayResponseDto["upcomingEvents"][number]) {
  const formatted = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(event.startAt));

  return event.locationLabel ? `${formatted} - ${event.locationLabel}` : formatted;
}

const brotherTodayStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "Brother Today",
    body: "Brother daily summary is available."
  },
  loading: {
    title: "Loading",
    body: "Brother Today is loading."
  },
  empty: {
    title: "Brother Today",
    body: "Brother profile content is being prepared."
  },
  error: {
    title: "Unable to Load",
    body: "Brother Today could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active brother profile is required."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh Brother Today."
  }
};

const brotherProfileStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "Brother Profile",
    body: "Brother profile is available."
  },
  loading: {
    title: "Loading",
    body: "Brother profile is loading."
  },
  empty: {
    title: "Brother Profile",
    body: "Brother profile is being prepared."
  },
  error: {
    title: "Unable to Load",
    body: "Brother profile could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active brother profile is required."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh brother profile."
  }
};

const brotherScreenTheme: BrotherScreenTheme = {
  background: designTokens.color.background.app,
  surface: designTokens.color.background.surface,
  border: designTokens.color.border.subtle,
  text: designTokens.color.text.primary,
  mutedText: designTokens.color.text.muted,
  primaryAction: designTokens.color.action.primary,
  primaryActionText: designTokens.color.action.primaryText,
  spacing: designTokens.space[4],
  radius: designTokens.radius.md
};
