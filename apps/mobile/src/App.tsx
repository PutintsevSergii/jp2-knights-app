import { useEffect, useMemo, useState } from "react";
import { resolveMobileLaunchState } from "./navigation.js";
import type { MobileLaunchState } from "./navigation.js";
import {
  fetchPublicHome,
  publicHomeLoadFailureState,
  readPublicApiBaseUrl
} from "./public-home-api.js";
import { buildPublicHomeScreen } from "./public-screens.js";
import { readMobileRuntimeMode } from "./runtime-config.js";
import { PublicHomeScreen } from "./screens/PublicHomeScreen.js";

export function App() {
  const runtimeMode = useMemo(() => readMobileRuntimeMode(), []);
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

    fetchPublicHome({ baseUrl: readPublicApiBaseUrl() })
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
  }, [runtimeMode]);

  return <PublicHomeScreen screen={buildPublicHomeScreen(launchState)} />;
}
