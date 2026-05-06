import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  BrotherEventListResponseDto,
  BrotherProfileResponseDto,
  BrotherTodayResponseDto,
  MyOrganizationUnitsResponseDto,
  OrganizationUnitSummaryDto
} from "@jp2/shared-validation";
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

export interface MyOrganizationUnitsScreen {
  route: "MyOrganizationUnits";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

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

export function buildMyOrganizationUnitsScreen(options: {
  state: MobileScreenState;
  response?: MyOrganizationUnitsResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): MyOrganizationUnitsScreen {
  if (options.state !== "ready") {
    return stateOnlyMyOrganizationUnits(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.organizationUnits.length === 0) {
    return stateOnlyMyOrganizationUnits("empty", options.runtimeMode === "demo");
  }

  return {
    route: "MyOrganizationUnits",
    state: "ready",
    title: "My Choragiew",
    body: organizationUnitCountBody(options.response.organizationUnits.length),
    sections: options.response.organizationUnits.map((organizationUnit) =>
      buildOrganizationUnitSection(organizationUnit)
    ),
    actions: [
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      },
      {
        id: "profile",
        label: "Brother Profile",
        targetRoute: "BrotherProfile"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
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
    ...response.organizationUnits.map((organizationUnit) =>
      buildOrganizationUnitSection(organizationUnit)
    )
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

function stateOnlyMyOrganizationUnits(
  state: MobileScreenState,
  demoChromeVisible: boolean
): MyOrganizationUnitsScreen {
  const copy = myOrganizationUnitsStateCopy[state];

  return {
    route: "MyOrganizationUnits",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherEvents(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherEventsScreen {
  const copy = brotherEventsStateCopy[state];

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

function buildOrganizationUnitSection(
  organizationUnit: OrganizationUnitSummaryDto
): BrotherScreenSection {
  const details = [
    `${organizationUnit.city}, ${organizationUnit.country}`,
    organizationUnit.parish,
    organizationUnit.publicDescription
  ].filter((item): item is string => Boolean(item));

  return {
    id: `organization-unit-${organizationUnit.id}`,
    title: organizationUnit.name,
    body: details.join("\n")
  };
}

function organizationUnitCountBody(count: number): string {
  return count === 1 ? "1 active organization unit" : `${count} active organization units`;
}

function eventCountBody(count: number): string {
  return count === 1 ? "1 brother-visible event" : `${count} brother-visible events`;
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
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before brother content is available."
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
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before brother profile content is available."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh brother profile."
  }
};

const myOrganizationUnitsStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "My Choragiew",
    body: "Your organization-unit assignments are available."
  },
  loading: {
    title: "Loading",
    body: "My Choragiew is loading."
  },
  empty: {
    title: "My Choragiew",
    body: "No active organization unit is assigned to your brother profile."
  },
  error: {
    title: "Unable to Load",
    body: "My Choragiew could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active brother profile is required."
  },
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before organization-unit content is available."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh My Choragiew."
  }
};

const brotherEventsStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "Brother Events",
    body: "Brother-visible events are available."
  },
  loading: {
    title: "Loading",
    body: "Brother events are loading."
  },
  empty: {
    title: "Brother Events",
    body: "No brother-visible events are listed yet."
  },
  error: {
    title: "Unable to Load",
    body: "Brother events could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active brother profile is required."
  },
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before brother events are available."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh brother events."
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
