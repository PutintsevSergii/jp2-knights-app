import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminIdentityAccessReviews } from "./admin-content-fixtures.js";
import {
  confirmAdminIdentityAccessReview,
  fetchAdminIdentityAccessReview,
  fetchAdminIdentityAccessReviews,
  rejectAdminIdentityAccessReview
} from "./admin-identity-access-api.js";

const detailResponse = {
  identityAccessReview: fallbackAdminIdentityAccessReviews.identityAccessReviews[0]!
};

describe("admin identity access API client", () => {
  it("loads and validates identity access review list and detail responses", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminIdentityAccessReviews)
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(detailResponse)
      });

    await expect(
      fetchAdminIdentityAccessReviews({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      })
    ).resolves.toEqual(fallbackAdminIdentityAccessReviews);
    await expect(
      fetchAdminIdentityAccessReview(detailResponse.identityAccessReview.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      })
    ).resolves.toEqual(detailResponse);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/admin/identity-access-reviews",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("posts confirm and reject decisions with bearer auth", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(detailResponse)
      })
    );

    await confirmAdminIdentityAccessReview(
      detailResponse.identityAccessReview.id,
      {
        assignedRole: "BROTHER",
        organizationUnitId: "11111111-1111-4111-8111-111111111111"
      },
      {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      }
    );
    await rejectAdminIdentityAccessReview(
      detailResponse.identityAccessReview.id,
      { note: "Not known" },
      {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      }
    );

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      `https://api.example.test/admin/identity-access-reviews/${detailResponse.identityAccessReview.id}/confirm`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token_1"
        }
      })
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      `https://api.example.test/admin/identity-access-reviews/${detailResponse.identityAccessReview.id}/reject`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token_1"
        }
      })
    );
  });

  it("rejects non-OK responses and invalid payloads", async () => {
    await expect(
      fetchAdminIdentityAccessReviews({
        fetchImpl: () =>
          Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({})
          })
      })
    ).rejects.toBeInstanceOf(AdminContentHttpError);

    await expect(
      fetchAdminIdentityAccessReviews({
        fetchImpl: () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ identityAccessReviews: [{ status: "x" }] })
          })
      })
    ).rejects.toThrow();
  });
});
