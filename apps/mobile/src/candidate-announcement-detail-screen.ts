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

export interface CandidateAnnouncementDetailScreen {
  route: "CandidateAnnouncementDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  publishedLabel: string | null;
  pinned: boolean;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export function buildCandidateAnnouncementDetailScreen(options: {
  state: MobileScreenState;
  response?: CandidateAnnouncementListResponseDto | undefined;
  selectedAnnouncementId?: string | undefined;
  runtimeMode: RuntimeMode;
}): CandidateAnnouncementDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateAnnouncementDetail(options.state, options.runtimeMode === "demo");
  }

  const announcement = options.response?.announcements.find(
    (item) => item.id === options.selectedAnnouncementId
  );

  if (!announcement) {
    return stateOnlyCandidateAnnouncementDetail("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateAnnouncementDetail",
    state: "ready",
    title: announcement.title,
    body: announcement.body,
    publishedLabel: formatAnnouncementPublishedAt(announcement.publishedAt),
    pinned: announcement.pinned,
    sections: buildCandidateAnnouncementDetailSections(announcement),
    actions: [
      {
        id: "announcements",
        label: "Candidate Announcements",
        targetRoute: "CandidateAnnouncements"
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

function stateOnlyCandidateAnnouncementDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateAnnouncementDetailScreen {
  const copy = candidateStateCopy("announcementDetail", state);

  return {
    route: "CandidateAnnouncementDetail",
    state,
    title: copy.title,
    body: copy.body,
    publishedLabel: null,
    pinned: false,
    sections: [],
    actions: [
      {
        id: "announcements",
        label: "Candidate Announcements",
        targetRoute: "CandidateAnnouncements"
      }
    ],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function buildCandidateAnnouncementDetailSections(
  announcement: CandidateAnnouncementListItem
): CandidateScreenSection[] {
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
