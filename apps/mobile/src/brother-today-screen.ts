import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherTodayResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherEventBody,
  brotherScreenTheme,
  brotherStateCopy,
  buildOrganizationUnitSection,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherTodayProfileSummary {
  displayName: string;
  currentDegreeLabel: string;
  organizationUnitLabel: string;
  initials: string;
}

export interface BrotherTodayQuickAction extends BrotherScreenAction {
  icon: "profile" | "organization" | "events" | "announcements";
  emphasized?: boolean | undefined;
}

export interface BrotherTodayEventCard {
  id: string;
  title: string;
  typeLabel: string;
  dateMonth: string;
  dateDay: string;
  timeLabel: string;
  locationLabel: string;
  detailAction: BrotherScreenAction;
}

export interface BrotherTodayOrganizationUnitCard {
  id: string;
  title: string;
  locationLabel: string;
  body: string;
}

export interface BrotherTodayScreen {
  route: "BrotherToday";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  profileSummary?: BrotherTodayProfileSummary | undefined;
  quickActions: BrotherTodayQuickAction[];
  upcomingEventCards: BrotherTodayEventCard[];
  organizationUnitCards: BrotherTodayOrganizationUnitCard[];
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
    actions: buildTodayActions(options.response),
    profileSummary: buildProfileSummary(options.response),
    quickActions: buildQuickActions(options.response),
    upcomingEventCards: buildEventCards(options.response),
    organizationUnitCards: buildOrganizationUnitCards(options.response),
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

function buildTodayActions(response: BrotherTodayResponseDto): BrotherScreenAction[] {
  return buildQuickActions(response).map((action) => ({
    id: action.id,
    label: action.label,
    targetRoute: action.targetRoute,
    targetId: action.targetId
  }));
}

function buildProfileSummary(response: BrotherTodayResponseDto): BrotherTodayProfileSummary {
  const displayName = response.profileSummary.displayName;
  const organizationUnitLabel = response.profileSummary.organizationUnitName ?? "Choragiew pending";

  return {
    displayName,
    currentDegreeLabel: response.profileSummary.currentDegree ?? "Degree pending",
    organizationUnitLabel,
    initials: initialsFor(displayName)
  };
}

function buildQuickActions(response: BrotherTodayResponseDto): BrotherTodayQuickAction[] {
  const cardActions = response.cards.map(
    (card): BrotherTodayQuickAction => ({
      id: card.id,
      label: card.label,
      targetRoute: card.targetRoute,
      icon: quickActionIcon(card.targetRoute)
    })
  );

  if (!cardActions.some((action) => action.targetRoute === "BrotherAnnouncements")) {
    cardActions.push({
      id: "announcements",
      label: "Announcements",
      targetRoute: "BrotherAnnouncements",
      icon: "announcements",
      emphasized: true
    });
  }

  return cardActions;
}

function buildEventCards(response: BrotherTodayResponseDto): BrotherTodayEventCard[] {
  return response.upcomingEvents.map((event) => {
    const start = new Date(event.startAt);
    const end = event.endAt ? new Date(event.endAt) : undefined;

    return {
      id: event.id,
      title: event.title,
      typeLabel: labelFromSlug(event.type),
      dateMonth: new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC"
      })
        .format(start)
        .toUpperCase(),
      dateDay: new Intl.DateTimeFormat("en", {
        day: "2-digit",
        timeZone: "UTC"
      }).format(start),
      timeLabel: formatEventTime(start, end),
      locationLabel: event.locationLabel ?? "Location pending",
      detailAction: {
        id: "open-event",
        label: "Open event",
        targetRoute: "BrotherEventDetail",
        targetId: event.id
      }
    };
  });
}

function buildOrganizationUnitCards(
  response: BrotherTodayResponseDto
): BrotherTodayOrganizationUnitCard[] {
  return response.organizationUnits.map((organizationUnit) => ({
    id: organizationUnit.id,
    title: organizationUnit.name,
    locationLabel: `${organizationUnit.city}, ${organizationUnit.country}`,
    body: [organizationUnit.parish, organizationUnit.publicDescription]
      .filter((item): item is string => Boolean(item))
      .join("\n")
  }));
}

function stateOnlyBrotherToday(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherTodayScreen {
  const copy = brotherStateCopy("today", state);

  return {
    route: "BrotherToday",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    quickActions: [],
    upcomingEventCards: [],
    organizationUnitCards: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function brotherTodayBody(response: BrotherTodayResponseDto): string {
  const degree = response.profileSummary.currentDegree ?? "degree pending";
  const organizationUnit = response.profileSummary.organizationUnitName ?? "choragiew pending";

  return `${response.profileSummary.displayName} - ${degree} - ${organizationUnit}`;
}

function quickActionIcon(
  targetRoute: BrotherScreenAction["targetRoute"]
): BrotherTodayQuickAction["icon"] {
  if (targetRoute === "BrotherProfile") {
    return "profile";
  }

  if (targetRoute === "MyOrganizationUnits") {
    return "organization";
  }

  if (targetRoute === "BrotherEvents") {
    return "events";
  }

  return "announcements";
}

function initialsFor(displayName: string): string {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials.toUpperCase() || "JP";
}

function labelFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function formatEventTime(start: Date, end: Date | undefined): string {
  const formatter = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  });
  const startLabel = formatter.format(start);

  return end ? `${startLabel} - ${formatter.format(end)}` : startLabel;
}
