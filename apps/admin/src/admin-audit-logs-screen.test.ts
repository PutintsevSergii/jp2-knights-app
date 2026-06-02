import { describe, expect, it } from "vitest";
import { fallbackAdminAuditLogs } from "./admin-content-fixtures.js";
import { buildAdminAuditLogListScreen } from "./admin-audit-logs-screen.js";

describe("admin audit logs screen model", () => {
  it("builds redacted audit rows without raw IP or email fields", () => {
    const screen = buildAdminAuditLogListScreen({
      state: "ready",
      response: fallbackAdminAuditLogs,
      runtimeMode: "api"
    });

    expect(screen).toMatchObject({
      route: "AdminAuditLogList",
      state: "ready",
      demoChromeVisible: false
    });
    expect(screen.rows[0]).toMatchObject({
      actorLabel: "Demo Admin",
      action: "admin.silentPrayerEvent.update",
      requestId: "req_demo_audit"
    });
    expect(JSON.stringify(screen)).not.toContain("ipAddress");
    expect(JSON.stringify(screen)).not.toContain("example.test");
  });

  it("maps empty ready responses to the empty state", () => {
    expect(
      buildAdminAuditLogListScreen({
        state: "ready",
        response: { auditLogs: [], pagination: { limit: 50, offset: 0, total: 0 } },
        runtimeMode: "demo"
      })
    ).toMatchObject({
      state: "empty",
      demoChromeVisible: true
    });
  });

  it("builds audit filter fields with defaults and active filter state", () => {
    const screen = buildAdminAuditLogListScreen({
      state: "ready",
      response: fallbackAdminAuditLogs,
      runtimeMode: "api",
      filters: {
        action: "admin.prayer.create",
        limit: "10",
        offset: "0"
      }
    });

    expect(screen.hasActiveFilters).toBe(true);
    expect(screen.filters).toEqual([
      { name: "action", label: "Action", value: "admin.prayer.create" },
      { name: "entityType", label: "Entity type", value: "" },
      { name: "actorUserId", label: "Actor user ID", value: "" },
      { name: "entityId", label: "Entity ID", value: "" },
      {
        name: "scopeOrganizationUnitId",
        label: "Scope organization unit ID",
        value: ""
      },
      { name: "createdFrom", label: "Created from", value: "" },
      { name: "createdTo", label: "Created to", value: "" },
      { name: "limit", label: "Limit", value: "10" },
      { name: "offset", label: "Offset", value: "0" }
    ]);

    expect(
      buildAdminAuditLogListScreen({
        state: "ready",
        response: fallbackAdminAuditLogs,
        runtimeMode: "api"
      }).hasActiveFilters
    ).toBe(false);
  });

  it("uses safe fallbacks for system actors and missing summaries", () => {
    const screen = buildAdminAuditLogListScreen({
      state: "ready",
      response: {
        auditLogs: [
          {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            actorUserId: null,
            actorDisplayName: null,
            action: "system.cleanup",
            entityType: "device_token",
            entityId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            scopeOrganizationUnitId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            beforeSummary: {},
            afterSummary: null,
            requestId: null,
            createdAt: "2026-05-27T08:00:00.000Z"
          }
        ],
        pagination: {
          limit: 50,
          offset: 0,
          total: 1
        }
      },
      runtimeMode: "api"
    });

    expect(screen.rows[0]).toMatchObject({
      actorLabel: "System",
      scopeLabel: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      beforeSummary: "None",
      afterSummary: "None",
      requestId: "Not captured"
    });
  });
});
