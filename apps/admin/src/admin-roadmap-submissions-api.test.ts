import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminRoadmapSubmissions } from "./admin-content-fixtures.js";
import {
  eraseAdminRoadmapSubmission,
  exportAdminRoadmapSubmission,
  fetchAdminRoadmapSubmission,
  fetchAdminRoadmapSubmissions,
  reviewAdminRoadmapSubmission
} from "./admin-roadmap-submissions-api.js";

const roadmapSubmission = fallbackAdminRoadmapSubmissions[0]!;
const listPayload = {
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
};

describe("admin roadmap submissions API client", () => {
  it("fetches and validates list, detail, export, and erasure responses", async () => {
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
        json: () => Promise.resolve({ roadmapSubmission })
      })
    );
    const exportFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            roadmapSubmission: {
              ...roadmapSubmission,
              archivedAt: null
            },
            exportedAt: "2026-06-03T10:00:00.000Z"
          })
      })
    );
    const eraseFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            roadmapSubmissionId: roadmapSubmission.id,
            erasedAt: "2026-06-03T11:00:00.000Z",
            archivedAt: "2026-06-03T11:00:00.000Z"
          })
      })
    );

    await expect(
      fetchAdminRoadmapSubmissions({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: listFetch
      })
    ).resolves.toEqual(listPayload);
    await expect(
      fetchAdminRoadmapSubmission(roadmapSubmission.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: detailFetch
      })
    ).resolves.toEqual({ roadmapSubmission });
    await expect(
      exportAdminRoadmapSubmission(roadmapSubmission.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: exportFetch
      })
    ).resolves.toMatchObject({
      roadmapSubmission: {
        id: roadmapSubmission.id,
        archivedAt: null
      },
      exportedAt: "2026-06-03T10:00:00.000Z"
    });
    await expect(
      eraseAdminRoadmapSubmission(roadmapSubmission.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: eraseFetch
      })
    ).resolves.toEqual({
      roadmapSubmissionId: roadmapSubmission.id,
      erasedAt: "2026-06-03T11:00:00.000Z",
      archivedAt: "2026-06-03T11:00:00.000Z"
    });

    expect(listFetch).toHaveBeenCalledWith("https://api.example.test/admin/roadmap-submissions", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
    expect(detailFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/roadmap-submissions/${roadmapSubmission.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(exportFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/roadmap-submissions/${roadmapSubmission.id}/export`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(eraseFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/roadmap-submissions/${roadmapSubmission.id}/erase`,
      {
        method: "POST",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("sends review decisions as JSON and maps non-OK responses", async () => {
    const reviewFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            roadmapSubmission: {
              ...roadmapSubmission,
              status: "approved",
              reviewComment: "Approved."
            }
          })
      })
    );
    const forbiddenFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      })
    );

    await expect(
      reviewAdminRoadmapSubmission(
        roadmapSubmission.id,
        { status: "approved", reviewComment: "Approved." },
        {
          baseUrl: "https://api.example.test",
          fetchImpl: reviewFetch
        }
      )
    ).resolves.toMatchObject({
      roadmapSubmission: {
        status: "approved"
      }
    });
    await expect(
      fetchAdminRoadmapSubmissions({ fetchImpl: forbiddenFetch })
    ).rejects.toBeInstanceOf(AdminContentHttpError);

    expect(reviewFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/roadmap-submissions/${roadmapSubmission.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "approved", reviewComment: "Approved." })
      }
    );
  });
});
