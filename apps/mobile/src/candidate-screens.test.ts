import { designTokens } from "@jp2/shared-design-tokens";
import { describe, expect, it } from "vitest";
import {
  fallbackCandidateEventDetail,
  fallbackCandidateEvents,
  fallbackCandidateDashboard
} from "./candidate-dashboard.js";
import {
  buildCandidateEventDetailScreen,
  buildCandidateEventsScreen,
  buildCandidateDashboardScreen
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
      title: "Candidate Events",
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
  });
});
