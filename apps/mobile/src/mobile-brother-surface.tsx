import { useRef, useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherSilentPrayerJoinResponseDto } from "@jp2/shared-validation";
import {
  brotherCompanionLoadFailureState,
  fetchBrotherAnnouncements,
  fetchBrotherEvent,
  fetchBrotherEvents,
  fetchBrotherProfile,
  fetchBrotherPrayers,
  fetchBrotherToday,
  fetchMyOrganizationUnits
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
  buildBrotherAnnouncementDetailScreen,
  buildBrotherAnnouncementsScreen,
  buildBrotherEventDetailScreen,
  buildBrotherEventsScreen,
  buildBrotherProfileScreen,
  buildBrotherPrayersScreen,
  buildBrotherRoadmapScreen,
  buildBrotherSilentPrayerScreen,
  buildBrotherTodayScreen,
  buildMyOrganizationUnitsScreen,
  buildOrganizationUnitDetailScreen
} from "./brother-screens.js";
import type { BrotherRoute } from "./brother-screens.js";
import { requirePrivateAuthToken, usePrivateRouteResource } from "./mobile-private-resource.js";
import {
  fetchBrotherRoadmap,
  roadmapLoadFailureState
} from "./roadmap-api.js";
import { fallbackBrotherRoadmap } from "./roadmap.js";
import {
  brotherSilentPrayerLoadFailureState,
  fetchBrotherSilentPrayerSessions
} from "./silent-prayer-api.js";
import { fallbackBrotherSilentPrayerSessions } from "./silent-prayer.js";
import type { SilentPrayerRealtimeSession } from "./silent-prayer-socket.js";
import { useBrotherRouteActions } from "./mobile-brother-route-actions.js";
import { BrotherAnnouncementsScreen } from "./screens/BrotherAnnouncementsScreen.js";
import { BrotherAnnouncementDetailScreen } from "./screens/BrotherAnnouncementDetailScreen.js";
import { BrotherEventDetailScreen } from "./screens/BrotherEventDetailScreen.js";
import { BrotherEventsScreen } from "./screens/BrotherEventsScreen.js";
import { BrotherProfileScreen } from "./screens/BrotherProfileScreen.js";
import { BrotherPrayersScreen } from "./screens/BrotherPrayersScreen.js";
import { BrotherRoadmapScreen } from "./screens/BrotherRoadmapScreen.js";
import { BrotherSilentPrayerScreen } from "./screens/BrotherSilentPrayerScreen.js";
import { BrotherTodayScreen } from "./screens/BrotherTodayScreen.js";
import { MyOrganizationUnitsScreen } from "./screens/MyOrganizationUnitsScreen.js";
import { OrganizationUnitDetailScreen } from "./screens/OrganizationUnitDetailScreen.js";

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
  const [selectedOrganizationUnitId, setSelectedOrganizationUnitId] = useState<string | undefined>(
    () => fallbackMyOrganizationUnits.organizationUnits[0]?.id
  );
  const [selectedBrotherEventId, setSelectedBrotherEventId] = useState<string | undefined>();
  const [selectedBrotherAnnouncementId, setSelectedBrotherAnnouncementId] = useState<
    string | undefined
  >();
  const [brotherSilentPrayerJoin, setBrotherSilentPrayerJoin] = useState<
    BrotherSilentPrayerJoinResponseDto | undefined
  >();
  const brotherSilentPrayerRealtime = useRef<SilentPrayerRealtimeSession | null>(null);
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
    activeRoute:
      route === "OrganizationUnitDetail" ? "OrganizationUnitDetail" : "MyOrganizationUnits",
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
    activeRoute:
      route === "BrotherAnnouncementDetail" ? "BrotherAnnouncementDetail" : "BrotherAnnouncements",
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
  const brotherRoadmap = usePrivateRouteResource({
    route,
    activeRoute: "BrotherRoadmap",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherRoadmap,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherRoadmap({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: roadmapLoadFailureState
  });
  const brotherSilentPrayer = usePrivateRouteResource({
    route,
    activeRoute: "SilentPrayer",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackBrotherSilentPrayerSessions,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchBrotherSilentPrayerSessions({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: brotherSilentPrayerLoadFailureState
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

  const { handleBrotherAction } = useBrotherRouteActions({
    route,
    runtimeMode,
    publicApiBaseUrl,
    authToken,
    onRouteChange,
    setSelectedOrganizationUnitId,
    setSelectedBrotherEventId,
    setSelectedBrotherAnnouncementId,
    setBrotherSilentPrayerJoin,
    brotherSilentPrayerRealtime,
    myOrganizationUnits,
    brotherAnnouncements,
    brotherRoadmap,
    brotherSilentPrayer,
    brotherEventDetail
  });

  if (route === "BrotherProfile") {
    return (
      <BrotherProfileScreen
        screen={buildBrotherProfileScreen({
          state: brotherProfile.state,
          response: brotherProfile.data,
          runtimeMode
        })}
        onAction={handleBrotherAction}
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
        onAction={handleBrotherAction}
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
        onAction={handleBrotherAction}
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
        onAction={handleBrotherAction}
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
        onAction={handleBrotherAction}
      />
    );
  }

  if (route === "BrotherAnnouncementDetail") {
    return (
      <BrotherAnnouncementDetailScreen
        screen={buildBrotherAnnouncementDetailScreen({
          state: brotherAnnouncements.state,
          response: brotherAnnouncements.data,
          selectedAnnouncementId: selectedBrotherAnnouncementId,
          runtimeMode
        })}
        onAction={handleBrotherAction}
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
        onAction={handleBrotherAction}
      />
    );
  }

  if (route === "BrotherRoadmap") {
    return (
      <BrotherRoadmapScreen
        screen={buildBrotherRoadmapScreen({
          state: brotherRoadmap.state,
          response: brotherRoadmap.data,
          runtimeMode
        })}
        onAction={handleBrotherAction}
      />
    );
  }

  if (route === "SilentPrayer") {
    return (
      <BrotherSilentPrayerScreen
        screen={buildBrotherSilentPrayerScreen({
          state: brotherSilentPrayer.state,
          response: brotherSilentPrayer.data,
          joined: brotherSilentPrayerJoin,
          runtimeMode
        })}
        onAction={handleBrotherAction}
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
        onAction={handleBrotherAction}
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
      onAction={handleBrotherAction}
    />
  );
}
