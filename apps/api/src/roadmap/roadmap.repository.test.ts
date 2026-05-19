import { describe, expect, it } from "vitest";
import { brotherRoadmapSubmissionTargetWhere } from "./roadmap.repository.js";

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
