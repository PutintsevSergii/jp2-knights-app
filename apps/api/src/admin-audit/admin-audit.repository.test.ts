import { describe, expect, it } from "vitest";
import type { AdminAuditLogListQuery } from "./admin-audit.types.js";
import { PrismaAdminAuditRepository } from "./admin-audit.repository.js";

describe("PrismaAdminAuditRepository", () => {
  it("maps latest audit rows without exposing raw IP addresses or nested JSON", async () => {
    const prisma = {
      auditLog: {
        findMany: (args: unknown) => {
          expect(args).toEqual({
            where: {},
            orderBy: {
              createdAt: "desc"
            },
            take: 50,
            skip: 0,
            include: {
              actor: {
                select: {
                  id: true,
                  displayName: true
                }
              }
            }
          });

          return Promise.resolve([
            {
              id: "55555555-5555-4555-8555-555555555555",
              actorUserId: "11111111-1111-4111-8111-111111111111",
              actor: {
                id: "11111111-1111-4111-8111-111111111111",
                displayName: "Demo Admin"
              },
              action: "admin.candidateRequest.update",
              entityType: "candidate_request",
              entityId: "66666666-6666-4666-8666-666666666666",
              scopeOrganizationUnitId: "33333333-3333-4333-8333-333333333333",
              beforeSummary: {
                status: "new",
                nested: {
                  private: "ignored"
                }
              },
              afterSummary: {
                status: "contacted",
                changed: true
              },
              requestId: "req_123",
              ipAddress: "127.0.0.1",
              createdAt: new Date("2026-05-27T08:00:00.000Z")
            }
          ]);
        },
        count: (args: unknown) => {
          expect(args).toEqual({ where: {} });

          return Promise.resolve(7);
        }
      }
    };

    await expect(
      new PrismaAdminAuditRepository(prisma as never).list(auditQuery())
    ).resolves.toEqual({
      auditLogs: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          actorUserId: "11111111-1111-4111-8111-111111111111",
          actorDisplayName: "Demo Admin",
          action: "admin.candidateRequest.update",
          entityType: "candidate_request",
          entityId: "66666666-6666-4666-8666-666666666666",
          scopeOrganizationUnitId: "33333333-3333-4333-8333-333333333333",
          beforeSummary: {
            status: "new"
          },
          afterSummary: {
            status: "contacted",
            changed: true
          },
          requestId: "req_123",
          createdAt: "2026-05-27T08:00:00.000Z"
        }
      ],
      total: 7
    });
  });

  it("translates audit filters and pagination into Prisma criteria", async () => {
    const query = auditQuery({
      limit: 10,
      offset: 20,
      action: "admin.candidateRequest.erase",
      entityType: "candidate_request",
      actorUserId: "11111111-1111-4111-8111-111111111111",
      entityId: "66666666-6666-4666-8666-666666666666",
      scopeOrganizationUnitId: "33333333-3333-4333-8333-333333333333",
      createdFrom: "2026-05-01T00:00:00.000Z",
      createdTo: "2026-05-31T23:59:59.000Z"
    });
    const prisma = {
      auditLog: {
        findMany: (args: unknown) => {
          expect(args).toMatchObject({
            where: {
              action: "admin.candidateRequest.erase",
              entityType: "candidate_request",
              actorUserId: "11111111-1111-4111-8111-111111111111",
              entityId: "66666666-6666-4666-8666-666666666666",
              scopeOrganizationUnitId: "33333333-3333-4333-8333-333333333333",
              createdAt: {
                gte: new Date("2026-05-01T00:00:00.000Z"),
                lte: new Date("2026-05-31T23:59:59.000Z")
              }
            },
            take: 10,
            skip: 20
          });

          return Promise.resolve([]);
        },
        count: (args: unknown) => {
          expect(args).toEqual({
            where: {
              action: "admin.candidateRequest.erase",
              entityType: "candidate_request",
              actorUserId: "11111111-1111-4111-8111-111111111111",
              entityId: "66666666-6666-4666-8666-666666666666",
              scopeOrganizationUnitId: "33333333-3333-4333-8333-333333333333",
              createdAt: {
                gte: new Date("2026-05-01T00:00:00.000Z"),
                lte: new Date("2026-05-31T23:59:59.000Z")
              }
            }
          });

          return Promise.resolve(0);
        }
      }
    };

    await expect(new PrismaAdminAuditRepository(prisma as never).list(query)).resolves.toEqual({
      auditLogs: [],
      total: 0
    });
  });
});

function auditQuery(overrides: Partial<AdminAuditLogListQuery> = {}): AdminAuditLogListQuery {
  return {
    limit: 50,
    offset: 0,
    ...overrides
  };
}
