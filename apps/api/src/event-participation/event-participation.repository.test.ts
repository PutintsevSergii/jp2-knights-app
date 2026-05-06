import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  brotherParticipationEventWhere,
  candidateParticipationEventWhere,
  PrismaEventParticipationRepository
} from "./event-participation.repository.js";

const eventId = "44444444-4444-4444-8444-444444444444";
const userId = "22222222-2222-4222-8222-222222222222";
const organizationUnitId = "11111111-1111-4111-8111-111111111111";
const now = new Date("2026-05-06T12:00:00.000Z");

describe("event participation visibility where clauses", () => {
  it("limits candidate participation to open public, candidate, and assigned events", () => {
    expect(candidateParticipationEventWhere(eventId, organizationUnitId, now)).toEqual({
      id: eventId,
      status: "published",
      archivedAt: null,
      cancelledAt: null,
      startAt: { gte: now },
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: organizationUnitId
            }
          ]
        }
      ]
    });
  });

  it("limits brother participation to open public, brother, and own organization-unit events", () => {
    expect(brotherParticipationEventWhere(eventId, [organizationUnitId], now)).toEqual(
      expect.objectContaining({
        id: eventId,
        status: "published",
        archivedAt: null,
        cancelledAt: null,
        startAt: { gte: now },
        AND: [
          {
            OR: [
              { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
              {
                visibility: "ORGANIZATION_UNIT",
                targetOrganizationUnitId: {
                  in: [organizationUnitId]
                }
              }
            ]
          }
        ]
      })
    );
  });
});

describe("PrismaEventParticipationRepository", () => {
  it("creates a planning intent and maps the response without exposing user ids", async () => {
    const { eventParticipationCreate, eventParticipationFindFirst, prisma } = prismaMock();
    eventParticipationFindFirst.mockResolvedValueOnce(null);
    eventParticipationCreate.mockResolvedValueOnce(record());

    await expect(
      new PrismaEventParticipationRepository(prisma).markPlanningToAttend(userId, eventId, now)
    ).resolves.toEqual({
      id: "55555555-5555-4555-8555-555555555555",
      eventId,
      intentStatus: "planning_to_attend",
      createdAt: "2026-05-06T12:00:00.000Z",
      cancelledAt: null
    });
    expect(eventParticipationCreate).toHaveBeenCalledWith({
      data: {
        eventId,
        userId,
        intentStatus: "planning_to_attend",
        createdAt: now
      }
    });
  });

  it("returns an existing active planning intent instead of duplicating it", async () => {
    const { eventParticipationCreate, eventParticipationFindFirst, prisma } = prismaMock();
    eventParticipationFindFirst.mockResolvedValueOnce(record());

    await expect(
      new PrismaEventParticipationRepository(prisma).markPlanningToAttend(userId, eventId, now)
    ).resolves.toMatchObject({
      eventId,
      intentStatus: "planning_to_attend"
    });
    expect(eventParticipationCreate).not.toHaveBeenCalled();
  });

  it("cancels only an active own participation intent", async () => {
    const { eventParticipationFindFirst, eventParticipationUpdate, prisma } = prismaMock();
    eventParticipationFindFirst.mockResolvedValueOnce(record());
    eventParticipationUpdate.mockResolvedValueOnce(
      record({
        intentStatus: "cancelled",
        cancelledAt: new Date("2026-05-06T13:00:00.000Z")
      })
    );

    await expect(
      new PrismaEventParticipationRepository(prisma).cancelOwnParticipation(
        userId,
        eventId,
        new Date("2026-05-06T13:00:00.000Z")
      )
    ).resolves.toEqual({
      id: "55555555-5555-4555-8555-555555555555",
      eventId,
      intentStatus: "cancelled",
      createdAt: "2026-05-06T12:00:00.000Z",
      cancelledAt: "2026-05-06T13:00:00.000Z"
    });
    expect(eventParticipationUpdate).toHaveBeenCalledWith({
      where: {
        id: "55555555-5555-4555-8555-555555555555"
      },
      data: {
        intentStatus: "cancelled",
        cancelledAt: new Date("2026-05-06T13:00:00.000Z")
      }
    });
  });

  it("returns null when no active own participation intent exists", async () => {
    const { eventParticipationFindFirst, eventParticipationUpdate, prisma } = prismaMock();
    eventParticipationFindFirst.mockResolvedValueOnce(null);

    await expect(
      new PrismaEventParticipationRepository(prisma).cancelOwnParticipation(userId, eventId, now)
    ).resolves.toBeNull();
    expect(eventParticipationUpdate).not.toHaveBeenCalled();
  });
});

function record(
  overrides: Partial<{
    id: string;
    eventId: string;
    intentStatus: string;
    createdAt: Date;
    cancelledAt: Date | null;
  }> = {}
) {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    eventId,
    intentStatus: "planning_to_attend",
    createdAt: now,
    cancelledAt: null,
    ...overrides
  };
}

function prismaMock(): {
  eventParticipationCreate: ReturnType<typeof vi.fn>;
  eventParticipationFindFirst: ReturnType<typeof vi.fn>;
  eventParticipationUpdate: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const eventParticipationCreate = vi.fn();
  const eventParticipationFindFirst = vi.fn(() => Promise.resolve(null));
  const eventParticipationUpdate = vi.fn();
  const transactionClient = {
    eventParticipation: {
      create: eventParticipationCreate,
      findFirst: eventParticipationFindFirst,
      update: eventParticipationUpdate
    }
  };
  const transaction = vi.fn(
    async <T>(callback: (client: typeof transactionClient) => Promise<T>): Promise<T> =>
      callback(transactionClient)
  );

  return {
    eventParticipationCreate,
    eventParticipationFindFirst,
    eventParticipationUpdate,
    prisma: {
      $transaction: transaction,
      eventParticipation: {
        findFirst: eventParticipationFindFirst,
        update: eventParticipationUpdate
      }
    } as unknown as PrismaService
  };
}
