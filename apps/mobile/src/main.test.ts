import { describe, expect, it } from "vitest";
import {
  buildPublicHomeScreen,
  getMobileHealth,
  getMobileThemePreview,
  readMobileRuntimeMode,
  resolveMobileLaunchState
} from "./main.js";

describe("mobile shell", () => {
  it("supports explicit demo mode", () => {
    expect(getMobileHealth("demo").runtimeMode).toBe("demo");
  });

  it("reads runtime mode from environment when not provided", () => {
    const env = process.env as Record<string, string | undefined>;
    const previousRuntimeMode = env.APP_RUNTIME_MODE;
    env.APP_RUNTIME_MODE = "demo";

    try {
      expect(getMobileHealth().runtimeMode).toBe("demo");
    } finally {
      env.APP_RUNTIME_MODE = previousRuntimeMode;
    }
  });

  it("uses Expo public runtime mode for bundled mobile launches", () => {
    expect(readMobileRuntimeMode({ EXPO_PUBLIC_APP_RUNTIME_MODE: "demo" })).toBe("demo");
    expect(
      readMobileRuntimeMode({
        EXPO_PUBLIC_APP_RUNTIME_MODE: "api",
        APP_RUNTIME_MODE: "demo"
      })
    ).toBe("api");
  });

  it("defaults local Expo launches to demo and production builds to api", () => {
    expect(readMobileRuntimeMode({ NODE_ENV: "development" })).toBe("demo");
    expect(readMobileRuntimeMode({ NODE_ENV: "production" })).toBe("api");
    expect(readMobileRuntimeMode({})).toBe("demo");
  });

  it("rejects demo mode for production builds", () => {
    expect(() => getMobileHealth("demo", "production")).toThrow(
      "Demo runtime mode is not allowed in production."
    );
  });

  it("uses shared design tokens", () => {
    expect(getMobileThemePreview().surface).toBeDefined();
  });

  it("exports the public launch resolver", () => {
    expect(resolveMobileLaunchState(null).initialRoute).toBe("PublicHome");
  });

  it("exports the public home screen model builder", () => {
    expect(buildPublicHomeScreen(resolveMobileLaunchState(null)).route).toBe("PublicHome");
  });
});
