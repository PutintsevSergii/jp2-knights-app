import { useEffect, useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  CandidateAnnouncementListResponseDto,
  CandidateDashboardResponseDto,
  CandidateEventDetailResponseDto,
  CandidateEventListResponseDto
} from "@jp2/shared-validation";
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
  buildCandidateDashboardScreen,
  buildCandidateEventDetailScreen,
  buildCandidateEventsScreen
} from "./candidate-screens.js";
import type { CandidateRoute } from "./candidate-screens.js";
import type { MobileScreenState } from "./navigation.js";
import { isCandidateRoute } from "./mobile-routes.js";
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
  const [candidateDashboardState, setCandidateDashboardState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "loading"
  );
  const [candidateDashboard, setCandidateDashboard] = useState<
    CandidateDashboardResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackCandidateDashboard : undefined));
  const [candidateEventsState, setCandidateEventsState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [candidateEvents, setCandidateEvents] = useState<
    CandidateEventListResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackCandidateEvents : undefined));
  const [candidateAnnouncementsState, setCandidateAnnouncementsState] =
    useState<MobileScreenState>(runtimeMode === "demo" ? "ready" : "empty");
  const [candidateAnnouncements, setCandidateAnnouncements] = useState<
    CandidateAnnouncementListResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackCandidateAnnouncements : undefined));
  const [selectedCandidateEventId, setSelectedCandidateEventId] = useState<string | undefined>();
  const [candidateEventDetailState, setCandidateEventDetailState] =
    useState<MobileScreenState>(runtimeMode === "demo" ? "ready" : "empty");
  const [candidateEventDetail, setCandidateEventDetail] = useState<
    CandidateEventDetailResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackCandidateEventDetail : undefined));

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "CandidateDashboard") {
      return;
    }

    if (!authToken) {
      setCandidateDashboardState("forbidden");
      return;
    }

    let cancelled = false;
    setCandidateDashboardState("loading");

    fetchCandidateDashboard({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setCandidateDashboard(response);
          setCandidateDashboardState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCandidateDashboard(undefined);
          setCandidateDashboardState(candidateDashboardLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "CandidateEvents") {
      return;
    }

    if (!authToken) {
      setCandidateEventsState("forbidden");
      return;
    }

    let cancelled = false;
    setCandidateEventsState("loading");

    fetchCandidateEvents({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setCandidateEvents(response);
          setCandidateEventsState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCandidateEvents(undefined);
          setCandidateEventsState(candidateDashboardLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "CandidateAnnouncements") {
      return;
    }

    if (!authToken) {
      setCandidateAnnouncementsState("forbidden");
      return;
    }

    let cancelled = false;
    setCandidateAnnouncementsState("loading");

    fetchCandidateAnnouncements({ baseUrl: publicApiBaseUrl, authToken })
      .then((response) => {
        if (!cancelled) {
          setCandidateAnnouncements(response);
          setCandidateAnnouncementsState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCandidateAnnouncements(undefined);
          setCandidateAnnouncementsState(candidateDashboardLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== "CandidateEventDetail" || !selectedCandidateEventId) {
      return;
    }

    if (!authToken) {
      setCandidateEventDetailState("forbidden");
      return;
    }

    let cancelled = false;
    setCandidateEventDetailState("loading");

    fetchCandidateEvent({
      id: selectedCandidateEventId,
      baseUrl: publicApiBaseUrl,
      authToken
    })
      .then((response) => {
        if (!cancelled) {
          setCandidateEventDetail(response);
          setCandidateEventDetailState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCandidateEventDetail(undefined);
          setCandidateEventDetailState(candidateDashboardLoadFailureState(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, publicApiBaseUrl, route, runtimeMode, selectedCandidateEventId]);

  async function handleCandidateRoute(
    nextRoute: CandidateRoute,
    targetId?: string,
    actionId?: string
  ) {
    if (nextRoute === "CandidateContact" || nextRoute === "CandidateRoadmap") {
      onRouteChange("CandidateDashboard");
      return;
    }

    if (nextRoute === "CandidateEvents" && targetId && actionId === "plan-to-attend") {
      if (runtimeMode === "demo") {
        setCandidateEvents((current) => markCandidateEventInList(current, targetId));
      } else if (authToken) {
        const response = await markCandidateEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        setCandidateEvents((current) =>
          markCandidateEventInList(current, targetId, response.participation)
        );
      }

      setCandidateEventsState("ready");
      onRouteChange("CandidateEvents");
      return;
    }

    if (nextRoute === "CandidateEventDetail") {
      setSelectedCandidateEventId(targetId);

      if (runtimeMode === "demo") {
        setCandidateEventDetail(fallbackCandidateEventDetail);
        setCandidateEventDetailState(targetId ? "ready" : "empty");
      } else if (targetId && authToken && actionId === "plan-to-attend") {
        const response = await markCandidateEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        setCandidateEventDetail((current) =>
          current
            ? {
                event: {
                  ...current.event,
                  currentUserParticipation: response.participation
                }
              }
            : current
        );
        setCandidateEventDetailState("ready");
      } else if (targetId && authToken && actionId === "cancel-participation") {
        const response = await cancelCandidateEventParticipation({
          id: targetId,
          baseUrl: publicApiBaseUrl,
          authToken
        });
        setCandidateEventDetail((current) =>
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
        setCandidateEventDetailState("ready");
      }
    }

    onRouteChange(nextRoute);
  }

  if (route === "CandidateEvents") {
    return (
      <CandidateEventsScreen
        screen={buildCandidateEventsScreen({
          state: candidateEventsState,
          response: candidateEvents,
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
      <PrivateContentScreen
        screen={buildCandidateAnnouncementsScreen({
          state: candidateAnnouncementsState,
          response: candidateAnnouncements,
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
      <PrivateContentScreen
        screen={buildCandidateEventDetailScreen({
          state: candidateEventDetailState,
          response: candidateEventDetail,
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
        state: candidateDashboardState,
        response: candidateDashboard,
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
