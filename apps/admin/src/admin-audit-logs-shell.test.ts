import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminAuditLogs } from "./admin-content-fixtures.js";
import { renderAdminAuditLogRoute } from "./admin-audit-logs-shell.js";

describe("admin audit logs shell", () => {
  it("renders API-mode audit logs through the guarded API client", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminAuditLogs)
      })
    );

    const rendered = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: false,
      fetchImpl
    });

    expect(rendered).toMatchObject({
      route: "AdminAuditLogList",
      state: "ready",
      statusCode: 200
    });
    expect(rendered.document).toContain("admin.silentPrayerEvent.update");
    expect(rendered.document).toContain("req_demo_audit");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/audit-logs", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("renders demo routes without backend calls and maps forbidden failures", async () => {
    const fetchImpl = vi.fn();

    const demo = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      runtimeMode: "demo",
      canWrite: false,
      fetchImpl
    });
    expect(demo.statusCode).toBe(200);
    expect(demo.document).toContain("Demo Admin");
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(
      renderAdminAuditLogRoute({
        path: "/admin/audit-logs",
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

  it("renders empty, offline, and generic error states", async () => {
    await expect(
      renderAdminAuditLogRoute({
        path: "/admin/audit-logs",
        runtimeMode: "api",
        canWrite: false,
        fetchImpl: () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ auditLogs: [] })
          })
      })
    ).resolves.toMatchObject({
      state: "empty",
      statusCode: 404
    });

    const offline = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      runtimeMode: "api",
      canWrite: false,
      fetchImpl: () => {
        throw new TypeError("network down");
      }
    });
    expect(offline).toMatchObject({
      state: "offline",
      statusCode: 503
    });
    expect(offline.document).toContain("Audit logs unavailable");

    const error = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      runtimeMode: "api",
      canWrite: false,
      fetchImpl: () => {
        throw new Error("bad payload");
      }
    });
    expect(error).toMatchObject({
      state: "error",
      statusCode: 500
    });
    expect(error.document).toContain("Could not load audit logs");
  });
});
