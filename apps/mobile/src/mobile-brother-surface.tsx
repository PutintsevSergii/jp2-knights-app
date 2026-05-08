import { useEffect, useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  BrotherAnnouncementListResponseDto,
  BrotherEventDetailResponseDto,
  BrotherEventListResponseDto,
  BrotherPrayerListResponseDto,
  BrotherProfileResponseDto,
  BrotherTodayResponseDto,
  MyOrganizationUnitsResponseDto
} from "@jp2/shared-validation";
import {
  brotherCompanionLoadFailureState,
  cancelBrotherEventParticipation,
  fetchBrotherAnnouncements,
  fetchBrotherEvent,
  fetchBrotherEvents,
  fetchBrotherProfile,
  fetchBrotherPrayers,
  fetchBrotherToday,
  fetchMyOrganizationUnits,
  markBrotherEventParticipation
} from "./brother-companion-api.js";
import {
  fallbackBrotherAnnouncements,
  fallbackBrotherEventDetail,
  fallbackBrotherEvents,
  fallbackBrotherPrayers,
  fallbackBrotherProfile,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";
import {
  buildBrotherAnnouncementsScreen,
  buildBrotherEventDetailScreen,
  buildBrotherEventsScreen,
  buildBrotherProfileScreen,
  buildBrotherPrayersScreen,
  buildBrotherTodayScreen,
  buildMyOrganizationUnitsScreen,
  buildOrganizationUnitDetailScreen
} from "./brother-screens.js";
import type { BrotherRoute } from "./brother-screens.js";
import { isBrotherRoute } from "./mobile-routes.js";
import type { MobileScreenState } from "./navigation.js";
import { BrotherAnnouncementsScreen } from "./screens/BrotherAnnouncementsScreen.js";
import { BrotherEventDetailScreen } from "./screens/BrotherEventDetailScreen.js";
import { BrotherEventsScreen } from "./screens/BrotherEventsScreen.js";
import { BrotherPrayersScreen } from "./screens/BrotherPrayersScreen.js";
import { BrotherTodayScreen } from "./screens/BrotherTodayScreen.js";
import { MyOrganizationUnitsScreen } from "./screens/MyOrganizationUnitsScreen.js";
import { OrganizationUnitDetailScreen } from "./screens/OrganizationUnitDetailScreen.js";
import { PrivateContentScreen } from "./screens/PrivateContentScreen.js";

export interface MobileBrotherSurfaceProps {
  route: BrotherRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  authToken: string | undefined;
  onRouteChange: (route: BrotherRoute) => void;
}

export function MobileBrotherSurface({
  route,
  runtimeMode,
  publicApiBaseUrl,
  authToken,
  onRouteChange
}: MobileBrotherSurfaceProps) {
  const [brotherTodayState, setBrotherTodayState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "loading"
  );
  const [brotherToday, setBrotherToday] = useState<BrotherTodayResponseDto | undefined>(() =>
    runtimeMode === "demo" ? fallbackBrotherToday : undefined
  );
  const [brotherProfileState, setBrotherProfileState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherProfile, setBrotherProfile] = useState<BrotherProfileResponseDto | undefined>(() =>
    runtimeMode === "demo" ? fallbackBrotherProfile : undefined
  );
  const [myOrganizationUnitsState, setMyOrganizationUnitsState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [myOrganizationUnits, setMyOrganizationUnits] = useState<
    MyOrganizationUnitsResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackMyOrganizationUnits : undefined));
  const [selectedOrganizationUnitId, setSelectedOrganizationUnitId] = useState<
    string | undefined
  >(() => fallbackMyOrganizationUnits.organizationUnits[0]?.id);
  const [brotherEventsState, setBrotherEventsState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherEvents, setBrotherEvents] = useState<BrotherEventListResponseDto | undefined>(() =>
    runtimeMode === "demo" ? fallbackBrotherEvents : undefined
  );
  const [brotherAnnouncementsState, setBrotherAnnouncementsState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherAnnouncements, setBrotherAnnouncements] = useState<
    BrotherAnnouncementListResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackBrotherAnnouncements : undefined));
  const [brotherPrayersState, setBrotherPrayersState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherPrayers, setBrotherPrayers] = useState<BrotherPrayerListResponseDto | undefined>(
    () => (runtimeMode === "demo" ? fallbackBrotherPrayers : undefined)
  );
  const [selectedBrotherEventId, setSelectedBrotherEventId] = useState<string | undefined>();
  const [brotherEventDetailState, setBrotherEventDetailState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherEventDetail, setBrotherEventDetail] = useState<
    BrotherEventDetailResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackBrotherEventDetail : undefined));

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "BrotherToday") {
      return;
    }

    if (!authToken) {
      setBrotherTodayState("forbidden");
      return;
    }

    let cancelled = false;
    setBrotherTodayState("loading");

    fetchBrotherToday({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setBrotherToday(response);
          setBrotherTodayState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBrotherToday(undefined);
          setBrotherTodayState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "BrotherPrayers") {
      return;
    }

    if (!authToken) {
      setBrotherPrayersState("forbidden");
      return;
    }

    let cancelled = false;
    setBrotherPrayersState("loading");

    fetchBrotherPrayers({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setBrotherPrayers(response);
          setBrotherPrayersState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBrotherPrayers(undefined);
          setBrotherPrayersState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "BrotherProfile") {
      return;
    }

    if (!authToken) {
      setBrotherProfileState("forbidden");
      return;
    }

    let cancelled = false;
    setBrotherProfileState("loading");

    fetchBrotherProfile({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setBrotherProfile(response);
          setBrotherProfileState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBrotherProfile(undefined);
          setBrotherProfileState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (
      runtimeMode === "demo" ||
      (route !== "MyOrganizationUnits" && route !== "OrganizationUnitDetail")
    ) {
      return;
    }

    if (!authToken) {
      setMyOrganizationUnitsState("forbidden");
      return;
    }

    let cancelled = false;
    setMyOrganizationUnitsState("loading");

    fetchMyOrganizationUnits({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setMyOrganizationUnits(response);
          setMyOrganizationUnitsState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMyOrganizationUnits(undefined);
          setMyOrganizationUnitsState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "BrotherEvents") {
      return;
    }

    if (!authToken) {
      setBrotherEventsState("forbidden");
      return;
    }

    let cancelled = false;
    setBrotherEventsState("loading");

    fetchBrotherEvents({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setBrotherEvents(response);
          setBrotherEventsState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBrotherEvents(undefined);
          setBrotherEventsState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "BrotherAnnouncements") {
      return;
    }

    if (!authToken) {
      setBrotherAnnouncementsState("forbidden");
      return;
    }

    let cancelled = false;
    setBrotherAnnouncementsState("loading");

    fetchBrotherAnnouncements({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setBrotherAnnouncements(response);
          setBrotherAnnouncementsState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBrotherAnnouncements(undefined);
          setBrotherAnnouncementsState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "BrotherEventDetail" || !selectedBrotherEventId) {
      return;
    }

    if (!authToken) {
      setBrotherEventDetailState("forbidden");
      return;
    }

    let cancelled = false;
    setBrotherEventDetailState("loading");

    fetchBrotherEvent({ id: selectedBrotherEventId, baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setBrotherEventDetail(response);
          setBrotherEventDetailState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBrotherEventDetail(undefined);
          setBrotherEventDetailState(brotherCompanionLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode, selectedBrotherEventId]);

  async function handleBrotherRoute(nextRoute: BrotherRoute, targetId?: string, actionId?: string) {
    if (nextRoute === "SilentPrayer") {
      onRouteChange("BrotherToday");
      return;
    }

    if (nextRoute === "BrotherEventDetail") {
      setSelectedBrotherEventId(targetId);

      if (runtimeMode === "demo") {
        setBrotherEventDetail(fallbackBrotherEventDetail);
        setBrotherEventDetailState(targetId ? "ready" : "empty");
      } else if (targetId && authToken && actionId === "plan-to-attend") {
        const response = await markBrotherEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        setBrotherEventDetail((current) =>
          current
            ? {
                event: {
                  ...current.event,
                  currentUserParticipation: response.participation
                }
              }
            : current
        );
        setBrotherEventDetailState("ready");
      } else if (targetId && authToken && actionId === "cancel-participation") {
        const response = await cancelBrotherEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        setBrotherEventDetail((current) =>
          current
            ? {
                event: {
                  ...current.event,
                  currentUserParticipation:
                    response.participation.intentStatus === "cancelled"
                      ? null
                      : response.participation
                }
              }
            : current
        );
        setBrotherEventDetailState("ready");
      }
    }

    if (nextRoute === "OrganizationUnitDetail") {
      setSelectedOrganizationUnitId(targetId);

      if (runtimeMode === "demo") {
        setMyOrganizationUnits(fallbackMyOrganizationUnits);
        setMyOrganizationUnitsState(targetId ? "ready" : "empty");
      }
    }

    onRouteChange(nextRoute);
  }

  if (route === "BrotherProfile") {
    return (
      <PrivateContentScreen
        screen={buildBrotherProfileScreen({
          state: brotherProfileState,
          response: brotherProfile,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "MyOrganizationUnits") {
    return (
      <MyOrganizationUnitsScreen
        screen={buildMyOrganizationUnitsScreen({
          state: myOrganizationUnitsState,
          response: myOrganizationUnits,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "OrganizationUnitDetail") {
    return (
      <OrganizationUnitDetailScreen
        screen={buildOrganizationUnitDetailScreen({
          state: myOrganizationUnitsState,
          response: myOrganizationUnits,
          selectedOrganizationUnitId,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "BrotherEvents") {
    return (
      <BrotherEventsScreen
        screen={buildBrotherEventsScreen({
          state: brotherEventsState,
          response: brotherEvents,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "BrotherAnnouncements") {
    return (
      <BrotherAnnouncementsScreen
        screen={buildBrotherAnnouncementsScreen({
          state: brotherAnnouncementsState,
          response: brotherAnnouncements,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "BrotherPrayers") {
    return (
      <BrotherPrayersScreen
        screen={buildBrotherPrayersScreen({
          state: brotherPrayersState,
          response: brotherPrayers,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "BrotherEventDetail") {
    return (
      <BrotherEventDetailScreen
        screen={buildBrotherEventDetailScreen({
          state: brotherEventDetailState,
          response: brotherEventDetail,
          runtimeMode
        })}
        onAction={(action) => {
          if (isBrotherRoute(action.targetRoute)) {
            void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  return (
    <BrotherTodayScreen
      screen={buildBrotherTodayScreen({
        state: brotherTodayState,
        response: brotherToday,
        runtimeMode
      })}
      onAction={(action) => {
        if (isBrotherRoute(action.targetRoute)) {
          void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
        }
      }}
    />
  );
}
