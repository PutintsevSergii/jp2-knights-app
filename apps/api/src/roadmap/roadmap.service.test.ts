import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { RoadmapRepository } from "./roadmap.repository.js";
import { RoadmapService } from "./roadmap.service.js";
import type { AssignedRoadmap, RoadmapBrotherAccessProfile } from "./roadmap.types.js";

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

describe("RoadmapService", () => {
  it("returns the active candidate's own assigned roadmap", async () => {
    const repository = roadmapRepository({
      candidateProfile: { assignedOrganizationUnitId: organizationUnitId },
      roadmap: candidateRoadmap
    });

    await expect(new RoadmapService(repository).getCandidateRoadmap(candidate)).resolves.toEqual({
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
      new RoadmapService(
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

    await expect(new RoadmapService(repository).getBrotherRoadmap(brother)).resolves.toEqual({
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
    const service = new RoadmapService(repository);

    await expect(service.getCandidateRoadmap(brother)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getBrotherRoadmap(candidate)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getCandidateRoadmap(idleUser)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ForbiddenException &&
        isIdleApprovalErrorResponse(error.getResponse())
    );
    expect(repository.lookups).toEqual([]);
  });

  it("requires active candidate and brother access profiles", async () => {
    await expect(
      new RoadmapService(roadmapRepository({ candidateProfile: null })).getCandidateRoadmap(
        candidate
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new RoadmapService(roadmapRepository({ brotherProfile: null })).getBrotherRoadmap(brother)
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function roadmapRepository(options: {
  candidateProfile?: { assignedOrganizationUnitId: string | null } | null | undefined;
  brotherProfile?: RoadmapBrotherAccessProfile | null | undefined;
  roadmap?: AssignedRoadmap | null | undefined;
}) {
  class FakeRoadmapRepository implements RoadmapRepository {
    lookups: Array<{
      userId: string;
      targetRole: "CANDIDATE" | "BROTHER";
      organizationUnitIds: readonly string[];
    }> = [];

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
  }

  return new FakeRoadmapRepository();
}

function isIdleApprovalErrorResponse(response: unknown): boolean {
  return (
    typeof response === "object" &&
    response !== null &&
    "code" in response &&
    response.code === IDLE_APPROVAL_REQUIRED_CODE
  );
}
