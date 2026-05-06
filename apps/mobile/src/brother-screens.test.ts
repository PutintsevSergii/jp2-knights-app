import { describe, expect, it } from "vitest";
import {
  fallbackBrotherEventDetail,
  fallbackBrotherEvents,
  fallbackBrotherProfile,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";
import {
  buildBrotherProfileScreen,
  buildBrotherEventDetailScreen,
  buildBrotherEventsScreen,
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

  it("builds Brother Events with visible event summaries and navigation actions", () => {
    const screen = buildBrotherEventsScreen({
      state: "ready",
      response: fallbackBrotherEvents,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("BrotherEvents");
    expect(screen.title).toBe("Brother Events");
    expect(screen.body).toBe("1 brother-visible event");
    expect(screen.sections).toEqual([
      expect.objectContaining({
        id: `event-${fallbackBrotherEvents.events[0]!.id}`,
        title: "Brother Gathering"
      })
    ]);
    expect(screen.sections[0]?.body).toContain("Riga");
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "BrotherEventDetail",
      "BrotherToday",
      "MyOrganizationUnits"
    ]);
    expect(screen.actions[0]).toEqual({
      id: "open-first-event",
      label: "Open first event",
      targetRoute: "BrotherEventDetail",
      targetId: fallbackBrotherEvents.events[0]!.id
    });
  });

  it("builds Brother Event Detail with own participation intent actions", () => {
    const screen = buildBrotherEventDetailScreen({
      state: "ready",
      response: fallbackBrotherEventDetail,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("BrotherEventDetail");
    expect(screen.title).toBe("Brother Gathering");
    expect(screen.body).toContain("planning to attend");
    expect(screen.sections.map((section) => section.id)).toEqual(["event-detail", "participation"]);
    expect(screen.sections[0]?.body).toContain("Private formation gathering");
    expect(screen.sections[1]?.body).toBe("You are planning to attend.");
    expect(screen.actions).toEqual([
      {
        id: "cancel-participation",
        label: "Cancel intent",
        targetRoute: "BrotherEventDetail",
        targetId: fallbackBrotherEventDetail.event.id
      },
      {
        id: "events",
        label: "Brother Events",
        targetRoute: "BrotherEvents"
      },
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      }
    ]);
  });

  it("builds Brother Event Detail plan action when the user has no active intent", () => {
    const response = {
      event: {
        ...fallbackBrotherEventDetail.event,
        description: null,
        currentUserParticipation: null
      }
    };

    const screen = buildBrotherEventDetailScreen({
      state: "ready",
      response,
      runtimeMode: "api"
    });

    expect(screen.body).not.toContain("planning to attend");
    expect(screen.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "event-detail",
          body: "No event description is recorded yet."
        }),
        expect.objectContaining({
          id: "participation",
          body: "You have not marked an attendance intent."
        })
      ])
    );
    expect(screen.actions[0]).toEqual({
      id: "plan-to-attend",
      label: "Plan to attend",
      targetRoute: "BrotherEventDetail",
      targetId: fallbackBrotherEventDetail.event.id
    });
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
    expect(
      buildBrotherEventsScreen({
        state: "offline",
        runtimeMode: "demo"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherEvents",
        state: "offline",
        demoChromeVisible: true,
        actions: []
      })
    );
    expect(
      buildBrotherEventDetailScreen({
        state: "idleApproval",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherEventDetail",
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

    expect(
      buildBrotherEventsScreen({
        state: "ready",
        response: { events: [], pagination: { limit: 20, offset: 0 } },
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherEvents",
        state: "empty",
        actions: []
      })
    );

    expect(
      buildBrotherEventDetailScreen({
        state: "ready",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherEventDetail",
        state: "empty",
        actions: []
      })
    );
  });
});
