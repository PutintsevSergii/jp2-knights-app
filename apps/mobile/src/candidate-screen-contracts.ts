import { designTokens } from "@jp2/shared-design-tokens";
import type { CandidateDashboardResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";

export type CandidateRoute =
  | "CandidateDashboard"
  | "CandidateContact"
  | "CandidateRoadmap"
  | "CandidateEvents"
  | "CandidateAnnouncements"
  | "CandidateEventDetail";

export interface CandidateScreenAction {
  id: string;
  label: string;
  targetRoute: CandidateRoute;
  targetId?: string | undefined;
}

export interface CandidateScreenSection {
  id: string;
  title: string;
  body: string;
}

export interface CandidateScreenTheme {
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  primaryAction: string;
  primaryActionText: string;
  spacing: number;
  radius: number;
}

export const candidateScreenTheme: CandidateScreenTheme = {
  background: designTokens.color.background.app,
  surface: designTokens.color.background.surface,
  border: designTokens.color.border.subtle,
  text: designTokens.color.text.primary,
  mutedText: designTokens.color.text.muted,
  primaryAction: designTokens.color.action.primary,
  primaryActionText: designTokens.color.action.primaryText,
  spacing: designTokens.space[4],
  radius: designTokens.radius.md
};

export function organizationUnitBody(
  organizationUnit: NonNullable<
    CandidateDashboardResponseDto["profile"]["assignedOrganizationUnit"]
  >
): string {
  return organizationUnit.parish
    ? `${organizationUnit.city}, ${organizationUnit.country} - ${organizationUnit.parish}`
    : `${organizationUnit.city}, ${organizationUnit.country}`;
}

export function candidateEventBody(event: CandidateDashboardResponseDto["upcomingEvents"][number]) {
  const formatted = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(event.startAt));

  return event.locationLabel ? `${formatted} - ${event.locationLabel}` : formatted;
}

export function candidateEventCountBody(count: number): string {
  return count === 1 ? "1 candidate-visible event" : `${count} candidate-visible events`;
}

export function candidateStateCopy(
  screen: "dashboard" | "events" | "announcements" | "eventDetail",
  state: MobileScreenState
): { title: string; body: string } {
  return candidateStateCopies[screen][state];
}

const candidateStateCopies: Record<
  "dashboard" | "events" | "announcements" | "eventDetail",
  Record<MobileScreenState, { title: string; body: string }>
> = {
  dashboard: {
    ready: {
      title: "Candidate Dashboard",
      body: "Candidate guidance is available."
    },
    loading: {
      title: "Loading",
      body: "Candidate dashboard is loading."
    },
    empty: {
      title: "Candidate Dashboard",
      body: "Candidate dashboard content is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Candidate dashboard could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active candidate profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before candidate content is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh candidate dashboard."
    }
  },
  events: {
    ready: {
      title: "Candidate Events",
      body: "Candidate-visible events are available."
    },
    loading: {
      title: "Loading",
      body: "Candidate events are loading."
    },
    empty: {
      title: "Candidate Events",
      body: "No candidate-visible events are listed yet."
    },
    error: {
      title: "Unable to Load",
      body: "Candidate events could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active candidate profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before candidate events are available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh candidate events."
    }
  },
  announcements: {
    ready: {
      title: "Candidate Announcements",
      body: "Candidate-visible announcements are available."
    },
    loading: {
      title: "Loading",
      body: "Candidate announcements are loading."
    },
    empty: {
      title: "Candidate Announcements",
      body: "No candidate announcements are listed yet."
    },
    error: {
      title: "Unable to Load",
      body: "Candidate announcements could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active candidate profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before candidate announcements are available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh candidate announcements."
    }
  },
  eventDetail: {
    ready: {
      title: "Candidate Event",
      body: "Candidate event detail is available."
    },
    loading: {
      title: "Loading",
      body: "Candidate event detail is loading."
    },
    empty: {
      title: "Candidate Event",
      body: "This candidate-visible event is not available."
    },
    error: {
      title: "Unable to Load",
      body: "Candidate event detail could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active candidate profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before candidate event detail is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh candidate event detail."
    }
  }
};
