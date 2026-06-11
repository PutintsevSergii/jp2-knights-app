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

type BrotherAnnouncementListItem = BrotherAnnouncementListResponseDto["announcements"][number];

export interface BrotherAnnouncementDetailScreen {
  route: "BrotherAnnouncementDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  publishedLabel: string | null;
  pinned: boolean;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherAnnouncementDetailScreen(options: {
  state: MobileScreenState;
  response?: BrotherAnnouncementListResponseDto | undefined;
  selectedAnnouncementId?: string | undefined;
  runtimeMode: RuntimeMode;
}): BrotherAnnouncementDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherAnnouncementDetail(options.state, options.runtimeMode === "demo");
  }

  const announcement = options.response?.announcements.find(
    (item) => item.id === options.selectedAnnouncementId
  );

  if (!announcement) {
    return stateOnlyBrotherAnnouncementDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherAnnouncementDetail",
    state: "ready",
    title: announcement.title,
    body: announcement.body,
    publishedLabel: formatAnnouncementPublishedAt(announcement.publishedAt),
    pinned: announcement.pinned,
    sections: buildBrotherAnnouncementDetailSections(announcement),
    actions: [
      {
        id: "announcements",
        label: "Brother Announcements",
        targetRoute: "BrotherAnnouncements"
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

function stateOnlyBrotherAnnouncementDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherAnnouncementDetailScreen {
  const copy = brotherStateCopy("announcementDetail", state);

  return {
    route: "BrotherAnnouncementDetail",
    state,
    title: copy.title,
    body: copy.body,
    publishedLabel: null,
    pinned: false,
    sections: [],
    actions: [
      {
        id: "announcements",
        label: "Brother Announcements",
        targetRoute: "BrotherAnnouncements"
      }
    ],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function buildBrotherAnnouncementDetailSections(
  announcement: BrotherAnnouncementListItem
): BrotherScreenSection[] {
  return [
    {
      id: "announcement-detail",
      title: announcement.pinned ? "Pinned announcement" : "Announcement",
      body: announcement.body
    },
    {
      id: "announcement-published",
      title: "Published",
      body: formatAnnouncementPublishedAt(announcement.publishedAt)
    }
  ];
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
