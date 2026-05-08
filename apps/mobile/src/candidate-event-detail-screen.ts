import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateEventDetailResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateEventBody,
  candidateScreenTheme,
  candidateStateCopy,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

export interface CandidateEventDetailScreen {
  route: "CandidateEventDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  typeLabel: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  description: string;
  statusLabel: string;
  statusTone: "planning" | "needed" | "cancelled";
  primaryAction: CandidateScreenAction | null;
  backAction: CandidateScreenAction | null;
  dashboardAction: CandidateScreenAction | null;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
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
    typeLabel: formatEventType(options.response.event.type),
    dateLabel: formatEventDate(options.response.event.startAt),
    timeLabel: formatEventTimeRange(options.response.event.startAt, options.response.event.endAt),
    locationLabel: options.response.event.locationLabel ?? "Location to be confirmed",
    description: options.response.event.description ?? "No event description is recorded yet.",
    ...candidateParticipationState(options.response),
    backAction: {
      id: "events",
      label: "Candidate Events",
      targetRoute: "CandidateEvents"
    },
    dashboardAction: {
      id: "dashboard",
      label: "Dashboard",
      targetRoute: "CandidateDashboard"
    },
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

function stateOnlyCandidateEventDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateEventDetailScreen {
  const copy = candidateStateCopy("eventDetail", state);

  return {
    route: "CandidateEventDetail",
    state,
    title: copy.title,
    body: copy.body,
    typeLabel: "",
    dateLabel: "",
    timeLabel: "",
    locationLabel: "",
    description: copy.body,
    statusLabel: "",
    statusTone: "needed",
    primaryAction: null,
    backAction: null,
    dashboardAction: null,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
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

function candidateParticipationState(
  response: CandidateEventDetailResponseDto
): Pick<CandidateEventDetailScreen, "statusLabel" | "statusTone" | "primaryAction"> {
  if (response.event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      statusLabel: "Planning to attend",
      statusTone: "planning",
      primaryAction: candidateParticipationAction(response)
    };
  }

  if (response.event.currentUserParticipation?.intentStatus === "cancelled") {
    return {
      statusLabel: "Not attending",
      statusTone: "cancelled",
      primaryAction: candidateParticipationAction(response)
    };
  }

  return {
    statusLabel: "RSVP needed",
    statusTone: "needed",
    primaryAction: candidateParticipationAction(response)
  };
}

function formatEventType(type: string): string {
  return type
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function formatEventTimeRange(startAt: string, endAt: string | null): string {
  const start = formatEventTime(new Date(startAt));

  if (!endAt) {
    return start;
  }

  return `${start} - ${formatEventTime(new Date(endAt))}`;
}

function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  }).format(date);
}
