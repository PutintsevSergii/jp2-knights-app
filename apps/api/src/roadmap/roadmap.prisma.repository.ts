import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { RoadmapAttachmentMetadataDto } from "@jp2/shared-validation";
import { publishedAtNowOrUnset } from "../content/content-visibility.where.js";
import { PrismaService } from "../database/prisma.service.js";
import type { RoadmapRepository } from "./roadmap.repository.interfaces.js";
import type {
  AssignedRoadmap,
  AssignedRoadmapLookup,
  AdminRoadmapAssignmentAssigneeLookup,
  AdminRoadmapAssignmentDuplicateLookup,
  AdminRoadmapAssignmentDetail,
  AdminRoadmapAssignmentLookup,
  AdminRoadmapAssignmentSummary,
  AdminRoadmapDefinitionDetail,
  AdminRoadmapDefinitionAssignmentTarget,
  AdminRoadmapDefinitionLookup,
  AdminRoadmapDefinitionSummary,
  AdminRoadmapSubmissionDetail,
  AdminRoadmapSubmissionDetailLookup,
  AdminRoadmapSubmissionExport,
  AdminRoadmapSubmissionLookup,
  AdminRoadmapSubmissionSummary,
  BrotherRoadmapSubmissionTargetLookup,
  CreateAdminRoadmapAssignmentInput,
  CreateRoadmapSubmissionInput,
  ErasedRoadmapSubmission,
  PendingRoadmapSubmissionLookup,
  ReviewRoadmapSubmissionInput,
  RoadmapBrotherAccessProfile,
  RoadmapCandidateAccessProfile,
  RoadmapSubmissionSummary,
  RoadmapSubmissionTarget
} from "./roadmap.types.js";
import {
  assignedRoadmapWhere,
  brotherRoadmapSubmissionTargetWhere,
  eligibleRoadmapAssignmentAssigneeWhere,
  scopedAdminRoadmapSubmissionWhere
} from "./roadmap.where.js";
import { roadmapSubmissionBodyPreview } from "./roadmap.presenter.js";

@Injectable()
export class PrismaRoadmapRepository implements RoadmapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveCandidateAccessProfile(
    userId: string
  ): Promise<RoadmapCandidateAccessProfile | null> {
    const profile = await this.prisma.candidateProfile.findFirst({
      where: {
        userId,
        status: "active",
        archivedAt: null
      },
      select: {
        assignedOrganizationUnitId: true
      }
    });

    return profile;
  }

  async findActiveBrotherAccessProfile(
    userId: string
  ): Promise<RoadmapBrotherAccessProfile | null> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        status: "active",
        archivedAt: null,
        organizationUnit: {
          status: "active",
          archivedAt: null
        }
      },
      select: {
        organizationUnitId: true
      },
      orderBy: [{ organizationUnit: { country: "asc" } }, { organizationUnit: { city: "asc" } }]
    });

    if (memberships.length === 0) {
      return null;
    }

    return {
      organizationUnitIds: memberships.map((membership) => membership.organizationUnitId)
    };
  }

  async findAssignedRoadmap({
    userId,
    targetRole,
    organizationUnitIds,
    now = new Date()
  }: AssignedRoadmapLookup): Promise<AssignedRoadmap | null> {
    const assignment = await this.prisma.roadmapAssignment.findFirst({
      where: assignedRoadmapWhere(userId, targetRole, organizationUnitIds, now),
      include: {
        roadmapDefinition: {
          include: {
            stages: {
              where: {
                archivedAt: null
              },
              orderBy: {
                sortOrder: "asc"
              },
              include: {
                steps: {
                  where: {
                    status: "PUBLISHED",
                    archivedAt: null,
                    OR: publishedAtNowOrUnset(now)
                  },
                  orderBy: {
                    sortOrder: "asc"
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [{ assignedAt: "desc" }, { createdAt: "desc" }]
    });

    if (!assignment) {
      return null;
    }

    const submissions = await this.prisma.roadmapSubmission.findMany({
      where: {
        assignmentId: assignment.id,
        userId,
        archivedAt: null
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return toAssignedRoadmap(assignment, submissions);
  }

  async findBrotherRoadmapSubmissionTarget({
    userId,
    stepId,
    organizationUnitIds,
    now = new Date()
  }: BrotherRoadmapSubmissionTargetLookup): Promise<RoadmapSubmissionTarget | null> {
    const assignment = await this.prisma.roadmapAssignment.findFirst({
      where: brotherRoadmapSubmissionTargetWhere(userId, stepId, organizationUnitIds, now),
      select: {
        id: true
      },
      orderBy: [{ assignedAt: "desc" }, { createdAt: "desc" }]
    });

    if (!assignment) {
      return null;
    }

    return {
      assignmentId: assignment.id,
      stepId
    };
  }

  async findPendingRoadmapSubmission({
    assignmentId,
    stepId
  }: PendingRoadmapSubmissionLookup): Promise<RoadmapSubmissionSummary | null> {
    const submission = await this.prisma.roadmapSubmission.findFirst({
      where: {
        assignmentId,
        stepId,
        status: "pending_review",
        archivedAt: null
      }
    });

    return submission ? toRoadmapSubmissionSummary(submission) : null;
  }

  async createRoadmapSubmission({
    assignmentId,
    stepId,
    userId,
    body,
    attachmentMetadata
  }: CreateRoadmapSubmissionInput): Promise<RoadmapSubmissionSummary> {
    const submission = await this.prisma.roadmapSubmission.create({
      data: {
        assignmentId,
        stepId,
        userId,
        body,
        attachmentMeta: toInputAttachmentMetadata(attachmentMetadata),
        status: "pending_review"
      }
    });

    return toRoadmapSubmissionSummary(submission);
  }

  async listAdminRoadmapSubmissions({
    scopeOrganizationUnitIds
  }: AdminRoadmapSubmissionLookup): Promise<AdminRoadmapSubmissionSummary[]> {
    const records = await this.prisma.roadmapSubmission.findMany({
      where: scopedAdminRoadmapSubmissionWhere(scopeOrganizationUnitIds),
      include: adminRoadmapSubmissionInclude,
      orderBy: [{ createdAt: "desc" }]
    });

    return records.map(toAdminRoadmapSubmissionSummary);
  }

  async findAdminRoadmapSubmission({
    id,
    scopeOrganizationUnitIds
  }: AdminRoadmapSubmissionDetailLookup): Promise<AdminRoadmapSubmissionDetail | null> {
    const record = await this.prisma.roadmapSubmission.findFirst({
      where: {
        ...scopedAdminRoadmapSubmissionWhere(scopeOrganizationUnitIds),
        id
      },
      include: adminRoadmapSubmissionInclude
    });

    return record ? toAdminRoadmapSubmissionDetail(record) : null;
  }

  async findAdminRoadmapSubmissionForExport(
    id: string
  ): Promise<AdminRoadmapSubmissionExport | null> {
    const record = await this.prisma.roadmapSubmission.findUnique({
      where: { id },
      include: adminRoadmapSubmissionInclude
    });

    return record ? toAdminRoadmapSubmissionExport(record) : null;
  }

  async eraseAdminRoadmapSubmission(
    id: string,
    erasedAt: Date
  ): Promise<ErasedRoadmapSubmission | null> {
    const existing = await this.prisma.roadmapSubmission.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      return null;
    }

    const record = await this.prisma.roadmapSubmission.update({
      where: { id },
      data: {
        body: "Erased roadmap submission personal data.",
        attachmentMeta: [],
        reviewComment: null,
        archivedAt: erasedAt
      },
      include: adminRoadmapSubmissionInclude
    });

    return toErasedRoadmapSubmission(record);
  }

  async reviewRoadmapSubmission({
    id,
    scopeOrganizationUnitIds,
    reviewerUserId,
    status,
    reviewComment
  }: ReviewRoadmapSubmissionInput): Promise<AdminRoadmapSubmissionDetail | null> {
    const existing = await this.prisma.roadmapSubmission.findFirst({
      where: {
        ...scopedAdminRoadmapSubmissionWhere(scopeOrganizationUnitIds),
        id
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return null;
    }

    const record = await this.prisma.roadmapSubmission.update({
      where: { id },
      data: {
        status,
        reviewComment,
        reviewedBy: reviewerUserId,
        reviewedAt: new Date()
      },
      include: adminRoadmapSubmissionInclude
    });

    return toAdminRoadmapSubmissionDetail(record);
  }

  async listAdminRoadmapAssignments(): Promise<AdminRoadmapAssignmentSummary[]> {
    const records = await this.prisma.roadmapAssignment.findMany({
      where: {
        archivedAt: null
      },
      include: adminRoadmapAssignmentSummaryInclude,
      orderBy: [{ assignedAt: "desc" }, { createdAt: "desc" }]
    });

    if (records.length === 0) {
      return [];
    }

    const pendingCounts = await this.prisma.roadmapSubmission.groupBy({
      by: ["assignmentId"],
      where: {
        assignmentId: {
          in: records.map((record) => record.id)
        },
        archivedAt: null,
        status: "pending_review"
      },
      _count: {
        _all: true
      }
    });
    const pendingCountByAssignmentId = new Map(
      pendingCounts.map((count) => [count.assignmentId, count._count._all])
    );

    return records.map((record) =>
      toAdminRoadmapAssignmentSummary(
        record,
        record._count.submissions,
        pendingCountByAssignmentId.get(record.id) ?? 0
      )
    );
  }

  async findAdminRoadmapAssignment({
    id
  }: AdminRoadmapAssignmentLookup): Promise<AdminRoadmapAssignmentDetail | null> {
    const record = await this.prisma.roadmapAssignment.findFirst({
      where: {
        id,
        archivedAt: null
      },
      include: adminRoadmapAssignmentInclude
    });

    return record ? toAdminRoadmapAssignmentDetail(record) : null;
  }

  async findPublishedRoadmapDefinitionAssignmentTarget(
    id: string
  ): Promise<AdminRoadmapDefinitionAssignmentTarget | null> {
    const record = await this.prisma.roadmapDefinition.findFirst({
      where: {
        id,
        targetRole: {
          in: ["CANDIDATE", "BROTHER"]
        },
        status: "PUBLISHED",
        archivedAt: null,
        OR: publishedAtNowOrUnset(new Date())
      },
      select: {
        id: true,
        title: true,
        targetRole: true
      }
    });

    return record
      ? {
          id: record.id,
          title: record.title,
          targetRole: record.targetRole as AdminRoadmapDefinitionAssignmentTarget["targetRole"]
        }
      : null;
  }

  async findEligibleRoadmapAssignmentAssignee({
    userId,
    targetRole,
    organizationUnitId
  }: AdminRoadmapAssignmentAssigneeLookup): Promise<{ id: string } | null> {
    const record = await this.prisma.user.findFirst({
      where: eligibleRoadmapAssignmentAssigneeWhere(userId, targetRole, organizationUnitId),
      select: {
        id: true
      }
    });

    return record;
  }

  async findActiveRoadmapAssignmentDuplicate({
    assigneeUserId,
    roadmapDefinitionId,
    organizationUnitId
  }: AdminRoadmapAssignmentDuplicateLookup): Promise<{ id: string } | null> {
    const record = await this.prisma.roadmapAssignment.findFirst({
      where: {
        userId: assigneeUserId,
        roadmapDefinitionId,
        organizationUnitId,
        status: {
          in: ["active", "completed"]
        },
        archivedAt: null
      },
      select: {
        id: true
      }
    });

    return record;
  }

  async createAdminRoadmapAssignment({
    assigneeUserId,
    roadmapDefinitionId,
    organizationUnitId,
    assignedByUserId
  }: CreateAdminRoadmapAssignmentInput): Promise<AdminRoadmapAssignmentDetail> {
    const record = await this.prisma.roadmapAssignment.create({
      data: {
        userId: assigneeUserId,
        roadmapDefinitionId,
        organizationUnitId,
        assignedBy: assignedByUserId,
        status: "active"
      },
      include: adminRoadmapAssignmentInclude
    });

    return toAdminRoadmapAssignmentDetail(record);
  }

  async listAdminRoadmapDefinitions(): Promise<AdminRoadmapDefinitionSummary[]> {
    const records = await this.prisma.roadmapDefinition.findMany({
      where: {
        archivedAt: null
      },
      include: adminRoadmapDefinitionSummaryInclude,
      orderBy: [{ targetRole: "asc" }, { title: "asc" }]
    });

    if (records.length === 0) {
      return [];
    }

    const stageCounts = await this.prisma.roadmapStage.findMany({
      where: {
        roadmapDefinitionId: {
          in: records.map((record) => record.id)
        },
        archivedAt: null
      },
      select: {
        roadmapDefinitionId: true,
        _count: {
          select: {
            steps: {
              where: {
                archivedAt: null
              }
            }
          }
        }
      }
    });
    const stepCountByDefinitionId = new Map<string, number>();

    for (const stage of stageCounts) {
      stepCountByDefinitionId.set(
        stage.roadmapDefinitionId,
        (stepCountByDefinitionId.get(stage.roadmapDefinitionId) ?? 0) + stage._count.steps
      );
    }

    return records.map((record) =>
      toAdminRoadmapDefinitionSummary(record, {
        stageCount: record._count.stages,
        stepCount: stepCountByDefinitionId.get(record.id) ?? 0,
        assignmentCount: record._count.assignments
      })
    );
  }

  async findAdminRoadmapDefinition({
    id
  }: AdminRoadmapDefinitionLookup): Promise<AdminRoadmapDefinitionDetail | null> {
    const record = await this.prisma.roadmapDefinition.findFirst({
      where: {
        id,
        archivedAt: null
      },
      include: adminRoadmapDefinitionDetailInclude
    });

    return record ? toAdminRoadmapDefinitionDetail(record) : null;
  }
}

type RoadmapAssignmentRecord = Prisma.RoadmapAssignmentGetPayload<{
  include: {
    roadmapDefinition: {
      include: {
        stages: {
          include: {
            steps: true;
          };
        };
      };
    };
  };
}>;

type RoadmapSubmissionRecord = Prisma.RoadmapSubmissionGetPayload<Record<string, never>>;

const adminRoadmapSubmissionInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      email: true
    }
  },
  assignment: {
    include: {
      organizationUnit: {
        select: {
          name: true
        }
      },
      roadmapDefinition: {
        select: {
          title: true,
          targetRole: true
        }
      }
    }
  },
  step: {
    include: {
      stage: {
        select: {
          title: true
        }
      }
    }
  }
} as const;

type AdminRoadmapSubmissionRecord = Prisma.RoadmapSubmissionGetPayload<{
  include: typeof adminRoadmapSubmissionInclude;
}>;

const adminRoadmapAssignmentSummaryInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      email: true
    }
  },
  roadmapDefinition: {
    select: {
      id: true,
      title: true,
      targetRole: true,
      status: true
    }
  },
  organizationUnit: {
    select: {
      name: true
    }
  },
  assigner: {
    select: {
      id: true,
      displayName: true
    }
  },
  _count: {
    select: {
      submissions: {
        where: {
          archivedAt: null
        }
      }
    }
  }
} as const;

type AdminRoadmapAssignmentSummaryRecord = Prisma.RoadmapAssignmentGetPayload<{
  include: typeof adminRoadmapAssignmentSummaryInclude;
}>;

const adminRoadmapAssignmentInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      email: true
    }
  },
  roadmapDefinition: {
    select: {
      id: true,
      title: true,
      targetRole: true,
      status: true
    }
  },
  organizationUnit: {
    select: {
      name: true
    }
  },
  assigner: {
    select: {
      id: true,
      displayName: true
    }
  },
  submissions: {
    where: {
      archivedAt: null
    },
    select: {
      id: true,
      stepId: true,
      status: true,
      attachmentMeta: true,
      reviewComment: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
      step: {
        select: {
          title: true,
          stage: {
            select: {
              title: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  }
} as const;

type AdminRoadmapAssignmentRecord = Prisma.RoadmapAssignmentGetPayload<{
  include: typeof adminRoadmapAssignmentInclude;
}>;

const adminRoadmapDefinitionSummaryInclude = {
  _count: {
    select: {
      stages: {
        where: {
          archivedAt: null
        }
      },
      assignments: {
        where: {
          archivedAt: null
        }
      }
    }
  }
} as const;

const adminRoadmapDefinitionDetailInclude = {
  stages: {
    where: {
      archivedAt: null
    },
    orderBy: {
      sortOrder: "asc"
    },
    include: {
      steps: {
        where: {
          archivedAt: null
        },
        orderBy: {
          sortOrder: "asc"
        }
      }
    }
  },
  assignments: {
    where: {
      archivedAt: null
    },
    select: {
      id: true
    }
  }
} as const;

type AdminRoadmapDefinitionSummaryRecord = Prisma.RoadmapDefinitionGetPayload<{
  include: typeof adminRoadmapDefinitionSummaryInclude;
}>;

type AdminRoadmapDefinitionDetailRecord = Prisma.RoadmapDefinitionGetPayload<{
  include: typeof adminRoadmapDefinitionDetailInclude;
}>;

export function toAssignedRoadmap(
  assignment: RoadmapAssignmentRecord,
  submissions: readonly RoadmapSubmissionRecord[]
): AssignedRoadmap {
  const latestSubmissionByStepId = new Map<string, RoadmapSubmissionRecord>();

  for (const submission of submissions) {
    if (!latestSubmissionByStepId.has(submission.stepId)) {
      latestSubmissionByStepId.set(submission.stepId, submission);
    }
  }

  return {
    assignmentId: assignment.id,
    status: assignment.status,
    assignedAt: assignment.assignedAt.toISOString(),
    completedAt: assignment.completedAt?.toISOString() ?? null,
    organizationUnitId: assignment.organizationUnitId,
    definition: {
      id: assignment.roadmapDefinition.id,
      title: assignment.roadmapDefinition.title,
      targetRole: assignment.roadmapDefinition.targetRole as "CANDIDATE" | "BROTHER",
      language: assignment.roadmapDefinition.language,
      status: assignment.roadmapDefinition.status,
      publishedAt: assignment.roadmapDefinition.publishedAt?.toISOString() ?? null
    },
    stages: assignment.roadmapDefinition.stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      sortOrder: stage.sortOrder,
      steps: stage.steps.map((step) => {
        const latestSubmission = latestSubmissionByStepId.get(step.id);

        return {
          id: step.id,
          title: step.title,
          description: step.description,
          requiresSubmission: step.requiresSubmission,
          sortOrder: step.sortOrder,
          status: step.status,
          latestSubmission: latestSubmission ? toRoadmapSubmissionSummary(latestSubmission) : null
        };
      })
    }))
  };
}

function toRoadmapSubmissionSummary(submission: RoadmapSubmissionRecord): RoadmapSubmissionSummary {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    stepId: submission.stepId,
    status: submission.status,
    body: submission.body,
    attachmentMetadata: toAttachmentMetadata(submission.attachmentMeta),
    reviewComment: submission.reviewComment,
    reviewedAt: submission.reviewedAt?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString()
  };
}

function toAdminRoadmapSubmissionSummary(
  submission: AdminRoadmapSubmissionRecord
): AdminRoadmapSubmissionSummary {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    stepId: submission.stepId,
    submitterUserId: submission.user.id,
    submitterName: submission.user.displayName,
    submitterEmail: submission.user.email,
    roadmapTitle: submission.assignment.roadmapDefinition.title,
    roadmapTargetRole: submission.assignment.roadmapDefinition.targetRole as
      | "CANDIDATE"
      | "BROTHER",
    stageTitle: submission.step.stage.title,
    stepTitle: submission.step.title,
    organizationUnitId: submission.assignment.organizationUnitId,
    organizationUnitName: submission.assignment.organizationUnit?.name ?? null,
    status: submission.status,
    bodyPreview: roadmapSubmissionBodyPreview(submission.body),
    attachmentCount: toAttachmentMetadata(submission.attachmentMeta).length,
    reviewComment: submission.reviewComment,
    reviewedAt: submission.reviewedAt?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString()
  };
}

function toAdminRoadmapSubmissionDetail(
  submission: AdminRoadmapSubmissionRecord
): AdminRoadmapSubmissionDetail {
  return {
    ...toAdminRoadmapSubmissionSummary(submission),
    body: submission.body,
    attachmentMetadata: toAttachmentMetadata(submission.attachmentMeta)
  };
}

function toAdminRoadmapSubmissionExport(
  submission: AdminRoadmapSubmissionRecord
): AdminRoadmapSubmissionExport {
  return {
    ...toAdminRoadmapSubmissionDetail(submission),
    archivedAt: submission.archivedAt?.toISOString() ?? null
  };
}

function toErasedRoadmapSubmission(
  submission: AdminRoadmapSubmissionRecord
): ErasedRoadmapSubmission {
  return {
    id: submission.id,
    organizationUnitId: submission.assignment.organizationUnitId,
    status: submission.status,
    archivedAt: submission.archivedAt?.toISOString() ?? null
  };
}

function toAdminRoadmapAssignmentSummary(
  assignment: AdminRoadmapAssignmentSummarySource,
  submissionCount: number,
  pendingSubmissionCount: number
): AdminRoadmapAssignmentSummary {
  return {
    id: assignment.id,
    assigneeUserId: assignment.user.id,
    assigneeName: assignment.user.displayName,
    assigneeEmail: assignment.user.email,
    roadmapDefinitionId: assignment.roadmapDefinition.id,
    roadmapTitle: assignment.roadmapDefinition.title,
    roadmapTargetRole: assignment.roadmapDefinition.targetRole as "CANDIDATE" | "BROTHER",
    roadmapStatus: assignment.roadmapDefinition.status,
    organizationUnitId: assignment.organizationUnitId,
    organizationUnitName: assignment.organizationUnit?.name ?? null,
    status: assignment.status,
    assignedByUserId: assignment.assigner?.id ?? null,
    assignedByName: assignment.assigner?.displayName ?? null,
    assignedAt: assignment.assignedAt.toISOString(),
    completedAt: assignment.completedAt?.toISOString() ?? null,
    submissionCount,
    pendingSubmissionCount,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    archivedAt: assignment.archivedAt?.toISOString() ?? null
  };
}

function toAdminRoadmapAssignmentDetail(
  assignment: AdminRoadmapAssignmentRecord
): AdminRoadmapAssignmentDetail {
  return {
    ...toAdminRoadmapAssignmentSummary(
      assignment,
      assignment.submissions.length,
      assignment.submissions.filter((submission) => submission.status === "pending_review").length
    ),
    submissions: assignment.submissions.map((submission) => ({
      id: submission.id,
      stepId: submission.stepId,
      stageTitle: submission.step.stage.title,
      stepTitle: submission.step.title,
      status: submission.status,
      attachmentCount: toAttachmentMetadata(submission.attachmentMeta).length,
      reviewComment: submission.reviewComment,
      reviewedAt: submission.reviewedAt?.toISOString() ?? null,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString()
    }))
  };
}

type AdminRoadmapAssignmentSummarySource =
  | AdminRoadmapAssignmentSummaryRecord
  | AdminRoadmapAssignmentRecord;

function toAdminRoadmapDefinitionSummary(
  definition: AdminRoadmapDefinitionSummarySource,
  counts: {
    stageCount: number;
    stepCount: number;
    assignmentCount: number;
  }
): AdminRoadmapDefinitionSummary {
  return {
    id: definition.id,
    title: definition.title,
    targetRole: definition.targetRole as "CANDIDATE" | "BROTHER",
    language: definition.language,
    status: definition.status,
    publishedAt: definition.publishedAt?.toISOString() ?? null,
    stageCount: counts.stageCount,
    stepCount: counts.stepCount,
    assignmentCount: counts.assignmentCount,
    createdAt: definition.createdAt.toISOString(),
    updatedAt: definition.updatedAt.toISOString(),
    archivedAt: definition.archivedAt?.toISOString() ?? null
  };
}

function toAdminRoadmapDefinitionDetail(
  definition: AdminRoadmapDefinitionDetailRecord
): AdminRoadmapDefinitionDetail {
  return {
    ...toAdminRoadmapDefinitionSummary(definition, {
      stageCount: definition.stages.length,
      stepCount: definition.stages.reduce((total, stage) => total + stage.steps.length, 0),
      assignmentCount: definition.assignments.length
    }),
    stages: definition.stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      sortOrder: stage.sortOrder,
      steps: stage.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        requiresSubmission: step.requiresSubmission,
        sortOrder: step.sortOrder,
        status: step.status,
        publishedAt: step.publishedAt?.toISOString() ?? null
      }))
    }))
  };
}

type AdminRoadmapDefinitionSummarySource =
  | AdminRoadmapDefinitionSummaryRecord
  | AdminRoadmapDefinitionDetailRecord;

function toInputAttachmentMetadata(
  attachmentMetadata: readonly RoadmapAttachmentMetadataDto[]
): Prisma.InputJsonValue {
  return attachmentMetadata.map((metadata) => ({
    originalFilename: metadata.originalFilename,
    mimeType: metadata.mimeType,
    sizeBytes: metadata.sizeBytes
  }));
}

function toAttachmentMetadata(value: Prisma.JsonValue | null): RoadmapAttachmentMetadataDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRoadmapAttachmentMetadata);
}

function isRoadmapAttachmentMetadata(
  value: Prisma.JsonValue
): value is RoadmapAttachmentMetadataDto {
  return (
    isRecord(value) &&
    typeof value.originalFilename === "string" &&
    typeof value.mimeType === "string" &&
    typeof value.sizeBytes === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
