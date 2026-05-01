import { designTokens } from "@jp2/shared-design-tokens";
import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
export { fallbackPublicHome } from "./public-home.js";
export { resolveMobileLaunchState } from "./navigation.js";
export type { MobileInitialRoute, MobileLaunchState, MobileScreenState } from "./navigation.js";

export function getMobileHealth(
  mode = process.env.APP_RUNTIME_MODE,
  nodeEnv = process.env.NODE_ENV
): HealthStatus {
  return {
    app: "mobile",
    runtimeMode: parseRuntimeMode(mode, { nodeEnv }),
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
