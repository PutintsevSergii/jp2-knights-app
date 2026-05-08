import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateAnnouncementListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateScreenTheme,
  candidateStateCopy,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

type CandidateAnnouncementListItem = CandidateAnnouncementListResponseDto["announcements"][number];

export interface CandidateAnnouncementCard {
  id: string;
  title: string;
  body: string;
  publishedLabel: string;
  pinned: boolean;
}

export interface CandidateAnnouncementsScreen {
  route: "CandidateAnnouncements";
  state: MobileScreenState;
  title: string;
  body: string;
  announcementCards: CandidateAnnouncementCard[];
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export function buildCandidateAnnouncementsScreen(options: {
  state: MobileScreenState;
  response?: CandidateAnnouncementListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateAnnouncementsScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateAnnouncements(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.announcements.length === 0) {
    return stateOnlyCandidateAnnouncements("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateAnnouncements",
    state: "ready",
    title: "Candidate Announcements",
    body: candidateAnnouncementCountBody(options.response.announcements.length),
    announcementCards: options.response.announcements.map(buildCandidateAnnouncementCard),
    sections: options.response.announcements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      title: announcement.pinned ? `${announcement.title} (Pinned)` : announcement.title,
      body: candidateAnnouncementBody(announcement)
    })),
    actions: [
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

function stateOnlyCandidateAnnouncements(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateAnnouncementsScreen {
  const copy = candidateStateCopy("announcements", state);

  return {
    route: "CandidateAnnouncements",
    state,
    title: copy.title,
    body: copy.body,
    announcementCards: [],
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function candidateAnnouncementCountBody(count: number): string {
  return count === 1
    ? "1 candidate-visible announcement"
    : `${count} candidate-visible announcements`;
}

function candidateAnnouncementBody(
  announcement: CandidateAnnouncementListItem
): string {
  return `${formatAnnouncementPublishedAt(announcement.publishedAt)}\n${announcement.body}`;
}

function buildCandidateAnnouncementCard(
  announcement: CandidateAnnouncementListItem
): CandidateAnnouncementCard {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    publishedLabel: formatAnnouncementPublishedAt(announcement.publishedAt),
    pinned: announcement.pinned
  };
}

function formatAnnouncementPublishedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(value));
}
