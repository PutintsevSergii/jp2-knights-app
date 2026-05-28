import { describe, expect, it } from "vitest";
import { PrismaAdminAuditRepository } from "./admin-audit.repository.js";

describe("PrismaAdminAuditRepository", () => {
  it("maps latest audit rows without exposing raw IP addresses or nested JSON", async () => {
    const prisma = {
      auditLog: {
        findMany: (args: unknown) => {
          expect(args).toEqual({
            orderBy: {
              createdAt: "desc"
            },
            take: 50,
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
        }
      }
    };

    await expect(
      new PrismaAdminAuditRepository(prisma as never).listLatest()
    ).resolves.toEqual([
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
    ]);
  });
});
