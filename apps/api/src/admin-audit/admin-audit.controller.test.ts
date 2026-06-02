import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminAuditController } from "./admin-audit.controller.js";
import type { AdminAuditService } from "./admin-audit.service.js";
import type { AdminAuditLogListQuery } from "./admin-audit.types.js";

const principal: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminAuditController", () => {
  it("delegates audit-log reads using the guard-attached principal", async () => {
    const query: AdminAuditLogListQuery = {
      limit: 50,
      offset: 0,
      entityType: "candidate_request"
    };
    const controller = new AdminAuditController({
      listAuditLogs: (
        receivedPrincipal: CurrentUserPrincipal,
        receivedQuery: AdminAuditLogListQuery
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(receivedQuery).toBe(query);
        return Promise.resolve({
          auditLogs: [],
          pagination: {
            limit: query.limit,
            offset: query.offset,
            total: 0
          }
        });
      }
    } as unknown as AdminAuditService);

    await expect(controller.listAuditLogs({ principal }, query)).resolves.toEqual({
      auditLogs: [],
      pagination: {
        limit: 50,
        offset: 0,
        total: 0
      }
    });
  });

  it("fails closed when invoked without the guard-attached principal", async () => {
    const controller = new AdminAuditController({} as AdminAuditService);

    await expect(controller.listAuditLogs({}, { limit: 50, offset: 0 })).rejects.toThrow(
      "CurrentUserGuard"
    );
  });
});
