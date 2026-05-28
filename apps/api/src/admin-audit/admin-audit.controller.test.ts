import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminAuditController } from "./admin-audit.controller.js";
import type { AdminAuditService } from "./admin-audit.service.js";

const principal: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminAuditController", () => {
  it("delegates audit-log reads using the guard-attached principal", async () => {
    const controller = new AdminAuditController({
      listAuditLogs: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({
          auditLogs: []
        });
      }
    } as unknown as AdminAuditService);

    await expect(controller.listAuditLogs({ principal })).resolves.toEqual({
      auditLogs: []
    });
  });

  it("fails closed when invoked without the guard-attached principal", async () => {
    const controller = new AdminAuditController({} as AdminAuditService);

    await expect(controller.listAuditLogs({})).rejects.toThrow("CurrentUserGuard");
  });
});
