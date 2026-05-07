import { useEffect, useMemo, useState } from "react";
import {
  brotherCompanionLoadFailureState,
  cancelBrotherEventParticipation,
  fetchBrotherAnnouncements,
  fetchBrotherEvent,
  fetchBrotherEvents,
  fetchBrotherProfile,
  fetchBrotherToday,
  fetchMyOrganizationUnits,
  markBrotherEventParticipation
} from "./brother-companion-api.js";
import {
  fallbackBrotherAnnouncements,
  fallbackBrotherEventDetail,
  fallbackBrotherEvents,
  fallbackBrotherProfile,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";
import {
  buildBrotherAnnouncementsScreen,
  buildBrotherEventDetailScreen,
  buildBrotherEventsScreen,
  buildBrotherProfileScreen,
  buildBrotherTodayScreen,
  buildMyOrganizationUnitsScreen,
  type BrotherRoute
} from "./brother-screens.js";
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
  buildCandidateEventsScreen,
  type CandidateRoute
} from "./candidate-screens.js";
import { resolveMobileLaunchState } from "./navigation.js";
import type { MobileLaunchState, MobileScreenState } from "./navigation.js";
import {
  currentUserLoadFailureState,
  fetchCurrentUser,
  readMobileAuthToken,
  toMobilePrincipal
} from "./mobile-auth-api.js";
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
import {
  fetchPublicHome,
  publicHomeLoadFailureState,
  readPublicApiBaseUrl
} from "./public-home-api.js";
import {
  buildAboutOrderScreen,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  buildPublicHomeScreen,
  buildPublicPrayerDetailScreen,
  buildPublicPrayerCategoriesScreen,
  JOIN_REQUEST_CONSENT_TEXT_VERSION
} from "./public-screens.js";
import type { JoinRequestFieldId, PublicRoute } from "./public-screens.js";
import { readMobileRuntimeMode } from "./runtime-config.js";
import { AboutOrderScreen } from "./screens/AboutOrderScreen.js";
import { JoinRequestConfirmationScreen } from "./screens/JoinRequestConfirmationScreen.js";
import { JoinRequestFormScreen } from "./screens/JoinRequestFormScreen.js";
import {
  PrivateContentScreen,
  type PrivateContentScreenAction
} from "./screens/PrivateContentScreen.js";
import { PublicContentDetailScreen } from "./screens/PublicContentDetailScreen.js";
import { PublicContentListScreen } from "./screens/PublicContentListScreen.js";
import { PublicHomeScreen } from "./screens/PublicHomeScreen.js";
import type {
  BrotherAnnouncementListResponseDto,
  BrotherEventDetailResponseDto,
  BrotherEventListResponseDto,
  BrotherProfileResponseDto,
  BrotherTodayResponseDto,
  CandidateAnnouncementListResponseDto,
  CandidateDashboardResponseDto,
  CandidateEventDetailResponseDto,
  CandidateEventListResponseDto,
  MyOrganizationUnitsResponseDto,
  PublicCandidateRequestResponseDto,
  PublicContentPageResponseDto,
  PublicEventDetailResponseDto,
  PublicEventListResponseDto,
  PublicPrayerDetailResponseDto,
  PublicPrayerListResponseDto
} from "@jp2/shared-validation";

type MobileAppRoute = PublicRoute | CandidateRoute | BrotherRoute;

export function App() {
  const runtimeMode = useMemo(() => readMobileRuntimeMode(), []);
  const publicApiBaseUrl = useMemo(() => readPublicApiBaseUrl(), []);
  const authToken = useMemo(() => readMobileAuthToken(), []);
  const [currentRoute, setCurrentRoute] = useState<MobileAppRoute>("PublicHome");
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
  >(() => (runtimeMode === "demo" ? undefined : undefined));
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
  const [myOrganizationUnitsState, setMyOrganizationUnitsState] =
    useState<MobileScreenState>(runtimeMode === "demo" ? "ready" : "empty");
  const [myOrganizationUnits, setMyOrganizationUnits] = useState<
    MyOrganizationUnitsResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackMyOrganizationUnits : undefined));
  const [brotherEventsState, setBrotherEventsState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherEvents, setBrotherEvents] = useState<BrotherEventListResponseDto | undefined>(() =>
    runtimeMode === "demo" ? fallbackBrotherEvents : undefined
  );
  const [brotherAnnouncementsState, setBrotherAnnouncementsState] =
    useState<MobileScreenState>(runtimeMode === "demo" ? "ready" : "empty");
  const [brotherAnnouncements, setBrotherAnnouncements] = useState<
    BrotherAnnouncementListResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackBrotherAnnouncements : undefined));
  const [selectedBrotherEventId, setSelectedBrotherEventId] = useState<string | undefined>();
  const [brotherEventDetailState, setBrotherEventDetailState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : "empty"
  );
  const [brotherEventDetail, setBrotherEventDetail] = useState<
    BrotherEventDetailResponseDto | undefined
  >(() => (runtimeMode === "demo" ? fallbackBrotherEventDetail : undefined));

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
    if (runtimeMode === "demo" || !authToken) {
      return;
    }

    let cancelled = false;

    fetchCurrentUser({ baseUrl: publicApiBaseUrl, authToken })
      .then((currentUser) => {
        if (cancelled) {
          return;
        }

        const nextLaunchState = resolveMobileLaunchState(toMobilePrincipal(currentUser), {
          runtimeMode,
          ...(launchState.publicHome ? { publicHome: launchState.publicHome } : {}),
          useFallbackPublicHome: false
        });
        setLaunchState(nextLaunchState);
        setCurrentRoute(nextLaunchState.initialRoute);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLaunchState((current) => ({
            ...current,
            state: currentUserLoadFailureState(error)
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, launchState.publicHome, publicApiBaseUrl, runtimeMode]);

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

  useEffect(() => {
    if (
      runtimeMode === "demo" ||
      currentRoute !== "PublicPrayerDetail" ||
      !selectedPublicPrayerId
    ) {
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
  }, [currentRoute, publicApiBaseUrl, runtimeMode, selectedPublicPrayerId]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "PublicEventDetail" || !selectedPublicEventId) {
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
  }, [currentRoute, publicApiBaseUrl, runtimeMode, selectedPublicEventId]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "CandidateDashboard") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "CandidateEvents") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "CandidateAnnouncements") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (
      runtimeMode === "demo" ||
      currentRoute !== "CandidateEventDetail" ||
      !selectedCandidateEventId
    ) {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode, selectedCandidateEventId]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "BrotherToday") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "BrotherProfile") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "MyOrganizationUnits") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "BrotherEvents") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "BrotherAnnouncements") {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode]);

  useEffect(() => {
    if (runtimeMode === "demo" || currentRoute !== "BrotherEventDetail" || !selectedBrotherEventId) {
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
  }, [authToken, currentRoute, publicApiBaseUrl, runtimeMode, selectedBrotherEventId]);

  function handlePublicRoute(route: PublicRoute, targetId?: string) {
    if (
      route === "PublicHome" ||
      route === "AboutOrder" ||
      route === "PublicPrayerCategories" ||
      route === "PublicEventsList" ||
      route === "PublicPrayerDetail" ||
      route === "PublicEventDetail" ||
      route === "JoinRequestForm" ||
      route === "JoinRequestConfirmation"
    ) {
      if (route === "PublicPrayerDetail") {
        setSelectedPublicPrayerId(targetId);
        if (runtimeMode === "demo") {
          setPublicPrayerDetail(fallbackPublicPrayerDetail);
          setPublicPrayerDetailState(targetId ? "ready" : "empty");
        }
      }

      if (route === "PublicEventDetail") {
        setSelectedPublicEventId(targetId);
        if (runtimeMode === "demo") {
          setPublicEventDetail(fallbackPublicEventDetail);
          setPublicEventDetailState(targetId ? "ready" : "empty");
        }
      }

      setCurrentRoute(route);
    }
  }

  function handlePrivateAction(action: PrivateContentScreenAction) {
    if (isCandidateRoute(action.targetRoute)) {
      void handleCandidateRoute(action.targetRoute, action.targetId, action.id);
      return;
    }

    void handleBrotherRoute(action.targetRoute, action.targetId, action.id);
  }

  async function handleCandidateRoute(route: CandidateRoute, targetId?: string, actionId?: string) {
    if (route === "CandidateContact" || route === "CandidateRoadmap") {
      setCurrentRoute("CandidateDashboard");
      return;
    }

    if (route === "CandidateEventDetail") {
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

    setCurrentRoute(route);
  }

  async function handleBrotherRoute(route: BrotherRoute, targetId?: string, actionId?: string) {
    if (route === "BrotherPrayers" || route === "SilentPrayer") {
      setCurrentRoute("BrotherToday");
      return;
    }

    if (route === "BrotherEventDetail") {
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

    setCurrentRoute(route);
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
      setCurrentRoute("JoinRequestConfirmation");
    } catch (error: unknown) {
      const failureState = publicCandidateRequestSubmitFailureState(error);
      setJoinRequestState(failureState === "offline" ? "offline" : "ready");
      setJoinRequestErrorMessage(joinRequestSubmitErrorMessage(error));
    }
  }

  if (currentRoute === "CandidateDashboard") {
    return (
      <PrivateContentScreen
        screen={buildCandidateDashboardScreen({
          state: candidateDashboardState,
          response: candidateDashboard,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "CandidateEvents") {
    return (
      <PrivateContentScreen
        screen={buildCandidateEventsScreen({
          state: candidateEventsState,
          response: candidateEvents,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "CandidateAnnouncements") {
    return (
      <PrivateContentScreen
        screen={buildCandidateAnnouncementsScreen({
          state: candidateAnnouncementsState,
          response: candidateAnnouncements,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "CandidateEventDetail") {
    return (
      <PrivateContentScreen
        screen={buildCandidateEventDetailScreen({
          state: candidateEventDetailState,
          response: candidateEventDetail,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "BrotherToday") {
    return (
      <PrivateContentScreen
        screen={buildBrotherTodayScreen({
          state: brotherTodayState,
          response: brotherToday,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "BrotherProfile") {
    return (
      <PrivateContentScreen
        screen={buildBrotherProfileScreen({
          state: brotherProfileState,
          response: brotherProfile,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "MyOrganizationUnits") {
    return (
      <PrivateContentScreen
        screen={buildMyOrganizationUnitsScreen({
          state: myOrganizationUnitsState,
          response: myOrganizationUnits,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "BrotherEvents") {
    return (
      <PrivateContentScreen
        screen={buildBrotherEventsScreen({
          state: brotherEventsState,
          response: brotherEvents,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "BrotherAnnouncements") {
    return (
      <PrivateContentScreen
        screen={buildBrotherAnnouncementsScreen({
          state: brotherAnnouncementsState,
          response: brotherAnnouncements,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
  }

  if (currentRoute === "BrotherEventDetail") {
    return (
      <PrivateContentScreen
        screen={buildBrotherEventDetailScreen({
          state: brotherEventDetailState,
          response: brotherEventDetail,
          runtimeMode
        })}
        onAction={handlePrivateAction}
      />
    );
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

  if (currentRoute === "PublicPrayerDetail") {
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

  if (currentRoute === "PublicEventDetail") {
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

  if (currentRoute === "JoinRequestForm") {
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

  if (currentRoute === "JoinRequestConfirmation") {
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

function isCandidateRoute(route: CandidateRoute | BrotherRoute): route is CandidateRoute {
  return (
    route === "CandidateDashboard" ||
    route === "CandidateContact" ||
    route === "CandidateRoadmap" ||
    route === "CandidateEvents" ||
    route === "CandidateAnnouncements" ||
    route === "CandidateEventDetail"
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
