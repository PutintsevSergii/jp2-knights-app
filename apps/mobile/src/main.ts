import { designTokens } from "@jp2/shared-design-tokens";
import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
export { fallbackPublicHome } from "./public-home.js";
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
  fallbackAboutOrderContentPage,
  fallbackPublicEvents,
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
export {
  buildAboutOrderScreen,
  buildPublicEventsListScreen,
  buildPublicHomeScreen,
  buildPublicPrayerCategoriesScreen
} from "./public-screens.js";
export type { MobileInitialRoute, MobileLaunchState, MobileScreenState } from "./navigation.js";
export type {
  AboutOrderScreen,
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
