import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminCandidateRequestDetails } from "./admin-content-fixtures.js";
import { renderAdminCandidateRequestRoute } from "./admin-candidate-requests-shell.js";

const candidateRequest = fallbackAdminCandidateRequestDetails[0]!;

describe("admin candidate request shell", () => {
  it("renders API-mode list and detail routes", async () => {
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

    const list = await renderAdminCandidateRequestRoute({
      path: "/admin/candidate-requests",
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });
    const detail = await renderAdminCandidateRequestRoute({
      path: `/admin/candidate-requests/${candidateRequest.id}`,
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });

    expect(list).toMatchObject({
      route: "AdminCandidateRequestList",
      state: "ready",
      statusCode: 200
    });
    expect(list.document).toContain("Jan Nowak");
    expect(detail).toMatchObject({
      route: "AdminCandidateRequestDetail",
      state: "ready",
      statusCode: 200
    });
    expect(detail.document).toContain("Save Follow-up");
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/admin/candidate-requests",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/admin/candidate-requests/${candidateRequest.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("renders demo routes without backend calls and maps failures", async () => {
    const fetchImpl = vi.fn();

    const demo = await renderAdminCandidateRequestRoute({
      path: "/admin/candidate-requests",
      runtimeMode: "demo",
      canWrite: true,
      fetchImpl
    });
    expect(demo.statusCode).toBe(200);
    expect(demo.document).toContain("Demo");
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(
      renderAdminCandidateRequestRoute({
        path: "/admin/candidate-requests",
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
