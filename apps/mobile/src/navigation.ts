import { resolveMobileMode, type MobileMode, type Principal } from "@jp2/shared-auth";
import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicHomeResponseDto } from "@jp2/shared-validation";
import { fallbackPublicHome } from "./public-home.js";

export type MobileInitialRoute = "PublicHome" | "CandidateDashboard" | "BrotherToday";
export type MobileScreenState =
  | "ready"
  | "loading"
  | "empty"
  | "error"
  | "forbidden"
  | "idleApproval"
  | "offline";

export interface MobileIdleApprovalState {
  state: "pending" | "rejected" | "expired";
  expiresAt: string | null;
  scopeOrganizationUnitId: string | null;
}

export type MobilePrincipal = Principal & {
  approval?: MobileIdleApprovalState | null;
};

export interface MobileLaunchState {
  mode: MobileMode;
  initialRoute: MobileInitialRoute;
  state: MobileScreenState;
  publicHome?: PublicHomeResponseDto;
  idleApproval?: MobileIdleApprovalState;
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
  principal: MobilePrincipal | null | undefined,
  options: ResolveMobileLaunchStateOptions = {}
): MobileLaunchState {
  const runtimeMode = options.runtimeMode ?? "api";
  const idleApproval = principal?.approval ?? undefined;
  const state = options.state ?? (idleApproval ? "idleApproval" : "ready");
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
    ...(publicHome ? { publicHome } : {}),
    ...(idleApproval ? { idleApproval } : {})
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
