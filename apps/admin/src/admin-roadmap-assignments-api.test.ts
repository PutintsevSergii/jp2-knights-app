import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminRoadmapAssignments } from "./admin-content-fixtures.js";
import {
  fetchAdminRoadmapAssignment,
  fetchAdminRoadmapAssignments
} from "./admin-roadmap-assignments-api.js";

const roadmapAssignment = fallbackAdminRoadmapAssignments[0]!;
const listPayload = {
  roadmapAssignments: [
    {
      id: roadmapAssignment.id,
      assigneeUserId: roadmapAssignment.assigneeUserId,
      assigneeName: roadmapAssignment.assigneeName,
      assigneeEmail: roadmapAssignment.assigneeEmail,
      roadmapDefinitionId: roadmapAssignment.roadmapDefinitionId,
      roadmapTitle: roadmapAssignment.roadmapTitle,
      roadmapTargetRole: roadmapAssignment.roadmapTargetRole,
      roadmapStatus: roadmapAssignment.roadmapStatus,
      organizationUnitId: roadmapAssignment.organizationUnitId,
      organizationUnitName: roadmapAssignment.organizationUnitName,
      status: roadmapAssignment.status,
      assignedByUserId: roadmapAssignment.assignedByUserId,
      assignedByName: roadmapAssignment.assignedByName,
      assignedAt: roadmapAssignment.assignedAt,
      completedAt: roadmapAssignment.completedAt,
      submissionCount: roadmapAssignment.submissionCount,
      pendingSubmissionCount: roadmapAssignment.pendingSubmissionCount,
      createdAt: roadmapAssignment.createdAt,
      updatedAt: roadmapAssignment.updatedAt,
      archivedAt: roadmapAssignment.archivedAt
    }
  ]
};

describe("admin roadmap assignments API client", () => {
  it("fetches and validates list and detail responses", async () => {
    const listFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(listPayload)
      })
    );
    const detailFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapAssignment })
      })
    );

    await expect(
      fetchAdminRoadmapAssignments({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: listFetch
      })
    ).resolves.toEqual(listPayload);
    await expect(
      fetchAdminRoadmapAssignment(roadmapAssignment.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: detailFetch
      })
    ).resolves.toEqual({ roadmapAssignment });

    expect(listFetch).toHaveBeenCalledWith("https://api.example.test/admin/roadmap-assignments", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
    expect(detailFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/roadmap-assignments/${roadmapAssignment.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("maps non-OK responses", async () => {
    const forbiddenFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      })
    );

    await expect(
      fetchAdminRoadmapAssignments({ fetchImpl: forbiddenFetch })
    ).rejects.toBeInstanceOf(AdminContentHttpError);
  });
});
