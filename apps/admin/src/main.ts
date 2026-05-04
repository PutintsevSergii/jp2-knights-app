import { designTokens } from "@jp2/shared-design-tokens";
import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
import { adminShellRoutes } from "./admin-shell.js";
import { startAdminWebServer } from "./admin-web-shell.js";

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

export function getAdminShellRoutes() {
  return [...adminShellRoutes];
}

/* v8 ignore next 5 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = startAdminWebServer();
  const address = server.address();
  const port =
    typeof address === "object" && address ? address.port : (process.env.ADMIN_PORT ?? 3001);
  console.log(`Admin Lite web shell listening on http://localhost:${port}`);
}
