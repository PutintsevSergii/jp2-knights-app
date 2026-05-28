import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminAuditLogs } from "./admin-content-fixtures.js";
import { fetchAdminAuditLogs } from "./admin-audit-logs-api.js";

describe("admin audit logs API client", () => {
  it("fetches and validates audit-log list responses", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminAuditLogs)
      })
    );

    await expect(
      fetchAdminAuditLogs({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl
      })
    ).resolves.toEqual(fallbackAdminAuditLogs);

    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/audit-logs", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("maps non-OK responses", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({})
      })
    );

    await expect(fetchAdminAuditLogs({ fetchImpl })).rejects.toBeInstanceOf(
      AdminContentHttpError
    );
  });
});
