import { designTokens } from "@jp2/shared-design-tokens";
import { describe, expect, it } from "vitest";
import { resolveMobileLaunchState } from "./navigation.js";
import { buildPublicHomeScreen } from "./public-screens.js";

describe("mobile public screen models", () => {
  it("builds public home from the shared fallback DTO without private fields", () => {
    const screen = buildPublicHomeScreen(resolveMobileLaunchState(null));

    expect(screen).toMatchObject({
      route: "PublicHome",
      state: "ready",
      title: "JP2 App",
      demoChromeVisible: false
    });
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "AboutOrder",
      "PublicPrayerCategories",
      "JoinRequestForm",
      "Login"
    ]);
    expect(screen.sections.map((section) => section.id)).toEqual(["prayer-empty", "events-empty"]);
    expect(JSON.stringify(screen)).not.toMatch(/email|roles|membership|candidate/i);
  });

  it("uses shared design tokens for public screen theme values", () => {
    expect(buildPublicHomeScreen(resolveMobileLaunchState(null)).theme).toEqual({
      background: designTokens.color.background.app,
      surface: designTokens.color.background.surface,
      border: designTokens.color.border.subtle,
      text: designTokens.color.text.primary,
      mutedText: designTokens.color.text.muted,
      primaryAction: designTokens.color.action.primary,
      primaryActionText: designTokens.color.action.primaryText,
      spacing: designTokens.space[4],
      radius: designTokens.radius.md
    });
  });

  it("maps unknown CTA routes back to public home", () => {
    const screen = buildPublicHomeScreen(
      resolveMobileLaunchState(null, {
        publicHome: {
          intro: {
            title: "JP2 App",
            body: "Public content"
          },
          prayerOfDay: null,
          nextEvents: [],
          ctas: [
            {
              id: "unknown",
              label: "Unknown",
              action: "learn",
              targetRoute: "UnexpectedRoute"
            }
          ]
        }
      })
    );

    expect(screen.actions).toEqual([
      {
        id: "unknown",
        label: "Unknown",
        targetRoute: "PublicHome"
      }
    ]);
  });

  it("renders prayer and next event sections when public content is present", () => {
    const screen = buildPublicHomeScreen(
      resolveMobileLaunchState(null, {
        publicHome: {
          intro: {
            title: "JP2 App",
            body: "Public content"
          },
          prayerOfDay: {
            title: "Prayer of the Day",
            body: "Public prayer body"
          },
          nextEvents: [
            {
              id: "11111111-1111-4111-8111-111111111111",
              title: "Public Family Event",
              startAt: "2026-06-01T10:00:00.000Z",
              locationLabel: "Parish Hall",
              visibility: "FAMILY_OPEN"
            }
          ],
          ctas: [
            {
              id: "events",
              label: "Events",
              action: "events",
              targetRoute: "PublicEventsList"
            }
          ]
        }
      })
    );

    expect(screen.sections).toEqual([
      {
        id: "prayer-of-day",
        title: "Prayer of the Day",
        body: "Public prayer body"
      },
      {
        id: "next-event",
        title: "Public Family Event",
        body: "Parish Hall"
      }
    ]);
  });

  it("uses a safe event fallback when the public event has no location label", () => {
    const screen = buildPublicHomeScreen(
      resolveMobileLaunchState(null, {
        publicHome: {
          intro: {
            title: "JP2 App",
            body: "Public content"
          },
          prayerOfDay: null,
          nextEvents: [
            {
              id: "11111111-1111-4111-8111-111111111111",
              title: "Public Event",
              startAt: "2026-06-01T10:00:00.000Z",
              locationLabel: null,
              visibility: "PUBLIC"
            }
          ],
          ctas: [
            {
              id: "learn",
              label: "Learn",
              action: "learn",
              targetRoute: "AboutOrder"
            }
          ]
        }
      })
    );

    expect(screen.sections.at(1)).toEqual({
      id: "next-event",
      title: "Public Event",
      body: "Public event details are available."
    });
  });

  it("renders empty state when public home data is absent", () => {
    const launchState = resolveMobileLaunchState(null);
    const withoutPublicHome = {
      mode: launchState.mode,
      initialRoute: launchState.initialRoute,
      state: launchState.state,
      runtimeMode: launchState.runtimeMode,
      demoChromeVisible: launchState.demoChromeVisible
    };

    expect(buildPublicHomeScreen(withoutPublicHome)).toMatchObject({
      state: "empty",
      title: "JP2 App",
      actions: []
    });
  });

  it("renders explicit state screens for loading, error, offline, and forbidden states", () => {
    expect(
      buildPublicHomeScreen({
        ...resolveMobileLaunchState(null),
        state: "loading"
      })
    ).toMatchObject({ state: "loading", title: "Loading", actions: [] });
    expect(
      buildPublicHomeScreen({
        ...resolveMobileLaunchState(null),
        state: "error"
      })
    ).toMatchObject({ state: "error", title: "Unable to Load", actions: [] });
    expect(
      buildPublicHomeScreen({
        ...resolveMobileLaunchState(null, { runtimeMode: "demo" }),
        state: "offline"
      })
    ).toMatchObject({ state: "offline", title: "Offline", demoChromeVisible: true });
    expect(
      buildPublicHomeScreen(
        resolveMobileLaunchState({
          id: "brother_1",
          roles: ["BROTHER"],
          status: "active"
        })
      )
    ).toMatchObject({ state: "forbidden", title: "Access Denied" });
  });
});
