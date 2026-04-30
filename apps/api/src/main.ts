import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";

export function getApiHealth(mode = process.env.APP_RUNTIME_MODE): HealthStatus {
  return {
    app: "api",
    runtimeMode: parseRuntimeMode(mode),
    status: "ok"
  };
}

/* v8 ignore next 3 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(getApiHealth()));
}
