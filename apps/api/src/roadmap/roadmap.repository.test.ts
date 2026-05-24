import { describe, expect, it } from "vitest";
import {
  brotherRoadmapSubmissionTargetWhere,
  eligibleRoadmapAssignmentAssigneeWhere,
  scopedAdminRoadmapSubmissionWhere
} from "./roadmap.repository.js";

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
    expect(
      scopedAdminRoadmapSubmissionWhere(["33333333-3333-4333-8333-333333333333"])
    ).toEqual({
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
