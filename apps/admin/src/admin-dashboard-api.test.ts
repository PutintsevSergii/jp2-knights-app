import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fetchAdminDashboard } from "./admin-dashboard-api.js";
import { fallbackAdminDashboard } from "./admin-content-fixtures.js";

describe("admin dashboard API client", () => {
  it("loads and validates the scoped dashboard response", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );

    await expect(
      fetchAdminDashboard({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      })
    ).resolves.toEqual(fallbackAdminDashboard);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("rejects non-OK responses and invalid payloads", async () => {
    await expect(
      fetchAdminDashboard({
        fetchImpl: () =>
          Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({})
          })
      })
    ).rejects.toBeInstanceOf(AdminContentHttpError);

    await expect(
      fetchAdminDashboard({
        fetchImpl: () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({ ...fallbackAdminDashboard, tasks: [{ targetRoute: "/x" }] })
          })
      })
    ).rejects.toThrow();
  });
});
