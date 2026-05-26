import { useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AssignedRoadmapResponseDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto,
  RoadmapSubmissionSummaryDto
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
  buildBrotherRoadmapScreen,
  buildBrotherSilentPrayerScreen,
  buildBrotherTodayScreen,
  buildMyOrganizationUnitsScreen,
  buildOrganizationUnitDetailScreen
} from "./brother-screens.js";
import type { BrotherRoute } from "./brother-screens.js";
import type { BrotherScreenAction } from "./brother-screen-contracts.js";
import { isBrotherRoute } from "./mobile-routes.js";
import { requirePrivateAuthToken, usePrivateRouteResource } from "./mobile-private-resource.js";
import {
  fetchBrotherRoadmap,
  roadmapLoadFailureState,
  submitBrotherRoadmapStep
} from "./roadmap-api.js";
import { fallbackBrotherRoadmap } from "./roadmap.js";
import {
  brotherSilentPrayerLoadFailureState,
  fetchBrotherSilentPrayerSessions,
  joinBrotherSilentPrayerSession
} from "./silent-prayer-api.js";
import {
  fallbackBrotherSilentPrayerJoin,
  fallbackBrotherSilentPrayerSessions
} from "./silent-prayer.js";
import { BrotherAnnouncementsScreen } from "./screens/BrotherAnnouncementsScreen.js";
import { BrotherEventDetailScreen } from "./screens/BrotherEventDetailScreen.js";
import { BrotherEventsScreen } from "./screens/BrotherEventsScreen.js";
import { BrotherPrayersScreen } from "./screens/BrotherPrayersScreen.js";
import { BrotherRoadmapScreen } from "./screens/BrotherRoadmapScreen.js";
import { BrotherSilentPrayerScreen } from "./screens/BrotherSilentPrayerScreen.js";
import { BrotherTodayScreen } from "./screens/BrotherTodayScreen.js";
import { MyOrganizationUnitsScreen } from "./screens/MyOrganizationUnitsScreen.js";
import { OrganizationUnitDetailScreen } from "./screens/OrganizationUnitDetailScreen.js";
import {
  PrivateContentScreen,
  type PrivateContentScreenAction
} from "./screens/PrivateContentScreen.js";

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
  const [brotherSilentPrayerJoin, setBrotherSilentPrayerJoin] = useState<
    BrotherSilentPrayerJoinResponseDto | undefined
  >();
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

  function handleBrotherAction(action: BrotherScreenAction) {
    if (isBrotherRoute(action.targetRoute)) {
      void handleBrotherRoute(
        action.targetRoute,
        action.targetId,
        action.id,
        action.submissionBody
      );
    }
  }

  function handlePrivateContentAction(action: PrivateContentScreenAction) {
    if (isBrotherRoute(action.targetRoute)) {
      void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
    }
  }

  async function handleBrotherRoute(
    nextRoute: BrotherRoute,
    targetId?: string,
    actionId?: string,
    submissionBody?: string
  ) {
    if (nextRoute === "SilentPrayer" && actionId === "join-silent-prayer" && targetId) {
      if (runtimeMode === "demo") {
        setBrotherSilentPrayerJoin(fallbackBrotherSilentPrayerJoin);
        brotherSilentPrayer.setData(fallbackBrotherSilentPrayerSessions);
        brotherSilentPrayer.setState("ready");
      } else if (authToken) {
        brotherSilentPrayer.setState("loading");

        try {
          const response = await joinBrotherSilentPrayerSession({
            id: targetId,
            baseUrl: publicApiBaseUrl,
            authToken
          });
          setBrotherSilentPrayerJoin(response);
          brotherSilentPrayer.setData((current) =>
            current ? applyBrotherSilentPrayerJoin(current, response) : current
          );
          brotherSilentPrayer.setState("ready");
        } catch (error: unknown) {
          brotherSilentPrayer.setState(brotherSilentPrayerLoadFailureState(error));
        }
      }

      onRouteChange("SilentPrayer");
      return;
    }

    if (nextRoute === "BrotherRoadmap" && actionId === "submit-roadmap-step" && targetId) {
      if (runtimeMode === "demo") {
        const submission = buildDemoRoadmapSubmission(
          brotherRoadmap.data ?? fallbackBrotherRoadmap,
          targetId,
          submissionBody ?? ""
        );
        brotherRoadmap.setData((current) =>
          applyRoadmapSubmission(current ?? fallbackBrotherRoadmap, targetId, submission)
        );
        brotherRoadmap.setState("ready");
      } else if (authToken && submissionBody) {
        brotherRoadmap.setState("loading");

        try {
          const response = await submitBrotherRoadmapStep({
            baseUrl: publicApiBaseUrl,
            authToken,
            stepId: targetId,
            body: submissionBody
          });
          brotherRoadmap.setData((current) =>
            current ? applyRoadmapSubmission(current, targetId, response.submission) : current
          );
          brotherRoadmap.setState("ready");
        } catch (error: unknown) {
          brotherRoadmap.setState(roadmapLoadFailureState(error));
        }
      }

      onRouteChange("BrotherRoadmap");
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
        onAction={handlePrivateContentAction}
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

function applyBrotherSilentPrayerJoin(
  current: BrotherSilentPrayerListResponseDto,
  joined: BrotherSilentPrayerJoinResponseDto
): BrotherSilentPrayerListResponseDto {
  return {
    ...current,
    sessions: current.sessions.map((session) =>
      session.id === joined.session.id ? joined.session : session
    )
  };
}

function applyRoadmapSubmission(
  response: AssignedRoadmapResponseDto,
  stepId: string,
  submission: RoadmapSubmissionSummaryDto
): AssignedRoadmapResponseDto {
  if (!response.roadmap) {
    return response;
  }

  return {
    roadmap: {
      ...response.roadmap,
      stages: response.roadmap.stages.map((stage) => ({
        ...stage,
        steps: stage.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                latestSubmission: submission
              }
            : step
        )
      }))
    }
  };
}

function buildDemoRoadmapSubmission(
  response: AssignedRoadmapResponseDto,
  stepId: string,
  body: string
): RoadmapSubmissionSummaryDto {
  return {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    assignmentId: response.roadmap?.assignmentId ?? "99999999-9999-4999-8999-999999999999",
    stepId,
    status: "pending_review",
    body,
    attachmentMetadata: [],
    reviewComment: null,
    reviewedAt: null,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:00.000Z"
  };
}
