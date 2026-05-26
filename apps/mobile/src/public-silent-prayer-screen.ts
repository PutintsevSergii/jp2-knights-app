import type { RuntimeMode } from "@jp2/shared-types";
import type {
  PublicSilentPrayerEventSummaryDto,
  PublicSilentPrayerJoinResponseDto,
  PublicSilentPrayerListResponseDto
} from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface PublicSilentPrayerSessionCard {
  id: string;
  title: string;
  intention: string;
  timeLabel: string;
  visibilityLabel: string;
  activeCountLabel: string;
  joined: boolean;
}

export interface PublicSilentPrayerScreen {
  route: "PublicSilentPrayer";
  state: MobileScreenState;
  title: string;
  body: string;
  sessionCards: PublicSilentPrayerSessionCard[];
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  joinedPresence: string | null;
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export function buildPublicSilentPrayerScreen(options: {
  state: MobileScreenState;
  response?: PublicSilentPrayerListResponseDto | undefined;
  joined?: PublicSilentPrayerJoinResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): PublicSilentPrayerScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicSilentPrayer(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.sessions.length === 0) {
    return stateOnlyPublicSilentPrayer("empty", options.runtimeMode === "demo");
  }

  return {
    route: "PublicSilentPrayer",
    state: "ready",
    title: "Silent Prayer",
    body: "Join anonymously. Only the aggregate count is shown.",
    sessionCards: options.response.sessions.map((session) =>
      buildPublicSilentPrayerSessionCard(session, options.joined)
    ),
    sections: options.response.sessions.map((session) => ({
      id: `silent-prayer-${session.id}`,
      title: session.title,
      body: publicSilentPrayerBody(session)
    })),
    actions: [
      ...options.response.sessions.map((session): PublicScreenAction => ({
        id: "join-silent-prayer",
        label:
          options.joined?.presence.eventId === session.id ? "Refresh Counter" : "Join Silent Prayer",
        targetRoute: "PublicSilentPrayer",
        targetId: session.id
      })),
      homeAction
    ],
    joinedPresence: options.joined
      ? `${options.joined.presence.activeCount} praying now`
      : null,
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyPublicSilentPrayer(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicSilentPrayerScreen {
  const copy = publicStateCopy("silentPrayer", state);

  return {
    route: "PublicSilentPrayer",
    state,
    title: copy.title,
    body: copy.body,
    sessionCards: [],
    sections: [],
    actions: [],
    joinedPresence: null,
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function buildPublicSilentPrayerSessionCard(
  session: PublicSilentPrayerEventSummaryDto,
  joined: PublicSilentPrayerJoinResponseDto | undefined
): PublicSilentPrayerSessionCard {
  const activeCount =
    joined?.presence.eventId === session.id ? joined.presence.activeCount : session.activeCount;

  return {
    id: session.id,
    title: session.title,
    intention: session.intention ?? "Silent prayer intention",
    timeLabel: formatSilentPrayerTime(session.startsAt, session.endsAt),
    visibilityLabel: session.visibility === "FAMILY_OPEN" ? "Family open" : "Public",
    activeCountLabel: `${activeCount} praying now`,
    joined: joined?.presence.eventId === session.id
  };
}

function publicSilentPrayerBody(session: PublicSilentPrayerEventSummaryDto): string {
  return [
    session.intention ?? "Silent prayer intention",
    formatSilentPrayerTime(session.startsAt, session.endsAt),
    `${session.activeCount} praying now`
  ].join("\n");
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
