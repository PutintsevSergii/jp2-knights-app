import { designTokens } from "@jp2/shared-design-tokens";
import { describe, expect, it } from "vitest";
import { resolveMobileLaunchState } from "./navigation.js";
import {
  fallbackAboutOrderContentPage,
  fallbackPublicEventDetail,
  fallbackPublicEvents,
  fallbackPublicPrayerDetail,
  fallbackPublicPrayers
} from "./public-content.js";
import {
  buildAboutOrderScreen,
  buildIdleApprovalScreen,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  buildPublicHomeScreen,
  buildPublicPrayerDetailScreen,
  buildPublicPrayerCategoriesScreen,
  buildSignInScreen,
  JOIN_REQUEST_CONSENT_TEXT_VERSION
} from "./public-screens.js";

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

  it("renders idle approval info while keeping public home content usable", () => {
    const screen = buildPublicHomeScreen(
      resolveMobileLaunchState({
        id: "idle_1",
        roles: [],
        status: "active",
        approval: {
          state: "pending",
          expiresAt: "2026-06-04T08:00:00.000Z",
          scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
        }
      })
    );

    expect(screen).toMatchObject({
      state: "idleApproval",
      title: "JP2 App"
    });
    expect(screen.actions.map((action) => action.targetRoute)).toContain("AboutOrder");
    expect(screen.actions.map((action) => action.targetRoute)).toContain("IdleApproval");
    expect(screen.sections.at(0)).toEqual({
      id: "identity-approval",
      title: "Account Approval Pending",
      body: "Your sign-in is waiting for officer approval. Public content remains available."
    });
  });

  it("builds a token-backed sign-in entry screen without granting private access", () => {
    const screen = buildSignInScreen({ state: "ready", runtimeMode: "api" });

    expect(screen).toMatchObject({
      route: "Login",
      state: "ready",
      title: "Sign In",
      demoChromeVisible: false
    });
    expect(screen.fields.map((field) => field.id)).toEqual(["email", "password"]);
    expect(screen.fields.find((field) => field.id === "password")?.secureTextEntry).toBe(true);
    expect(screen.sections.at(0)?.body).toContain("configured authentication provider");
    expect(JSON.stringify(screen)).not.toMatch(/roles|membership|officer scope/i);
  });

  it("builds an idle approval status screen with aggregate approval state only", () => {
    const launchState = resolveMobileLaunchState({
      id: "idle_1",
      roles: [],
      status: "active",
      approval: {
        state: "pending",
        expiresAt: "2026-06-04T08:00:00.000Z",
        scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
      }
    });
    const screen = buildIdleApprovalScreen({ launchState });

    expect(screen).toMatchObject({
      route: "IdleApproval",
      state: "idleApproval",
      title: "Account Approval Pending",
      actions: [
        {
          id: "home",
          label: "Home",
          targetRoute: "PublicHome"
        }
      ]
    });
    expect(screen.sections.at(0)?.body).toContain("Status: pending");
    expect(screen.sections.at(0)?.body).toContain("Review expires: Jun 4, 2026");
    expect(JSON.stringify(screen)).not.toMatch(/roles|membership|officer scope/i);
  });

  it("builds an AboutOrder screen from a published public content page", () => {
    const screen = buildAboutOrderScreen({
      state: "ready",
      page: fallbackAboutOrderContentPage,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "AboutOrder",
      state: "ready",
      title: "About the Order",
      demoChromeVisible: false
    });
    expect(screen.sections).toEqual([
      {
        id: "about-order-content",
        title: "About the Order",
        body: fallbackAboutOrderContentPage.body
      }
    ]);
    expect(screen.actions).toEqual([
      {
        id: "join",
        label: "Join",
        targetRoute: "JoinRequestForm"
      },
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/email|roles|membership|candidate/i);
  });

  it("builds AboutOrder loading, empty, error, and offline states", () => {
    expect(buildAboutOrderScreen({ state: "loading", runtimeMode: "api" })).toMatchObject({
      state: "loading",
      title: "Loading",
      actions: []
    });
    expect(buildAboutOrderScreen({ state: "empty", runtimeMode: "api" })).toMatchObject({
      state: "empty",
      title: "About the Order",
      actions: []
    });
    expect(buildAboutOrderScreen({ state: "error", runtimeMode: "api" })).toMatchObject({
      state: "error",
      title: "Unable to Load"
    });
    expect(buildAboutOrderScreen({ state: "offline", runtimeMode: "demo" })).toMatchObject({
      state: "offline",
      title: "Offline",
      demoChromeVisible: true
    });
  });

  it("builds a public prayer categories screen from public prayer DTOs", () => {
    const screen = buildPublicPrayerCategoriesScreen({
      state: "ready",
      response: fallbackPublicPrayers,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "PublicPrayerCategories",
      state: "ready",
      title: "Public Prayers"
    });
    expect(screen.actions).toEqual([
      {
        id: "open-first-prayer",
        label: "Open First Prayer",
        targetRoute: "PublicPrayerDetail",
        targetId: "00000000-0000-0000-0000-000000000006"
      },
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ]);
    expect(screen.sections).toEqual([
      {
        id: "category-00000000-0000-0000-0000-000000000005",
        title: "Daily Prayer",
        body: "1 public prayer"
      },
      {
        id: "prayer-00000000-0000-0000-0000-000000000006",
        title: "Morning Offering",
        body: "Lord, receive this day and guide our service in truth, fraternity, and charity."
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/brother only|private|membership/i);
  });

  it("builds a public events list screen from public event DTOs", () => {
    const screen = buildPublicEventsListScreen({
      state: "ready",
      response: fallbackPublicEvents,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "PublicEventsList",
      state: "ready",
      title: "Public Events"
    });
    expect(screen.actions).toEqual([
      {
        id: "open-first-event",
        label: "Open First Event",
        targetRoute: "PublicEventDetail",
        targetId: "00000000-0000-0000-0000-000000000008"
      },
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ]);
    expect(screen.sections).toEqual([
      {
        id: "event-00000000-0000-0000-0000-000000000008",
        title: "Open Evening",
        body: "Jun 10, 2026, 18:00 - Riga"
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/brother formation|private|membership/i);
  });

  it("builds public prayer and event list loading, empty, error, and offline states", () => {
    expect(
      buildPublicPrayerCategoriesScreen({ state: "loading", runtimeMode: "api" })
    ).toMatchObject({ state: "loading", title: "Loading", actions: [] });
    expect(buildPublicPrayerCategoriesScreen({ state: "empty", runtimeMode: "api" })).toMatchObject(
      { state: "empty", title: "Public Prayers", actions: [] }
    );
    expect(buildPublicEventsListScreen({ state: "error", runtimeMode: "api" })).toMatchObject({
      state: "error",
      title: "Unable to Load"
    });
    expect(buildPublicEventsListScreen({ state: "offline", runtimeMode: "demo" })).toMatchObject({
      state: "offline",
      title: "Offline",
      demoChromeVisible: true
    });
  });

  it("builds public prayer and event detail screens from public DTOs", () => {
    expect(
      buildPublicPrayerDetailScreen({
        state: "ready",
        response: fallbackPublicPrayerDetail,
        runtimeMode: "api"
      })
    ).toMatchObject({
      route: "PublicPrayerDetail",
      state: "ready",
      title: "Morning Offering",
      sections: [
        {
          id: "prayer-body",
          title: "Daily Prayer",
          body: "Lord, receive this day and guide our service in truth, fraternity, and charity."
        }
      ]
    });
    expect(
      buildPublicEventDetailScreen({
        state: "ready",
        response: fallbackPublicEventDetail,
        runtimeMode: "api"
      })
    ).toMatchObject({
      route: "PublicEventDetail",
      state: "ready",
      title: "Open Evening",
      sections: [
        {
          id: "event-time-location",
          title: "When and Where",
          body: "Jun 10, 2026, 18:00 - Riga"
        },
        {
          id: "event-description",
          title: "Details",
          body: "A public introduction evening for people exploring the Order."
        }
      ]
    });
  });

  it("builds public detail loading, empty, error, and offline states", () => {
    expect(buildPublicPrayerDetailScreen({ state: "loading", runtimeMode: "api" })).toMatchObject({
      state: "loading",
      title: "Loading",
      actions: []
    });
    expect(buildPublicPrayerDetailScreen({ state: "empty", runtimeMode: "api" })).toMatchObject({
      state: "empty",
      title: "Public Prayer",
      actions: []
    });
    expect(buildPublicEventDetailScreen({ state: "error", runtimeMode: "api" })).toMatchObject({
      state: "error",
      title: "Unable to Load"
    });
    expect(buildPublicEventDetailScreen({ state: "offline", runtimeMode: "demo" })).toMatchObject({
      state: "offline",
      title: "Offline",
      demoChromeVisible: true
    });
  });

  it("builds a public join request form model with consent and required fields", () => {
    const screen = buildJoinRequestFormScreen({
      state: "ready",
      runtimeMode: "api",
      errorMessage: "Check the required fields and consent, then try again."
    });

    expect(screen).toMatchObject({
      route: "JoinRequestForm",
      state: "ready",
      title: "Join Interest",
      errorMessage: "Check the required fields and consent, then try again.",
      demoChromeVisible: false
    });
    expect(screen.fields.map((field) => field.id)).toEqual([
      "firstName",
      "lastName",
      "email",
      "phone",
      "country",
      "city",
      "preferredLanguage",
      "message"
    ]);
    expect(screen.fields.filter((field) => field.required).map((field) => field.id)).toEqual([
      "firstName",
      "lastName",
      "email",
      "country",
      "city"
    ]);
    expect(screen.consent.textVersion).toBe(JOIN_REQUEST_CONSENT_TEXT_VERSION);
    expect(screen.actions).toEqual([
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ]);
  });

  it("builds join request loading and offline states without public form fields", () => {
    expect(buildJoinRequestFormScreen({ state: "loading", runtimeMode: "api" })).toMatchObject({
      state: "loading",
      title: "Submitting",
      fields: []
    });
    expect(buildJoinRequestFormScreen({ state: "offline", runtimeMode: "demo" })).toMatchObject({
      state: "offline",
      title: "Offline",
      fields: [],
      demoChromeVisible: true
    });
  });

  it("builds a safe join request confirmation without account promises", () => {
    const screen = buildJoinRequestConfirmationScreen({
      state: "ready",
      response: {
        request: {
          id: "11111111-1111-4111-8111-111111111111",
          status: "new"
        }
      },
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "JoinRequestConfirmation",
      state: "ready",
      title: "Request Received",
      sections: [
        {
          id: "request-reference",
          title: "Reference",
          body: "11111111-1111-4111-8111-111111111111"
        }
      ]
    });
    expect(screen.body).toContain("does not create an account or promise membership");
    expect(screen.actions).toEqual([
      {
        id: "home",
        label: "Home",
        targetRoute: "PublicHome"
      }
    ]);
  });
});
