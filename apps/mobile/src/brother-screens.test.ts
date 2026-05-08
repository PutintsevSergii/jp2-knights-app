import { describe, expect, it } from "vitest";
import {
  fallbackBrotherAnnouncements,
  fallbackBrotherEventDetail,
  fallbackBrotherEvents,
  fallbackBrotherPrayers,
  fallbackBrotherProfile,
  fallbackBrotherToday,
  fallbackMyOrganizationUnits
} from "./brother-companion.js";
import {
  buildBrotherAnnouncementsScreen,
  buildBrotherProfileScreen,
  buildBrotherEventDetailScreen,
  buildBrotherEventsScreen,
  buildBrotherPrayersScreen,
  buildOrganizationUnitDetailScreen,
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
    expect(screen.profileSummary).toEqual({
      displayName: "Demo Brother",
      currentDegreeLabel: "First Degree",
      organizationUnitLabel: "Pilot Choragiew",
      initials: "DB"
    });
    expect(screen.quickActions.map((action) => action.targetRoute)).toEqual([
      "BrotherProfile",
      "MyOrganizationUnits",
      "BrotherEvents",
      "BrotherAnnouncements"
    ]);
    expect(screen.upcomingEventCards).toEqual([
      expect.objectContaining({
        title: "Brother Gathering",
        dateMonth: "JUN",
        dateDay: "01",
        locationLabel: "Riga",
        detailAction: {
          id: "open-event",
          label: "Open event",
          targetRoute: "BrotherEventDetail",
          targetId: fallbackBrotherToday.upcomingEvents[0]!.id
        }
      })
    ]);
    expect(screen.sections.map((section) => section.id)).toContain(
      `organization-unit-${fallbackBrotherToday.organizationUnits[0]!.id}`
    );
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "BrotherProfile",
      "MyOrganizationUnits",
      "BrotherEvents",
      "BrotherAnnouncements"
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
    expect(screen.organizationUnitCards).toEqual([
      expect.objectContaining({
        id: fallbackMyOrganizationUnits.organizationUnits[0]!.id,
        title: "Pilot Choragiew",
        detailAction: {
          id: "open-organization-unit",
          label: "Open choragiew",
          targetRoute: "OrganizationUnitDetail",
          targetId: fallbackMyOrganizationUnits.organizationUnits[0]!.id
        }
      })
    ]);
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "OrganizationUnitDetail",
      "BrotherToday",
      "BrotherProfile"
    ]);
  });

  it("builds Organization Unit Detail with read-only scoped data and no roster", () => {
    const screen = buildOrganizationUnitDetailScreen({
      state: "ready",
      response: fallbackMyOrganizationUnits,
      selectedOrganizationUnitId: fallbackMyOrganizationUnits.organizationUnits[0]!.id,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("OrganizationUnitDetail");
    expect(screen.title).toBe("Pilot Choragiew");
    expect(screen.body).toBe("CHORAGIEW - Riga, Latvia");
    expect(screen.detailRows).toEqual([
      { id: "type", label: "Type", value: "CHORAGIEW" },
      { id: "status", label: "Status", value: "active" },
      { id: "location", label: "Location", value: "Riga, Latvia" },
      { id: "parish", label: "Parish", value: "Not recorded" }
    ]);
    expect(screen.description).toBe("Pilot community");
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "MyOrganizationUnits",
      "BrotherToday",
      "BrotherProfile"
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/roster|member list|brother list|participant/i);
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
    expect(screen.eventCards).toEqual([
      expect.objectContaining({
        id: fallbackBrotherEvents.events[0]!.id,
        title: "Brother Gathering",
        typeLabel: "Formation",
        locationLabel: "Riga",
        visibilityLabel: "Choragiew",
        detailAction: {
          id: "view-event-detail",
          label: "View Details",
          targetRoute: "BrotherEventDetail",
          targetId: fallbackBrotherEvents.events[0]!.id
        }
      })
    ]);
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

  it("builds Brother Announcements with visible message bodies and no chat actions", () => {
    const screen = buildBrotherAnnouncementsScreen({
      state: "ready",
      response: fallbackBrotherAnnouncements,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("BrotherAnnouncements");
    expect(screen.title).toBe("Brother Announcements");
    expect(screen.body).toBe("1 brother-visible announcement");
    expect(screen.sections).toEqual([
      expect.objectContaining({
        id: `announcement-${fallbackBrotherAnnouncements.announcements[0]!.id}`,
        title: "Brother Formation Notice (Pinned)"
      })
    ]);
    expect(screen.sections[0]?.body).toContain("Pilot Choragiew");
    expect(screen.actions).toEqual([
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/chat|comment|reply|read receipt/i);
  });

  it("builds Brother Prayers with visible scoped prayer cards and no tracking actions", () => {
    const screen = buildBrotherPrayersScreen({
      state: "ready",
      response: fallbackBrotherPrayers,
      runtimeMode: "api"
    });

    expect(screen.route).toBe("BrotherPrayers");
    expect(screen.title).toBe("Brother Prayers");
    expect(screen.body).toBe("2 brother-visible prayers");
    expect(screen.categoryChips).toEqual([
      {
        id: fallbackBrotherPrayers.categories[0]!.id,
        label: "Daily Brother Prayers"
      }
    ]);
    expect(screen.prayerCards).toEqual([
      expect.objectContaining({
        title: "Prayer for Fraternal Service",
        visibilityLabel: "Brother",
        scopeLabel: "Shared library"
      }),
      expect.objectContaining({
        title: "Pilot Choragiew Prayer",
        visibilityLabel: "Choragiew",
        scopeLabel: "Your choragiew"
      })
    ]);
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "BrotherToday",
      "BrotherEvents",
      "MyOrganizationUnits"
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/participant|attendee|tracking|mark complete/i);
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
    expect(
      buildBrotherAnnouncementsScreen({
        state: "idleApproval",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherAnnouncements",
        state: "idleApproval",
        title: "Account Approval Pending",
        actions: []
      })
    );
    expect(
      buildBrotherPrayersScreen({
        state: "idleApproval",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherPrayers",
        state: "idleApproval",
        title: "Account Approval Pending",
        actions: []
      })
    );
    expect(
      buildOrganizationUnitDetailScreen({
        state: "idleApproval",
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "OrganizationUnitDetail",
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

    expect(
      buildBrotherAnnouncementsScreen({
        state: "ready",
        response: { announcements: [], pagination: { limit: 20, offset: 0 } },
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherAnnouncements",
        state: "empty",
        actions: []
      })
    );
    expect(
      buildBrotherPrayersScreen({
        state: "ready",
        response: { categories: [], prayers: [], pagination: { limit: 20, offset: 0 } },
        runtimeMode: "api"
      })
    ).toEqual(
      expect.objectContaining({
        route: "BrotherPrayers",
        state: "empty",
        actions: []
      })
    );
  });
});
