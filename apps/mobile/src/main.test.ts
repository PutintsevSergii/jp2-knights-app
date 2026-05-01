import { describe, expect, it } from "vitest";
import {
  buildPublicHomeScreen,
  getMobileHealth,
  getMobileThemePreview,
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
