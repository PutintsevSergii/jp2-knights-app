import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateEventListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateEventBody,
  candidateEventCountBody,
  candidateScreenTheme,
  candidateStateCopy,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

type CandidateEventListItem = CandidateEventListResponseDto["events"][number];

export interface CandidateEventCard {
  id: string;
  title: string;
  dateLabel: string;
  locationLabel: string;
  statusLabel: string;
  statusTone: "planning" | "needed" | "cancelled";
  primaryAction: CandidateScreenAction | null;
  detailAction: CandidateScreenAction;
}

export interface CandidateEventsScreen {
  route: "CandidateEvents";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  eventCards: CandidateEventCard[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
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
    title: "Upcoming Events",
    body: candidateEventCountBody(options.response.events.length),
    sections: options.response.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: candidateEventBody(event)
    })),
    eventCards: options.response.events.map(buildCandidateEventCard),
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

function stateOnlyCandidateEvents(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateEventsScreen {
  const copy = candidateStateCopy("events", state);

  return {
    route: "CandidateEvents",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    eventCards: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function buildCandidateEventCard(event: CandidateEventListItem): CandidateEventCard {
  return {
    id: event.id,
    title: event.title,
    dateLabel: formatEventDateRange(event),
    locationLabel: event.locationLabel ?? "Location to be confirmed",
    ...participationCardState(event),
    detailAction: {
      id: "view-event-detail",
      label: "View Details",
      targetRoute: "CandidateEventDetail",
      targetId: event.id
    }
  };
}

function participationCardState(
  event: CandidateEventListItem
): Pick<CandidateEventCard, "statusLabel" | "statusTone" | "primaryAction"> {
  if (event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      statusLabel: "Planning to attend",
      statusTone: "planning",
      primaryAction: null
    };
  }

  if (event.currentUserParticipation?.intentStatus === "cancelled") {
    return {
      statusLabel: "Not attending",
      statusTone: "cancelled",
      primaryAction: {
        id: "plan-to-attend",
        label: "RSVP Now",
        targetRoute: "CandidateEvents",
        targetId: event.id
      }
    };
  }

  return {
    statusLabel: "RSVP needed",
    statusTone: "needed",
    primaryAction: {
      id: "plan-to-attend",
      label: "RSVP Now",
      targetRoute: "CandidateEvents",
      targetId: event.id
    }
  };
}

function formatEventDateRange(event: CandidateEventListItem): string {
  const start = new Date(event.startAt);
  const startDate = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(start);
  const startTime = formatTime(start);

  if (!event.endAt) {
    return `${startDate} • ${startTime}`;
  }

  return `${startDate} • ${startTime} - ${formatTime(new Date(event.endAt))}`;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  }).format(date);
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
