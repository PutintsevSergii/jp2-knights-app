import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  buildAboutOrderScreen,
  buildCurrentUserUrl,
  buildCandidateAnnouncementsScreen,
  buildCandidateAnnouncementsUrl,
  buildCandidateEventDetailScreen,
  buildCandidateEventDetailUrl,
  buildCandidateEventParticipationUrl,
  buildCandidateEventsScreen,
  buildCandidateEventsUrl,
  buildCandidateDashboardScreen,
  buildCandidateDashboardUrl,
  buildBrotherAnnouncementsScreen,
  buildBrotherAnnouncementsUrl,
  buildBrotherEventDetailScreen,
  buildBrotherEventDetailUrl,
  buildBrotherEventParticipationUrl,
  buildBrotherEventsScreen,
  buildBrotherEventsUrl,
  buildBrotherPrayersScreen,
  buildBrotherPrayersUrl,
  buildBrotherProfileScreen,
  buildBrotherProfileUrl,
  buildBrotherTodayScreen,
  buildBrotherTodayUrl,
  buildMyOrganizationUnitsScreen,
  buildMyOrganizationUnitsUrl,
  buildOrganizationUnitDetailScreen,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildIdleApprovalScreen,
  buildPublicCandidateRequestUrl,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  fallbackAboutOrderContentPage,
  fallbackBrotherAnnouncements,
  fallbackBrotherEventDetail,
  fallbackBrotherProfile,
  fallbackBrotherEvents,
  fallbackBrotherPrayers,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits,
  fallbackCandidateAnnouncements,
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
  buildSignInScreen,
  getMobileHealth,
  getMobileThemePreview,
  isBrotherRoute,
  isCandidateRoute,
  isPublicRoute,
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
    expect(getMobileThemePreview().screenTitleSize).toBe(32);
  });

  it("exports the public launch resolver", () => {
    expect(resolveMobileLaunchState(null).initialRoute).toBe("PublicHome");
  });

  it("exports route group guards for the split mobile shell", () => {
    expect(isPublicRoute("PublicHome")).toBe(true);
    expect(isPublicRoute("Login")).toBe(true);
    expect(isPublicRoute("IdleApproval")).toBe(true);
    expect(isCandidateRoute("CandidateEvents")).toBe(true);
    expect(isBrotherRoute("BrotherToday")).toBe(true);
    expect(isBrotherRoute("OrganizationUnitDetail")).toBe(true);
    expect(isPublicRoute("BrotherToday")).toBe(false);
    expect(isCandidateRoute("PublicHome")).toBe(false);
    expect(isBrotherRoute("CandidateDashboard")).toBe(false);
  });

  it("keeps App.tsx as a thin composition root for Phase 10A", () => {
    const appSource = readFileSync(join(process.cwd(), "apps/mobile/src/App.tsx"), "utf8");

    expect(appSource).toContain("MobilePublicSurface");
    expect(appSource).toContain("MobileCandidateSurface");
    expect(appSource).toContain("MobileBrotherSurface");
    expect(appSource).not.toContain("fetchCandidateDashboard");
    expect(appSource).not.toContain("fetchBrotherToday");
    expect(appSource).not.toContain("submitPublicCandidateRequest");
    expect(appSource).not.toContain("markCandidateEventParticipation");
    expect(appSource).not.toContain("markBrotherEventParticipation");
  });

  it("keeps plural screen model files as barrels only", () => {
    for (const fileName of ["public-screens.ts", "candidate-screens.ts", "brother-screens.ts"]) {
      const source = readFileSync(join(process.cwd(), "apps/mobile/src", fileName), "utf8");

      expect(source).not.toMatch(/export function build[A-Za-z]+Screen/);
      expect(source).not.toMatch(/export interface [A-Za-z]+Screen/);
    }
  });

  it("keeps React Native component files one-component-per-file with shared inventory", () => {
    const screensDir = join(process.cwd(), "apps/mobile/src/screens");
    const sharedDir = join(screensDir, "shared");
    const componentFiles = mobileComponentFiles();

    for (const filePath of componentFiles) {
      const source = readFileSync(filePath, "utf8");
      const expectedComponentName = basename(filePath, ".tsx");
      const exportedFunctionComponents = [
        ...source.matchAll(/^export function ([A-Z][A-Za-z0-9]+)/gm)
      ].map((match) => match[1]);
      const exportedConstComponents = [
        ...source.matchAll(/^export const ([A-Z][A-Za-z0-9]+)\s*=/gm)
      ].map((match) => match[1]);
      const localFunctionComponents = [
        ...source.matchAll(/^(?!export )function ([A-Z][A-Za-z0-9]+)/gm)
      ].map((match) => match[1]);
      const localConstComponents = [
        ...source.matchAll(/^(?!export )const ([A-Z][A-Za-z0-9]+)\s*=/gm)
      ].map((match) => match[1]);

      expect(exportedFunctionComponents, filePath).toEqual([expectedComponentName]);
      expect(exportedConstComponents, filePath).toEqual([]);
      expect(localFunctionComponents, filePath).toEqual([]);
      expect(localConstComponents, filePath).toEqual([]);
    }

    const inventory = readFileSync(join(sharedDir, "README.md"), "utf8");

    for (const fileName of readdirSync(sharedDir).filter((name) => name.endsWith(".tsx"))) {
      expect(inventory, fileName).toContain(fileName);
    }
  });

  it("keeps mobile React Native components from using nonzero letter spacing", () => {
    for (const filePath of mobileComponentFiles()) {
      const source = readFileSync(filePath, "utf8");
      const nonzeroLetterSpacing = source.match(/letterSpacing:\s*(?!0[,}\n])[-0-9.]+/g) ?? [];

      expect(nonzeroLetterSpacing, filePath).toEqual([]);
    }
  });

  it("exports the public home screen model builder", () => {
    expect(buildPublicHomeScreen(resolveMobileLaunchState(null)).route).toBe("PublicHome");
  });

  it("exports the current-user mobile auth helper", () => {
    expect(buildCurrentUserUrl("https://api.example.test")).toBe(
      "https://api.example.test/auth/me"
    );
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

  it("exports sign-in and idle approval screen model builders", () => {
    expect(buildSignInScreen({ state: "ready", runtimeMode: "demo" }).route).toBe("Login");
    expect(
      buildIdleApprovalScreen({
        launchState: resolveMobileLaunchState({
          id: "idle_1",
          roles: [],
          status: "active",
          approval: {
            state: "pending",
            expiresAt: null,
            scopeOrganizationUnitId: null
          }
        })
      }).route
    ).toBe("IdleApproval");
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
    expect(buildCandidateAnnouncementsUrl("https://api.example.test")).toBe(
      "https://api.example.test/candidate/announcements"
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
    expect(
      buildCandidateAnnouncementsScreen({
        state: "ready",
        response: fallbackCandidateAnnouncements,
        runtimeMode: "demo"
      }).route
    ).toBe("CandidateAnnouncements");
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
    expect(buildBrotherAnnouncementsUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/announcements"
    );
    expect(buildBrotherPrayersUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/prayers"
    );
    expect(
      buildBrotherEventDetailUrl("44444444-4444-4444-8444-444444444444", "https://api.example.test")
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
      buildOrganizationUnitDetailScreen({
        state: "ready",
        response: fallbackMyOrganizationUnits,
        selectedOrganizationUnitId: fallbackMyOrganizationUnits.organizationUnits[0]!.id,
        runtimeMode: "demo"
      }).route
    ).toBe("OrganizationUnitDetail");
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
    expect(
      buildBrotherAnnouncementsScreen({
        state: "ready",
        response: fallbackBrotherAnnouncements,
        runtimeMode: "demo"
      }).route
    ).toBe("BrotherAnnouncements");
    expect(
      buildBrotherPrayersScreen({
        state: "ready",
        response: fallbackBrotherPrayers,
        runtimeMode: "demo"
      }).route
    ).toBe("BrotherPrayers");
  });
});

function mobileComponentFiles(): string[] {
  const screensDir = join(process.cwd(), "apps/mobile/src/screens");
  const sharedDir = join(screensDir, "shared");

  return [
    ...readdirSync(screensDir)
      .filter((fileName) => fileName.endsWith(".tsx") && !fileName.endsWith(".test.tsx"))
      .map((fileName) => join(screensDir, fileName)),
    ...readdirSync(sharedDir)
      .filter((fileName) => fileName.endsWith(".tsx"))
      .map((fileName) => join(sharedDir, fileName))
  ];
}
