import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminRoadmapAssignments } from "./admin-content-fixtures.js";
import { renderAdminRoadmapAssignmentRoute } from "./admin-roadmap-assignments-shell.js";

const roadmapAssignment = fallbackAdminRoadmapAssignments[0]!;
const assignmentSummary = {
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
};

describe("admin roadmap assignments shell", () => {
  it("renders API-mode list and detail routes", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapAssignments: [assignmentSummary] })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapAssignment })
      });

    const list = await renderAdminRoadmapAssignmentRoute({
      path: "/admin/roadmap-assignments",
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      fetchImpl
    });
    const detail = await renderAdminRoadmapAssignmentRoute({
      path: `/admin/roadmap-assignments/${roadmapAssignment.id}`,
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      fetchImpl
    });

    expect(list).toMatchObject({
      route: "AdminRoadmapAssignmentList",
      state: "ready",
      statusCode: 200
    });
    expect(list.document).toContain("Demo Brother");
    expect(detail).toMatchObject({
      route: "AdminRoadmapAssignmentDetail",
      state: "ready",
      statusCode: 200
    });
    expect(detail.document).toContain("Submission Status");
    expect(detail.document).not.toContain("Reflection text for officer review");
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/admin/roadmap-assignments",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/admin/roadmap-assignments/${roadmapAssignment.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("renders demo routes without backend calls and maps failures", async () => {
    const fetchImpl = vi.fn();

    const demo = await renderAdminRoadmapAssignmentRoute({
      path: "/admin/roadmap-assignments",
      runtimeMode: "demo",
      fetchImpl
    });
    expect(demo.statusCode).toBe(200);
    expect(demo.document).toContain("Demo Brother");
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(
      renderAdminRoadmapAssignmentRoute({
        path: "/admin/roadmap-assignments",
        runtimeMode: "api",
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
  });

  it("renders the create-assignment form without treating new as a detail id", async () => {
    const fetchImpl = vi.fn();

    const rendered = await renderAdminRoadmapAssignmentRoute({
      path: "/admin/roadmap-assignments/new",
      runtimeMode: "api",
      fetchImpl
    });

    expect(rendered).toMatchObject({
      route: "AdminRoadmapAssignmentEditor",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain('data-route="AdminRoadmapAssignmentEditor"');
    expect(rendered.document).toContain('name="assigneeUserId"');
    expect(rendered.document).toContain('name="roadmapDefinitionId"');
    expect(rendered.document).toContain('name="organizationUnitId"');
    expect(rendered.document).toContain('data-endpoint="/admin/roadmap-assignments"');
    expect(rendered.document).toContain('data-method="POST"');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
