import { useEffect, useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  PublicContentPageResponseDto,
  PublicEventDetailResponseDto,
  PublicEventListResponseDto,
  PublicPrayerDetailResponseDto,
  PublicPrayerListResponseDto
} from "@jp2/shared-validation";
import { fetchPublicContentPage, publicContentPageLoadFailureState } from "./public-content-api.js";
import {
  fetchPublicEvent,
  fetchPublicPrayer,
  publicContentDetailLoadFailureState
} from "./public-content-detail-api.js";
import {
  fetchPublicEvents,
  fetchPublicPrayers,
  publicContentListLoadFailureState
} from "./public-content-list-api.js";
import {
  fallbackAboutOrderContentPage,
  fallbackPublicEventDetail,
  fallbackPublicEvents,
  fallbackPublicPrayerDetail,
  fallbackPublicPrayers
} from "./public-content.js";
import type { MobileScreenState } from "./navigation.js";
import type { PublicRoute } from "./public-screens.js";

export interface MobilePublicContentControllerOptions {
  route: PublicRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  onRouteChange: (route: PublicRoute) => void;
}

export function useMobilePublicContentController({
  route,
  runtimeMode,
  publicApiBaseUrl,
  onRouteChange
}: MobilePublicContentControllerOptions) {
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
  const [selectedPublicPrayerId, setSelectedPublicPrayerId] = useState<string | undefined>();
  const [selectedPublicEventId, setSelectedPublicEventId] = useState<string | undefined>();
  const [publicPrayerDetailState, setPublicPrayerDetailState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [publicPrayerDetail, setPublicPrayerDetail] = useState<
    PublicPrayerDetailResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackPublicPrayerDetail : undefined));
  const [publicEventDetailState, setPublicEventDetailState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [publicEventDetail, setPublicEventDetail] = useState<
    PublicEventDetailResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackPublicEventDetail : undefined));

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "AboutOrder") {
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
  }, [publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "PublicPrayerCategories") {
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
  }, [publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "PublicEventsList") {
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
  }, [publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "PublicPrayerDetail" || !selectedPublicPrayerId) {
      return;
    }

    let cancelled = false;
    setPublicPrayerDetailState("loading");

    fetchPublicPrayer({ id: selectedPublicPrayerId, baseUrl: publicApiBaseUrl })
      .then((response) => {
        if (!cancelled) {
          setPublicPrayerDetail(response);
          setPublicPrayerDetailState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPublicPrayerDetail(undefined);
          setPublicPrayerDetailState(publicContentDetailLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicApiBaseUrl, route, runtimeMode, selectedPublicPrayerId]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "PublicEventDetail" || !selectedPublicEventId) {
      return;
    }

    let cancelled = false;
    setPublicEventDetailState("loading");

    fetchPublicEvent({ id: selectedPublicEventId, baseUrl: publicApiBaseUrl })
      .then((response) => {
        if (!cancelled) {
          setPublicEventDetail(response);
          setPublicEventDetailState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPublicEventDetail(undefined);
          setPublicEventDetailState(publicContentDetailLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicApiBaseUrl, route, runtimeMode, selectedPublicEventId]);

  function handlePublicRoute(nextRoute: PublicRoute, targetId?: string) {
    if (nextRoute === "PublicPrayerDetail") {
      setSelectedPublicPrayerId(targetId);
      if (runtimeMode === "demo") {
        setPublicPrayerDetail(fallbackPublicPrayerDetail);
        setPublicPrayerDetailState(targetId ? "ready" : "empty");
      }
    }

    if (nextRoute === "PublicEventDetail") {
      setSelectedPublicEventId(targetId);
      if (runtimeMode === "demo") {
        setPublicEventDetail(fallbackPublicEventDetail);
        setPublicEventDetailState(targetId ? "ready" : "empty");
      }
    }

    onRouteChange(nextRoute);
  }

  return {
    aboutOrderState,
    aboutOrderPage,
    publicPrayersState,
    publicPrayers,
    publicEventsState,
    publicEvents,
    publicPrayerDetailState,
    publicPrayerDetail,
    publicEventDetailState,
    publicEventDetail,
    handlePublicRoute
  };
}
