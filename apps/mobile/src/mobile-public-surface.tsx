import { useEffect, useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type {
  PublicCandidateRequestResponseDto,
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
import {
  emptyJoinRequestFormDraft,
  fallbackPublicCandidateRequestResponse,
  submitDemoPublicCandidateRequest,
  type JoinRequestFormDraft
} from "./public-candidate-request.js";
import {
  publicCandidateRequestSubmitFailureState,
  submitPublicCandidateRequest
} from "./public-candidate-request-api.js";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";
import {
  buildAboutOrderScreen,
  buildIdleApprovalScreen,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  buildPublicHomeScreen,
  buildPublicPrayerDetailScreen,
  buildPublicPrayerCategoriesScreen,
  buildSignInScreen,
  JOIN_REQUEST_CONSENT_TEXT_VERSION
} from "./public-screens.js";
import type { JoinRequestFieldId, PublicRoute, SignInFieldId } from "./public-screens.js";
import { AboutOrderScreen } from "./screens/AboutOrderScreen.js";
import { IdleApprovalScreen } from "./screens/IdleApprovalScreen.js";
import { JoinRequestConfirmationScreen } from "./screens/JoinRequestConfirmationScreen.js";
import { JoinRequestFormScreen } from "./screens/JoinRequestFormScreen.js";
import { PublicContentDetailScreen } from "./screens/PublicContentDetailScreen.js";
import { PublicContentListScreen } from "./screens/PublicContentListScreen.js";
import { PublicHomeScreen } from "./screens/PublicHomeScreen.js";
import { SignInScreen } from "./screens/SignInScreen.js";

export interface MobilePublicSurfaceProps {
  route: PublicRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  launchState: MobileLaunchState;
  onRouteChange: (route: PublicRoute) => void;
}

export function MobilePublicSurface({
  route,
  runtimeMode,
  publicApiBaseUrl,
  launchState,
  onRouteChange
}: MobilePublicSurfaceProps) {
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
  const [joinRequestState, setJoinRequestState] = useState<MobileScreenState>("ready");
  const [joinRequestDraft, setJoinRequestDraft] = useState<JoinRequestFormDraft>({
    ...emptyJoinRequestFormDraft
  });
  const [joinRequestConsentAccepted, setJoinRequestConsentAccepted] = useState(false);
  const [joinRequestErrorMessage, setJoinRequestErrorMessage] = useState<string | undefined>();
  const [joinRequestResponse, setJoinRequestResponse] = useState<
    PublicCandidateRequestResponseDto | undefined
  >();
  const [signInValues, setSignInValues] = useState<Record<SignInFieldId, string>>({
    email: "",
    password: ""
  });
  const [signInErrorMessage, setSignInErrorMessage] = useState<string | undefined>();

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

  function handleJoinRequestFieldChange(field: JoinRequestFieldId, value: string) {
    setJoinRequestDraft((current) => ({
      ...current,
      [field]: value
    }));
    setJoinRequestErrorMessage(undefined);
  }

  function handleJoinRequestConsentAcceptedChange(accepted: boolean) {
    setJoinRequestConsentAccepted(accepted);
    setJoinRequestErrorMessage(undefined);
  }

  function handleSignInFieldChange(field: SignInFieldId, value: string) {
    setSignInValues((current) => ({
      ...current,
      [field]: value
    }));
    setSignInErrorMessage(undefined);
  }

  function handleSignInSubmit() {
    setSignInErrorMessage(
      "Provider sign-in is not configured in this Expo shell yet. Use an approved bearer token for API-mode development."
    );
  }

  async function handleJoinRequestSubmit() {
    setJoinRequestState("loading");
    setJoinRequestErrorMessage(undefined);

    try {
      const request = buildJoinRequestPayload(
        joinRequestDraft,
        joinRequestConsentAccepted,
        createJoinRequestIdempotencyKey()
      );
      const response =
        runtimeMode === "demo"
          ? await submitDemoPublicCandidateRequest(request)
          : await submitPublicCandidateRequest({
              baseUrl: publicApiBaseUrl,
              request
            });

      setJoinRequestResponse(response);
      setJoinRequestState("ready");
      setJoinRequestDraft({ ...emptyJoinRequestFormDraft });
      setJoinRequestConsentAccepted(false);
      onRouteChange("JoinRequestConfirmation");
    } catch (error: unknown) {
      const failureState = publicCandidateRequestSubmitFailureState(error);
      setJoinRequestState(failureState === "offline" ? "offline" : "ready");
      setJoinRequestErrorMessage(joinRequestSubmitErrorMessage(error));
    }
  }

  if (route === "AboutOrder") {
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

  if (route === "PublicPrayerCategories") {
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

  if (route === "PublicEventsList") {
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

  if (route === "PublicPrayerDetail") {
    return (
      <PublicContentDetailScreen
        screen={buildPublicPrayerDetailScreen({
          state: publicPrayerDetailState,
          response: publicPrayerDetail,
          runtimeMode
        })}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (route === "PublicEventDetail") {
    return (
      <PublicContentDetailScreen
        screen={buildPublicEventDetailScreen({
          state: publicEventDetailState,
          response: publicEventDetail,
          runtimeMode
        })}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (route === "JoinRequestForm") {
    return (
      <JoinRequestFormScreen
        screen={buildJoinRequestFormScreen({
          state: joinRequestState,
          runtimeMode,
          errorMessage: joinRequestErrorMessage
        })}
        draft={joinRequestDraft}
        consentAccepted={joinRequestConsentAccepted}
        onChangeField={handleJoinRequestFieldChange}
        onConsentAcceptedChange={handleJoinRequestConsentAcceptedChange}
        onSubmit={() => {
          void handleJoinRequestSubmit();
        }}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (route === "Login") {
    return (
      <SignInScreen
        screen={buildSignInScreen({
          state: "ready",
          runtimeMode,
          errorMessage: signInErrorMessage
        })}
        values={signInValues}
        onChangeField={handleSignInFieldChange}
        onSubmit={handleSignInSubmit}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (route === "IdleApproval") {
    return (
      <IdleApprovalScreen
        screen={buildIdleApprovalScreen({ launchState })}
        onNavigate={handlePublicRoute}
      />
    );
  }

  if (route === "JoinRequestConfirmation") {
    return (
      <JoinRequestConfirmationScreen
        screen={buildJoinRequestConfirmationScreen({
          state: "ready",
          response:
            runtimeMode === "demo" && !joinRequestResponse
              ? fallbackPublicCandidateRequestResponse
              : joinRequestResponse,
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

function buildJoinRequestPayload(
  draft: JoinRequestFormDraft,
  consentAccepted: boolean,
  idempotencyKey: string
) {
  return {
    firstName: draft.firstName,
    lastName: draft.lastName,
    email: draft.email,
    phone: optionalNullable(draft.phone),
    country: draft.country,
    city: draft.city,
    preferredLanguage: optionalNullable(draft.preferredLanguage),
    message: optionalNullable(draft.message),
    consentAccepted,
    consentTextVersion: JOIN_REQUEST_CONSENT_TEXT_VERSION,
    idempotencyKey
  };
}

function optionalNullable(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function createJoinRequestIdempotencyKey() {
  return `mobile-${Date.now()}`;
}

function joinRequestSubmitErrorMessage(error: unknown) {
  if (publicCandidateRequestSubmitFailureState(error) === "offline") {
    return "Reconnect to submit your interest request.";
  }

  return "Check the required fields and consent, then try again.";
}
