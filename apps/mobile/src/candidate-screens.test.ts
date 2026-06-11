import { designTokens } from "@jp2/shared-design-tokens";
import { describe, expect, it } from "vitest";
import {
  fallbackCandidateAnnouncements,
  fallbackCandidateEventDetail,
  fallbackCandidateEvents,
  fallbackCandidateDashboard
} from "./candidate-dashboard.js";
import { fallbackCandidateRoadmap } from "./roadmap.js";
import {
  buildCandidateAnnouncementDetailScreen,
  buildCandidateAnnouncementsScreen,
  buildCandidateEventDetailScreen,
  buildCandidateEventsScreen,
  buildCandidateDashboardScreen,
  buildCandidateRoadmapScreen
} from "./candidate-screens.js";

describe("mobile candidate screen models", () => {
  it("builds the candidate dashboard without brother-only content", () => {
    const screen = buildCandidateDashboardScreen({
      state: "ready",
      response: fallbackCandidateDashboard,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "CandidateDashboard",
      state: "ready",
      title: "Candidate Dashboard",
      demoChromeVisible: false
    });
    expect(screen.actions.map((action) => action.targetRoute)).toEqual([
      "CandidateRoadmap",
      "CandidateContact",
      "CandidateEvents"
    ]);
    expect(screen.sections.map((section) => section.id)).toContain("next-step");
    expect(screen.today).toEqual(fallbackCandidateDashboard.today);
    expect(JSON.stringify(screen)).not.toMatch(/brother|membership|degree/i);
  });

  it("uses shared design tokens for candidate screen theme values", () => {
    expect(
      buildCandidateDashboardScreen({
        state: "ready",
        response: fallbackCandidateDashboard,
        runtimeMode: "api"
      }).theme
    ).toEqual({
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

  it("builds candidate event list and detail without exposing participant lists", () => {
    const list = buildCandidateEventsScreen({
      state: "ready",
      response: fallbackCandidateEvents,
      runtimeMode: "api"
    });
    const detail = buildCandidateEventDetailScreen({
      state: "ready",
      response: fallbackCandidateEventDetail,
      runtimeMode: "api"
    });

    expect(list).toMatchObject({
      route: "CandidateEvents",
      state: "ready",
      title: "Upcoming Events",
      demoChromeVisible: false
    });
    expect(list.actions).toEqual([
      {
        id: "open-first-event",
        label: "Open first event",
        targetRoute: "CandidateEventDetail",
        targetId: fallbackCandidateEvents.events[0]!.id
      },
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ]);
    expect(list.eventCards[0]).toMatchObject({
      title: "Candidate Gathering",
      locationLabel: "Riga",
      statusLabel: "Planning to attend",
      statusTone: "planning",
      primaryAction: null,
      detailAction: {
        id: "view-event-detail",
        label: "View Details",
        targetRoute: "CandidateEventDetail",
        targetId: fallbackCandidateEvents.events[0]!.id
      }
    });
    expect(detail).toMatchObject({
      route: "CandidateEventDetail",
      state: "ready",
      title: fallbackCandidateEventDetail.event.title
    });
    expect(detail.actions[0]).toEqual({
      id: "cancel-participation",
      label: "Cancel intent",
      targetRoute: "CandidateEventDetail",
      targetId: fallbackCandidateEventDetail.event.id
    });
    expect(JSON.stringify({ list, detail })).not.toMatch(/participants|brother|membership|degree/i);
  });

  it("builds Figma candidate event card RSVP states from current-user participation only", () => {
    const screen = buildCandidateEventsScreen({
      state: "ready",
      response: {
        events: [
          {
            ...fallbackCandidateEvents.events[0]!,
            id: "11111111-1111-4111-8111-111111111111",
            currentUserParticipation: null
          },
          {
            ...fallbackCandidateEvents.events[0]!,
            id: "22222222-2222-4222-8222-222222222222",
            currentUserParticipation: {
              id: "33333333-3333-4333-8333-333333333333",
              eventId: "22222222-2222-4222-8222-222222222222",
              intentStatus: "cancelled",
              createdAt: "2026-05-06T12:00:00.000Z",
              cancelledAt: "2026-05-07T12:00:00.000Z"
            }
          }
        ],
        pagination: {
          limit: 20,
          offset: 0
        }
      },
      runtimeMode: "api"
    });

    expect(screen.eventCards.map((event) => event.statusLabel)).toEqual([
      "RSVP needed",
      "Not attending"
    ]);
    expect(screen.eventCards.map((event) => event.primaryAction?.id)).toEqual([
      "plan-to-attend",
      "plan-to-attend"
    ]);
  });

  it("builds candidate announcements without brother-only language", () => {
    const screen = buildCandidateAnnouncementsScreen({
      state: "ready",
      response: fallbackCandidateAnnouncements,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "CandidateAnnouncements",
      state: "ready",
      title: "Candidate Announcements",
      body: "1 candidate-visible announcement",
      demoChromeVisible: false
    });
    expect(screen.announcementCards).toEqual([
      {
        id: fallbackCandidateAnnouncements.announcements[0]!.id,
        title: "Candidate Formation Update",
        body: "The next candidate formation note is available from your responsible officer.",
        publishedLabel: "May 7, 2026, 12:00",
        pinned: true,
        detailAction: {
          id: "view-announcement-detail",
          label: "View Details",
          targetRoute: "CandidateAnnouncementDetail",
          targetId: fallbackCandidateAnnouncements.announcements[0]!.id
        }
      }
    ]);
    expect(screen.sections).toEqual([
      expect.objectContaining({
        id: `announcement-${fallbackCandidateAnnouncements.announcements[0]!.id}`,
        title: "Candidate Formation Update (Pinned)"
      })
    ]);
    expect(screen.sections[0]?.body).toContain("responsible officer");
    expect(screen.actions).toEqual([
      {
        id: "open-first-announcement",
        label: "Open first announcement",
        targetRoute: "CandidateAnnouncementDetail",
        targetId: fallbackCandidateAnnouncements.announcements[0]!.id
      },
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/brother|membership|degree/i);
  });

  it("builds candidate announcement detail from the authorized list payload only", () => {
    const screen = buildCandidateAnnouncementDetailScreen({
      state: "ready",
      response: fallbackCandidateAnnouncements,
      selectedAnnouncementId: fallbackCandidateAnnouncements.announcements[0]!.id,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "CandidateAnnouncementDetail",
      state: "ready",
      title: "Candidate Formation Update",
      body: "The next candidate formation note is available from your responsible officer.",
      publishedLabel: "May 7, 2026, 12:00",
      pinned: true,
      demoChromeVisible: false
    });
    expect(screen.sections).toEqual([
      {
        id: "announcement-detail",
        title: "Pinned announcement",
        body: "The next candidate formation note is available from your responsible officer."
      },
      {
        id: "announcement-published",
        title: "Published",
        body: "May 7, 2026, 12:00"
      }
    ]);
    expect(screen.actions).toEqual([
      {
        id: "announcements",
        label: "Candidate Announcements",
        targetRoute: "CandidateAnnouncements"
      },
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(
      /brother|membership|degree|chat|comment|read receipt|delivery|participant/i
    );
  });

  it("fails candidate announcement detail closed when the id is not in the scoped list", () => {
    const screen = buildCandidateAnnouncementDetailScreen({
      state: "ready",
      response: fallbackCandidateAnnouncements,
      selectedAnnouncementId: "00000000-0000-4000-8000-000000000000",
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "CandidateAnnouncementDetail",
      state: "empty",
      title: "Candidate Announcement",
      body: "This candidate-visible announcement is not available.",
      sections: []
    });
  });

  it("builds plan-to-attend action when the candidate has no active intent", () => {
    expect(
      buildCandidateEventDetailScreen({
        state: "ready",
        response: {
          event: {
            ...fallbackCandidateEventDetail.event,
            currentUserParticipation: null
          }
        },
        runtimeMode: "api"
      }).actions[0]
    ).toEqual({
      id: "plan-to-attend",
      label: "Plan to attend",
      targetRoute: "CandidateEventDetail",
      targetId: fallbackCandidateEventDetail.event.id
    });
  });

  it("builds candidate roadmap sections from the assigned roadmap without submission actions", () => {
    const screen = buildCandidateRoadmapScreen({
      state: "ready",
      response: fallbackCandidateRoadmap,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "CandidateRoadmap",
      state: "ready",
      title: "Candidate Onboarding Roadmap",
      body: "1 roadmap stages - 1 roadmap steps",
      demoChromeVisible: false
    });
    expect(screen.sections).toEqual([
      {
        id: `stage-${fallbackCandidateRoadmap.roadmap!.stages[0]!.id}`,
        title: "Discernment",
        body: "1 roadmap steps"
      },
      expect.objectContaining({
        id: `step-${fallbackCandidateRoadmap.roadmap!.stages[0]!.steps[0]!.id}`,
        title: "Meet your officer"
      })
    ]);
    expect(screen.sections[1]?.body).toContain("Read-only step.");
    expect(screen.actions).toEqual([
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ]);
    expect(JSON.stringify(screen)).not.toMatch(/brother|degree|submit reflection/i);
  });

  it("maps forbidden and empty states without private sections", () => {
    expect(buildCandidateDashboardScreen({ state: "forbidden", runtimeMode: "api" })).toMatchObject(
      {
        state: "forbidden",
        sections: [],
        actions: []
      }
    );
    expect(buildCandidateDashboardScreen({ state: "ready", runtimeMode: "demo" })).toMatchObject({
      state: "empty",
      demoChromeVisible: true
    });
    expect(
      buildCandidateDashboardScreen({ state: "idleApproval", runtimeMode: "api" })
    ).toMatchObject({
      state: "idleApproval",
      title: "Account Approval Pending",
      sections: [],
      actions: []
    });
    expect(buildCandidateEventsScreen({ state: "ready", runtimeMode: "demo" })).toMatchObject({
      route: "CandidateEvents",
      state: "empty",
      demoChromeVisible: true
    });
    expect(
      buildCandidateEventDetailScreen({ state: "idleApproval", runtimeMode: "api" })
    ).toMatchObject({
      route: "CandidateEventDetail",
      state: "idleApproval",
      title: "Account Approval Pending",
      sections: [],
      actions: []
    });
    expect(
      buildCandidateAnnouncementsScreen({ state: "idleApproval", runtimeMode: "api" })
    ).toMatchObject({
      route: "CandidateAnnouncements",
      state: "idleApproval",
      title: "Account Approval Pending",
      sections: [],
      actions: []
    });
    expect(
      buildCandidateAnnouncementsScreen({
        state: "ready",
        response: { announcements: [], pagination: { limit: 20, offset: 0 } },
        runtimeMode: "demo"
      })
    ).toMatchObject({
      route: "CandidateAnnouncements",
      state: "empty",
      demoChromeVisible: true,
      actions: []
    });
    expect(buildCandidateRoadmapScreen({ state: "ready", runtimeMode: "demo" })).toMatchObject({
      route: "CandidateRoadmap",
      state: "empty",
      title: "Candidate Roadmap",
      demoChromeVisible: true,
      actions: []
    });
  });
});
