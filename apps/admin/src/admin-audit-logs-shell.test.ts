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
    expect(rendered.document).toContain('method="get" action="/admin/audit-logs"');
    expect(rendered.document).toContain('name="action" value=""');
    expect(rendered.document).toContain('name="limit" value="50"');
    expect(rendered.document).toContain("admin.silentPrayerEvent.update");
    expect(rendered.document).toContain("req_demo_audit");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/audit-logs", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("forwards only supported audit-log filters to the API client", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminAuditLogs)
      })
    );

    const rendered = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      query: {
        limit: "10",
        offset: "20",
        entityType: "candidate_request",
        createdFrom: "2026-05-01T00:00:00.000Z",
        ignored: "true"
      },
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: false,
      fetchImpl
    });

    expect(rendered.document).toContain('name="limit" value="10"');
    expect(rendered.document).toContain('name="offset" value="20"');
    expect(rendered.document).toContain('name="entityType" value="candidate_request"');
    expect(rendered.document).toContain('href="/admin/audit-logs"');
    expect(rendered.document).not.toContain('name="ignored"');
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/audit-logs?limit=10&offset=20&entityType=candidate_request&createdFrom=2026-05-01T00%3A00%3A00.000Z",
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
  });

  it("renders audit-log previous and next pagination links with current filters", async () => {
    const page = {
      auditLogs: [
        fallbackAdminAuditLogs.auditLogs[0],
        {
          ...fallbackAdminAuditLogs.auditLogs[0],
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          entityId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          requestId: "req_demo_audit_2"
        }
      ],
      pagination: {
        limit: 2,
        offset: 2,
        total: 5
      }
    };
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(page)
      })
    );

    const rendered = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      query: {
        action: "admin.silentPrayerEvent.update",
        entityType: "silent_prayer_event",
        limit: "2",
        offset: "2"
      },
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: false,
      fetchImpl
    });

    expect(rendered.document).toContain('aria-label="Audit log pages"');
    expect(rendered.document).toContain("Showing 3-4 of 5");
    expect(rendered.document).toContain(
      'href="/admin/audit-logs?action=admin.silentPrayerEvent.update&amp;entityType=silent_prayer_event&amp;limit=2&amp;offset=0"'
    );
    expect(rendered.document).toContain(
      'href="/admin/audit-logs?action=admin.silentPrayerEvent.update&amp;entityType=silent_prayer_event&amp;limit=2&amp;offset=4"'
    );
  });

  it("does not infer a next audit-log page when the server total ends on the current page", async () => {
    const page = {
      auditLogs: [
        fallbackAdminAuditLogs.auditLogs[0],
        {
          ...fallbackAdminAuditLogs.auditLogs[0],
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          entityId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          requestId: "req_demo_audit_2"
        }
      ],
      pagination: {
        limit: 2,
        offset: 2,
        total: 4
      }
    };
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(page)
      })
    );

    const rendered = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      query: {
        limit: "2",
        offset: "2"
      },
      runtimeMode: "api",
      baseUrl: "https://api.example.test",
      authToken: "token_1",
      canWrite: false,
      fetchImpl
    });

    expect(rendered.document).toContain("Showing 3-4 of 4");
    expect(rendered.document).toContain('href="/admin/audit-logs?limit=2&amp;offset=0"');
    expect(rendered.document).not.toContain(
      'href="/admin/audit-logs?limit=2&amp;offset=4"'
    );
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
    const empty = await renderAdminAuditLogRoute({
      path: "/admin/audit-logs",
      query: {
        limit: "10",
        offset: "20"
      },
      runtimeMode: "api",
      canWrite: false,
      fetchImpl: () =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({ auditLogs: [], pagination: { limit: 10, offset: 20, total: 20 } })
        })
    });

    expect(empty).toMatchObject({
      state: "empty",
      statusCode: 404
    });
    expect(empty.document).toContain("No audit logs");
    expect(empty.document).toContain("Showing 0 of 20 results from offset 20");
    expect(empty.document).toContain('href="/admin/audit-logs?limit=10&amp;offset=10"');

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
