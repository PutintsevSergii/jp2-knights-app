import { resolveMobileMode, type MobileMode, type Principal } from "@jp2/shared-auth";
import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicHomeResponseDto } from "@jp2/shared-validation";
import { fallbackPublicHome } from "./public-home.js";

export type MobileInitialRoute = "PublicHome" | "CandidateDashboard" | "BrotherToday";
export type MobileScreenState = "ready" | "loading" | "empty" | "error" | "forbidden" | "offline";

export interface MobileLaunchState {
  mode: MobileMode;
  initialRoute: MobileInitialRoute;
  state: MobileScreenState;
  publicHome?: PublicHomeResponseDto;
  runtimeMode: RuntimeMode;
  demoChromeVisible: boolean;
}

export interface ResolveMobileLaunchStateOptions {
  runtimeMode?: RuntimeMode;
  publicHome?: PublicHomeResponseDto;
  state?: MobileScreenState;
  useFallbackPublicHome?: boolean;
}

export function resolveMobileLaunchState(
  principal: Principal | null | undefined,
  options: ResolveMobileLaunchStateOptions = {}
): MobileLaunchState {
  const runtimeMode = options.runtimeMode ?? "api";
  const state = options.state ?? "ready";
  const mode = resolveMobileMode(principal);

  if (mode === "brother") {
    return baseState("brother", "BrotherToday", runtimeMode, state);
  }

  if (mode === "candidate") {
    return baseState("candidate", "CandidateDashboard", runtimeMode, state);
  }

  const publicHome =
    options.publicHome ??
    (options.useFallbackPublicHome === false ? undefined : fallbackPublicHome);

  return {
    ...baseState("public", "PublicHome", runtimeMode, state),
    ...(publicHome ? { publicHome } : {})
  };
}

function baseState(
  mode: MobileMode,
  initialRoute: MobileInitialRoute,
  runtimeMode: RuntimeMode,
  state: MobileScreenState
): MobileLaunchState {
  return {
    mode,
    initialRoute,
    state,
    runtimeMode,
    demoChromeVisible: runtimeMode === "demo"
  };
}
