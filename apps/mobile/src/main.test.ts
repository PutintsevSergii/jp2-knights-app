import { describe, expect, it } from "vitest";
import {
  buildAboutOrderScreen,
  buildCandidateEventDetailScreen,
  buildCandidateEventDetailUrl,
  buildCandidateEventParticipationUrl,
  buildCandidateEventsScreen,
  buildCandidateEventsUrl,
  buildCandidateDashboardScreen,
  buildCandidateDashboardUrl,
  buildBrotherEventDetailScreen,
  buildBrotherEventDetailUrl,
  buildBrotherEventParticipationUrl,
  buildBrotherEventsScreen,
  buildBrotherEventsUrl,
  buildBrotherProfileScreen,
  buildBrotherProfileUrl,
  buildBrotherTodayScreen,
  buildBrotherTodayUrl,
  buildMyOrganizationUnitsScreen,
  buildMyOrganizationUnitsUrl,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildPublicCandidateRequestUrl,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  fallbackAboutOrderContentPage,
  fallbackBrotherEventDetail,
  fallbackBrotherProfile,
  fallbackBrotherEvents,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits,
  fallbackCandidateEventDetail,
  fallbackCandidateEvents,
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
    expect(buildCandidateEventsUrl("https://api.example.test")).toBe(
      "https://api.example.test/candidate/events"
    );
    expect(
      buildCandidateEventDetailUrl(
        "55555555-5555-4555-8555-555555555555",
        "https://api.example.test"
      )
    ).toBe("https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555");
    expect(
      buildCandidateEventParticipationUrl(
        "55555555-5555-4555-8555-555555555555",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/candidate/events/55555555-5555-4555-8555-555555555555/participation"
    );
    expect(
      buildCandidateEventsScreen({
        state: "ready",
        response: fallbackCandidateEvents,
        runtimeMode: "demo"
      }).route
    ).toBe("CandidateEvents");
    expect(
      buildCandidateEventDetailScreen({
        state: "ready",
        response: fallbackCandidateEventDetail,
        runtimeMode: "demo"
      }).route
    ).toBe("CandidateEventDetail");
  });

  it("exports brother companion helpers and screen model builders", () => {
    expect(buildBrotherTodayUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/today"
    );
    expect(buildBrotherProfileUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/profile"
    );
    expect(buildBrotherEventsUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/events"
    );
    expect(
      buildBrotherEventDetailUrl(
        "44444444-4444-4444-8444-444444444444",
        "https://api.example.test"
      )
    ).toBe("https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444");
    expect(
      buildBrotherEventParticipationUrl(
        "44444444-4444-4444-8444-444444444444",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/brother/events/44444444-4444-4444-8444-444444444444/participation"
    );
    expect(buildMyOrganizationUnitsUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/my-organization-units"
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
    expect(
      buildMyOrganizationUnitsScreen({
        state: "ready",
        response: fallbackMyOrganizationUnits,
        runtimeMode: "demo"
      }).route
    ).toBe("MyOrganizationUnits");
    expect(
      buildBrotherEventsScreen({
        state: "ready",
        response: fallbackBrotherEvents,
        runtimeMode: "demo"
      }).route
    ).toBe("BrotherEvents");
    expect(
      buildBrotherEventDetailScreen({
        state: "ready",
        response: fallbackBrotherEventDetail,
        runtimeMode: "demo"
      }).route
    ).toBe("BrotherEventDetail");
  });
});
