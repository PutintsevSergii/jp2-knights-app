import type { RuntimeMode } from "@jp2/shared-types";

export interface MobileRuntimeConfig {
  development: RuntimeMode;
  production: RuntimeMode;
}

export const mobileRuntimeConfig: MobileRuntimeConfig = {
  development: "demo",
  production: "api"
};

export function readMobileRuntimeMode(env: Record<string, unknown> = process.env): RuntimeMode {
  const explicitMode = env.EXPO_PUBLIC_APP_RUNTIME_MODE ?? env.APP_RUNTIME_MODE;

  if (explicitMode === "demo" || explicitMode === "api" || explicitMode === "test") {
    return explicitMode;
  }

  return env.NODE_ENV === "production"
    ? mobileRuntimeConfig.production
    : mobileRuntimeConfig.development;
}
