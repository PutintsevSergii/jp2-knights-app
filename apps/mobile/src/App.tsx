import { useEffect, useMemo, useState } from "react";
import { resolveMobileLaunchState } from "./navigation.js";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";
import { fetchPublicContentPage, publicContentPageLoadFailureState } from "./public-content-api.js";
import {
  fetchPublicEvents,
  fetchPublicPrayers,
  publicContentListLoadFailureState
} from "./public-content-list-api.js";
import {
  fallbackAboutOrderContentPage,
  fallbackPublicEvents,
  fallbackPublicPrayers
} from "./public-content.js";
import {
  fetchPublicHome,
  publicHomeLoadFailureState,
  readPublicApiBaseUrl
} from "./public-home-api.js";
import {
  buildAboutOrderScreen,
  buildPublicEventsListScreen,
  buildPublicHomeScreen,
  buildPublicPrayerCategoriesScreen
} from "./public-screens.js";
import type { PublicRoute } from "./public-screens.js";
import { readMobileRuntimeMode } from "./runtime-config.js";
import { AboutOrderScreen } from "./screens/AboutOrderScreen.js";
import { PublicContentListScreen } from "./screens/PublicContentListScreen.js";
import { PublicHomeScreen } from "./screens/PublicHomeScreen.js";
import type {
  PublicContentPageResponseDto,
  PublicEventListResponseDto,
  PublicPrayerListResponseDto
} from "@jp2/shared-validation";

export function App() {
  const runtimeMode = useMemo(() => readMobileRuntimeMode(), []);
  const publicApiBaseUrl = useMemo(() => readPublicApiBaseUrl(), []);
  const [currentRoute, setCurrentRoute] = useState<PublicRoute>("PublicHome");
  const [launchState, setLaunchState] = useState<MobileLaunchState>(() =>
    runtimeMode === "demo"
      ? resolveMobileLaunchState(null, { runtimeMode })
      : resolveMobileLaunchState(null, {
          runtimeMode,
          state: "loading",
          useFallbackPublicHome: false
        })
  );
  const [aboutOrderState, setAboutOrderState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [aboutOrderPage, setAboutOrderPage] = useState<
    PublicContentPageResponseDto["page"] | undefined
  >(() => (runtimeMode === "demo" ? fallbackAboutOrderContentPage : undefined));
  const [publicPrayersState, setPublicPrayersState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [publicPrayers, setPublicPrayers] = useState<PublicPrayerListResponseDto | undefined>(() =>
    runtimeMode === "demo" ? fallbackPublicPrayers : undefined
  );
  const [publicEventsState, setPublicEventsState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [publicEvents, setPublicEvents] = useState<PublicEventListResponseDto | undefined>(() =>
    runtimeMode === "demo" ? fallbackPublicEvents : undefined
  );

  useEffect(() => {
    if (runtimeMode === "demo") {
      return;
    }

    let cancelled = false;

    fetchPublicHome({ baseUrl: publicApiBaseUrl })
      .then((publicHome) => {
        if (!cancelled) {
          setLaunchState(resolveMobileLaunchState(null, { runtimeMode, publicHome }));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLaunchState(
            resolveMobileLaunchState(null, {
              runtimeMode,
              state: publicHomeLoadFailureState(error),
              useFallbackPublicHome: false
            })
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "AboutOrder") {
      return;
    }

    let cancelled = false;
    setAboutOrderState("loading");

    fetchPublicContentPage({ slug: "about-order", baseUrl: publicApiBaseUrl })
      .then((response) => {
        if (!cancelled) {
          setAboutOrderPage(response.page);
          setAboutOrderState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAboutOrderPage(undefined);
          setAboutOrderState(publicContentPageLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "PublicPrayerCategories") {
      return;
    }

    let cancelled = false;
    setPublicPrayersState("loading");

    fetchPublicPrayers({ baseUrl: publicApiBaseUrl })
      .then((response) => {
        if (!cancelled) {
          setPublicPrayers(response);
          setPublicPrayersState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPublicPrayers(undefined);
          setPublicPrayersState(publicContentListLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "PublicEventsList") {
      return;
    }

    let cancelled = false;
    setPublicEventsState("loading");

    fetchPublicEvents({ baseUrl: publicApiBaseUrl })
      .then((response) => {
        if (!cancelled) {
          setPublicEvents(response);
          setPublicEventsState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPublicEvents(undefined);
          setPublicEventsState(publicContentListLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentRoute, publicApiBaseUrl, runtimeMode]);

  function handlePublicRoute(route: PublicRoute) {
    if (
      route === "PublicHome" ||
      route === "AboutOrder" ||
      route === "PublicPrayerCategories" ||
      route === "PublicEventsList"
    ) {
      setCurrentRoute(route);
    }
  }

  if (currentRoute === "AboutOrder") {
    return (
      <AboutOrderScreen
        screen={buildAboutOrderScreen({
          state: aboutOrderState,
          page: aboutOrderPage,
          runtimeMode
        })}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (currentRoute === "PublicPrayerCategories") {
    return (
      <PublicContentListScreen
        screen={buildPublicPrayerCategoriesScreen({
          state: publicPrayersState,
          response: publicPrayers,
          runtimeMode
        })}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (currentRoute === "PublicEventsList") {
    return (
      <PublicContentListScreen
        screen={buildPublicEventsListScreen({
          state: publicEventsState,
          response: publicEvents,
          runtimeMode
        })}
        onNavigate={handlePublicRoute}
      />
    );
  }

  return (
    <PublicHomeScreen screen={buildPublicHomeScreen(launchState)} onNavigate={handlePublicRoute} />
  );
}
