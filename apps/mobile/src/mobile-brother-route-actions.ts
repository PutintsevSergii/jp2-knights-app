import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AssignedRoadmapResponseDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto,
  MyOrganizationUnitsResponseDto,
  BrotherEventDetailResponseDto
} from "@jp2/shared-validation";
import {
  cancelBrotherEventParticipation,
  markBrotherEventParticipation
} from "./brother-companion-api.js";
import {
  fallbackBrotherEventDetail,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";
import type { BrotherRoute } from "./brother-screens.js";
import type { BrotherScreenAction } from "./brother-screen-contracts.js";
import { isBrotherRoute } from "./mobile-routes.js";
import type { PrivateRouteResource } from "./mobile-private-resource.js";
import {
  brotherSilentPrayerLoadFailureState,
  joinBrotherSilentPrayerSession
} from "./silent-prayer-api.js";
import {
  fallbackBrotherSilentPrayerJoin,
  fallbackBrotherSilentPrayerSessions
} from "./silent-prayer.js";
import {
  startBrotherSilentPrayerRealtime,
  type SilentPrayerRealtimeSession,
  type SilentPrayerSocketError
} from "./silent-prayer-socket.js";
import {
  buildDemoRoadmapSubmission,
  applyBrotherSilentPrayerJoin,
  applyBrotherSilentPrayerPresence,
  applyBrotherSilentPrayerPresenceToJoin,
  applyRoadmapSubmission
} from "./brother-surface-state.js";
import type { PrivateContentScreenAction } from "./screens/PrivateContentScreen.js";
import {
  fallbackBrotherRoadmap
} from "./roadmap.js";
import {
  roadmapLoadFailureState,
  submitBrotherRoadmapStep
} from "./roadmap-api.js";

export interface UseBrotherRouteActionsOptions {
  route: BrotherRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  authToken: string | undefined;
  onRouteChange: (route: BrotherRoute) => void;
  setSelectedOrganizationUnitId: (id: string | undefined) => void;
  setSelectedBrotherEventId: (id: string | undefined) => void;
  setBrotherSilentPrayerJoin: Dispatch<
    SetStateAction<BrotherSilentPrayerJoinResponseDto | undefined>
  >;
  brotherSilentPrayerRealtime: MutableRefObject<SilentPrayerRealtimeSession | null>;
  myOrganizationUnits: PrivateRouteResource<MyOrganizationUnitsResponseDto>;
  brotherRoadmap: PrivateRouteResource<AssignedRoadmapResponseDto>;
  brotherSilentPrayer: PrivateRouteResource<BrotherSilentPrayerListResponseDto>;
  brotherEventDetail: PrivateRouteResource<BrotherEventDetailResponseDto>;
}

export function useBrotherRouteActions(options: UseBrotherRouteActionsOptions) {
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
    if (options.route === "SilentPrayer" && nextRoute !== "SilentPrayer") {
      stopBrotherSilentPrayerRealtime(true);
    }

    if (nextRoute === "SilentPrayer" && actionId === "join-silent-prayer" && targetId) {
      await joinSilentPrayer(targetId);
      options.onRouteChange("SilentPrayer");
      return;
    }

    if (nextRoute === "BrotherRoadmap" && actionId === "submit-roadmap-step" && targetId) {
      await submitRoadmapStep(targetId, submissionBody);
      options.onRouteChange("BrotherRoadmap");
      return;
    }

    if (nextRoute === "BrotherEventDetail") {
      await openBrotherEventDetail(targetId, actionId);
    }

    if (nextRoute === "OrganizationUnitDetail") {
      options.setSelectedOrganizationUnitId(targetId);

      if (options.runtimeMode === "demo") {
        options.myOrganizationUnits.setData(fallbackMyOrganizationUnits);
        options.myOrganizationUnits.setState(targetId ? "ready" : "empty");
      }
    }

    options.onRouteChange(nextRoute);
  }

  async function joinSilentPrayer(targetId: string) {
    if (options.runtimeMode === "demo") {
      options.setBrotherSilentPrayerJoin(fallbackBrotherSilentPrayerJoin);
      options.brotherSilentPrayer.setData(fallbackBrotherSilentPrayerSessions);
      options.brotherSilentPrayer.setState("ready");
      return;
    }

    if (!options.authToken) {
      return;
    }

    options.brotherSilentPrayer.setState("loading");

    try {
      const response = await joinBrotherSilentPrayerSession({
        id: targetId,
        baseUrl: options.publicApiBaseUrl,
        authToken: options.authToken
      });
      options.setBrotherSilentPrayerJoin(response);
      options.brotherSilentPrayer.setData((current) =>
        current ? applyBrotherSilentPrayerJoin(current, response) : current
      );
      startBrotherSilentPrayerSocket(response);
      options.brotherSilentPrayer.setState("ready");
    } catch (error: unknown) {
      options.brotherSilentPrayer.setState(brotherSilentPrayerLoadFailureState(error));
    }
  }

  async function submitRoadmapStep(targetId: string, submissionBody: string | undefined) {
    if (options.runtimeMode === "demo") {
      const submission = buildDemoRoadmapSubmission(
        options.brotherRoadmap.data ?? fallbackBrotherRoadmap,
        targetId,
        submissionBody ?? ""
      );
      options.brotherRoadmap.setData((current) =>
        applyRoadmapSubmission(current ?? fallbackBrotherRoadmap, targetId, submission)
      );
      options.brotherRoadmap.setState("ready");
      return;
    }

    if (!options.authToken || !submissionBody) {
      return;
    }

    options.brotherRoadmap.setState("loading");

    try {
      const response = await submitBrotherRoadmapStep({
        baseUrl: options.publicApiBaseUrl,
        authToken: options.authToken,
        stepId: targetId,
        body: submissionBody
      });
      options.brotherRoadmap.setData((current) =>
        current ? applyRoadmapSubmission(current, targetId, response.submission) : current
      );
      options.brotherRoadmap.setState("ready");
    } catch (error: unknown) {
      options.brotherRoadmap.setState(roadmapLoadFailureState(error));
    }
  }

  async function openBrotherEventDetail(targetId: string | undefined, actionId: string | undefined) {
    options.setSelectedBrotherEventId(targetId);

    if (options.runtimeMode === "demo") {
      options.brotherEventDetail.setData(fallbackBrotherEventDetail);
      options.brotherEventDetail.setState(targetId ? "ready" : "empty");
      return;
    }

    if (!targetId || !options.authToken) {
      return;
    }

    if (actionId === "plan-to-attend") {
      const response = await markBrotherEventParticipation({
        id: targetId,
        baseUrl: options.publicApiBaseUrl,
        authToken: options.authToken
      });
      options.brotherEventDetail.setData((current) =>
        current
          ? {
              event: {
                ...current.event,
                currentUserParticipation: response.participation
              }
            }
          : current
      );
      options.brotherEventDetail.setState("ready");
    }

    if (actionId === "cancel-participation") {
      const response = await cancelBrotherEventParticipation({
        id: targetId,
        baseUrl: options.publicApiBaseUrl,
        authToken: options.authToken
      });
      options.brotherEventDetail.setData((current) =>
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
      options.brotherEventDetail.setState("ready");
    }
  }

  function startBrotherSilentPrayerSocket(response: BrotherSilentPrayerJoinResponseDto) {
    stopBrotherSilentPrayerRealtime(false);

    options.brotherSilentPrayerRealtime.current = startBrotherSilentPrayerRealtime({
      baseUrl: options.publicApiBaseUrl,
      eventId: response.session.id,
      authToken: options.authToken ?? "",
      onJoined: (joined) => {
        options.setBrotherSilentPrayerJoin(joined);
        options.brotherSilentPrayer.setData((current) =>
          current ? applyBrotherSilentPrayerJoin(current, joined) : current
        );
        options.brotherSilentPrayer.setState("ready");
      },
      onPresence: (presence) => {
        options.setBrotherSilentPrayerJoin((current) =>
          current ? applyBrotherSilentPrayerPresenceToJoin(current, presence) : current
        );
        options.brotherSilentPrayer.setData((current) =>
          current ? applyBrotherSilentPrayerPresence(current, presence) : current
        );
      },
      onError: handleBrotherSilentPrayerSocketError
    });
  }

  function stopBrotherSilentPrayerRealtime(emitLeave: boolean) {
    if (emitLeave) {
      options.brotherSilentPrayerRealtime.current?.leave();
    } else {
      options.brotherSilentPrayerRealtime.current?.disconnect();
    }

    options.brotherSilentPrayerRealtime.current = null;
  }

  function handleBrotherSilentPrayerSocketError(error: SilentPrayerSocketError) {
    if (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN") {
      options.brotherSilentPrayer.setState("forbidden");
      return;
    }

    if (error.code === "NOT_FOUND") {
      options.brotherSilentPrayer.setState("empty");
      return;
    }

    options.brotherSilentPrayer.setState("error");
  }

  return {
    handleBrotherAction,
    handlePrivateContentAction
  };
}
