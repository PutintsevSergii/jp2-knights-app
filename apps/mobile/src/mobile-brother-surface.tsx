import { useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
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
import {
  requirePrivateAuthToken,
  usePrivateRouteResource
} from "./mobile-private-resource.js";
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
  const [selectedOrganizationUnitId, setSelectedOrganizationUnitId] = useState<
    string | undefined
  >(() => fallbackMyOrganizationUnits.organizationUnits[0]?.id);
  const [selectedBrotherEventId, setSelectedBrotherEventId] = useState<string | undefined>();
  const brotherToday = usePrivateRouteResource({
    route,
    activeRoute: "BrotherToday",
    runtimeMode,
    authToken,
    initialApiState: "loading",
    demoData: fallbackBrotherToday,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherToday({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });
  const brotherProfile = usePrivateRouteResource({
    route,
    activeRoute: "BrotherProfile",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherProfile,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherProfile({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });
  const myOrganizationUnits = usePrivateRouteResource({
    route,
    activeRoute: route === "OrganizationUnitDetail" ? "OrganizationUnitDetail" : "MyOrganizationUnits",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackMyOrganizationUnits,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchMyOrganizationUnits({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });
  const brotherEvents = usePrivateRouteResource({
    route,
    activeRoute: "BrotherEvents",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherEvents,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherEvents({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });
  const brotherAnnouncements = usePrivateRouteResource({
    route,
    activeRoute: "BrotherAnnouncements",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherAnnouncements,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherAnnouncements({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });
  const brotherPrayers = usePrivateRouteResource({
    route,
    activeRoute: "BrotherPrayers",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherPrayers,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherPrayers({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });
  const brotherEventDetail = usePrivateRouteResource({
    route,
    activeRoute: "BrotherEventDetail",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherEventDetail,
    loadKey: `${publicApiBaseUrl}:${selectedBrotherEventId ?? ""}`,
    canLoad: Boolean(selectedBrotherEventId),
    load: () =>
      fetchBrotherEvent({
        id: selectedBrotherEventId ?? "",
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherCompanionLoadFailureState
  });

  async function handleBrotherRoute(nextRoute: BrotherRoute, targetId?: string, actionId?: string) {
    if (nextRoute === "SilentPrayer") {
      onRouteChange("BrotherToday");
      return;
    }

    if (nextRoute === "BrotherEventDetail") {
      setSelectedBrotherEventId(targetId);

      if (runtimeMode === "demo") {
        brotherEventDetail.setData(fallbackBrotherEventDetail);
        brotherEventDetail.setState(targetId ? "ready" : "empty");
      } else if (targetId && authToken && actionId === "plan-to-attend") {
        const response = await markBrotherEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        brotherEventDetail.setData((current) =>
          current
            ? {
                event: {
                  ...current.event,
                  currentUserParticipation: response.participation
                }
              }
            : current
        );
        brotherEventDetail.setState("ready");
      } else if (targetId && authToken && actionId === "cancel-participation") {
        const response = await cancelBrotherEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        brotherEventDetail.setData((current) =>
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
        brotherEventDetail.setState("ready");
      }
    }

    if (nextRoute === "OrganizationUnitDetail") {
      setSelectedOrganizationUnitId(targetId);

      if (runtimeMode === "demo") {
        myOrganizationUnits.setData(fallbackMyOrganizationUnits);
        myOrganizationUnits.setState(targetId ? "ready" : "empty");
      }
    }

    onRouteChange(nextRoute);
  }

  if (route === "BrotherProfile") {
    return (
      <PrivateContentScreen
        screen={buildBrotherProfileScreen({
          state: brotherProfile.state,
          response: brotherProfile.data,
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
          state: myOrganizationUnits.state,
          response: myOrganizationUnits.data,
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
          state: myOrganizationUnits.state,
          response: myOrganizationUnits.data,
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
          state: brotherEvents.state,
          response: brotherEvents.data,
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
          state: brotherAnnouncements.state,
          response: brotherAnnouncements.data,
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
          state: brotherPrayers.state,
          response: brotherPrayers.data,
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
          state: brotherEventDetail.state,
          response: brotherEventDetail.data,
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
        state: brotherToday.state,
        response: brotherToday.data,
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
