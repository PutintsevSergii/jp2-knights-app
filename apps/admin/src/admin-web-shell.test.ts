import { describe, expect, it, vi } from "vitest";
import {
  fallbackAdminAnnouncements,
  fallbackAdminAuditLogs,
  fallbackAdminCandidateRequestDetails,
  fallbackAdminCandidateProfiles,
  fallbackAdminDashboard,
  fallbackAdminIdentityAccessReviews,
  fallbackAdminOrganizationUnits,
  fallbackAdminRoadmapAssignments,
  fallbackAdminRoadmapDefinitions,
  fallbackAdminRoadmapSubmissions,
  fallbackAdminPrayers,
  fallbackAdminSilentPrayerEvents
} from "./admin-content-fixtures.js";
import { renderAdminWebRequest } from "./admin-web-shell.js";

describe("admin web shell", () => {
  it("mounts the dashboard at /admin and /admin/dashboard", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );

    await expect(
      renderAdminWebRequest(
        {
          path: "/admin",
          headers: {
            authorization: "Bearer token_1"
          }
        },
        {
          runtimeMode: "api",
          baseUrl: "https://api.example.test",
          fetchImpl
        }
      )
    ).resolves.toMatchObject({
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    });
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("forwards session cookies from mounted admin routes to backend clients", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/dashboard",
        headers: {
          cookie: "jp2_session=session_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { cookie: "jp2_session=session_1" }
    });
  });

  it("preserves audit-log query filters on mounted admin routes", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminAuditLogs)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/audit-logs?entityType=candidate_request&limit=10&ignored=true",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/audit-logs?limit=10&entityType=candidate_request",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("mounts the identity access review route", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminIdentityAccessReviews)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/identity-access-reviews",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("Piotr Kowalski");
    expect(response.body).toContain('href="/admin/identity-access-reviews" aria-current="page"');
    expect(response.body).toContain('data-action="confirm"');
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/identity-access-reviews",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("mounts prayer content routes and forwards write capability as render-only state", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminPrayers)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/prayers?ignored=true",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("JP2 Admin Lite");
    expect(response.body).toContain('href="/admin/prayers" aria-current="page"');
    expect(response.body).toContain('href="/admin/candidate-requests"');
    expect(response.body).toContain('href="/admin/candidates"');
    expect(response.body).toContain('href="/admin/organization-units"');
    expect(response.body).toContain("Morning Offering");
    expect(response.body).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/prayers", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts the announcement content route through the shared Admin Lite shell", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminAnnouncements)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/announcements",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("JP2 Admin Lite");
    expect(response.body).toContain('href="/admin/announcements" aria-current="page"');
    expect(response.body).toContain("Service Schedule Update");
    expect(response.body).toContain('data-target-route="AdminAnnouncementEditor"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/announcements", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts the silent-prayer content route through the shared Admin Lite shell", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminSilentPrayerEvents)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/silent-prayer-events",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("JP2 Admin Lite");
    expect(response.body).toContain(
      'href="/admin/silent-prayer-events" aria-current="page"'
    );
    expect(response.body).toContain("Evening Silent Prayer");
    expect(response.body).toContain('data-target-route="AdminSilentPrayerEditor"');
    expect(response.body).not.toContain("participant");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/silent-prayer-events",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("mounts announcement create and detail editor routes", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminAnnouncements)
      })
    );

    const createResponse = await renderAdminWebRequest(
      { path: "/admin/announcements/new" },
      {
        runtimeMode: "api",
        canWrite: true,
        fetchImpl
      }
    );
    const detailResponse = await renderAdminWebRequest(
      {
        path: "/admin/announcements/55555555-5555-4555-8555-555555555555",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toContain("Create Announcement");
    expect(createResponse.body).toContain('href="/admin/announcements" aria-current="page"');
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("Announcement: Service Schedule Update");
    expect(detailResponse.body).toContain('data-action="approve"');
    expect(detailResponse.body).toContain('href="/admin/announcements" aria-current="page"');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/announcements", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts candidate profile list and detail routes", async () => {
    const candidateProfile = fallbackAdminCandidateProfiles[0]!;
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ candidateProfiles: [candidateProfile] })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ candidateProfile })
      });

    const listResponse = await renderAdminWebRequest(
      { path: "/admin/candidates", headers: { authorization: "Bearer token_1" } },
      { runtimeMode: "api", baseUrl: "https://api.example.test", canWrite: true, fetchImpl }
    );
    const detailResponse = await renderAdminWebRequest(
      {
        path: `/admin/candidates/${candidateProfile.id}`,
        headers: { authorization: "Bearer token_1" }
      },
      { runtimeMode: "api", baseUrl: "https://api.example.test", canWrite: true, fetchImpl }
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toContain("Jan Nowak");
    expect(listResponse.body).toContain('href="/admin/candidates" aria-current="page"');
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("Save Candidate");
    expect(detailResponse.body).toContain('href="/admin/candidates" aria-current="page"');
  });

  it("mounts candidate request list and detail routes", async () => {
    const candidateRequest = fallbackAdminCandidateRequestDetails[0]!;
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            candidateRequests: [
              {
                id: candidateRequest.id,
                firstName: candidateRequest.firstName,
                lastName: candidateRequest.lastName,
                email: candidateRequest.email,
                country: candidateRequest.country,
                city: candidateRequest.city,
                messagePreview: candidateRequest.messagePreview,
                status: candidateRequest.status,
                assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
                assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
                createdAt: candidateRequest.createdAt,
                updatedAt: candidateRequest.updatedAt,
                archivedAt: candidateRequest.archivedAt
              }
            ]
          })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ candidateRequest })
      });

    const listResponse = await renderAdminWebRequest(
      {
        path: "/admin/candidate-requests",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );
    const detailResponse = await renderAdminWebRequest(
      {
        path: `/admin/candidate-requests/${candidateRequest.id}`,
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toContain("Jan Nowak");
    expect(listResponse.body).toContain('href="/admin/candidate-requests" aria-current="page"');
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("Save Follow-up");
    expect(detailResponse.body).toContain('href="/admin/candidate-requests" aria-current="page"');
  });

  it("mounts roadmap submission list and detail routes", async () => {
    const roadmapSubmission = fallbackAdminRoadmapSubmissions[0]!;
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

    const listResponse = await renderAdminWebRequest(
      { path: "/admin/roadmap-submissions", headers: { authorization: "Bearer token_1" } },
      { runtimeMode: "api", baseUrl: "https://api.example.test", canWrite: true, fetchImpl }
    );
    const detailResponse = await renderAdminWebRequest(
      {
        path: `/admin/roadmap-submissions/${roadmapSubmission.id}`,
        headers: { authorization: "Bearer token_1" }
      },
      { runtimeMode: "api", baseUrl: "https://api.example.test", canWrite: true, fetchImpl }
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toContain("Demo Brother");
    expect(listResponse.body).toContain('href="/admin/roadmap-submissions" aria-current="page"');
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("Roadmap Submission: Meet your officer");
    expect(detailResponse.body).toContain('href="/admin/roadmap-submissions" aria-current="page"');
  });

  it("mounts roadmap definition list and detail routes", async () => {
    const roadmapDefinition = fallbackAdminRoadmapDefinitions[0]!;
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            roadmapDefinitions: [
              {
                id: roadmapDefinition.id,
                title: roadmapDefinition.title,
                targetRole: roadmapDefinition.targetRole,
                language: roadmapDefinition.language,
                status: roadmapDefinition.status,
                publishedAt: roadmapDefinition.publishedAt,
                stageCount: roadmapDefinition.stageCount,
                stepCount: roadmapDefinition.stepCount,
                assignmentCount: roadmapDefinition.assignmentCount,
                createdAt: roadmapDefinition.createdAt,
                updatedAt: roadmapDefinition.updatedAt,
                archivedAt: roadmapDefinition.archivedAt
              }
            ]
          })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapDefinition })
      });

    const listResponse = await renderAdminWebRequest(
      { path: "/admin/roadmap-definitions", headers: { authorization: "Bearer token_1" } },
      { runtimeMode: "api", baseUrl: "https://api.example.test", fetchImpl }
    );
    const detailResponse = await renderAdminWebRequest(
      {
        path: `/admin/roadmap-definitions/${roadmapDefinition.id}`,
        headers: { authorization: "Bearer token_1" }
      },
      { runtimeMode: "api", baseUrl: "https://api.example.test", fetchImpl }
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toContain("Brother Formation Roadmap");
    expect(listResponse.body).toContain('href="/admin/roadmap-definitions" aria-current="page"');
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("Roadmap Definition: Brother Formation Roadmap");
    expect(detailResponse.body).toContain('href="/admin/roadmap-definitions" aria-current="page"');
  });

  it("mounts roadmap assignment list and detail routes", async () => {
    const roadmapAssignment = fallbackAdminRoadmapAssignments[0]!;
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
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
          })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ roadmapAssignment })
      });

    const listResponse = await renderAdminWebRequest(
      { path: "/admin/roadmap-assignments", headers: { authorization: "Bearer token_1" } },
      { runtimeMode: "api", baseUrl: "https://api.example.test", fetchImpl }
    );
    const detailResponse = await renderAdminWebRequest(
      {
        path: `/admin/roadmap-assignments/${roadmapAssignment.id}`,
        headers: { authorization: "Bearer token_1" }
      },
      { runtimeMode: "api", baseUrl: "https://api.example.test", fetchImpl }
    );
    const createResponse = await renderAdminWebRequest(
      { path: "/admin/roadmap-assignments/new", headers: { authorization: "Bearer token_1" } },
      { runtimeMode: "api", baseUrl: "https://api.example.test", fetchImpl }
    );

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toContain("Demo Brother");
    expect(listResponse.body).toContain('href="/admin/roadmap-assignments" aria-current="page"');
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("Roadmap Assignment: Demo Brother");
    expect(detailResponse.body).not.toContain("Reflection text for officer review");
    expect(detailResponse.body).toContain('href="/admin/roadmap-assignments" aria-current="page"');
    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toContain("Create Roadmap Assignment");
    expect(createResponse.body).toContain('href="/admin/roadmap-assignments" aria-current="page"');
  });

  it("mounts the organization-unit admin route", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    const response = await renderAdminWebRequest(
      {
        path: "/admin/organization-units",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("Pilot Organization Unit");
    expect(response.body).toContain('data-action="create"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts organization-unit create and detail form routes", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminOrganizationUnits)
      })
    );

    const createResponse = await renderAdminWebRequest(
      { path: "/admin/organization-units/new" },
      {
        runtimeMode: "api",
        canWrite: true,
        fetchImpl
      }
    );

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toContain("Create Organization Unit");
    expect(fetchImpl).not.toHaveBeenCalled();

    const detailResponse = await renderAdminWebRequest(
      {
        path: "/admin/organization-units/11111111-1111-4111-8111-111111111111",
        headers: {
          authorization: "Bearer token_1"
        }
      },
      {
        runtimeMode: "api",
        baseUrl: "https://api.example.test",
        canWrite: true,
        fetchImpl
      }
    );

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toContain("JP2 Admin Lite");
    expect(detailResponse.body).toContain('href="/admin/organization-units" aria-current="page"');
    expect(detailResponse.body).toContain("Organization Unit: Pilot Organization Unit");
    expect(detailResponse.body).toContain('data-action="archive"');
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/organization-units", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("mounts Super Admin privacy workflow metadata without backend fetches", async () => {
    const fetchImpl = vi.fn();

    const forbiddenResponse = await renderAdminWebRequest(
      { path: "/admin/privacy-workflows" },
      {
        runtimeMode: "api",
        canWrite: true,
        canManagePrivacy: false,
        fetchImpl
      }
    );
    const superAdminResponse = await renderAdminWebRequest(
      { path: "/admin/privacy-workflows" },
      {
        runtimeMode: "api",
        canWrite: false,
        canManagePrivacy: true,
        fetchImpl
      }
    );

    expect(forbiddenResponse.statusCode).toBe(403);
    expect(forbiddenResponse.body).toContain("Super Admin privacy workflow access is required.");
    expect(superAdminResponse.statusCode).toBe(200);
    expect(superAdminResponse.body).toContain("Privacy Workflows");
    expect(superAdminResponse.body).toContain("Candidate request");
    expect(superAdminResponse.body).toContain("admin.candidateRequest.erase");
    expect(superAdminResponse.body).toContain('href="/admin/privacy-workflows" aria-current="page"');
    expect(superAdminResponse.body).not.toContain("data-request-path");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("renders demo routes without backend calls and returns mounted 404 for unknown admin routes", async () => {
    const fetchImpl = vi.fn();

    await expect(
      renderAdminWebRequest(
        { path: "/admin/events" },
        {
          runtimeMode: "demo",
          fetchImpl
        }
      )
    ).resolves.toMatchObject({
      statusCode: 200
    });
    expect(fetchImpl).not.toHaveBeenCalled();

    const notFound = await renderAdminWebRequest({ path: "/admin/brothers" });

    expect(notFound.statusCode).toBe(404);
    expect(notFound.body).toContain("JP2 Admin Lite");
    expect(notFound.body).toContain("The requested Admin Lite route is not available.");
  });
});
