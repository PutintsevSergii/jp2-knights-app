import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  assignedRoadmapWhere,
  brotherRoadmapSubmissionTargetWhere,
  eligibleRoadmapAssignmentAssigneeWhere,
  PrismaRoadmapRepository,
  scopedAdminRoadmapSubmissionWhere
} from "./roadmap.repository.js";

describe("assignedRoadmapWhere", () => {
  it("limits assigned roadmap reads to current-user active or completed published definitions in scope", () => {
    const now = new Date("2026-05-19T10:00:00.000Z");

    expect(
      assignedRoadmapWhere(
        "11111111-1111-4111-8111-111111111111",
        "BROTHER",
        ["33333333-3333-4333-8333-333333333333"],
        now
      )
    ).toEqual({
      userId: "11111111-1111-4111-8111-111111111111",
      archivedAt: null,
      status: {
        in: ["active", "completed"]
      },
      roadmapDefinition: {
        targetRole: "BROTHER",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      AND: [
        {
          OR: [
            { organizationUnitId: null },
            { organizationUnitId: { in: ["33333333-3333-4333-8333-333333333333"] } }
          ]
        }
      ]
    });
  });
});

describe("brotherRoadmapSubmissionTargetWhere", () => {
  it("limits submissions to the active brother's own active scoped published roadmap step", () => {
    const now = new Date("2026-05-19T10:00:00.000Z");

    expect(
      brotherRoadmapSubmissionTargetWhere(
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
        ["33333333-3333-4333-8333-333333333333"],
        now
      )
    ).toEqual({
      userId: "11111111-1111-4111-8111-111111111111",
      archivedAt: null,
      status: "active",
      roadmapDefinition: {
        targetRole: "BROTHER",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
        stages: {
          some: {
            archivedAt: null,
            steps: {
              some: {
                id: "22222222-2222-4222-8222-222222222222",
                requiresSubmission: true,
                status: "PUBLISHED",
                archivedAt: null,
                OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
              }
            }
          }
        }
      },
      AND: [
        {
          OR: [
            { organizationUnitId: null },
            { organizationUnitId: { in: ["33333333-3333-4333-8333-333333333333"] } }
          ]
        }
      ]
    });
  });
});

describe("scopedAdminRoadmapSubmissionWhere", () => {
  it("limits officer review queues to assigned organization-unit submissions", () => {
    expect(scopedAdminRoadmapSubmissionWhere(["33333333-3333-4333-8333-333333333333"])).toEqual({
      archivedAt: null,
      assignment: {
        organizationUnitId: {
          in: ["33333333-3333-4333-8333-333333333333"]
        },
        archivedAt: null
      }
    });
  });

  it("allows Super Admin review queues across all non-archived submissions", () => {
    expect(scopedAdminRoadmapSubmissionWhere(null)).toEqual({
      archivedAt: null,
      assignment: {
        archivedAt: null
      }
    });
  });
});

describe("eligibleRoadmapAssignmentAssigneeWhere", () => {
  it("requires active candidate role and scoped active candidate profile", () => {
    expect(
      eligibleRoadmapAssignmentAssigneeWhere(
        "11111111-1111-4111-8111-111111111111",
        "CANDIDATE",
        "33333333-3333-4333-8333-333333333333"
      )
    ).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      status: {
        in: ["active", "invited"]
      },
      archivedAt: null,
      roles: {
        some: {
          role: "CANDIDATE",
          revokedAt: null
        }
      },
      candidateProfiles: {
        some: {
          status: "active",
          archivedAt: null,
          assignedOrganizationUnitId: "33333333-3333-4333-8333-333333333333"
        }
      }
    });
  });

  it("requires active brother role and active membership for scoped brother assignments", () => {
    expect(
      eligibleRoadmapAssignmentAssigneeWhere(
        "11111111-1111-4111-8111-111111111111",
        "BROTHER",
        "33333333-3333-4333-8333-333333333333"
      )
    ).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      status: {
        in: ["active", "invited"]
      },
      archivedAt: null,
      roles: {
        some: {
          role: "BROTHER",
          revokedAt: null
        }
      },
      memberships: {
        some: {
          status: "active",
          archivedAt: null,
          organizationUnitId: "33333333-3333-4333-8333-333333333333",
          organizationUnit: {
            status: "active",
            archivedAt: null
          }
        }
      }
    });
  });
});

describe("PrismaRoadmapRepository", () => {
  it("anonymizes and archives roadmap submission personal data for erasure", async () => {
    const { prisma, roadmapSubmissionFindUnique, roadmapSubmissionUpdate } = prismaMock();
    const erasedAt = new Date("2026-06-03T11:00:00.000Z");
    roadmapSubmissionFindUnique.mockResolvedValueOnce({
      id: "44444444-4444-4444-8444-444444444444"
    });
    roadmapSubmissionUpdate.mockResolvedValueOnce({
      id: "44444444-4444-4444-8444-444444444444",
      status: "pending_review",
      archivedAt: erasedAt,
      assignment: {
        organizationUnitId: "11111111-1111-4111-8111-111111111111"
      }
    });

    await expect(
      new PrismaRoadmapRepository(prisma).eraseAdminRoadmapSubmission(
        "44444444-4444-4444-8444-444444444444",
        erasedAt
      )
    ).resolves.toEqual({
      id: "44444444-4444-4444-8444-444444444444",
      organizationUnitId: "11111111-1111-4111-8111-111111111111",
      status: "pending_review",
      archivedAt: "2026-06-03T11:00:00.000Z"
    });
    expect(roadmapSubmissionUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "44444444-4444-4444-8444-444444444444" },
      data: {
        body: "Erased roadmap submission personal data.",
        attachmentMeta: [],
        reviewComment: null,
        archivedAt: erasedAt
      }
    }));
  });

  it("does not update a missing roadmap submission during erasure", async () => {
    const { prisma, roadmapSubmissionFindUnique, roadmapSubmissionUpdate } = prismaMock();
    roadmapSubmissionFindUnique.mockResolvedValueOnce(null);

    await expect(
      new PrismaRoadmapRepository(prisma).eraseAdminRoadmapSubmission(
        "44444444-4444-4444-8444-444444444444",
        new Date("2026-06-03T11:00:00.000Z")
      )
    ).resolves.toBeNull();
    expect(roadmapSubmissionUpdate).not.toHaveBeenCalled();
  });
});

function prismaMock(): {
  prisma: PrismaService;
  roadmapSubmissionFindUnique: ReturnType<typeof vi.fn>;
  roadmapSubmissionUpdate: ReturnType<typeof vi.fn>;
} {
  const roadmapSubmissionFindUnique = vi.fn();
  const roadmapSubmissionUpdate = vi.fn();

  return {
    prisma: {
      roadmapSubmission: {
        findUnique: roadmapSubmissionFindUnique,
        update: roadmapSubmissionUpdate
      }
    } as unknown as PrismaService,
    roadmapSubmissionFindUnique,
    roadmapSubmissionUpdate
  };
}
