import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherAnnouncementListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherAnnouncementsScreen {
  route: "BrotherAnnouncements";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherAnnouncementsScreen(options: {
  state: MobileScreenState;
  response?: BrotherAnnouncementListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherAnnouncementsScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherAnnouncements(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.announcements.length === 0) {
    return stateOnlyBrotherAnnouncements("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherAnnouncements",
    state: "ready",
    title: "Brother Announcements",
    body: announcementCountBody(options.response.announcements.length),
    sections: options.response.announcements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      title: announcement.pinned ? `${announcement.title} (Pinned)` : announcement.title,
      body: brotherAnnouncementBody(announcement)
    })),
    actions: [
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

function stateOnlyBrotherAnnouncements(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherAnnouncementsScreen {
  const copy = brotherStateCopy("announcements", state);

  return {
    route: "BrotherAnnouncements",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function announcementCountBody(count: number): string {
  return count === 1
    ? "1 brother-visible announcement"
    : `${count} brother-visible announcements`;
}

function brotherAnnouncementBody(
  announcement: BrotherAnnouncementListResponseDto["announcements"][number]
): string {
  const formatted = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(announcement.publishedAt));

  return `${formatted}\n${announcement.body}`;
}
