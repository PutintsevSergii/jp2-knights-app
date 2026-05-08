import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherEventDetailResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherEventBody,
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherEventDetailScreen {
  route: "BrotherEventDetail";
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
  primaryAction: BrotherScreenAction | null;
  backAction: BrotherScreenAction | null;
  todayAction: BrotherScreenAction | null;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherEventDetailScreen(options: {
  state: MobileScreenState;
  response?: BrotherEventDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherEventDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherEventDetail(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyBrotherEventDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherEventDetail",
    state: "ready",
    title: options.response.event.title,
    body: brotherEventDetailBody(options.response.event),
    typeLabel: formatEventType(options.response.event.type),
    dateLabel: formatEventDate(options.response.event.startAt),
    timeLabel: formatEventTimeRange(options.response.event.startAt, options.response.event.endAt),
    locationLabel: options.response.event.locationLabel ?? "Location to be confirmed",
    description: options.response.event.description ?? "No event description is recorded yet.",
    ...brotherParticipationState(options.response),
    backAction: {
      id: "events",
      label: "Brother Events",
      targetRoute: "BrotherEvents"
    },
    todayAction: {
      id: "today",
      label: "Brother Today",
      targetRoute: "BrotherToday"
    },
    sections: buildBrotherEventDetailSections(options.response),
    actions: [
      participationAction(options.response),
      {
        id: "events",
        label: "Brother Events",
        targetRoute: "BrotherEvents"
      },
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherEventDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherEventDetailScreen {
  const copy = brotherStateCopy("eventDetail", state);

  return {
    route: "BrotherEventDetail",
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
    todayAction: null,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function buildBrotherEventDetailSections(
  response: BrotherEventDetailResponseDto
): BrotherScreenSection[] {
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

function brotherEventDetailBody(event: BrotherEventDetailResponseDto["event"]) {
  const base = brotherEventBody(event);
  return event.currentUserParticipation?.intentStatus === "planning_to_attend"
    ? `${base} - planning to attend`
    : base;
}

function participationAction(response: BrotherEventDetailResponseDto): BrotherScreenAction {
  if (response.event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      id: "cancel-participation",
      label: "Cancel intent",
      targetRoute: "BrotherEventDetail",
      targetId: response.event.id
    };
  }

  return {
    id: "plan-to-attend",
    label: "Plan to attend",
    targetRoute: "BrotherEventDetail",
    targetId: response.event.id
  };
}

function brotherParticipationState(
  response: BrotherEventDetailResponseDto
): Pick<BrotherEventDetailScreen, "statusLabel" | "statusTone" | "primaryAction"> {
  if (response.event.currentUserParticipation?.intentStatus === "planning_to_attend") {
    return {
      statusLabel: "Planning to attend",
      statusTone: "planning",
      primaryAction: participationAction(response)
    };
  }

  if (response.event.currentUserParticipation?.intentStatus === "cancelled") {
    return {
      statusLabel: "Not attending",
      statusTone: "cancelled",
      primaryAction: participationAction(response)
    };
  }

  return {
    statusLabel: "RSVP needed",
    statusTone: "needed",
    primaryAction: participationAction(response)
  };
}

function formatEventType(type: string): string {
  return type
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
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
