import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { RoadmapAttachmentMetadataDto } from "@jp2/shared-validation";
import { publishedAtNowOrUnset } from "../content/content-visibility.where.js";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AssignedRoadmap,
  AssignedRoadmapLookup,
  AdminRoadmapSubmissionDetail,
  AdminRoadmapSubmissionDetailLookup,
  AdminRoadmapSubmissionLookup,
  AdminRoadmapSubmissionSummary,
  BrotherRoadmapSubmissionTargetLookup,
  CreateRoadmapSubmissionInput,
  PendingRoadmapSubmissionLookup,
  ReviewRoadmapSubmissionInput,
  RoadmapBrotherAccessProfile,
  RoadmapCandidateAccessProfile,
  RoadmapSubmissionSummary,
  RoadmapSubmissionTarget
} from "./roadmap.types.js";

export abstract class RoadmapRepository {
  abstract findActiveCandidateAccessProfile(
    userId: string
  ): Promise<RoadmapCandidateAccessProfile | null>;
  abstract findActiveBrotherAccessProfile(userId: string): Promise<RoadmapBrotherAccessProfile | null>;
  abstract findAssignedRoadmap(lookup: AssignedRoadmapLookup): Promise<AssignedRoadmap | null>;
  abstract findBrotherRoadmapSubmissionTarget(
    lookup: BrotherRoadmapSubmissionTargetLookup
  ): Promise<RoadmapSubmissionTarget | null>;
  abstract findPendingRoadmapSubmission(
    lookup: PendingRoadmapSubmissionLookup
  ): Promise<RoadmapSubmissionSummary | null>;
  abstract createRoadmapSubmission(
    input: CreateRoadmapSubmissionInput
  ): Promise<RoadmapSubmissionSummary>;
  abstract listAdminRoadmapSubmissions(
    lookup: AdminRoadmapSubmissionLookup
  ): Promise<AdminRoadmapSubmissionSummary[]>;
  abstract findAdminRoadmapSubmission(
    lookup: AdminRoadmapSubmissionDetailLookup
  ): Promise<AdminRoadmapSubmissionDetail | null>;
  abstract reviewRoadmapSubmission(
    input: ReviewRoadmapSubmissionInput
  ): Promise<AdminRoadmapSubmissionDetail | null>;
}

@Injectable()
export class PrismaRoadmapRepository extends RoadmapRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

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

  async findActiveBrotherAccessProfile(userId: string): Promise<RoadmapBrotherAccessProfile | null> {
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

export function assignedRoadmapWhere(
  userId: string,
  targetRole: "CANDIDATE" | "BROTHER",
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.RoadmapAssignmentWhereInput {
  const scopeWhere: Prisma.RoadmapAssignmentWhereInput[] =
    organizationUnitIds.length > 0
      ? [{ organizationUnitId: null }, { organizationUnitId: { in: [...organizationUnitIds] } }]
      : [{ organizationUnitId: null }];

  return {
    userId,
    archivedAt: null,
    status: {
      in: ["active", "completed"]
    },
    roadmapDefinition: {
      targetRole,
      status: "PUBLISHED",
      archivedAt: null,
      OR: publishedAtNowOrUnset(now)
    },
    AND: [
      {
        OR: scopeWhere
      }
    ]
  };
}

export function brotherRoadmapSubmissionTargetWhere(
  userId: string,
  stepId: string,
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.RoadmapAssignmentWhereInput {
  const scopeWhere: Prisma.RoadmapAssignmentWhereInput[] =
    organizationUnitIds.length > 0
      ? [{ organizationUnitId: null }, { organizationUnitId: { in: [...organizationUnitIds] } }]
      : [{ organizationUnitId: null }];

  return {
    userId,
    archivedAt: null,
    status: "active",
    roadmapDefinition: {
      targetRole: "BROTHER",
      status: "PUBLISHED",
      archivedAt: null,
      OR: publishedAtNowOrUnset(now),
      stages: {
        some: {
          archivedAt: null,
          steps: {
            some: {
              id: stepId,
              requiresSubmission: true,
              status: "PUBLISHED",
              archivedAt: null,
              OR: publishedAtNowOrUnset(now)
            }
          }
        }
      }
    },
    AND: [
      {
        OR: scopeWhere
      }
    ]
  };
}

export function scopedAdminRoadmapSubmissionWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.RoadmapSubmissionWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return {
      archivedAt: null,
      assignment: {
        archivedAt: null
      }
    };
  }

  return {
    archivedAt: null,
    assignment: {
      organizationUnitId: {
        in: [...scopeOrganizationUnitIds]
      },
      archivedAt: null
    }
  };
}

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
    roadmapTargetRole: submission.assignment.roadmapDefinition.targetRole as "CANDIDATE" | "BROTHER",
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

function roadmapSubmissionBodyPreview(body: string): string | null {
  const normalized = body.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

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

function isRoadmapAttachmentMetadata(value: Prisma.JsonValue): value is RoadmapAttachmentMetadataDto {
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
