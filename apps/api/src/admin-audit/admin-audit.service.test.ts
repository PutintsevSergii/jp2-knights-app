import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { IDLE_APPROVAL_REQUIRED_CODE } from "../auth/idle-approval.exception.js";
import type { AdminAuditRepository } from "./admin-audit.repository.js";
import { AdminAuditService } from "./admin-audit.service.js";

const superAdmin: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

const officer: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["33333333-3333-4333-8333-333333333333"]
};

const idleUser: CurrentUserPrincipal = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "idle@example.test",
  displayName: "Idle User",
  status: "active",
  roles: [],
  approval: {
    state: "pending",
    expiresAt: "2026-06-04T08:00:00.000Z",
    scopeOrganizationUnitId: "33333333-3333-4333-8333-333333333333"
  }
};

describe("AdminAuditService", () => {
  it("returns latest redacted audit logs for Super Admins only", async () => {
    const repository = auditRepository();

    await expect(new AdminAuditService(repository).listAuditLogs(superAdmin)).resolves.toEqual({
      auditLogs: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          actorUserId: superAdmin.id,
          actorDisplayName: "Demo Admin",
          action: "admin.prayer.create",
          entityType: "prayer",
          entityId: "66666666-6666-4666-8666-666666666666",
          scopeOrganizationUnitId: null,
          beforeSummary: null,
          afterSummary: {
            title: "Morning Prayer",
            status: "published"
          },
          requestId: "req_123",
          createdAt: "2026-05-27T08:00:00.000Z"
        }
      ]
    });
    expect(repository.calls).toBe(1);
  });

  it("blocks officers before loading audit rows", async () => {
    const repository = auditRepository();

    await expect(new AdminAuditService(repository).listAuditLogs(officer)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(repository.calls).toBe(0);
  });

  it("blocks idle users with the approval-required code before loading audit rows", async () => {
    const repository = auditRepository();

    await expect(new AdminAuditService(repository).listAuditLogs(idleUser)).rejects.toMatchObject({
      response: {
        code: IDLE_APPROVAL_REQUIRED_CODE
      }
    });
    expect(repository.calls).toBe(0);
  });
});

function auditRepository(): AdminAuditRepository & { calls: number } {
  return {
    calls: 0,
    listLatest() {
      this.calls += 1;
      return Promise.resolve([
        {
          id: "55555555-5555-4555-8555-555555555555",
          actorUserId: superAdmin.id,
          actorDisplayName: "Demo Admin",
          action: "admin.prayer.create",
          entityType: "prayer",
          entityId: "66666666-6666-4666-8666-666666666666",
          scopeOrganizationUnitId: null,
          beforeSummary: null,
          afterSummary: {
            title: "Morning Prayer",
            status: "published"
          },
          requestId: "req_123",
          createdAt: "2026-05-27T08:00:00.000Z"
        }
      ]);
    }
  };
}
