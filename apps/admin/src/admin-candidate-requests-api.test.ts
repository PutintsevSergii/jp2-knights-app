import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import {
  fetchAdminCandidateRequest,
  fetchAdminCandidateRequests,
  updateAdminCandidateRequest
} from "./admin-candidate-requests-api.js";
import { fallbackAdminCandidateRequestDetails } from "./admin-content-fixtures.js";

const candidateRequest = fallbackAdminCandidateRequestDetails[0]!;
const listPayload = {
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
};

describe("admin candidate request API client", () => {
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
        json: () => Promise.resolve({ candidateRequest })
      })
    );

    await expect(
      fetchAdminCandidateRequests({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: listFetch
      })
    ).resolves.toEqual(listPayload);
    await expect(
      fetchAdminCandidateRequest(candidateRequest.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: detailFetch
      })
    ).resolves.toEqual({ candidateRequest });

    expect(listFetch).toHaveBeenCalledWith(
      "https://api.example.test/admin/candidate-requests",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    expect(detailFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/candidate-requests/${candidateRequest.id}`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("sends status updates as JSON and maps non-OK responses", async () => {
    const updateFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            candidateRequest: { ...candidateRequest, status: "contacted" }
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
      updateAdminCandidateRequest(
        candidateRequest.id,
        { status: "contacted", officerNote: "Called once." },
        {
          baseUrl: "https://api.example.test",
          fetchImpl: updateFetch
        }
      )
    ).resolves.toMatchObject({
      candidateRequest: {
        status: "contacted"
      }
    });
    await expect(
      fetchAdminCandidateRequests({ fetchImpl: forbiddenFetch })
    ).rejects.toBeInstanceOf(AdminContentHttpError);

    expect(updateFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/candidate-requests/${candidateRequest.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "contacted", officerNote: "Called once." })
      }
    );
  });
});
