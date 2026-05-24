import { describe, expect, it, vi } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { RoadmapController } from "./roadmap.controller.js";
import type { RoadmapService } from "./roadmap.service.js";
import type {
  AdminRoadmapSubmissionDetailResponse,
  AdminRoadmapSubmissionListResponse,
  AssignedRoadmapResponse,
  RoadmapSubmissionResponse
} from "./roadmap.types.js";

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

const adminRoadmapSubmissionResponse: AdminRoadmapSubmissionDetailResponse = {
  roadmapSubmission: {
    ...submissionResponse.submission,
    submitterUserId: principal.id,
    submitterName: principal.displayName,
    submitterEmail: principal.email,
    roadmapTitle: "Brother Formation Roadmap",
    roadmapTargetRole: "BROTHER",
    stageTitle: "Discernment",
    stepTitle: "Meet your officer",
    organizationUnitId: null,
    organizationUnitName: null,
    bodyPreview: "Reflection text.",
    attachmentCount: 0
  }
};

const adminRoadmapSubmissionListResponse: AdminRoadmapSubmissionListResponse = {
  roadmapSubmissions: [
    {
      id: adminRoadmapSubmissionResponse.roadmapSubmission.id,
      assignmentId: adminRoadmapSubmissionResponse.roadmapSubmission.assignmentId,
      stepId: adminRoadmapSubmissionResponse.roadmapSubmission.stepId,
      submitterUserId: adminRoadmapSubmissionResponse.roadmapSubmission.submitterUserId,
      submitterName: adminRoadmapSubmissionResponse.roadmapSubmission.submitterName,
      submitterEmail: adminRoadmapSubmissionResponse.roadmapSubmission.submitterEmail,
      roadmapTitle: adminRoadmapSubmissionResponse.roadmapSubmission.roadmapTitle,
      roadmapTargetRole: adminRoadmapSubmissionResponse.roadmapSubmission.roadmapTargetRole,
      stageTitle: adminRoadmapSubmissionResponse.roadmapSubmission.stageTitle,
      stepTitle: adminRoadmapSubmissionResponse.roadmapSubmission.stepTitle,
      organizationUnitId: adminRoadmapSubmissionResponse.roadmapSubmission.organizationUnitId,
      organizationUnitName: adminRoadmapSubmissionResponse.roadmapSubmission.organizationUnitName,
      status: adminRoadmapSubmissionResponse.roadmapSubmission.status,
      bodyPreview: adminRoadmapSubmissionResponse.roadmapSubmission.bodyPreview,
      attachmentCount: adminRoadmapSubmissionResponse.roadmapSubmission.attachmentCount,
      reviewComment: adminRoadmapSubmissionResponse.roadmapSubmission.reviewComment,
      reviewedAt: adminRoadmapSubmissionResponse.roadmapSubmission.reviewedAt,
      createdAt: adminRoadmapSubmissionResponse.roadmapSubmission.createdAt,
      updatedAt: adminRoadmapSubmissionResponse.roadmapSubmission.updatedAt
    }
  ]
};

describe("RoadmapController", () => {
  it("delegates candidate and brother roadmap reads using the guard-attached principal", async () => {
    const getCandidateRoadmap = vi.fn(() => Promise.resolve(response));
    const getBrotherRoadmap = vi.fn(() => Promise.resolve(response));
    const submitBrotherRoadmapStep = vi.fn(() => Promise.resolve(submissionResponse));
    const listAdminRoadmapSubmissions = vi.fn(() =>
      Promise.resolve(adminRoadmapSubmissionListResponse)
    );
    const getAdminRoadmapSubmission = vi.fn(() =>
      Promise.resolve(adminRoadmapSubmissionResponse)
    );
    const reviewAdminRoadmapSubmission = vi.fn(() =>
      Promise.resolve(adminRoadmapSubmissionResponse)
    );
    const controller = new RoadmapController({
      getCandidateRoadmap,
      getBrotherRoadmap,
      submitBrotherRoadmapStep,
      listAdminRoadmapSubmissions,
      getAdminRoadmapSubmission,
      reviewAdminRoadmapSubmission
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
    await expect(controller.listAdminRoadmapSubmissions({ principal })).resolves.toBe(
      adminRoadmapSubmissionListResponse
    );
    await expect(
      controller.getAdminRoadmapSubmission({ principal }, submissionResponse.submission.id)
    ).resolves.toBe(adminRoadmapSubmissionResponse);
    await expect(
      controller.reviewAdminRoadmapSubmission({ principal }, submissionResponse.submission.id, {
        status: "approved",
        reviewComment: "Approved."
      })
    ).resolves.toBe(adminRoadmapSubmissionResponse);
    expect(getCandidateRoadmap).toHaveBeenCalledWith(principal);
    expect(getBrotherRoadmap).toHaveBeenCalledWith(principal);
    expect(submitBrotherRoadmapStep).toHaveBeenCalledWith(principal, stepId, {
      stepId,
      body: "Reflection text.",
      attachmentMetadata: []
    });
    expect(listAdminRoadmapSubmissions).toHaveBeenCalledWith(principal);
    expect(getAdminRoadmapSubmission).toHaveBeenCalledWith(
      principal,
      submissionResponse.submission.id
    );
    expect(reviewAdminRoadmapSubmission).toHaveBeenCalledWith(
      principal,
      submissionResponse.submission.id,
      {
        status: "approved",
        reviewComment: "Approved."
      }
    );
  });

  it("fails closed if the guard did not attach a principal", () => {
    const controller = new RoadmapController({
      getCandidateRoadmap: vi.fn(),
      getBrotherRoadmap: vi.fn(),
      submitBrotherRoadmapStep: vi.fn(),
      listAdminRoadmapSubmissions: vi.fn(),
      getAdminRoadmapSubmission: vi.fn(),
      reviewAdminRoadmapSubmission: vi.fn()
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
    expect(() => controller.listAdminRoadmapSubmissions({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.getAdminRoadmapSubmission({}, submissionResponse.submission.id)).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() =>
      controller.reviewAdminRoadmapSubmission({}, submissionResponse.submission.id, {
        status: "approved",
        reviewComment: null
      })
    ).toThrow("CurrentUserGuard did not attach a principal.");
  });
});
