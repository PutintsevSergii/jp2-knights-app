import { useEffect, useMemo, useState } from "react";
import { fetchPublicHome, publicHomeLoadFailureState, readPublicApiBaseUrl } from "./public-home-api.js";
import { resolveMobileLaunchState } from "./navigation.js";
import type { MobileLaunchState } from "./navigation.js";
import {
  currentUserLoadFailureState,
  fetchCurrentUser,
  readMobileAuthToken,
  toMobilePrincipal
} from "./mobile-auth-api.js";
import { MobileBrotherSurface } from "./mobile-brother-surface.js";
import { MobileCandidateSurface } from "./mobile-candidate-surface.js";
import { isBrotherRoute, isCandidateRoute, type MobileAppRoute } from "./mobile-routes.js";
import { MobilePublicSurface } from "./mobile-public-surface.js";
import { readMobileRuntimeMode } from "./runtime-config.js";

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

  if (isCandidateRoute(currentRoute)) {
    return (
      <MobileCandidateSurface
        route={currentRoute}
        runtimeMode={runtimeMode}
        publicApiBaseUrl={publicApiBaseUrl}
        authToken={authToken}
        onRouteChange={setCurrentRoute}
      />
    );
  }

  if (isBrotherRoute(currentRoute)) {
    return (
      <MobileBrotherSurface
        route={currentRoute}
        runtimeMode={runtimeMode}
        publicApiBaseUrl={publicApiBaseUrl}
        authToken={authToken}
        onRouteChange={setCurrentRoute}
      />
    );
  }

  return (
    <MobilePublicSurface
      route={currentRoute}
      runtimeMode={runtimeMode}
      publicApiBaseUrl={publicApiBaseUrl}
      launchState={launchState}
      onRouteChange={setCurrentRoute}
    />
  );
}
