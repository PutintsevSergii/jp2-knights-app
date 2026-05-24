import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { RoadmapRepository } from "./roadmap.repository.js";
import { RoadmapService } from "./roadmap.service.js";
import type {
  AdminRoadmapAssignmentDetail,
  AdminRoadmapDefinitionDetail,
  AdminRoadmapDefinitionAssignmentTarget,
  AssignedRoadmap,
  CreateAdminRoadmapAssignmentInput,
  RoadmapBrotherAccessProfile,
  RoadmapSubmissionSummary,
  RoadmapSubmissionTarget
} from "./roadmap.types.js";

const organizationUnitId = "11111111-1111-4111-8111-111111111111";

const candidate: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"],
  candidateOrganizationUnitId: organizationUnitId
};

const brother: CurrentUserPrincipal = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnitId]
};

const officer: CurrentUserPrincipal = {
  id: "3f3f3f3f-3333-4333-8333-333333333333",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: [organizationUnitId]
};

const superAdmin: CurrentUserPrincipal = {
  id: "4f4f4f4f-4444-4444-8444-444444444444",
  email: "super-admin@example.test",
  displayName: "Super Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

const idleUser: CurrentUserPrincipal = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "idle@example.test",
  displayName: "Idle User",
  status: "active",
  roles: [],
  approval: {
    state: "pending",
    expiresAt: "2026-06-04T08:00:00.000Z",
    scopeOrganizationUnitId: organizationUnitId
  }
};

const candidateRoadmap: AssignedRoadmap = {
  assignmentId: "55555555-5555-4555-8555-555555555555",
  status: "active",
  assignedAt: "2026-05-09T09:00:00.000Z",
  completedAt: null,
  organizationUnitId,
  definition: {
    id: "66666666-6666-4666-8666-666666666666",
    title: "Candidate Onboarding Roadmap",
    targetRole: "CANDIDATE",
    language: "en",
    status: "PUBLISHED",
    publishedAt: "2026-05-09T09:00:00.000Z"
  },
  stages: [
    {
      id: "77777777-7777-4777-8777-777777777777",
      title: "Discernment",
      sortOrder: 1,
      steps: [
        {
          id: "88888888-8888-4888-8888-888888888888",
          title: "Meet your officer",
          description: "Confirm the first candidate conversation.",
          requiresSubmission: false,
          sortOrder: 1,
          status: "PUBLISHED",
          latestSubmission: null
        }
      ]
    }
  ]
};

const brotherRoadmap: AssignedRoadmap = {
  ...candidateRoadmap,
  assignmentId: "99999999-9999-4999-8999-999999999999",
  definition: {
    ...candidateRoadmap.definition,
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Brother Formation Roadmap",
    targetRole: "BROTHER"
  },
  stages: [
    {
      ...candidateRoadmap.stages[0]!,
      steps: [
        {
          ...candidateRoadmap.stages[0]!.steps[0]!,
          latestSubmission: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            assignmentId: "99999999-9999-4999-8999-999999999999",
            stepId: candidateRoadmap.stages[0]!.steps[0]!.id,
            status: "pending_review",
            body: "Reflection text.",
            attachmentMetadata: [],
            reviewComment: null,
            reviewedAt: null,
            createdAt: "2026-05-10T09:00:00.000Z",
            updatedAt: "2026-05-10T09:00:00.000Z"
          }
        }
      ]
    }
  ]
};

const submission: RoadmapSubmissionSummary = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  assignmentId: brotherRoadmap.assignmentId,
  stepId: brotherRoadmap.stages[0]!.steps[0]!.id,
  status: "pending_review",
  body: "Reflection text.",
  attachmentMetadata: [
    {
      originalFilename: "reflection.pdf",
      mimeType: "application/pdf",
      sizeBytes: 512
    }
  ],
  reviewComment: null,
  reviewedAt: null,
  createdAt: "2026-05-11T09:00:00.000Z",
  updatedAt: "2026-05-11T09:00:00.000Z"
};

const adminRoadmapSubmission = {
  ...submission,
  submitterUserId: brother.id,
  submitterName: brother.displayName,
  submitterEmail: brother.email,
  roadmapTitle: "Brother Formation Roadmap",
  roadmapTargetRole: "BROTHER" as const,
  stageTitle: "Discernment",
  stepTitle: "Meet your officer",
  organizationUnitId,
  organizationUnitName: "Pilot Organization Unit",
  bodyPreview: "Reflection text.",
  attachmentCount: 1
};

const adminRoadmapDefinition: AdminRoadmapDefinitionDetail = {
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
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
  stages: [
    {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      title: "Discernment",
      sortOrder: 1,
      steps: [
        {
          id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
          title: "Meet your officer",
          description: "Complete the required officer conversation.",
          requiresSubmission: true,
          sortOrder: 1,
          status: "PUBLISHED",
          publishedAt: "2026-05-09T09:00:00.000Z"
        }
      ]
    }
  ]
};

const adminRoadmapAssignment: AdminRoadmapAssignmentDetail = {
  id: brotherRoadmap.assignmentId,
  assigneeUserId: brother.id,
  assigneeName: brother.displayName,
  assigneeEmail: brother.email,
  roadmapDefinitionId: brotherRoadmap.definition.id,
  roadmapTitle: brotherRoadmap.definition.title,
  roadmapTargetRole: "BROTHER",
  roadmapStatus: "PUBLISHED",
  organizationUnitId,
  organizationUnitName: "Pilot Organization Unit",
  status: "active",
  assignedByUserId: officer.id,
  assignedByName: officer.displayName,
  assignedAt: brotherRoadmap.assignedAt,
  completedAt: null,
  submissionCount: 1,
  pendingSubmissionCount: 1,
  createdAt: brotherRoadmap.assignedAt,
  updatedAt: brotherRoadmap.assignedAt,
  archivedAt: null,
  submissions: [
    {
      id: adminRoadmapSubmission.id,
      stepId: adminRoadmapSubmission.stepId,
      stageTitle: adminRoadmapSubmission.stageTitle,
      stepTitle: adminRoadmapSubmission.stepTitle,
      status: adminRoadmapSubmission.status,
      attachmentCount: adminRoadmapSubmission.attachmentCount,
      reviewComment: adminRoadmapSubmission.reviewComment,
      reviewedAt: adminRoadmapSubmission.reviewedAt,
      createdAt: adminRoadmapSubmission.createdAt,
      updatedAt: adminRoadmapSubmission.updatedAt
    }
  ]
};

describe("RoadmapService", () => {
  it("returns the active candidate's own assigned roadmap", async () => {
    const repository = roadmapRepository({
      candidateProfile: { assignedOrganizationUnitId: organizationUnitId },
      roadmap: candidateRoadmap
    });

    await expect(service(repository).getCandidateRoadmap(candidate)).resolves.toEqual({
      roadmap: candidateRoadmap
    });
    expect(repository.lookups).toEqual([
      {
        userId: candidate.id,
        targetRole: "CANDIDATE",
        organizationUnitIds: [organizationUnitId]
      }
    ]);
  });

  it("returns null when an active candidate has no assigned roadmap", async () => {
    await expect(
      service(
        roadmapRepository({
          candidateProfile: { assignedOrganizationUnitId: null },
          roadmap: null
        })
      ).getCandidateRoadmap(candidate)
    ).resolves.toEqual({ roadmap: null });
  });

  it("returns the active brother's own formation roadmap with own submissions only", async () => {
    const repository = roadmapRepository({
      brotherProfile: { organizationUnitIds: [organizationUnitId] },
      roadmap: brotherRoadmap
    });

    await expect(service(repository).getBrotherRoadmap(brother)).resolves.toEqual({
      roadmap: brotherRoadmap
    });
    expect(repository.lookups).toEqual([
      {
        userId: brother.id,
        targetRole: "BROTHER",
        organizationUnitIds: [organizationUnitId]
      }
    ]);
  });

  it("blocks wrong-role and idle principals before loading roadmap assignments", async () => {
    const repository = roadmapRepository({ roadmap: candidateRoadmap });
    const roadmapService = service(repository);

    await expect(roadmapService.getCandidateRoadmap(brother)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(roadmapService.getBrotherRoadmap(candidate)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(roadmapService.getCandidateRoadmap(idleUser)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ForbiddenException &&
        isIdleApprovalErrorResponse(error.getResponse())
    );
    expect(repository.lookups).toEqual([]);
  });

  it("requires active candidate and brother access profiles", async () => {
    await expect(
      service(roadmapRepository({ candidateProfile: null })).getCandidateRoadmap(
        candidate
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service(roadmapRepository({ brotherProfile: null })).getBrotherRoadmap(brother)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates a pending brother roadmap step submission for the brother's own submittable step", async () => {
    const repository = roadmapRepository({
      brotherProfile: { organizationUnitIds: [organizationUnitId] },
      submissionTarget: {
        assignmentId: brotherRoadmap.assignmentId,
        stepId: submission.stepId
      },
      pendingSubmission: null,
      createdSubmission: submission
    });

    await expect(
      service(repository).submitBrotherRoadmapStep(brother, submission.stepId, {
        stepId: submission.stepId,
        body: " Reflection text. ",
        attachmentMetadata: submission.attachmentMetadata
      })
    ).resolves.toEqual({ submission });
    expect(repository.submissionTargetLookups).toEqual([
      {
        userId: brother.id,
        stepId: submission.stepId,
        organizationUnitIds: [organizationUnitId]
      }
    ]);
    expect(repository.createdSubmissions).toEqual([
      {
        assignmentId: brotherRoadmap.assignmentId,
        stepId: submission.stepId,
        userId: brother.id,
        body: " Reflection text. ",
        attachmentMetadata: submission.attachmentMetadata
      }
    ]);
  });

  it("rejects brother roadmap submissions when the route and body step ids differ", async () => {
    const repository = roadmapRepository({
      brotherProfile: { organizationUnitIds: [organizationUnitId] }
    });

    await expect(
      service(repository).submitBrotherRoadmapStep(
        brother,
        submission.stepId,
        {
          stepId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
          body: "Reflection text.",
          attachmentMetadata: []
        }
      )
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.submissionTargetLookups).toEqual([]);
    expect(repository.createdSubmissions).toEqual([]);
  });

  it("hides non-owned, non-submittable, or out-of-scope brother roadmap steps", async () => {
    const repository = roadmapRepository({
      brotherProfile: { organizationUnitIds: [organizationUnitId] },
      submissionTarget: null
    });

    await expect(
      service(repository).submitBrotherRoadmapStep(brother, submission.stepId, {
        stepId: submission.stepId,
        body: "Reflection text.",
        attachmentMetadata: []
      })
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.createdSubmissions).toEqual([]);
  });

  it("prevents duplicate pending roadmap step submissions", async () => {
    const repository = roadmapRepository({
      brotherProfile: { organizationUnitIds: [organizationUnitId] },
      submissionTarget: {
        assignmentId: brotherRoadmap.assignmentId,
        stepId: submission.stepId
      },
      pendingSubmission: submission
    });

    await expect(
      service(repository).submitBrotherRoadmapStep(brother, submission.stepId, {
        stepId: submission.stepId,
        body: "Second reflection.",
        attachmentMetadata: []
      })
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.createdSubmissions).toEqual([]);
  });

  it("lists and reads roadmap submissions in the current admin scope", async () => {
    const repository = roadmapRepository({
      adminSubmissions: [adminRoadmapSubmission],
      adminSubmission: adminRoadmapSubmission
    });

    await expect(service(repository).listAdminRoadmapSubmissions(officer)).resolves.toEqual({
      roadmapSubmissions: [adminRoadmapSubmission]
    });
    await expect(
      service(repository).getAdminRoadmapSubmission(officer, adminRoadmapSubmission.id)
    ).resolves.toEqual({
      roadmapSubmission: adminRoadmapSubmission
    });
    expect(repository.adminSubmissionLookups).toEqual([
      {
        scopeOrganizationUnitIds: [organizationUnitId]
      },
      {
        id: adminRoadmapSubmission.id,
        scopeOrganizationUnitIds: [organizationUnitId]
      }
    ]);
  });

  it("reviews pending roadmap submissions with redacted audit summaries", async () => {
    const reviewedSubmission = {
      ...adminRoadmapSubmission,
      status: "approved" as const,
      reviewComment: "Approved after officer review.",
      reviewedAt: "2026-05-12T09:00:00.000Z"
    };
    const repository = roadmapRepository({
      adminSubmission: adminRoadmapSubmission,
      reviewedSubmission
    });
    const auditLog = auditLogRecorder();

    await expect(
      service(repository, auditLog).reviewAdminRoadmapSubmission(
        officer,
        adminRoadmapSubmission.id,
        {
          status: "approved",
          reviewComment: "Approved after officer review."
        }
      )
    ).resolves.toEqual({
      roadmapSubmission: reviewedSubmission
    });
    expect(repository.reviewInputs).toEqual([
      {
        id: adminRoadmapSubmission.id,
        scopeOrganizationUnitIds: [organizationUnitId],
        reviewerUserId: officer.id,
        status: "approved",
        reviewComment: "Approved after officer review."
      }
    ]);
    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.roadmapSubmission.approved",
      actorUserId: officer.id,
      entityType: "roadmap_submission",
      entityId: adminRoadmapSubmission.id,
      scopeOrganizationUnitId: organizationUnitId
    });
    expect(auditLog.records[0]?.beforeSummary).toMatchObject({
      hasBody: true,
      attachmentCount: 1,
      status: "pending_review"
    });
    expect(auditLog.records[0]?.beforeSummary).not.toHaveProperty("body");
  });

  it("blocks reviewed, out-of-scope, and non-admin roadmap reviews", async () => {
    await expect(
      service(
        roadmapRepository({
          adminSubmission: { ...adminRoadmapSubmission, status: "approved" }
        })
      ).reviewAdminRoadmapSubmission(officer, adminRoadmapSubmission.id, {
        status: "rejected",
        reviewComment: "Needs another pass."
      })
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      service(roadmapRepository({ adminSubmission: null })).getAdminRoadmapSubmission(
        officer,
        adminRoadmapSubmission.id
      )
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service(roadmapRepository({ adminSubmissions: [adminRoadmapSubmission] }))
        .listAdminRoadmapSubmissions(brother)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("lists and reads roadmap definitions for Super Admin only", async () => {
    const repository = roadmapRepository({
      adminDefinitions: [adminRoadmapDefinition],
      adminDefinition: adminRoadmapDefinition
    });

    await expect(service(repository).listAdminRoadmapDefinitions(superAdmin)).resolves.toEqual({
      roadmapDefinitions: [definitionSummary(adminRoadmapDefinition)]
    });
    await expect(
      service(repository).getAdminRoadmapDefinition(superAdmin, adminRoadmapDefinition.id)
    ).resolves.toEqual({
      roadmapDefinition: adminRoadmapDefinition
    });
    expect(repository.adminDefinitionLookups).toEqual([
      "list",
      `detail:${adminRoadmapDefinition.id}`
    ]);

    await expect(
      service(repository).listAdminRoadmapDefinitions(officer)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("lists and reads roadmap assignments for Super Admin only without submission bodies", async () => {
    const repository = roadmapRepository({
      adminAssignments: [adminRoadmapAssignment],
      adminAssignment: adminRoadmapAssignment
    });

    await expect(service(repository).listAdminRoadmapAssignments(superAdmin)).resolves.toEqual({
      roadmapAssignments: [assignmentSummary(adminRoadmapAssignment)]
    });
    await expect(
      service(repository).getAdminRoadmapAssignment(superAdmin, adminRoadmapAssignment.id)
    ).resolves.toEqual({
      roadmapAssignment: adminRoadmapAssignment
    });
    expect(repository.adminAssignmentLookups).toEqual([
      "list",
      `detail:${adminRoadmapAssignment.id}`
    ]);
    expect(adminRoadmapAssignment.submissions[0]).not.toHaveProperty("body");

    await expect(
      service(repository).listAdminRoadmapAssignments(officer)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("creates Super Admin roadmap assignments for eligible users with audit", async () => {
    const repository = roadmapRepository({
      adminAssignmentTarget: {
        id: brotherRoadmap.definition.id,
        title: brotherRoadmap.definition.title,
        targetRole: "BROTHER"
      },
      eligibleAssignee: { id: brother.id },
      duplicateAssignment: null,
      createdAssignment: adminRoadmapAssignment
    });
    const auditLog = auditLogRecorder();

    await expect(
      service(repository, auditLog).createAdminRoadmapAssignment(superAdmin, {
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        organizationUnitId
      })
    ).resolves.toEqual({ roadmapAssignment: adminRoadmapAssignment });
    expect(repository.createdAssignments).toEqual([
      {
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        organizationUnitId,
        assignedByUserId: superAdmin.id
      }
    ]);
    expect(auditLog.records[0]).toMatchObject({
      action: "admin.roadmapAssignment.create",
      actorUserId: superAdmin.id,
      entityType: "roadmap_assignment",
      entityId: adminRoadmapAssignment.id,
      scopeOrganizationUnitId: organizationUnitId,
      beforeSummary: null,
      afterSummary: {
        assignmentId: adminRoadmapAssignment.id,
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        roadmapTargetRole: "BROTHER",
        organizationUnitId,
        status: "active"
      }
    });
    expect(auditLog.records[0]?.afterSummary).not.toHaveProperty("assigneeEmail");
  });

  it("blocks invalid roadmap assignment creation targets", async () => {
    await expect(
      service(roadmapRepository()).createAdminRoadmapAssignment(officer, {
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        organizationUnitId
      })
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service(
        roadmapRepository({
          adminAssignmentTarget: null
        })
      ).createAdminRoadmapAssignment(superAdmin, {
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        organizationUnitId
      })
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service(
        roadmapRepository({
          adminAssignmentTarget: {
            id: brotherRoadmap.definition.id,
            title: brotherRoadmap.definition.title,
            targetRole: "BROTHER"
          },
          eligibleAssignee: null
        })
      ).createAdminRoadmapAssignment(superAdmin, {
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        organizationUnitId
      })
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service(
        roadmapRepository({
          adminAssignmentTarget: {
            id: brotherRoadmap.definition.id,
            title: brotherRoadmap.definition.title,
            targetRole: "BROTHER"
          },
          eligibleAssignee: { id: brother.id },
          duplicateAssignment: { id: adminRoadmapAssignment.id }
        })
      ).createAdminRoadmapAssignment(superAdmin, {
        assigneeUserId: brother.id,
        roadmapDefinitionId: brotherRoadmap.definition.id,
        organizationUnitId
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("returns not found for missing roadmap assignments", async () => {
    await expect(
      service(roadmapRepository({ adminAssignment: null })).getAdminRoadmapAssignment(
        superAdmin,
        adminRoadmapAssignment.id
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns not found for missing roadmap definitions", async () => {
    await expect(
      service(roadmapRepository({ adminDefinition: null })).getAdminRoadmapDefinition(
        superAdmin,
        adminRoadmapDefinition.id
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function service(repository: RoadmapRepository, auditLog: TestAuditLog = auditLogRecorder()) {
  return new RoadmapService(repository, auditLog as unknown as AuditLogService);
}

function roadmapRepository(options: {
  candidateProfile?: { assignedOrganizationUnitId: string | null } | null | undefined;
  brotherProfile?: RoadmapBrotherAccessProfile | null | undefined;
  roadmap?: AssignedRoadmap | null | undefined;
  submissionTarget?: RoadmapSubmissionTarget | null | undefined;
  pendingSubmission?: RoadmapSubmissionSummary | null | undefined;
  createdSubmission?: RoadmapSubmissionSummary | undefined;
  adminSubmissions?: typeof adminRoadmapSubmission[] | undefined;
  adminSubmission?: typeof adminRoadmapSubmission | null | undefined;
  reviewedSubmission?: typeof adminRoadmapSubmission | undefined;
  adminDefinitions?: AdminRoadmapDefinitionDetail[] | undefined;
  adminDefinition?: AdminRoadmapDefinitionDetail | null | undefined;
  adminAssignments?: AdminRoadmapAssignmentDetail[] | undefined;
  adminAssignment?: AdminRoadmapAssignmentDetail | null | undefined;
  adminAssignmentTarget?: AdminRoadmapDefinitionAssignmentTarget | null | undefined;
  eligibleAssignee?: { id: string } | null | undefined;
  duplicateAssignment?: { id: string } | null | undefined;
  createdAssignment?: AdminRoadmapAssignmentDetail | undefined;
} = {}) {
  class FakeRoadmapRepository implements RoadmapRepository {
    lookups: Array<{
      userId: string;
      targetRole: "CANDIDATE" | "BROTHER";
      organizationUnitIds: readonly string[];
    }> = [];
    submissionTargetLookups: Array<{
      userId: string;
      stepId: string;
      organizationUnitIds: readonly string[];
    }> = [];
    pendingSubmissionLookups: Array<{
      assignmentId: string;
      stepId: string;
    }> = [];
    createdSubmissions: Array<{
      assignmentId: string;
      stepId: string;
      userId: string;
      body: string;
      attachmentMetadata: readonly {
        originalFilename: string;
        mimeType: string;
        sizeBytes: number;
      }[];
    }> = [];
    adminSubmissionLookups: Array<{
      id?: string;
      scopeOrganizationUnitIds: readonly string[] | null;
    }> = [];
    reviewInputs: Array<{
      id: string;
      scopeOrganizationUnitIds: readonly string[] | null;
      reviewerUserId: string;
      status: "approved" | "rejected";
      reviewComment: string | null;
    }> = [];
    adminAssignmentLookups: string[] = [];
    adminDefinitionLookups: string[] = [];
    createdAssignments: CreateAdminRoadmapAssignmentInput[] = [];

    findActiveCandidateAccessProfile() {
      return Promise.resolve(options.candidateProfile ?? null);
    }

    findActiveBrotherAccessProfile() {
      return Promise.resolve(options.brotherProfile ?? null);
    }

    findAssignedRoadmap(lookup: {
      userId: string;
      targetRole: "CANDIDATE" | "BROTHER";
      organizationUnitIds: readonly string[];
    }) {
      this.lookups.push({
        userId: lookup.userId,
        targetRole: lookup.targetRole,
        organizationUnitIds: [...lookup.organizationUnitIds]
      });
      return Promise.resolve(options.roadmap ?? null);
    }

    findBrotherRoadmapSubmissionTarget(lookup: {
      userId: string;
      stepId: string;
      organizationUnitIds: readonly string[];
    }) {
      this.submissionTargetLookups.push({
        userId: lookup.userId,
        stepId: lookup.stepId,
        organizationUnitIds: [...lookup.organizationUnitIds]
      });
      return Promise.resolve(options.submissionTarget ?? null);
    }

    findPendingRoadmapSubmission(lookup: { assignmentId: string; stepId: string }) {
      this.pendingSubmissionLookups.push({
        assignmentId: lookup.assignmentId,
        stepId: lookup.stepId
      });
      return Promise.resolve(options.pendingSubmission ?? null);
    }

    createRoadmapSubmission(input: {
      assignmentId: string;
      stepId: string;
      userId: string;
      body: string;
      attachmentMetadata: readonly {
        originalFilename: string;
        mimeType: string;
        sizeBytes: number;
      }[];
    }) {
      this.createdSubmissions.push({
        assignmentId: input.assignmentId,
        stepId: input.stepId,
        userId: input.userId,
        body: input.body,
        attachmentMetadata: [...input.attachmentMetadata]
      });
      return Promise.resolve(options.createdSubmission ?? submission);
    }

    listAdminRoadmapSubmissions(lookup: { scopeOrganizationUnitIds: readonly string[] | null }) {
      this.adminSubmissionLookups.push({
        scopeOrganizationUnitIds:
          lookup.scopeOrganizationUnitIds === null ? null : [...lookup.scopeOrganizationUnitIds]
      });
      return Promise.resolve(options.adminSubmissions ?? []);
    }

    findAdminRoadmapSubmission(lookup: {
      id: string;
      scopeOrganizationUnitIds: readonly string[] | null;
    }) {
      this.adminSubmissionLookups.push({
        id: lookup.id,
        scopeOrganizationUnitIds:
          lookup.scopeOrganizationUnitIds === null ? null : [...lookup.scopeOrganizationUnitIds]
      });
      return Promise.resolve(options.adminSubmission ?? null);
    }

    reviewRoadmapSubmission(input: {
      id: string;
      scopeOrganizationUnitIds: readonly string[] | null;
      reviewerUserId: string;
      status: "approved" | "rejected";
      reviewComment: string | null;
    }) {
      this.reviewInputs.push({
        id: input.id,
        scopeOrganizationUnitIds:
          input.scopeOrganizationUnitIds === null ? null : [...input.scopeOrganizationUnitIds],
        reviewerUserId: input.reviewerUserId,
        status: input.status,
        reviewComment: input.reviewComment
      });
      return Promise.resolve(options.reviewedSubmission ?? adminRoadmapSubmission);
    }

    listAdminRoadmapAssignments() {
      this.adminAssignmentLookups.push("list");
      return Promise.resolve(
        (options.adminAssignments ?? []).map((assignment) => assignmentSummary(assignment))
      );
    }

    findAdminRoadmapAssignment(lookup: { id: string }) {
      this.adminAssignmentLookups.push(`detail:${lookup.id}`);
      return Promise.resolve(options.adminAssignment ?? null);
    }

    findPublishedRoadmapDefinitionAssignmentTarget() {
      return Promise.resolve(options.adminAssignmentTarget ?? null);
    }

    findEligibleRoadmapAssignmentAssignee() {
      return Promise.resolve(options.eligibleAssignee ?? null);
    }

    findActiveRoadmapAssignmentDuplicate() {
      return Promise.resolve(options.duplicateAssignment ?? null);
    }

    createAdminRoadmapAssignment(input: CreateAdminRoadmapAssignmentInput) {
      this.createdAssignments.push(input);
      return Promise.resolve(options.createdAssignment ?? adminRoadmapAssignment);
    }

    listAdminRoadmapDefinitions() {
      this.adminDefinitionLookups.push("list");
      return Promise.resolve(
        (options.adminDefinitions ?? []).map((definition) => definitionSummary(definition))
      );
    }

    findAdminRoadmapDefinition(lookup: { id: string }) {
      this.adminDefinitionLookups.push(`detail:${lookup.id}`);
      return Promise.resolve(options.adminDefinition ?? null);
    }
  }

  return new FakeRoadmapRepository();
}

function assignmentSummary(assignment: AdminRoadmapAssignmentDetail) {
  return {
    id: assignment.id,
    assigneeUserId: assignment.assigneeUserId,
    assigneeName: assignment.assigneeName,
    assigneeEmail: assignment.assigneeEmail,
    roadmapDefinitionId: assignment.roadmapDefinitionId,
    roadmapTitle: assignment.roadmapTitle,
    roadmapTargetRole: assignment.roadmapTargetRole,
    roadmapStatus: assignment.roadmapStatus,
    organizationUnitId: assignment.organizationUnitId,
    organizationUnitName: assignment.organizationUnitName,
    status: assignment.status,
    assignedByUserId: assignment.assignedByUserId,
    assignedByName: assignment.assignedByName,
    assignedAt: assignment.assignedAt,
    completedAt: assignment.completedAt,
    submissionCount: assignment.submissionCount,
    pendingSubmissionCount: assignment.pendingSubmissionCount,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    archivedAt: assignment.archivedAt
  };
}

function definitionSummary(definition: AdminRoadmapDefinitionDetail) {
  return {
    id: definition.id,
    title: definition.title,
    targetRole: definition.targetRole,
    language: definition.language,
    status: definition.status,
    publishedAt: definition.publishedAt,
    stageCount: definition.stageCount,
    stepCount: definition.stepCount,
    assignmentCount: definition.assignmentCount,
    createdAt: definition.createdAt,
    updatedAt: definition.updatedAt,
    archivedAt: definition.archivedAt
  };
}

type TestAuditLog = Pick<AuditLogService, "record"> & {
  records: Parameters<AuditLogService["record"]>[0][];
};

function auditLogRecorder(): TestAuditLog {
  return {
    records: [],
    record(input: Parameters<AuditLogService["record"]>[0]) {
      this.records.push(input);
      return Promise.resolve();
    }
  };
}

function isIdleApprovalErrorResponse(response: unknown): boolean {
  return (
    typeof response === "object" &&
    response !== null &&
    "code" in response &&
    response.code === IDLE_APPROVAL_REQUIRED_CODE
  );
}
