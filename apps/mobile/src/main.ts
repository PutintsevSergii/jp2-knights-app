import { designTokens } from "@jp2/shared-design-tokens";
import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
export { fallbackPublicHome } from "./public-home.js";
export {
  buildPublicEventDetailUrl,
  buildPublicPrayerDetailUrl,
  fetchPublicEvent,
  fetchPublicPrayer,
  publicContentDetailLoadFailureState
} from "./public-content-detail-api.js";
export {
  buildPublicEventListUrl,
  buildPublicPrayerListUrl,
  fetchPublicEvents,
  fetchPublicPrayers,
  publicContentListLoadFailureState
} from "./public-content-list-api.js";
export {
  buildPublicContentPageUrl,
  fetchPublicContentPage,
  publicContentPageLoadFailureState
} from "./public-content-api.js";
export {
  buildPublicCandidateRequestUrl,
  publicCandidateRequestSubmitFailureState,
  submitPublicCandidateRequest
} from "./public-candidate-request-api.js";
export {
  buildCandidateDashboardUrl,
  candidateDashboardLoadFailureState,
  fetchCandidateDashboard
} from "./candidate-dashboard-api.js";
export { fallbackCandidateDashboard } from "./candidate-dashboard.js";
export {
  brotherCompanionLoadFailureState,
  buildBrotherProfileUrl,
  buildBrotherTodayUrl,
  fetchBrotherProfile,
  fetchBrotherToday
} from "./brother-companion-api.js";
export { fallbackBrotherProfile, fallbackBrotherToday } from "./brother-companion.js";
export {
  emptyJoinRequestFormDraft,
  fallbackPublicCandidateRequestResponse,
  submitDemoPublicCandidateRequest
} from "./public-candidate-request.js";
export type { JoinRequestFormDraft } from "./public-candidate-request.js";
export {
  fallbackAboutOrderContentPage,
  fallbackPublicEventDetail,
  fallbackPublicEvents,
  fallbackPublicPrayerDetail,
  fallbackPublicPrayers
} from "./public-content.js";
export {
  buildPublicHomeUrl,
  fetchPublicHome,
  publicHomeLoadFailureState,
  readPublicApiBaseUrl
} from "./public-home-api.js";
export { mobileRuntimeConfig, readMobileRuntimeMode } from "./runtime-config.js";
export { resolveMobileLaunchState } from "./navigation.js";
export { buildCandidateDashboardScreen } from "./candidate-screens.js";
export { buildBrotherProfileScreen, buildBrotherTodayScreen } from "./brother-screens.js";
export type {
  BrotherProfileScreen,
  BrotherRoute,
  BrotherScreenAction,
  BrotherScreenSection,
  BrotherScreenTheme,
  BrotherTodayScreen
} from "./brother-screens.js";
export type {
  CandidateDashboardScreen,
  CandidateRoute,
  CandidateScreenAction,
  CandidateScreenSection,
  CandidateScreenTheme
} from "./candidate-screens.js";
export {
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
export type {
  MobileIdleApprovalState,
  MobileInitialRoute,
  MobileLaunchState,
  MobilePrincipal,
  MobileScreenState
} from "./navigation.js";
export type {
  AboutOrderScreen,
  JoinRequestConfirmationScreen,
  JoinRequestConsent,
  JoinRequestFieldId,
  JoinRequestFormField,
  JoinRequestFormScreen,
  PublicContentDetailScreen,
  PublicContentListScreen,
  PublicHomeScreen,
  PublicRoute,
  PublicScreenAction,
  PublicScreenSection,
  PublicScreenTheme
} from "./public-screens.js";

export function getMobileHealth(mode?: string, nodeEnv?: string): HealthStatus {
  return {
    app: "mobile",
    runtimeMode: parseRuntimeMode(mode ?? readEnv("APP_RUNTIME_MODE"), {
      nodeEnv: nodeEnv ?? readEnv("NODE_ENV")
    }),
    status: "ok"
  };
}

export function getMobileThemePreview() {
  return {
    surface: designTokens.color.background.surface,
    text: designTokens.color.text.primary
  };
}

/* v8 ignore next 3 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(getMobileHealth()));
}

function readEnv(key: string): string | undefined {
  const env = process.env as Record<string, unknown>;
  const value = env[key];

  return typeof value === "string" ? value : undefined;
}
