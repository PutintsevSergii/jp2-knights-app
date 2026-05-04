import { designTokens } from "@jp2/shared-design-tokens";
import type {
  PublicContentPageResponseDto,
  PublicEventDetailResponseDto,
  PublicEventListResponseDto,
  PublicHomeResponseDto,
  PublicPrayerDetailResponseDto,
  PublicPrayerListResponseDto
} from "@jp2/shared-validation";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";
import type { RuntimeMode } from "@jp2/shared-types";

export type PublicRoute =
  | "PublicHome"
  | "AboutOrder"
  | "PublicPrayerCategories"
  | "PublicEventsList"
  | "PublicPrayerDetail"
  | "PublicEventDetail"
  | "JoinRequestForm"
  | "Login";

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

export interface PublicHomeScreen {
  route: "PublicHome";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface AboutOrderScreen {
  route: "AboutOrder";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface PublicContentListScreen {
  route: "PublicPrayerCategories" | "PublicEventsList";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface PublicContentDetailScreen {
  route: "PublicPrayerDetail" | "PublicEventDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildAboutOrderScreenOptions {
  state: MobileScreenState;
  page?: PublicContentPageResponseDto["page"] | undefined;
  runtimeMode: RuntimeMode;
}

export interface BuildPublicPrayerCategoriesScreenOptions {
  state: MobileScreenState;
  response?: PublicPrayerListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export interface BuildPublicEventsListScreenOptions {
  state: MobileScreenState;
  response?: PublicEventListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export interface BuildPublicPrayerDetailScreenOptions {
  state: MobileScreenState;
  response?: PublicPrayerDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export interface BuildPublicEventDetailScreenOptions {
  state: MobileScreenState;
  response?: PublicEventDetailResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildPublicHomeScreen(launchState: MobileLaunchState): PublicHomeScreen {
  if (launchState.mode !== "public") {
    return stateOnlyPublicHome("forbidden", launchState.demoChromeVisible);
  }

  if (launchState.state !== "ready") {
    return stateOnlyPublicHome(launchState.state, launchState.demoChromeVisible);
  }

  const publicHome = launchState.publicHome;

  if (!publicHome) {
    return stateOnlyPublicHome("empty", launchState.demoChromeVisible);
  }

  return {
    route: "PublicHome",
    state: "ready",
    title: publicHome.intro.title,
    body: publicHome.intro.body,
    sections: buildPublicHomeSections(publicHome),
    actions: publicHome.ctas.map((cta) => ({
      id: cta.id,
      label: cta.label,
      targetRoute: toPublicRoute(cta.targetRoute)
    })),
    demoChromeVisible: launchState.demoChromeVisible,
    theme: publicScreenTheme
  };
}

export function buildAboutOrderScreen(options: BuildAboutOrderScreenOptions): AboutOrderScreen {
  if (options.state !== "ready") {
    return stateOnlyAboutOrder(options.state, options.runtimeMode === "demo");
  }

  if (!options.page) {
    return stateOnlyAboutOrder("empty", options.runtimeMode === "demo");
  }

  return {
    route: "AboutOrder",
    state: "ready",
    title: options.page.title,
    body: "Public information approved for guest discovery.",
    sections: [
      {
        id: "about-order-content",
        title: options.page.title,
        body: options.page.body
      }
    ],
    actions: [
      {
        id: "join",
        label: "Join",
        targetRoute: "JoinRequestForm"
      },
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

export function buildPublicPrayerCategoriesScreen(
  options: BuildPublicPrayerCategoriesScreenOptions
): PublicContentListScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicContentList(
      "PublicPrayerCategories",
      options.state,
      options.runtimeMode === "demo"
    );
  }

  if (!options.response || options.response.prayers.length === 0) {
    return stateOnlyPublicContentList(
      "PublicPrayerCategories",
      "empty",
      options.runtimeMode === "demo"
    );
  }

  return {
    route: "PublicPrayerCategories",
    state: "ready",
    title: "Public Prayers",
    body: "Published prayers available before login.",
    sections: [
      ...options.response.categories.map((category) => ({
        id: `category-${category.id}`,
        title: category.title,
        body: publicPrayerCategoryBody(category.id, options.response?.prayers ?? [])
      })),
      ...options.response.prayers.map((prayer) => ({
        id: `prayer-${prayer.id}`,
        title: prayer.title,
        body: prayer.excerpt
      }))
    ],
    actions: [openFirstPrayerAction(options.response.prayers[0]?.id), homeAction].filter(
      isPublicScreenAction
    ),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

export function buildPublicEventsListScreen(
  options: BuildPublicEventsListScreenOptions
): PublicContentListScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicContentList(
      "PublicEventsList",
      options.state,
      options.runtimeMode === "demo"
    );
  }

  if (!options.response || options.response.events.length === 0) {
    return stateOnlyPublicContentList("PublicEventsList", "empty", options.runtimeMode === "demo");
  }

  return {
    route: "PublicEventsList",
    state: "ready",
    title: "Public Events",
    body: "Upcoming public and family-open events.",
    sections: options.response.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: publicEventBody(event)
    })),
    actions: [openFirstEventAction(options.response.events[0]?.id), homeAction].filter(
      isPublicScreenAction
    ),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

export function buildPublicPrayerDetailScreen(
  options: BuildPublicPrayerDetailScreenOptions
): PublicContentDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicContentDetail(
      "PublicPrayerDetail",
      options.state,
      options.runtimeMode === "demo"
    );
  }

  if (!options.response) {
    return stateOnlyPublicContentDetail(
      "PublicPrayerDetail",
      "empty",
      options.runtimeMode === "demo"
    );
  }

  return {
    route: "PublicPrayerDetail",
    state: "ready",
    title: options.response.prayer.title,
    body: "Published public prayer.",
    sections: [
      {
        id: "prayer-body",
        title: options.response.prayer.category?.title ?? "Prayer",
        body: options.response.prayer.body
      }
    ],
    actions: [publicPrayersAction, homeAction],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

export function buildPublicEventDetailScreen(
  options: BuildPublicEventDetailScreenOptions
): PublicContentDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicContentDetail(
      "PublicEventDetail",
      options.state,
      options.runtimeMode === "demo"
    );
  }

  if (!options.response) {
    return stateOnlyPublicContentDetail(
      "PublicEventDetail",
      "empty",
      options.runtimeMode === "demo"
    );
  }

  return {
    route: "PublicEventDetail",
    state: "ready",
    title: options.response.event.title,
    body: "Published public event.",
    sections: [
      {
        id: "event-time-location",
        title: "When and Where",
        body: publicEventBody(options.response.event)
      },
      {
        id: "event-description",
        title: "Details",
        body: options.response.event.description ?? "Public event details are available."
      }
    ],
    actions: [publicEventsAction, homeAction],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function buildPublicHomeSections(publicHome: PublicHomeResponseDto): PublicScreenSection[] {
  const sections: PublicScreenSection[] = [];

  if (publicHome.prayerOfDay) {
    sections.push({
      id: "prayer-of-day",
      title: publicHome.prayerOfDay.title,
      body: publicHome.prayerOfDay.body
    });
  } else {
    sections.push({
      id: "prayer-empty",
      title: "Prayer",
      body: "Public prayer content is being prepared."
    });
  }

  if (publicHome.nextEvents.length > 0) {
    const nextEvent = publicHome.nextEvents[0];

    if (nextEvent) {
      sections.push({
        id: "next-event",
        title: nextEvent.title,
        body: nextEvent.locationLabel ?? "Public event details are available."
      });
    }
  } else {
    sections.push({
      id: "events-empty",
      title: "Events",
      body: "No public events are listed yet."
    });
  }

  return sections;
}

function stateOnlyPublicHome(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicHomeScreen {
  const copy = publicHomeStateCopy[state];

  return {
    route: "PublicHome",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function stateOnlyAboutOrder(
  state: MobileScreenState,
  demoChromeVisible: boolean
): AboutOrderScreen {
  const copy = aboutOrderStateCopy[state];

  return {
    route: "AboutOrder",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function stateOnlyPublicContentList(
  route: PublicContentListScreen["route"],
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicContentListScreen {
  const copy =
    route === "PublicPrayerCategories"
      ? publicPrayerCategoriesStateCopy[state]
      : publicEventsListStateCopy[state];

  return {
    route,
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function stateOnlyPublicContentDetail(
  route: PublicContentDetailScreen["route"],
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicContentDetailScreen {
  const copy =
    route === "PublicPrayerDetail"
      ? publicPrayerDetailStateCopy[state]
      : publicEventDetailStateCopy[state];

  return {
    route,
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function toPublicRoute(route: string): PublicRoute {
  if (publicRoutes.includes(route as PublicRoute)) {
    return route as PublicRoute;
  }

  return "PublicHome";
}

const publicRoutes: readonly PublicRoute[] = [
  "PublicHome",
  "AboutOrder",
  "PublicPrayerCategories",
  "PublicEventsList",
  "PublicPrayerDetail",
  "PublicEventDetail",
  "JoinRequestForm",
  "Login"
];

const publicHomeStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
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
    body: "This public screen cannot show private content."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh public content."
  }
};

const aboutOrderStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
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
    body: "This public screen cannot show private content."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh about content."
  }
};

const publicPrayerCategoriesStateCopy: Record<MobileScreenState, { title: string; body: string }> =
  {
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
      body: "This public screen cannot show private content."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh public prayers."
    }
  };

const publicEventsListStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
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
    body: "This public screen cannot show private content."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh public events."
  }
};

const publicPrayerDetailStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
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
    body: "This public screen cannot show private content."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this public prayer."
  }
};

const publicEventDetailStateCopy: Record<MobileScreenState, { title: string; body: string }> = {
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
    body: "This public screen cannot show private content."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this public event."
  }
};

const homeAction: PublicScreenAction = {
  id: "home",
  label: "Home",
  targetRoute: "PublicHome"
};

const publicPrayersAction: PublicScreenAction = {
  id: "public-prayers",
  label: "Prayers",
  targetRoute: "PublicPrayerCategories"
};

const publicEventsAction: PublicScreenAction = {
  id: "public-events",
  label: "Events",
  targetRoute: "PublicEventsList"
};

const publicScreenTheme: PublicScreenTheme = {
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

function publicPrayerCategoryBody(
  categoryId: string,
  prayers: PublicPrayerListResponseDto["prayers"]
) {
  const count = prayers.filter((prayer) => prayer.category?.id === categoryId).length;

  return count === 1 ? "1 public prayer" : `${count} public prayers`;
}

function publicEventBody(event: PublicEventListResponseDto["events"][number]) {
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

function openFirstPrayerAction(id: string | undefined): PublicScreenAction | undefined {
  return id
    ? {
        id: "open-first-prayer",
        label: "Open First Prayer",
        targetRoute: "PublicPrayerDetail",
        targetId: id
      }
    : undefined;
}

function openFirstEventAction(id: string | undefined): PublicScreenAction | undefined {
  return id
    ? {
        id: "open-first-event",
        label: "Open First Event",
        targetRoute: "PublicEventDetail",
        targetId: id
      }
    : undefined;
}

function isPublicScreenAction(
  action: PublicScreenAction | undefined
): action is PublicScreenAction {
  return Boolean(action);
}
