import { describe, expect, it, vi } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { RoadmapController } from "./roadmap.controller.js";
import type { RoadmapService } from "./roadmap.service.js";
import type { AssignedRoadmapResponse, RoadmapSubmissionResponse } from "./roadmap.types.js";

const principal: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"]
};

const response: AssignedRoadmapResponse = {
  roadmap: null
};

const stepId = "33333333-3333-4333-8333-333333333333";

const submissionResponse: RoadmapSubmissionResponse = {
  submission: {
    id: "44444444-4444-4444-8444-444444444444",
    assignmentId: "55555555-5555-4555-8555-555555555555",
    stepId,
    status: "pending_review",
    body: "Reflection text.",
    attachmentMetadata: [],
    reviewComment: null,
    reviewedAt: null,
    createdAt: "2026-05-11T09:00:00.000Z",
    updatedAt: "2026-05-11T09:00:00.000Z"
  }
};

describe("RoadmapController", () => {
  it("delegates candidate and brother roadmap reads using the guard-attached principal", async () => {
    const getCandidateRoadmap = vi.fn(() => Promise.resolve(response));
    const getBrotherRoadmap = vi.fn(() => Promise.resolve(response));
    const submitBrotherRoadmapStep = vi.fn(() => Promise.resolve(submissionResponse));
    const controller = new RoadmapController({
      getCandidateRoadmap,
      getBrotherRoadmap,
      submitBrotherRoadmapStep
    } as unknown as RoadmapService);

    await expect(controller.getCandidateRoadmap({ principal })).resolves.toBe(response);
    await expect(controller.getBrotherRoadmap({ principal })).resolves.toBe(response);
    await expect(
      controller.submitBrotherRoadmapStep({ principal }, stepId, {
        stepId,
        body: "Reflection text.",
        attachmentMetadata: []
      })
    ).resolves.toBe(submissionResponse);
    expect(getCandidateRoadmap).toHaveBeenCalledWith(principal);
    expect(getBrotherRoadmap).toHaveBeenCalledWith(principal);
    expect(submitBrotherRoadmapStep).toHaveBeenCalledWith(principal, stepId, {
      stepId,
      body: "Reflection text.",
      attachmentMetadata: []
    });
  });

  it("fails closed if the guard did not attach a principal", () => {
    const controller = new RoadmapController({
      getCandidateRoadmap: vi.fn(),
      getBrotherRoadmap: vi.fn(),
      submitBrotherRoadmapStep: vi.fn()
    } as unknown as RoadmapService);

    expect(() => controller.getCandidateRoadmap({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.getBrotherRoadmap({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() =>
      controller.submitBrotherRoadmapStep({}, stepId, {
        stepId,
        body: "Reflection text.",
        attachmentMetadata: []
      })
    ).toThrow("CurrentUserGuard did not attach a principal.");
  });
});
