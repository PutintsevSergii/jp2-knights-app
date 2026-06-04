import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaSilentPrayerRepository } from "./silent-prayer.repository.js";

const now = new Date("2026-05-25T12:00:00.000Z");
const eventRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Morning Prayer",
  intention: "For peace.",
  startsAt: new Date("2026-05-25T10:00:00.000Z"),
  endsAt: new Date("2026-05-25T14:00:00.000Z"),
  visibility: "PUBLIC",
  targetOrganizationUnitId: null
};

describe("PrismaSilentPrayerRepository", () => {
  it("requires approval metadata before public silent-prayer sessions are visible or joinable", async () => {
    const { silentPrayerEventFindMany, silentPrayerEventFindFirst, prisma } = prismaMock();
    silentPrayerEventFindMany.mockResolvedValueOnce([eventRecord]);
    silentPrayerEventFindFirst.mockResolvedValueOnce(eventRecord);
    const repository = new PrismaSilentPrayerRepository(prisma);

    await expect(repository.findPublicSessions({ limit: 20, offset: 0 }, now)).resolves.toEqual([
      {
        id: eventRecord.id,
        title: eventRecord.title,
        intention: eventRecord.intention,
        startsAt: "2026-05-25T10:00:00.000Z",
        endsAt: "2026-05-25T14:00:00.000Z",
        visibility: "PUBLIC",
        activeCount: 0
      }
    ]);
    await expect(repository.findPublicJoinableSession(eventRecord.id, now)).resolves.toMatchObject({
      id: eventRecord.id
    });

    const publicWhere = {
      visibility: { in: ["PUBLIC", "FAMILY_OPEN"] },
      status: "PUBLISHED",
      approvedAt: { not: null },
      archivedAt: null,
      cancelledAt: null,
      startsAt: { lte: now },
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [{ endsAt: null }, { endsAt: { gt: now } }]
        }
      ]
    };
    expect(silentPrayerEventFindMany).toHaveBeenCalledWith({
      where: publicWhere,
      orderBy: [{ startsAt: "asc" }, { title: "asc" }],
      take: 20,
      skip: 0
    });
    expect(silentPrayerEventFindFirst).toHaveBeenCalledWith({
      where: {
        id: eventRecord.id,
        ...publicWhere
      }
    });
  });

  it("requires approval metadata before brother silent-prayer sessions are visible or joinable", async () => {
    const { silentPrayerEventFindMany, silentPrayerEventFindFirst, prisma } = prismaMock();
    silentPrayerEventFindMany.mockResolvedValueOnce([
      {
        ...eventRecord,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
      }
    ]);
    silentPrayerEventFindFirst.mockResolvedValueOnce({
      ...eventRecord,
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "22222222-2222-4222-8222-222222222222"
    });
    const repository = new PrismaSilentPrayerRepository(prisma);
    const organizationUnitIds = ["22222222-2222-4222-8222-222222222222"];

    await expect(
      repository.findBrotherSessions({ limit: 10, offset: 0 }, organizationUnitIds, now)
    ).resolves.toEqual([
      {
        id: eventRecord.id,
        title: eventRecord.title,
        intention: eventRecord.intention,
        startsAt: "2026-05-25T10:00:00.000Z",
        endsAt: "2026-05-25T14:00:00.000Z",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: organizationUnitIds[0],
        activeCount: 0
      }
    ]);
    await expect(
      repository.findBrotherJoinableSession(eventRecord.id, organizationUnitIds, now)
    ).resolves.toMatchObject({
      id: eventRecord.id,
      targetOrganizationUnitId: organizationUnitIds[0]
    });

    const brotherWhere = {
      status: "PUBLISHED",
      approvedAt: { not: null },
      archivedAt: null,
      cancelledAt: null,
      startsAt: { lte: now },
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [{ endsAt: null }, { endsAt: { gt: now } }]
        },
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: { in: organizationUnitIds }
            }
          ]
        }
      ]
    };
    expect(silentPrayerEventFindMany).toHaveBeenCalledWith({
      where: brotherWhere,
      orderBy: [{ startsAt: "asc" }, { title: "asc" }],
      take: 10,
      skip: 0
    });
    expect(silentPrayerEventFindFirst).toHaveBeenCalledWith({
      where: {
        id: eventRecord.id,
        ...brotherWhere
      }
    });
  });
});

function prismaMock(): {
  silentPrayerEventFindMany: ReturnType<typeof vi.fn>;
  silentPrayerEventFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const silentPrayerEventFindMany = vi.fn(() => Promise.resolve([]));
  const silentPrayerEventFindFirst = vi.fn(() => Promise.resolve(null));

  return {
    silentPrayerEventFindMany,
    silentPrayerEventFindFirst,
    prisma: {
      silentPrayerEvent: {
        findMany: silentPrayerEventFindMany,
        findFirst: silentPrayerEventFindFirst
      }
    } as unknown as PrismaService
  };
}
