import { describe, expect, it } from "vitest";
import type {
  AssignedRoadmapResponseDto,
  BrotherSilentPrayerJoinResponseDto,
  BrotherSilentPrayerListResponseDto,
  SilentPrayerPresenceDto
} from "@jp2/shared-validation";
import {
  applyBrotherSilentPrayerJoin,
  applyBrotherSilentPrayerPresence,
  applyBrotherSilentPrayerPresenceToJoin,
  applyRoadmapSubmission,
  buildDemoRoadmapSubmission
} from "./brother-surface-state.js";

describe("brother surface state reducers", () => {
  it("updates silent-prayer session and joined presence snapshots", () => {
    const list = {
      sessions: [
        { id: "event-1", activeCount: 1 },
        { id: "event-2", activeCount: 2 }
      ]
    } as BrotherSilentPrayerListResponseDto;
    const joined = {
      session: { id: "event-1", activeCount: 3 },
      presence: { eventId: "event-1", activeCount: 3 }
    } as BrotherSilentPrayerJoinResponseDto;
    const presence = { eventId: "event-1", activeCount: 4 } as SilentPrayerPresenceDto;

    expect(applyBrotherSilentPrayerJoin(list, joined).sessions[0]?.activeCount).toBe(3);
    expect(applyBrotherSilentPrayerPresence(list, presence).sessions[0]?.activeCount).toBe(4);
    expect(applyBrotherSilentPrayerPresenceToJoin(joined, presence).session.activeCount).toBe(4);
  });

  it("applies roadmap submissions and builds deterministic demo submissions", () => {
    const response = {
      roadmap: {
        assignmentId: "assignment-1",
        stages: [{ steps: [{ id: "step-1", latestSubmission: null }] }]
      }
    } as AssignedRoadmapResponseDto;
    const submission = buildDemoRoadmapSubmission(response, "step-1", "Done");

    expect(submission.assignmentId).toBe("assignment-1");
    expect(applyRoadmapSubmission(response, "step-1", submission).roadmap?.stages[0]?.steps[0]?.latestSubmission).toEqual(
      submission
    );
  });
});
