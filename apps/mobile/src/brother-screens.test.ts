import { describe, expect, it } from "vitest";
import {
  fallbackBrotherProfile,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";
import {
  buildBrotherProfileScreen,
  buildBrotherTodayScreen,
  buildMyOrganizationUnitsScreen
} from "./brother-screens.js";

describe("brother screen models", () => {
  it("builds Brother Today sections and actions from the daily response", () => {
    const screen = buildBrotherTodayScreen({
      state: "ready",
      response: fallbackBrotherToday,
      runtimeMode: "demo"
    });

    expect(screen.route).toBe("BrotherToday");
    expect(screen.demoChromeVisible).toBe(true);
    expect(screen.body).toContain("First Degree");
    expect(screen.sections.map((section) => section.id)).toContain(
      `organization-unit-${fallbackBrotherToday.organizationUnits[0]!.id}`
    );
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "BrotherProfile",
      "MyOrganizationUnits",
      "BrotherEvents"
    ]);
  });

  it("builds Brother Profile with read-only contact and membership sections", () => {
    const screen = buildBrotherProfileScreen({
      state: "ready",
      response: fallbackBrotherProfile,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("BrotherProfile");
    expect(screen.body).toBe("Demo Brother - brother@example.test");
    expect(screen.sections.map((section) => section.title)).toContain("Pilot Choragiew");
    expect(screen.actions).toEqual([
      {
        id: "organization-units",
        label: "My choragiew",
        targetRoute: "MyOrganizationUnits"
      }
    ]);
  });

  it("builds My Organization Units with scoped summaries and no brother roster", () => {
    const screen = buildMyOrganizationUnitsScreen({
      state: "ready",
      response: fallbackMyOrganizationUnits,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("MyOrganizationUnits");
    expect(screen.title).toBe("My Choragiew");
    expect(screen.body).toBe("1 active organization unit");
    expect(screen.sections).toEqual([
      expect.objectContaining({
        id: `organization-unit-${fallbackMyOrganizationUnits.organizationUnits[0]!.id}`,
        title: "Pilot Choragiew"
      })
    ]);
    expect(screen.sections.map((section) => section.body).join("\n")).not.toContain("Brother:");
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "BrotherToday",
      "BrotherProfile"
    ]);
  });

  it("maps non-ready states without content actions", () => {
    expect(
      buildBrotherTodayScreen({
        state: "forbidden",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherToday",
        state: "forbidden",
        actions: []
      })
    );
    expect(
      buildBrotherProfileScreen({
        state: "offline",
        runtimeMode: "demo"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherProfile",
        state: "offline",
        demoChromeVisible: true,
        actions: []
      })
    );
    expect(
      buildBrotherTodayScreen({
        state: "idleApproval",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherToday",
        state: "idleApproval",
        title: "Account Approval Pending",
        actions: []
      })
    );
    expect(
      buildMyOrganizationUnitsScreen({
        state: "idleApproval",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "MyOrganizationUnits",
        state: "idleApproval",
        title: "Account Approval Pending",
        actions: []
      })
    );
  });

  it("builds empty and fallback detail copy for missing brother response fields", () => {
    expect(
      buildBrotherTodayScreen({
        state: "ready",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        state: "empty",
        actions: []
      })
    );

    const todayWithoutEvents = {
      ...fallbackBrotherToday,
      profileSummary: {
        displayName: "Demo Brother",
        currentDegree: null,
        organizationUnitName: null
      },
      upcomingEvents: []
    };
    const todayScreen = buildBrotherTodayScreen({
      state: "ready",
      response: todayWithoutEvents,
      runtimeMode: "api"
    });

    expect(todayScreen.body).toBe("Demo Brother - degree pending - choragiew pending");
    expect(todayScreen.sections.map((section) => section.id)).toContain("events-empty");

    const profileWithoutOptionalFields = {
      profile: {
        ...fallbackBrotherProfile.profile,
        phone: null,
        preferredLanguage: null,
        memberships: [
          {
            ...fallbackBrotherProfile.profile.memberships[0]!,
            currentDegree: null,
            joinedAt: null
          }
        ]
      }
    };
    const profileScreen = buildBrotherProfileScreen({
      state: "ready",
      response: profileWithoutOptionalFields,
      runtimeMode: "api"
    });

    expect(profileScreen.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "contact",
          body: "No optional contact details are recorded."
        }),
        expect.objectContaining({
          body: "Current degree is not recorded yet."
        })
      ])
    );
  });
});
