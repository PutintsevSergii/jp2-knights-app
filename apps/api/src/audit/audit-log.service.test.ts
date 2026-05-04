import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { AuditLogService } from "./audit-log.service.js";

describe("AuditLogService", () => {
  it("persists audit input with explicit JSON null summaries", async () => {
    const prisma = prismaRecorder();
    const service = new AuditLogService(prisma);

    await service.record({
      action: "admin.prayer.create",
      actorUserId: "11111111-1111-4111-8111-111111111111",
      entityType: "prayer",
      entityId: "22222222-2222-4222-8222-222222222222",
      scopeOrganizationUnitId: null,
      beforeSummary: null,
      afterSummary: {
        title: "Morning Offering",
        status: "DRAFT"
      },
      requestId: "req_1",
      ipAddress: "127.0.0.1"
    });

    expect(prisma.auditLog.createCalls).toEqual([
      {
        data: {
          action: "admin.prayer.create",
          actorUserId: "11111111-1111-4111-8111-111111111111",
          entityType: "prayer",
          entityId: "22222222-2222-4222-8222-222222222222",
          scopeOrganizationUnitId: null,
          beforeSummary: Prisma.JsonNull,
          afterSummary: {
            title: "Morning Offering",
            status: "DRAFT"
          },
          requestId: "req_1",
          ipAddress: "127.0.0.1"
        }
      }
    ]);
  });
});

function prismaRecorder() {
  const createCalls: unknown[] = [];

  return {
    auditLog: {
      createCalls,
      create: (input: unknown) => {
        createCalls.push(input);

        return Promise.resolve({});
      }
    }
  } as unknown as ConstructorParameters<typeof AuditLogService>[0] & {
    auditLog: { createCalls: unknown[] };
  };
}
