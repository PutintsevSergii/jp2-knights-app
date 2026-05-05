import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminCandidateProfiles } from "./admin-content-fixtures.js";
import { renderAdminCandidateRoute } from "./admin-candidates-shell.js";

const candidateProfile = fallbackAdminCandidateProfiles[0]!;

describe("admin candidate shell", () => {
  it("renders API-mode list and detail routes", async () => {
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

    const list = await renderAdminCandidateRoute({
      path: "/admin/candidates",
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });
    const detail = await renderAdminCandidateRoute({
      path: `/admin/candidates/${candidateProfile.id}`,
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: true,
      fetchImpl
    });

    expect(list).toMatchObject({ route: "AdminCandidateList", state: "ready", statusCode: 200 });
    expect(list.document).toContain("Jan Nowak");
    expect(detail).toMatchObject({
      route: "AdminCandidateDetail",
      state: "ready",
      statusCode: 200
    });
    expect(detail.document).toContain("Save Candidate");
  });

  it("renders demo routes without backend calls and maps failures", async () => {
    const fetchImpl = vi.fn();
    const demo = await renderAdminCandidateRoute({
      path: "/admin/candidates",
      runtimeMode: "demo",
      canWrite: true,
      fetchImpl
    });

    expect(demo.statusCode).toBe(200);
    expect(demo.document).toContain("Demo");
    expect(fetchImpl).not.toHaveBeenCalled();
    await expect(
      renderAdminCandidateRoute({
        path: "/admin/candidates",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () => {
          throw new AdminContentHttpError(403);
        }
      })
    ).resolves.toMatchObject({ state: "forbidden", statusCode: 403 });
  });
});
