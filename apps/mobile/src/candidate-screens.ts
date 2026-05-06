import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  CandidateEventDetailResponseDto,
  CandidateEventListResponseDto,
  CandidateDashboardResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";

export type CandidateRoute =
  | "CandidateDashboard"
  | "CandidateContact"
  | "CandidateRoadmap"
  | "CandidateEvents"
  | "CandidateEventDetail";

export interface CandidateScreenAction {
  id: string;
  label: string;
  targetRoute: CandidateRoute;
  targetId?: string | undefined;
}

export interface CandidateScreenSection {
  id: string;
  title: string;
  body: string;
}

export interface CandidateScreenTheme {
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

export interface CandidateDashboardScreen {
  route: "CandidateDashboard";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export interface CandidateEventsScreen {
  route: "CandidateEvents";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export interface CandidateEventDetailScreen {
  route: "CandidateEventDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export interface BuildCandidateDashboardScreenOptions {
  state: MobileScreenState;
  response?: CandidateDashboardResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildCandidateDashboardScreen(
  options: BuildCandidateDashboardScreenOptions
): CandidateDashboardScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateDashboard(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyCandidateDashboard("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateDashboard",
    state: "ready",
    title: "Candidate Dashboard",
    body: candidateDashboardBody(options.response),
    sections: buildCandidateDashboardSections(options.response),
    actions: buildCandidateDashboardActions(options.response),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

export function buildCandidateEventsScreen(options: {
  state: MobileScreenState;
  response?: CandidateEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateEventsScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateEvents(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.events.length === 0) {
    return stateOnlyCandidateEvents("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateEvents",
    state: "ready",
    title: "Candidate Events",
    body: candidateEventCountBody(options.response.events.length),
    sections: options.response.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: candidateEventBody(event)
    })),
    actions: [
      openFirstCandidateEventAction(options.response.events[0]?.id),
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ].filter((action): action is CandidateScreenAction => Boolean(action)),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

export function buildCandidateEventDetailScreen(options: {
  state: MobileScreenState;
  response?: CandidateEventDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateEventDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateEventDetail(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyCandidateEventDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateEventDetail",
    state: "ready",
    title: options.response.event.title,
    body: candidateEventDetailBody(options.response.event),
    sections: buildCandidateEventDetailSections(options.response),
    actions: [
      candidateParticipationAction(options.response),
      {
        id: "events",
        label: "Candidate Events",
        targetRoute: "CandidateEvents"
      },
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

function buildCandidateDashboardSections(
  response: CandidateDashboardResponseDto
): CandidateScreenSection[] {
  const sections: CandidateScreenSection[] = [
    {
      id: "next-step",
      title: response.nextStep.label,
      body: response.nextStep.body
    }
  ];

  if (response.profile.assignedOrganizationUnit) {
    sections.push({
      id: "assignment",
      title: response.profile.assignedOrganizationUnit.name,
      body: organizationUnitBody(response.profile.assignedOrganizationUnit)
    });
  } else {
    sections.push({
      id: "assignment-empty",
      title: "Assignment",
      body: "Your local assignment is being prepared."
    });
  }

  if (response.profile.responsibleOfficer) {
    sections.push({
      id: "responsible-officer",
      title: response.profile.responsibleOfficer.displayName,
      body: response.profile.responsibleOfficer.email
    });
  }

  if (response.upcomingEvents.length > 0) {
    sections.push(
      ...response.upcomingEvents.map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        body: candidateEventBody(event)
      }))
    );
  } else {
    sections.push({
      id: "events-empty",
      title: "Events",
      body: "No candidate-visible events are listed yet."
    });
  }

  if (response.announcements.length > 0) {
    sections.push(
      ...response.announcements.map((announcement) => ({
        id: `announcement-${announcement.id}`,
        title: announcement.title,
        body: announcement.body
      }))
    );
  } else {
    sections.push({
      id: "announcements-empty",
      title: "Announcements",
      body: "No candidate announcements are listed yet."
    });
  }

  return sections;
}

function buildCandidateDashboardActions(
  response: CandidateDashboardResponseDto
): CandidateScreenAction[] {
  const actions: CandidateScreenAction[] = [
    {
      id: "next-step",
      label: response.nextStep.label,
      targetRoute: response.nextStep.targetRoute
    }
  ];

  if (response.profile.responsibleOfficer) {
    actions.push({
      id: "contact",
      label: "Contact",
      targetRoute: "CandidateContact"
    });
  }

  if (response.upcomingEvents.length > 0) {
    actions.push({
      id: "events",
      label: "Events",
      targetRoute: "CandidateEvents"
    });
  }

  return actions;
}

function stateOnlyCandidateDashboard(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateDashboardScreen {
  const copy = candidateDashboardStateCopy[state];

  return {
    route: "CandidateDashboard",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function stateOnlyCandidateEvents(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateEventsScreen {
  const copy = candidateEventsStateCopy[state];

  return {
    route: "CandidateEvents",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function stateOnlyCandidateEventDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateEventDetailScreen {
  const copy = candidateEventDetailStateCopy[state];

  return {
    route: "CandidateEventDetail",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function candidateDashboardBody(response: CandidateDashboardResponseDto): string {
  const assignment = response.profile.assignedOrganizationUnit?.name ?? "local assignment pending";

  return `${response.profile.displayName} - ${assignment}`;
}

function organizationUnitBody(
  organizationUnit: NonNullable<
    CandidateDashboardResponseDto["profile"]["assignedOrganizationUnit"]
  >
): string {
  return organizationUnit.parish
    ? `${organizationUnit.city}, ${organizationUnit.country} - ${organizationUnit.parish}`
    : `${organizationUnit.city}, ${organizationUnit.country}`;
}

function candidateEventBody(event: CandidateDashboardResponseDto["upcomingEvents"][number]) {
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

function candidateEventCountBody(count: number): string {
  return count === 1 ? "1 candidate-visible event" : `${count} candidate-visible events`;
}

function buildCandidateEventDetailSections(
  response: CandidateEventDetailResponseDto
): CandidateScreenSection[] {
  const participation = response.event.currentUserParticipation;

  return [
    {
      id: "event-detail",
      title: response.event.type,
      body: response.event.description ?? "No event description is recorded yet."
    },
    {
      id: "participation",
      title: "Participation",
      body:
        participation?.intentStatus === "planning_to_attend"
          ? "You are planning to attend."
          : "You have not marked an attendance intent."
    }
  ];
}

function candidateEventDetailBody(event: CandidateEventDetailResponseDto["event"]) {
  const base = candidateEventBody(event);
  return event.currentUserParticipation?.intentStatus === "planning_to_attend"
    ? `${base} - planning to attend`
    : base;
}

function candidateParticipationAction(
  response: CandidateEventDetailResponseDto
): CandidateScreenAction {
  if (response.event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      id: "cancel-participation",
      label: "Cancel intent",
      targetRoute: "CandidateEventDetail",
      targetId: response.event.id
    };
  }

  return {
    id: "plan-to-attend",
    label: "Plan to attend",
    targetRoute: "CandidateEventDetail",
    targetId: response.event.id
  };
}

function openFirstCandidateEventAction(
  id: string | undefined
): CandidateScreenAction | undefined {
  return id
    ? {
        id: "open-first-event",
        label: "Open first event",
        targetRoute: "CandidateEventDetail",
        targetId: id
      }
    : undefined;
}

const candidateDashboardStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "Candidate Dashboard",
    body: "Candidate guidance is available."
  },
  loading: {
    title: "Loading",
    body: "Candidate dashboard is loading."
  },
  empty: {
    title: "Candidate Dashboard",
    body: "Candidate dashboard content is being prepared."
  },
  error: {
    title: "Unable to Load",
    body: "Candidate dashboard could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active candidate profile is required."
  },
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before candidate content is available."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh candidate dashboard."
  }
};

const candidateEventsStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "Candidate Events",
    body: "Candidate-visible events are available."
  },
  loading: {
    title: "Loading",
    body: "Candidate events are loading."
  },
  empty: {
    title: "Candidate Events",
    body: "No candidate-visible events are listed yet."
  },
  error: {
    title: "Unable to Load",
    body: "Candidate events could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active candidate profile is required."
  },
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before candidate events are available."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh candidate events."
  }
};

const candidateEventDetailStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
  ready: {
    title: "Candidate Event",
    body: "Candidate event detail is available."
  },
  loading: {
    title: "Loading",
    body: "Candidate event detail is loading."
  },
  empty: {
    title: "Candidate Event",
    body: "This candidate-visible event is not available."
  },
  error: {
    title: "Unable to Load",
    body: "Candidate event detail could not be loaded."
  },
  forbidden: {
    title: "Access Denied",
    body: "An active candidate profile is required."
  },
  idleApproval: {
    title: "Account Approval Pending",
    body: "Your sign-in is waiting for officer approval before candidate event detail is available."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh candidate event detail."
  }
};

const candidateScreenTheme: CandidateScreenTheme = {
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
