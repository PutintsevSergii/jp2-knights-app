import type { RuntimeMode } from "@jp2/shared-types";
import type {
  BrotherSilentPrayerEventSummaryDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherSilentPrayerSessionCard {
  id: string;
  title: string;
  intention: string;
  timeLabel: string;
  visibilityLabel: string;
  scopeLabel: string;
  activeCountLabel: string;
  joined: boolean;
}

export interface BrotherSilentPrayerScreen {
  route: "SilentPrayer";
  state: MobileScreenState;
  title: string;
  body: string;
  sessionCards: BrotherSilentPrayerSessionCard[];
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  joinedPresence: string | null;
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherSilentPrayerScreen(options: {
  state: MobileScreenState;
  response?: BrotherSilentPrayerListResponseDto | undefined;
  joined?: BrotherSilentPrayerJoinResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherSilentPrayerScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherSilentPrayer(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.sessions.length === 0) {
    return stateOnlyBrotherSilentPrayer("empty", options.runtimeMode === "demo");
  }

  return {
    route: "SilentPrayer",
    state: "ready",
    title: "Silent Prayer",
    body: "Join brother-visible silent prayer. No participant list is shown.",
    sessionCards: options.response.sessions.map((session) =>
      buildBrotherSilentPrayerSessionCard(session, options.joined)
    ),
    sections: options.response.sessions.map((session) => ({
      id: `silent-prayer-${session.id}`,
      title: session.title,
      body: brotherSilentPrayerBody(session)
    })),
    actions: [
      ...options.response.sessions.map((session): BrotherScreenAction => ({
        id: "join-silent-prayer",
        label:
          options.joined?.presence.eventId === session.id ? "Refresh Counter" : "Join Silent Prayer",
        targetRoute: "SilentPrayer",
        targetId: session.id
      })),
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      }
    ],
    joinedPresence: options.joined
      ? `${options.joined.presence.activeCount} praying now`
      : null,
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function stateOnlyBrotherSilentPrayer(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherSilentPrayerScreen {
  const copy = brotherStateCopy("silentPrayer", state);

  return {
    route: "SilentPrayer",
    state,
    title: copy.title,
    body: copy.body,
    sessionCards: [],
    sections: [],
    actions: [],
    joinedPresence: null,
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function buildBrotherSilentPrayerSessionCard(
  session: BrotherSilentPrayerEventSummaryDto,
  joined: BrotherSilentPrayerJoinResponseDto | undefined
): BrotherSilentPrayerSessionCard {
  const activeCount =
    joined?.presence.eventId === session.id ? joined.presence.activeCount : session.activeCount;

  return {
    id: session.id,
    title: session.title,
    intention: session.intention ?? "Silent prayer intention",
    timeLabel: formatSilentPrayerTime(session.startsAt, session.endsAt),
    visibilityLabel: formatSilentPrayerVisibility(session.visibility),
    scopeLabel:
      session.visibility === "ORGANIZATION_UNIT" && session.targetOrganizationUnitId
        ? "Your choragiew"
        : "Shared brother prayer",
    activeCountLabel: `${activeCount} praying now`,
    joined: joined?.presence.eventId === session.id
  };
}

function brotherSilentPrayerBody(session: BrotherSilentPrayerEventSummaryDto): string {
  return [
    session.intention ?? "Silent prayer intention",
    formatSilentPrayerTime(session.startsAt, session.endsAt),
    `${formatSilentPrayerVisibility(session.visibility)} - aggregate count only`
  ].join("\n");
}

function formatSilentPrayerVisibility(
  visibility: BrotherSilentPrayerEventSummaryDto["visibility"]
): string {
  if (visibility === "FAMILY_OPEN") {
    return "Family open";
  }

  if (visibility === "ORGANIZATION_UNIT") {
    return "Choragiew";
  }

  return visibility.charAt(0) + visibility.slice(1).toLowerCase();
}

function formatSilentPrayerTime(startsAt: string, endsAt: string | null): string {
  const starts = formatSilentPrayerDate(startsAt);

  if (!endsAt) {
    return starts;
  }

  return `${starts} - ${formatSilentPrayerDate(endsAt)}`;
}

function formatSilentPrayerDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(value));
}
