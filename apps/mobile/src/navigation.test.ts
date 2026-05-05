import { describe, expect, it } from "vitest";
import { resolveMobileLaunchState } from "./navigation.js";

describe("mobile public launch state", () => {
  it("opens public home without a session", () => {
    expect(resolveMobileLaunchState(null)).toMatchObject({
      mode: "public",
      initialRoute: "PublicHome",
      state: "ready",
      runtimeMode: "api",
      demoChromeVisible: false,
      publicHome: {
        intro: {
          title: "JP2 App"
        },
        prayerOfDay: null,
        nextEvents: []
      }
    });
  });

  it("marks demo mode visibly while preserving the public home route", () => {
    expect(resolveMobileLaunchState(undefined, { runtimeMode: "demo" })).toMatchObject({
      mode: "public",
      initialRoute: "PublicHome",
      demoChromeVisible: true
    });
  });

  it("routes active authenticated users to their private mode landing screens", () => {
    expect(
      resolveMobileLaunchState({
        id: "candidate_1",
        roles: ["CANDIDATE"],
        status: "active"
      })
    ).toMatchObject({
      mode: "candidate",
      initialRoute: "CandidateDashboard"
    });
    expect(
      resolveMobileLaunchState({
        id: "brother_1",
        roles: ["BROTHER"],
        status: "active"
      })
    ).toMatchObject({
      mode: "brother",
      initialRoute: "BrotherToday"
    });
  });

  it("falls back to public home for inactive users without exposing private state", () => {
    expect(
      resolveMobileLaunchState({
        id: "inactive_brother",
        roles: ["BROTHER"],
        status: "inactive"
      })
    ).toMatchObject({
      mode: "public",
      initialRoute: "PublicHome"
    });
  });

  it("keeps idle approval users on public home with approval state visible", () => {
    expect(
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
    ).toMatchObject({
      mode: "public",
      initialRoute: "PublicHome",
      state: "idleApproval",
      idleApproval: {
        state: "pending"
      },
      publicHome: {
        intro: {
          title: "JP2 App"
        }
      }
    });
  });
});
