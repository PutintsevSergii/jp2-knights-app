import { designTokens } from "@jp2/shared-design-tokens";
import { describe, expect, it } from "vitest";
import { fallbackCandidateDashboard } from "./candidate-dashboard.js";
import { buildCandidateDashboardScreen } from "./candidate-screens.js";

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
  });
});
