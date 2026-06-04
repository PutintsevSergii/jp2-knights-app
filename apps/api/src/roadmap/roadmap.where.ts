import type { Prisma } from "@prisma/client";
import {
  approvedContentWhere,
  publishedAtNowOrUnset
} from "../content/content-visibility.where.js";

export function assignedRoadmapWhere(
  userId: string,
  targetRole: "CANDIDATE" | "BROTHER",
  organizationUnitIds: readonly string[],
  now: Date
): Prisma.RoadmapAssignmentWhereInput {
  const scopeWhere = roadmapScopeWhere(organizationUnitIds);

  return {
    userId,
    archivedAt: null,
    status: {
      in: ["active", "completed"]
    },
    roadmapDefinition: {
      targetRole,
      status: "PUBLISHED",
      ...approvedContentWhere<Prisma.RoadmapDefinitionWhereInput>(),
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
  const scopeWhere = roadmapScopeWhere(organizationUnitIds);

  return {
    userId,
    archivedAt: null,
    status: "active",
    roadmapDefinition: {
      targetRole: "BROTHER",
      status: "PUBLISHED",
      ...approvedContentWhere<Prisma.RoadmapDefinitionWhereInput>(),
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
              ...approvedContentWhere<Prisma.RoadmapStepWhereInput>(),
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

export function eligibleRoadmapAssignmentAssigneeWhere(
  userId: string,
  targetRole: "CANDIDATE" | "BROTHER",
  organizationUnitId: string | null
): Prisma.UserWhereInput {
  return {
    id: userId,
    status: {
      in: ["active", "invited"]
    },
    archivedAt: null,
    roles: {
      some: {
        role: targetRole,
        revokedAt: null
      }
    },
    ...(targetRole === "CANDIDATE"
      ? {
          candidateProfiles: {
            some: {
              status: "active",
              archivedAt: null,
              ...(organizationUnitId ? { assignedOrganizationUnitId: organizationUnitId } : {})
            }
          }
        }
      : {
          memberships: {
            some: {
              status: "active",
              archivedAt: null,
              ...(organizationUnitId ? { organizationUnitId } : {}),
              organizationUnit: {
                status: "active",
                archivedAt: null
              }
            }
          }
        })
  };
}

function roadmapScopeWhere(
  organizationUnitIds: readonly string[]
): Prisma.RoadmapAssignmentWhereInput[] {
  return organizationUnitIds.length > 0
    ? [{ organizationUnitId: null }, { organizationUnitId: { in: [...organizationUnitIds] } }]
    : [{ organizationUnitId: null }];
}
