import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherEventListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherEventBody,
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

type BrotherEventListItem = BrotherEventListResponseDto["events"][number];

export interface BrotherEventCard {
  id: string;
  title: string;
  typeLabel: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  visibilityLabel: string;
  detailAction: BrotherScreenAction;
}

export interface BrotherEventsScreen {
  route: "BrotherEvents";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  eventCards: BrotherEventCard[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
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
    eventCards: options.response.events.map(buildBrotherEventCard),
    actions: [
      openFirstBrotherEventAction(options.response.events[0]?.id),
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
    ].filter((action): action is BrotherScreenAction => Boolean(action)),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherEvents(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherEventsScreen {
  const copy = brotherStateCopy("events", state);

  return {
    route: "BrotherEvents",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    eventCards: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function buildBrotherEventCard(event: BrotherEventListItem): BrotherEventCard {
  const start = new Date(event.startAt);

  return {
    id: event.id,
    title: event.title,
    typeLabel: formatTypeLabel(event.type),
    dateLabel: new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    }).format(start),
    timeLabel: formatEventTimeRange(event),
    locationLabel: event.locationLabel ?? "Location to be confirmed",
    visibilityLabel: formatVisibilityLabel(event.visibility),
    detailAction: {
      id: "view-event-detail",
      label: "View Details",
      targetRoute: "BrotherEventDetail",
      targetId: event.id
    }
  };
}

function eventCountBody(count: number): string {
  return count === 1 ? "1 brother-visible event" : `${count} brother-visible events`;
}

function formatEventTimeRange(event: BrotherEventListItem): string {
  const startTime = formatTime(new Date(event.startAt));

  if (!event.endAt) {
    return startTime;
  }

  return `${startTime} - ${formatTime(new Date(event.endAt))}`;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  }).format(date);
}

function formatTypeLabel(type: string): string {
  return type
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatVisibilityLabel(visibility: BrotherEventListItem["visibility"]): string {
  if (visibility === "ORGANIZATION_UNIT") {
    return "Choragiew";
  }

  if (visibility === "FAMILY_OPEN") {
    return "Family open";
  }

  return visibility.charAt(0) + visibility.slice(1).toLowerCase();
}

function openFirstBrotherEventAction(
  id: string | undefined
): BrotherScreenAction | undefined {
  return id
    ? {
        id: "open-first-event",
        label: "Open first event",
        targetRoute: "BrotherEventDetail",
        targetId: id
      }
    : undefined;
}
