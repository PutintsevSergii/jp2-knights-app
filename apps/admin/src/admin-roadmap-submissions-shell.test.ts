import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminRoadmapSubmissions } from "./admin-content-fixtures.js";
import { renderAdminRoadmapSubmissionRoute } from "./admin-roadmap-submissions-shell.js";

const roadmapSubmission = fallbackAdminRoadmapSubmissions[0]!;

describe("admin roadmap submissions shell", () => {
  it("renders API-mode list and detail routes", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            roadmapSubmissions: [
              {
                id: roadmapSubmission.id,
                assignmentId: roadmapSubmission.assignmentId,
                stepId: roadmapSubmission.stepId,
                submitterUserId: roadmapSubmission.submitterUserId,
                submitterName: roadmapSubmission.submitterName,
                submitterEmail: roadmapSubmission.submitterEmail,
                roadmapTitle: roadmapSubmission.roadmapTitle,
                roadmapTargetRole: roadmapSubmission.roadmapTargetRole,
                stageTitle: roadmapSubmission.stageTitle,
                stepTitle: roadmapSubmission.stepTitle,
                organizationUnitId: roadmapSubmission.organizationUnitId,
                organizationUnitName: roadmapSubmission.organizationUnitName,
                status: roadmapSubmission.status,
                bodyPreview: roadmapSubmission.bodyPreview,
                attachmentCount: roadmapSubmission.attachmentCount,
                reviewComment: roadmapSubmission.reviewComment,
                reviewedAt: roadmapSubmission.reviewedAt,
                createdAt: roadmapSubmission.createdAt,
                updatedAt: roadmapSubmission.updatedAt
              }
            ]
          })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapSubmission })
      });

    const list = await renderAdminRoadmapSubmissionRoute({
      path: "/admin/roadmap-submissions",
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });
    const detail = await renderAdminRoadmapSubmissionRoute({
      path: `/admin/roadmap-submissions/${roadmapSubmission.id}`,
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });

    expect(list).toMatchObject({
      route: "AdminRoadmapSubmissionList",
      state: "ready",
      statusCode: 200
    });
    expect(list.document).toContain("Demo Brother");
    expect(list.document).toContain('data-action="approve"');
    expect(detail).toMatchObject({
      route: "AdminRoadmapSubmissionDetail",
      state: "ready",
      statusCode: 200
    });
    expect(detail.document).toContain("Review Comment");
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/admin/roadmap-submissions",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/admin/roadmap-submissions/${roadmapSubmission.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("renders demo routes without backend calls and maps failures", async () => {
    const fetchImpl = vi.fn();

    const demo = await renderAdminRoadmapSubmissionRoute({
      path: "/admin/roadmap-submissions",
      runtimeMode: "demo",
      canWrite: true,
      fetchImpl
    });
    expect(demo.statusCode).toBe(200);
    expect(demo.document).toContain("Demo Brother");
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(
      renderAdminRoadmapSubmissionRoute({
        path: "/admin/roadmap-submissions",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({
      state: "forbidden",
      statusCode: 403
    });
  });
});
