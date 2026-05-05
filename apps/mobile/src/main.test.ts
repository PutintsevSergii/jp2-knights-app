import { describe, expect, it } from "vitest";
import {
  buildAboutOrderScreen,
  buildCandidateDashboardScreen,
  buildCandidateDashboardUrl,
  buildBrotherProfileScreen,
  buildBrotherProfileUrl,
  buildBrotherTodayScreen,
  buildBrotherTodayUrl,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildPublicCandidateRequestUrl,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  fallbackAboutOrderContentPage,
  fallbackBrotherProfile,
  fallbackBrotherToday,
  fallbackCandidateDashboard,
  fallbackPublicCandidateRequestResponse,
  fallbackPublicEventDetail,
  fallbackPublicEvents,
  fallbackPublicPrayerDetail,
  fallbackPublicPrayers,
  buildPublicHomeScreen,
  buildPublicPrayerDetailScreen,
  buildPublicPrayerCategoriesScreen,
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

  it("exports the about order screen model builder", () => {
    expect(
      buildAboutOrderScreen({
        state: "ready",
        page: fallbackAboutOrderContentPage,
        runtimeMode: "demo"
      }).route
    ).toBe("AboutOrder");
  });

  it("exports public prayer and event list screen model builders", () => {
    expect(
      buildPublicPrayerCategoriesScreen({
        state: "ready",
        response: fallbackPublicPrayers,
        runtimeMode: "demo"
      }).route
    ).toBe("PublicPrayerCategories");
    expect(
      buildPublicEventsListScreen({
        state: "ready",
        response: fallbackPublicEvents,
        runtimeMode: "demo"
      }).route
    ).toBe("PublicEventsList");
  });

  it("exports public prayer and event detail screen model builders", () => {
    expect(
      buildPublicPrayerDetailScreen({
        state: "ready",
        response: fallbackPublicPrayerDetail,
        runtimeMode: "demo"
      }).route
    ).toBe("PublicPrayerDetail");
    expect(
      buildPublicEventDetailScreen({
        state: "ready",
        response: fallbackPublicEventDetail,
        runtimeMode: "demo"
      }).route
    ).toBe("PublicEventDetail");
  });

  it("exports public candidate request helpers and screen model builders", () => {
    expect(buildPublicCandidateRequestUrl("https://api.example.test")).toBe(
      "https://api.example.test/public/candidate-requests"
    );
    expect(buildJoinRequestFormScreen({ state: "ready", runtimeMode: "demo" }).route).toBe(
      "JoinRequestForm"
    );
    expect(
      buildJoinRequestConfirmationScreen({
        state: "ready",
        response: fallbackPublicCandidateRequestResponse,
        runtimeMode: "demo"
      }).route
    ).toBe("JoinRequestConfirmation");
  });

  it("exports candidate dashboard helpers and screen model builder", () => {
    expect(buildCandidateDashboardUrl("https://api.example.test")).toBe(
      "https://api.example.test/candidate/dashboard"
    );
    expect(
      buildCandidateDashboardScreen({
        state: "ready",
        response: fallbackCandidateDashboard,
        runtimeMode: "demo"
      }).route
    ).toBe("CandidateDashboard");
  });

  it("exports brother companion helpers and screen model builders", () => {
    expect(buildBrotherTodayUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/today"
    );
    expect(buildBrotherProfileUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/profile"
    );
    expect(
      buildBrotherTodayScreen({
        state: "ready",
        response: fallbackBrotherToday,
        runtimeMode: "demo"
      }).route
    ).toBe("BrotherToday");
    expect(
      buildBrotherProfileScreen({
        state: "ready",
        response: fallbackBrotherProfile,
        runtimeMode: "demo"
      }).route
    ).toBe("BrotherProfile");
  });
});
