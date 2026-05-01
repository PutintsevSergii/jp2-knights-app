import { designTokens } from "@jp2/shared-design-tokens";
import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";

export function getAdminHealth(
  mode = process.env.APP_RUNTIME_MODE,
  nodeEnv = process.env.NODE_ENV
): HealthStatus {
  return {
    app: "admin",
    runtimeMode: parseRuntimeMode(mode, { nodeEnv }),
    status: "ok"
  };
}

export function getAdminThemePreview() {
  return {
    background: designTokens.color.background.app,
    action: designTokens.color.action.primary
  };
}

/* v8 ignore next 3 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(getAdminHealth()));
}
