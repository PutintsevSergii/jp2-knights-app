import { describe, expect, it, vi } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { RoadmapController } from "./roadmap.controller.js";
import type { RoadmapService } from "./roadmap.service.js";
import type {
  AdminRoadmapAssignmentDetailResponse,
  AdminRoadmapAssignmentListResponse,
  AdminRoadmapDefinitionDetailResponse,
  AdminRoadmapDefinitionListResponse,
  AdminRoadmapSubmissionDetailResponse,
  AdminRoadmapSubmissionErasureResponse,
  AdminRoadmapSubmissionExportResponse,
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

const adminRoadmapSubmissionExportResponse: AdminRoadmapSubmissionExportResponse = {
  roadmapSubmission: {
    ...adminRoadmapSubmissionResponse.roadmapSubmission,
    archivedAt: null
  },
  exportedAt: "2026-06-03T10:00:00.000Z"
};

const adminRoadmapSubmissionErasureResponse: AdminRoadmapSubmissionErasureResponse = {
  roadmapSubmissionId: adminRoadmapSubmissionResponse.roadmapSubmission.id,
  erasedAt: "2026-06-03T11:00:00.000Z",
  archivedAt: "2026-06-03T11:00:00.000Z"
};

const adminRoadmapDefinitionResponse: AdminRoadmapDefinitionDetailResponse = {
  roadmapDefinition: {
    id: "66666666-6666-4666-8666-666666666666",
    title: "Brother Formation Roadmap",
    targetRole: "BROTHER",
    language: "en",
    status: "PUBLISHED",
    publishedAt: "2026-05-09T09:00:00.000Z",
    stageCount: 1,
    stepCount: 1,
    assignmentCount: 1,
    createdAt: "2026-05-09T09:00:00.000Z",
    updatedAt: "2026-05-09T09:00:00.000Z",
    archivedAt: null,
    stages: []
  }
};

const adminRoadmapDefinitionListResponse: AdminRoadmapDefinitionListResponse = {
  roadmapDefinitions: [
    {
      id: adminRoadmapDefinitionResponse.roadmapDefinition.id,
      title: adminRoadmapDefinitionResponse.roadmapDefinition.title,
      targetRole: adminRoadmapDefinitionResponse.roadmapDefinition.targetRole,
      language: adminRoadmapDefinitionResponse.roadmapDefinition.language,
      status: adminRoadmapDefinitionResponse.roadmapDefinition.status,
      publishedAt: adminRoadmapDefinitionResponse.roadmapDefinition.publishedAt,
      stageCount: adminRoadmapDefinitionResponse.roadmapDefinition.stageCount,
      stepCount: adminRoadmapDefinitionResponse.roadmapDefinition.stepCount,
      assignmentCount: adminRoadmapDefinitionResponse.roadmapDefinition.assignmentCount,
      createdAt: adminRoadmapDefinitionResponse.roadmapDefinition.createdAt,
      updatedAt: adminRoadmapDefinitionResponse.roadmapDefinition.updatedAt,
      archivedAt: adminRoadmapDefinitionResponse.roadmapDefinition.archivedAt
    }
  ]
};

const adminRoadmapAssignmentResponse: AdminRoadmapAssignmentDetailResponse = {
  roadmapAssignment: {
    id: adminRoadmapSubmissionResponse.roadmapSubmission.assignmentId,
    assigneeUserId: principal.id,
    assigneeName: principal.displayName,
    assigneeEmail: principal.email,
    roadmapDefinitionId: adminRoadmapDefinitionResponse.roadmapDefinition.id,
    roadmapTitle: adminRoadmapDefinitionResponse.roadmapDefinition.title,
    roadmapTargetRole: "BROTHER",
    roadmapStatus: "PUBLISHED",
    organizationUnitId: null,
    organizationUnitName: null,
    status: "active",
    assignedByUserId: null,
    assignedByName: null,
    assignedAt: "2026-05-09T09:00:00.000Z",
    completedAt: null,
    submissionCount: 1,
    pendingSubmissionCount: 1,
    createdAt: "2026-05-09T09:00:00.000Z",
    updatedAt: "2026-05-09T09:00:00.000Z",
    archivedAt: null,
    submissions: [
      {
        id: adminRoadmapSubmissionResponse.roadmapSubmission.id,
        stepId: adminRoadmapSubmissionResponse.roadmapSubmission.stepId,
        stageTitle: adminRoadmapSubmissionResponse.roadmapSubmission.stageTitle,
        stepTitle: adminRoadmapSubmissionResponse.roadmapSubmission.stepTitle,
        status: adminRoadmapSubmissionResponse.roadmapSubmission.status,
        attachmentCount: adminRoadmapSubmissionResponse.roadmapSubmission.attachmentCount,
        reviewComment: adminRoadmapSubmissionResponse.roadmapSubmission.reviewComment,
        reviewedAt: adminRoadmapSubmissionResponse.roadmapSubmission.reviewedAt,
        createdAt: adminRoadmapSubmissionResponse.roadmapSubmission.createdAt,
        updatedAt: adminRoadmapSubmissionResponse.roadmapSubmission.updatedAt
      }
    ]
  }
};

const adminRoadmapAssignmentListResponse: AdminRoadmapAssignmentListResponse = {
  roadmapAssignments: [
    {
      id: adminRoadmapAssignmentResponse.roadmapAssignment.id,
      assigneeUserId: adminRoadmapAssignmentResponse.roadmapAssignment.assigneeUserId,
      assigneeName: adminRoadmapAssignmentResponse.roadmapAssignment.assigneeName,
      assigneeEmail: adminRoadmapAssignmentResponse.roadmapAssignment.assigneeEmail,
      roadmapDefinitionId: adminRoadmapAssignmentResponse.roadmapAssignment.roadmapDefinitionId,
      roadmapTitle: adminRoadmapAssignmentResponse.roadmapAssignment.roadmapTitle,
      roadmapTargetRole: adminRoadmapAssignmentResponse.roadmapAssignment.roadmapTargetRole,
      roadmapStatus: adminRoadmapAssignmentResponse.roadmapAssignment.roadmapStatus,
      organizationUnitId: adminRoadmapAssignmentResponse.roadmapAssignment.organizationUnitId,
      organizationUnitName: adminRoadmapAssignmentResponse.roadmapAssignment.organizationUnitName,
      status: adminRoadmapAssignmentResponse.roadmapAssignment.status,
      assignedByUserId: adminRoadmapAssignmentResponse.roadmapAssignment.assignedByUserId,
      assignedByName: adminRoadmapAssignmentResponse.roadmapAssignment.assignedByName,
      assignedAt: adminRoadmapAssignmentResponse.roadmapAssignment.assignedAt,
      completedAt: adminRoadmapAssignmentResponse.roadmapAssignment.completedAt,
      submissionCount: adminRoadmapAssignmentResponse.roadmapAssignment.submissionCount,
      pendingSubmissionCount: adminRoadmapAssignmentResponse.roadmapAssignment.pendingSubmissionCount,
      createdAt: adminRoadmapAssignmentResponse.roadmapAssignment.createdAt,
      updatedAt: adminRoadmapAssignmentResponse.roadmapAssignment.updatedAt,
      archivedAt: adminRoadmapAssignmentResponse.roadmapAssignment.archivedAt
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
    const exportAdminRoadmapSubmission = vi.fn(() =>
      Promise.resolve(adminRoadmapSubmissionExportResponse)
    );
    const eraseAdminRoadmapSubmission = vi.fn(() =>
      Promise.resolve(adminRoadmapSubmissionErasureResponse)
    );
    const reviewAdminRoadmapSubmission = vi.fn(() =>
      Promise.resolve(adminRoadmapSubmissionResponse)
    );
    const listAdminRoadmapAssignments = vi.fn(() =>
      Promise.resolve(adminRoadmapAssignmentListResponse)
    );
    const getAdminRoadmapAssignment = vi.fn(() => Promise.resolve(adminRoadmapAssignmentResponse));
    const createAdminRoadmapAssignment = vi.fn(() =>
      Promise.resolve(adminRoadmapAssignmentResponse)
    );
    const listAdminRoadmapDefinitions = vi.fn(() =>
      Promise.resolve(adminRoadmapDefinitionListResponse)
    );
    const getAdminRoadmapDefinition = vi.fn(() => Promise.resolve(adminRoadmapDefinitionResponse));
    const controller = new RoadmapController({
      getCandidateRoadmap,
      getBrotherRoadmap,
      submitBrotherRoadmapStep,
      listAdminRoadmapSubmissions,
      getAdminRoadmapSubmission,
      exportAdminRoadmapSubmission,
      eraseAdminRoadmapSubmission,
      reviewAdminRoadmapSubmission,
      listAdminRoadmapAssignments,
      getAdminRoadmapAssignment,
      createAdminRoadmapAssignment,
      listAdminRoadmapDefinitions,
      getAdminRoadmapDefinition
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
      controller.exportAdminRoadmapSubmission({ principal }, submissionResponse.submission.id)
    ).resolves.toBe(adminRoadmapSubmissionExportResponse);
    await expect(
      controller.eraseAdminRoadmapSubmission({ principal }, submissionResponse.submission.id)
    ).resolves.toBe(adminRoadmapSubmissionErasureResponse);
    await expect(
      controller.reviewAdminRoadmapSubmission({ principal }, submissionResponse.submission.id, {
        status: "approved",
        reviewComment: "Approved."
      })
    ).resolves.toBe(adminRoadmapSubmissionResponse);
    await expect(controller.listAdminRoadmapAssignments({ principal })).resolves.toBe(
      adminRoadmapAssignmentListResponse
    );
    await expect(
      controller.getAdminRoadmapAssignment(
        { principal },
        adminRoadmapAssignmentResponse.roadmapAssignment.id
      )
    ).resolves.toBe(adminRoadmapAssignmentResponse);
    await expect(
      controller.createAdminRoadmapAssignment({ principal }, {
        assigneeUserId: principal.id,
        roadmapDefinitionId: adminRoadmapDefinitionResponse.roadmapDefinition.id,
        organizationUnitId: null
      })
    ).resolves.toBe(adminRoadmapAssignmentResponse);
    await expect(controller.listAdminRoadmapDefinitions({ principal })).resolves.toBe(
      adminRoadmapDefinitionListResponse
    );
    await expect(
      controller.getAdminRoadmapDefinition(
        { principal },
        adminRoadmapDefinitionResponse.roadmapDefinition.id
      )
    ).resolves.toBe(adminRoadmapDefinitionResponse);
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
    expect(exportAdminRoadmapSubmission).toHaveBeenCalledWith(
      principal,
      submissionResponse.submission.id
    );
    expect(eraseAdminRoadmapSubmission).toHaveBeenCalledWith(
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
    expect(listAdminRoadmapAssignments).toHaveBeenCalledWith(principal);
    expect(getAdminRoadmapAssignment).toHaveBeenCalledWith(
      principal,
      adminRoadmapAssignmentResponse.roadmapAssignment.id
    );
    expect(createAdminRoadmapAssignment).toHaveBeenCalledWith(principal, {
      assigneeUserId: principal.id,
      roadmapDefinitionId: adminRoadmapDefinitionResponse.roadmapDefinition.id,
      organizationUnitId: null
    });
    expect(listAdminRoadmapDefinitions).toHaveBeenCalledWith(principal);
    expect(getAdminRoadmapDefinition).toHaveBeenCalledWith(
      principal,
      adminRoadmapDefinitionResponse.roadmapDefinition.id
    );
  });

  it("fails closed if the guard did not attach a principal", () => {
    const controller = new RoadmapController({
      getCandidateRoadmap: vi.fn(),
      getBrotherRoadmap: vi.fn(),
      submitBrotherRoadmapStep: vi.fn(),
      listAdminRoadmapSubmissions: vi.fn(),
      getAdminRoadmapSubmission: vi.fn(),
      exportAdminRoadmapSubmission: vi.fn(),
      eraseAdminRoadmapSubmission: vi.fn(),
      reviewAdminRoadmapSubmission: vi.fn(),
      listAdminRoadmapAssignments: vi.fn(),
      getAdminRoadmapAssignment: vi.fn(),
      createAdminRoadmapAssignment: vi.fn(),
      listAdminRoadmapDefinitions: vi.fn(),
      getAdminRoadmapDefinition: vi.fn()
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
      controller.exportAdminRoadmapSubmission({}, submissionResponse.submission.id)
    ).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() =>
      controller.eraseAdminRoadmapSubmission({}, submissionResponse.submission.id)
    ).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() =>
      controller.reviewAdminRoadmapSubmission({}, submissionResponse.submission.id, {
        status: "approved",
        reviewComment: null
      })
    ).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() => controller.listAdminRoadmapAssignments({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() =>
      controller.getAdminRoadmapAssignment(
        {},
        adminRoadmapAssignmentResponse.roadmapAssignment.id
      )
    ).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() =>
      controller.createAdminRoadmapAssignment({}, {
        assigneeUserId: principal.id,
        roadmapDefinitionId: adminRoadmapDefinitionResponse.roadmapDefinition.id,
        organizationUnitId: null
      })
    ).toThrow("CurrentUserGuard did not attach a principal.");
    expect(() => controller.listAdminRoadmapDefinitions({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() =>
      controller.getAdminRoadmapDefinition(
        {},
        adminRoadmapDefinitionResponse.roadmapDefinition.id
      )
    ).toThrow("CurrentUserGuard did not attach a principal.");
  });
});
