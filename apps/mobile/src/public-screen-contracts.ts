import { designTokens } from "@jp2/shared-design-tokens";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";

export type PublicRoute =
  | "PublicHome"
  | "AboutOrder"
  | "PublicPrayerCategories"
  | "PublicEventsList"
  | "PublicPrayerDetail"
  | "PublicEventDetail"
  | "JoinRequestForm"
  | "JoinRequestConfirmation"
  | "Login"
  | "IdleApproval";

export interface PublicScreenAction {
  id: string;
  label: string;
  targetRoute: PublicRoute;
  targetId?: string | undefined;
}

export interface PublicScreenSection {
  id: string;
  title: string;
  body: string;
}

export interface PublicScreenTheme {
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

export const publicScreenTheme: PublicScreenTheme = {
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

export const homeAction: PublicScreenAction = {
  id: "home",
  label: "Home",
  targetRoute: "PublicHome"
};

export const idleApprovalAction: PublicScreenAction = {
  id: "approval-status",
  label: "Approval Status",
  targetRoute: "IdleApproval"
};

export const publicPrayersAction: PublicScreenAction = {
  id: "public-prayers",
  label: "Prayers",
  targetRoute: "PublicPrayerCategories"
};

export const publicEventsAction: PublicScreenAction = {
  id: "public-events",
  label: "Events",
  targetRoute: "PublicEventsList"
};

export function publicStateCopy(
  screen:
    | "home"
    | "aboutOrder"
    | "prayerCategories"
    | "eventsList"
    | "prayerDetail"
    | "eventDetail"
    | "joinRequestForm"
    | "joinRequestConfirmation"
    | "signIn",
  state: MobileScreenState
): { title: string; body: string } {
  return publicStateCopies[screen][state];
}

export function toPublicRoute(route: string): PublicRoute {
  if (publicRoutes.includes(route as PublicRoute)) {
    return route as PublicRoute;
  }

  return "PublicHome";
}

export function isPublicScreenAction(
  action: PublicScreenAction | undefined
): action is PublicScreenAction {
  return Boolean(action);
}

export function publicEventBody(event: { startAt: string; locationLabel?: string | null }) {
  const date = new Date(event.startAt);
  const formatted = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(date);

  return event.locationLabel ? `${formatted} - ${event.locationLabel}` : formatted;
}

export function idleApprovalBody(launchState: MobileLaunchState): string {
  const approval = launchState.idleApproval;

  if (!approval || approval.state === "pending") {
    return "Your sign-in is waiting for officer approval. Public content remains available.";
  }

  if (approval.state === "rejected") {
    return "Your sign-in was not approved for private app access. Public content remains available.";
  }

  return "Your sign-in approval request expired. Public content remains available.";
}

export function idleApprovalTitle(
  state: NonNullable<MobileLaunchState["idleApproval"]>["state"] | undefined
) {
  if (state === "rejected") {
    return "Approval Not Granted";
  }

  if (state === "expired") {
    return "Approval Expired";
  }

  return "Account Approval Pending";
}

export function idleApprovalDetailBody(approval: NonNullable<MobileLaunchState["idleApproval"]>) {
  const parts = [`Status: ${approval.state}`];

  if (approval.expiresAt) {
    parts.push(`Review expires: ${formatApprovalDate(approval.expiresAt)}`);
  }

  if (approval.scopeOrganizationUnitId) {
    parts.push("Review is scoped to your requested organization unit.");
  }

  return parts.join("\n");
}

function formatApprovalDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

const publicRoutes: readonly PublicRoute[] = [
  "PublicHome",
  "AboutOrder",
  "PublicPrayerCategories",
  "PublicEventsList",
  "PublicPrayerDetail",
  "PublicEventDetail",
  "JoinRequestForm",
  "JoinRequestConfirmation",
  "Login",
  "IdleApproval"
];

const privateContentBody = "This public screen cannot show private content.";

const publicStateCopies: Record<
  | "home"
  | "aboutOrder"
  | "prayerCategories"
  | "eventsList"
  | "prayerDetail"
  | "eventDetail"
  | "joinRequestForm"
  | "joinRequestConfirmation"
  | "signIn",
  Record<MobileScreenState, { title: string; body: string }>
> = {
  home: {
    ready: {
      title: "JP2 App",
      body: "Public discovery content is being prepared for approval."
    },
    loading: {
      title: "Loading",
      body: "Public content is loading."
    },
    empty: {
      title: "JP2 App",
      body: "Public content is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Public content could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public content remains available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh public content."
    }
  },
  aboutOrder: {
    ready: {
      title: "About the Order",
      body: "Approved public information is available."
    },
    loading: {
      title: "Loading",
      body: "About content is loading."
    },
    empty: {
      title: "About the Order",
      body: "About content is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "About content could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public about content remains available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh about content."
    }
  },
  prayerCategories: {
    ready: {
      title: "Public Prayers",
      body: "Published public prayers are available."
    },
    loading: {
      title: "Loading",
      body: "Public prayers are loading."
    },
    empty: {
      title: "Public Prayers",
      body: "Public prayers are being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Public prayers could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public prayers remain available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh public prayers."
    }
  },
  eventsList: {
    ready: {
      title: "Public Events",
      body: "Upcoming public events are available."
    },
    loading: {
      title: "Loading",
      body: "Public events are loading."
    },
    empty: {
      title: "Public Events",
      body: "No public events are listed yet."
    },
    error: {
      title: "Unable to Load",
      body: "Public events could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public events remain available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh public events."
    }
  },
  prayerDetail: {
    ready: {
      title: "Public Prayer",
      body: "Published public prayer is available."
    },
    loading: {
      title: "Loading",
      body: "Public prayer is loading."
    },
    empty: {
      title: "Public Prayer",
      body: "This public prayer is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Public prayer could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public prayers remain available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh this public prayer."
    }
  },
  eventDetail: {
    ready: {
      title: "Public Event",
      body: "Published public event is available."
    },
    loading: {
      title: "Loading",
      body: "Public event is loading."
    },
    empty: {
      title: "Public Event",
      body: "This public event is being prepared."
    },
    error: {
      title: "Unable to Load",
      body: "Public event could not be loaded."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public events remain available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh this public event."
    }
  },
  joinRequestForm: {
    ready: {
      title: "Join Interest",
      body: "Submit your interest so a local officer can follow up."
    },
    loading: {
      title: "Submitting",
      body: "Your request is being submitted."
    },
    empty: {
      title: "Join Interest",
      body: "The interest form is being prepared."
    },
    error: {
      title: "Unable to Submit",
      body: "Your request could not be submitted."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public join requests remain available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to submit your request."
    }
  },
  joinRequestConfirmation: {
    ready: {
      title: "Request Received",
      body: "Your interest request was received."
    },
    loading: {
      title: "Submitting",
      body: "Your request is being submitted."
    },
    empty: {
      title: "Request",
      body: "No submitted request is available."
    },
    error: {
      title: "Unable to Submit",
      body: "Your request could not be submitted."
    },
    forbidden: {
      title: "Access Denied",
      body: privateContentBody
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Public confirmation remains available while your private app access is reviewed."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to submit your request."
    }
  },
  signIn: {
    ready: {
      title: "Sign In",
      body: "Use your approved account to access candidate or brother mode."
    },
    loading: {
      title: "Signing In",
      body: "Your sign-in is being checked."
    },
    empty: {
      title: "Sign In",
      body: "Sign-in fields are being prepared."
    },
    error: {
      title: "Unable to Sign In",
      body: "Sign-in could not be completed."
    },
    forbidden: {
      title: "Access Denied",
      body: "This screen cannot grant private access without approved authentication."
    },
    idleApproval: {
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for approval before private app access is available."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to sign in."
    }
  }
};
