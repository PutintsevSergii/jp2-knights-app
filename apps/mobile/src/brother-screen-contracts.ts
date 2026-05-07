import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherTodayResponseDto, OrganizationUnitSummaryDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";

export type BrotherRoute =
  | "BrotherToday"
  | "BrotherProfile"
  | "MyOrganizationUnits"
  | "BrotherEvents"
  | "BrotherAnnouncements"
  | "BrotherEventDetail"
  | "BrotherPrayers"
  | "SilentPrayer";

export interface BrotherScreenAction {
  id: string;
  label: string;
  targetRoute: BrotherRoute;
  targetId?: string | undefined;
}

export interface BrotherScreenSection {
  id: string;
  title: string;
  body: string;
}

export interface BrotherScreenTheme {
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

export const brotherScreenTheme: BrotherScreenTheme = {
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

export function buildOrganizationUnitSection(
  organizationUnit: OrganizationUnitSummaryDto
): BrotherScreenSection {
  const details = [
    `${organizationUnit.city}, ${organizationUnit.country}`,
    organizationUnit.parish,
    organizationUnit.publicDescription
  ].filter((item): item is string => Boolean(item));

  return {
    id: `organization-unit-${organizationUnit.id}`,
    title: organizationUnit.name,
    body: details.join("\n")
  };
}

export function brotherEventBody(event: BrotherTodayResponseDto["upcomingEvents"][number]) {
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

export function brotherStateCopy(
  screen: "today" | "profile" | "organizationUnits" | "events" | "announcements" | "eventDetail",
  state: MobileScreenState
): { title: string; body: string } {
  return brotherStateCopies[screen][state];
}

const brotherStateCopies: Record<
  "today" | "profile" | "organizationUnits" | "events" | "announcements" | "eventDetail",
  Record<MobileScreenState, { title: string; body: string }>
> = {
  today: {
    ready: {
      title: "Brother Today",
      body: "Brother daily summary is available."
    },
    loading: {
      title: "Loading",
      body: "Brother Today is loading."
    },
    empty: {
      title: "Brother Today",
      body: "Brother profile content is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Brother Today could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active brother profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before brother content is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh Brother Today."
    }
  },
  profile: {
    ready: {
      title: "Brother Profile",
      body: "Brother profile is available."
    },
    loading: {
      title: "Loading",
      body: "Brother profile is loading."
    },
    empty: {
      title: "Brother Profile",
      body: "Brother profile is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Brother profile could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active brother profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before brother profile content is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh brother profile."
    }
  },
  organizationUnits: {
    ready: {
      title: "My Choragiew",
      body: "Your organization-unit assignments are available."
    },
    loading: {
      title: "Loading",
      body: "My Choragiew is loading."
    },
    empty: {
      title: "My Choragiew",
      body: "No active organization unit is assigned to your brother profile."
    },
    error: {
      title: "Unable to Load",
      body: "My Choragiew could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active brother profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before organization-unit content is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh My Choragiew."
    }
  },
  events: {
    ready: {
      title: "Brother Events",
      body: "Brother-visible events are available."
    },
    loading: {
      title: "Loading",
      body: "Brother events are loading."
    },
    empty: {
      title: "Brother Events",
      body: "No brother-visible events are listed yet."
    },
    error: {
      title: "Unable to Load",
      body: "Brother events could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active brother profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before brother events are available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh brother events."
    }
  },
  announcements: {
    ready: {
      title: "Brother Announcements",
      body: "Brother-visible announcements are available."
    },
    loading: {
      title: "Loading",
      body: "Brother announcements are loading."
    },
    empty: {
      title: "Brother Announcements",
      body: "No brother-visible announcements are listed yet."
    },
    error: {
      title: "Unable to Load",
      body: "Brother announcements could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active brother profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before brother announcements are available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh brother announcements."
    }
  },
  eventDetail: {
    ready: {
      title: "Brother Event",
      body: "Brother event detail is available."
    },
    loading: {
      title: "Loading",
      body: "Brother event detail is loading."
    },
    empty: {
      title: "Brother Event",
      body: "This brother-visible event is not available."
    },
    error: {
      title: "Unable to Load",
      body: "Brother event detail could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: "An active brother profile is required."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval before brother event detail is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh brother event detail."
    }
  }
};
