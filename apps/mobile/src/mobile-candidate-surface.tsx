import { useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateEventListResponseDto } from "@jp2/shared-validation";
import {
  candidateDashboardLoadFailureState,
  cancelCandidateEventParticipation,
  fetchCandidateAnnouncements,
  fetchCandidateDashboard,
  fetchCandidateEvent,
  fetchCandidateEvents,
  markCandidateEventParticipation
} from "./candidate-dashboard-api.js";
import {
  fallbackCandidateAnnouncements,
  fallbackCandidateDashboard,
  fallbackCandidateEventDetail,
  fallbackCandidateEvents
} from "./candidate-dashboard.js";
import {
  buildCandidateAnnouncementsScreen,
  buildCandidateAnnouncementDetailScreen,
  buildCandidateContactScreen,
  buildCandidateDashboardScreen,
  buildCandidateEventDetailScreen,
  buildCandidateEventsScreen,
  buildCandidateRoadmapScreen
} from "./candidate-screens.js";
import type { CandidateRoute } from "./candidate-screens.js";
import { isCandidateRoute } from "./mobile-routes.js";
import {
  requirePrivateAuthToken,
  usePrivateRouteResource
} from "./mobile-private-resource.js";
import { fetchCandidateRoadmap, roadmapLoadFailureState } from "./roadmap-api.js";
import { fallbackCandidateRoadmap } from "./roadmap.js";
import { CandidateAnnouncementsScreen } from "./screens/CandidateAnnouncementsScreen.js";
import { CandidateAnnouncementDetailScreen } from "./screens/CandidateAnnouncementDetailScreen.js";
import { CandidateContactScreen } from "./screens/CandidateContactScreen.js";
import { CandidateEventDetailScreen } from "./screens/CandidateEventDetailScreen.js";
import { CandidateEventsScreen } from "./screens/CandidateEventsScreen.js";
import { PrivateContentScreen } from "./screens/PrivateContentScreen.js";

export interface MobileCandidateSurfaceProps {
  route: CandidateRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  authToken: string | undefined;
  onRouteChange: (route: CandidateRoute) => void;
}

export function MobileCandidateSurface({
  route,
  runtimeMode,
  publicApiBaseUrl,
  authToken,
  onRouteChange
}: MobileCandidateSurfaceProps) {
  const [selectedCandidateEventId, setSelectedCandidateEventId] = useState<string | undefined>();
  const [selectedCandidateAnnouncementId, setSelectedCandidateAnnouncementId] = useState<
    string | undefined
  >();
  const candidateDashboard = usePrivateRouteResource({
    route,
    activeRoute: route === "CandidateContact" ? "CandidateContact" : "CandidateDashboard",
    runtimeMode,
    authToken,
    initialApiState: "loading",
    demoData: fallbackCandidateDashboard,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchCandidateDashboard({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: candidateDashboardLoadFailureState
  });
  const candidateEvents = usePrivateRouteResource({
    route,
    activeRoute: "CandidateEvents",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackCandidateEvents,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchCandidateEvents({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: candidateDashboardLoadFailureState
  });
  const candidateAnnouncements = usePrivateRouteResource({
    route,
    activeRoute:
      route === "CandidateAnnouncementDetail"
        ? "CandidateAnnouncementDetail"
        : "CandidateAnnouncements",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackCandidateAnnouncements,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchCandidateAnnouncements({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: candidateDashboardLoadFailureState
  });
  const candidateRoadmap = usePrivateRouteResource({
    route,
    activeRoute: "CandidateRoadmap",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackCandidateRoadmap,
    loadKey: publicApiBaseUrl,
    load: () =>
      fetchCandidateRoadmap({
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: roadmapLoadFailureState
  });
  const candidateEventDetail = usePrivateRouteResource({
    route,
    activeRoute: "CandidateEventDetail",
    runtimeMode,
    authToken,
    initialApiState: "empty",
    demoData: fallbackCandidateEventDetail,
    loadKey: `${publicApiBaseUrl}:${selectedCandidateEventId ?? ""}`,
    canLoad: Boolean(selectedCandidateEventId),
    load: () =>
      fetchCandidateEvent({
        id: selectedCandidateEventId ?? "",
        baseUrl: publicApiBaseUrl,
        authToken: requirePrivateAuthToken(authToken)
      }),
    failureState: candidateDashboardLoadFailureState
  });

  async function handleCandidateRoute(
    nextRoute: CandidateRoute,
    targetId?: string,
    actionId?: string
  ) {
    if (nextRoute === "CandidateEvents" && targetId && actionId === "plan-to-attend") {
      if (runtimeMode === "demo") {
        candidateEvents.setData((current) => markCandidateEventInList(current, targetId));
      } else if (authToken) {
        const response = await markCandidateEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        candidateEvents.setData((current) =>
          markCandidateEventInList(current, targetId, response.participation)
        );
      }

      candidateEvents.setState("ready");
      onRouteChange("CandidateEvents");
      return;
    }

    if (nextRoute === "CandidateEventDetail") {
      setSelectedCandidateEventId(targetId);

      if (runtimeMode === "demo") {
        candidateEventDetail.setData(fallbackCandidateEventDetail);
        candidateEventDetail.setState(targetId ? "ready" : "empty");
      } else if (targetId && authToken && actionId === "plan-to-attend") {
        const response = await markCandidateEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        candidateEventDetail.setData((current) =>
          current
            ? {
                event: {
                  ...current.event,
                  currentUserParticipation: response.participation
                }
              }
            : current
        );
        candidateEventDetail.setState("ready");
      } else if (targetId && authToken && actionId === "cancel-participation") {
        const response = await cancelCandidateEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        candidateEventDetail.setData((current) =>
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
        candidateEventDetail.setState("ready");
      }
    }

    if (nextRoute === "CandidateAnnouncementDetail") {
      setSelectedCandidateAnnouncementId(targetId);

      if (runtimeMode === "demo") {
        candidateAnnouncements.setData(fallbackCandidateAnnouncements);
        candidateAnnouncements.setState(targetId ? "ready" : "empty");
      }
    }

    onRouteChange(nextRoute);
  }

  if (route === "CandidateEvents") {
    return (
      <CandidateEventsScreen
        screen={buildCandidateEventsScreen({
          state: candidateEvents.state,
          response: candidateEvents.data,
          runtimeMode
        })}
        onAction={(action) => {
          if (isCandidateRoute(action.targetRoute)) {
            void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "CandidateAnnouncements") {
    return (
      <CandidateAnnouncementsScreen
        screen={buildCandidateAnnouncementsScreen({
          state: candidateAnnouncements.state,
          response: candidateAnnouncements.data,
          runtimeMode
        })}
        onAction={(action) => {
          if (isCandidateRoute(action.targetRoute)) {
            void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "CandidateAnnouncementDetail") {
    return (
      <CandidateAnnouncementDetailScreen
        screen={buildCandidateAnnouncementDetailScreen({
          state: candidateAnnouncements.state,
          response: candidateAnnouncements.data,
          selectedAnnouncementId: selectedCandidateAnnouncementId,
          runtimeMode
        })}
        onAction={(action) => {
          if (isCandidateRoute(action.targetRoute)) {
            void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "CandidateEventDetail") {
    return (
      <CandidateEventDetailScreen
        screen={buildCandidateEventDetailScreen({
          state: candidateEventDetail.state,
          response: candidateEventDetail.data,
          runtimeMode
        })}
        onAction={(action) => {
          if (isCandidateRoute(action.targetRoute)) {
            void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "CandidateRoadmap") {
    return (
      <PrivateContentScreen
        screen={buildCandidateRoadmapScreen({
          state: candidateRoadmap.state,
          response: candidateRoadmap.data,
          runtimeMode
        })}
        onAction={(action) => {
          if (isCandidateRoute(action.targetRoute)) {
            void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  if (route === "CandidateContact") {
    return (
      <CandidateContactScreen
        screen={buildCandidateContactScreen({
          state: candidateDashboard.state,
          response: candidateDashboard.data,
          runtimeMode
        })}
        onAction={(action) => {
          if (isCandidateRoute(action.targetRoute)) {
            void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
          }
        }}
      />
    );
  }

  return (
    <PrivateContentScreen
      screen={buildCandidateDashboardScreen({
        state: candidateDashboard.state,
        response: candidateDashboard.data,
        runtimeMode
      })}
      onAction={(action) => {
        if (isCandidateRoute(action.targetRoute)) {
          void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
        }
      }}
    />
  );
}

function markCandidateEventInList(
  current: CandidateEventListResponseDto | undefined,
  eventId: string,
  participation: CandidateEventListResponseDto["events"][number]["currentUserParticipation"] = {
    id: "99999999-9999-4999-8999-999999999999",
    eventId,
    intentStatus: "planning_to_attend",
    createdAt: new Date().toISOString(),
    cancelledAt: null
  }
): CandidateEventListResponseDto | undefined {
  if (!current) {
    return current;
  }

  return {
    ...current,
    events: current.events.map((event) =>
      event.id === eventId
        ? {
            ...event,
            currentUserParticipation: participation
          }
        : event
    )
  };
}
