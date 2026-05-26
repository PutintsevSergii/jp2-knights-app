import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAdminSilentPrayerRepository } from "./admin-silent-prayer.repository.js";

const actorUserId = "99999999-9999-4999-8999-999999999999";

const silentPrayerEventRecord = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Morning Prayer",
  intention: "For peace.",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  status: "DRAFT",
  startsAt: new Date("2026-05-10T18:00:00.000Z"),
  endsAt: null,
  approvedAt: null,
  publishedAt: null,
  cancelledAt: null,
  archivedAt: null
};

type SilentPrayerEventRecord = {
  id: string;
  title: string;
  intention: string | null;
  visibility: string;
  targetOrganizationUnitId: string | null;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  approvedAt: Date | null;
  publishedAt: Date | null;
  cancelledAt: Date | null;
  archivedAt: Date | null;
};

const scopedSilentPrayerEventRecord = {
  ...silentPrayerEventRecord,
  id: "55555555-5555-4555-8555-555555555555",
  title: "Scoped Prayer",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  status: "PUBLISHED",
  approvedAt: new Date("2026-05-04T07:00:00.000Z"),
  publishedAt: new Date("2026-05-04T08:00:00.000Z")
};

describe("PrismaAdminSilentPrayerRepository", () => {
  it("lists every silent-prayer event for super-admin scope", async () => {
    const { silentPrayerEventFindMany, prisma } = prismaMock([silentPrayerEventRecord]);

    await expect(
      new PrismaAdminSilentPrayerRepository(prisma).listManageableEvents(null)
    ).resolves.toEqual([
      {
        id: silentPrayerEventRecord.id,
        title: silentPrayerEventRecord.title,
        intention: silentPrayerEventRecord.intention,
        visibility: "FAMILY_OPEN",
        targetOrganizationUnitId: null,
        status: "DRAFT",
        startsAt: "2026-05-10T18:00:00.000Z",
        endsAt: null,
        approvedAt: null,
        publishedAt: null,
        cancelledAt: null,
        archivedAt: null
      }
    ]);
    expect(silentPrayerEventFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("limits officer scope to public, family-open, and assigned organization-unit events", async () => {
    const { silentPrayerEventFindMany, prisma } = prismaMock([scopedSilentPrayerEventRecord]);

    await expect(
      new PrismaAdminSilentPrayerRepository(prisma).listManageableEvents([
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toEqual([
      {
        id: scopedSilentPrayerEventRecord.id,
        title: scopedSilentPrayerEventRecord.title,
        intention: scopedSilentPrayerEventRecord.intention,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedSilentPrayerEventRecord.targetOrganizationUnitId,
        status: "PUBLISHED",
        startsAt: "2026-05-10T18:00:00.000Z",
        endsAt: null,
        approvedAt: "2026-05-04T07:00:00.000Z",
        publishedAt: "2026-05-04T08:00:00.000Z",
        cancelledAt: null,
        archivedAt: null
      }
    ]);
    expect(silentPrayerEventFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { visibility: { in: ["PUBLIC", "FAMILY_OPEN"] } },
          {
            targetOrganizationUnitId: {
              in: ["11111111-1111-4111-8111-111111111111"]
            }
          }
        ]
      },
      orderBy: [{ startsAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("creates silent-prayer records with nullable optional fields and lifecycle metadata", async () => {
    const { silentPrayerEventCreate, prisma } = prismaMock([silentPrayerEventRecord]);
    const repository = new PrismaAdminSilentPrayerRepository(prisma);

    await expect(
      repository.createEvent(
        {
          title: "New Prayer",
          visibility: "PUBLIC",
          status: "DRAFT",
          startsAt: "2026-05-10T18:00:00.000Z"
        },
        actorUserId
      )
    ).resolves.toEqual({
      id: silentPrayerEventRecord.id,
      title: silentPrayerEventRecord.title,
      intention: silentPrayerEventRecord.intention,
      visibility: "FAMILY_OPEN",
      targetOrganizationUnitId: null,
      status: "DRAFT",
      startsAt: "2026-05-10T18:00:00.000Z",
      endsAt: null,
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    });
    expect(silentPrayerEventCreate).toHaveBeenLastCalledWith({
      data: {
        title: "New Prayer",
        intention: null,
        visibility: "PUBLIC",
        targetOrganizationUnitId: null,
        status: "DRAFT",
        startsAt: new Date("2026-05-10T18:00:00.000Z"),
        endsAt: null,
        createdBy: actorUserId,
        updatedBy: actorUserId,
        approvedBy: null,
        publishedBy: null,
        approvedAt: null,
        publishedAt: null,
        cancelledAt: null,
        archivedAt: null
      }
    });

    await repository.createEvent(
      {
        title: "Published Prayer",
        visibility: "PUBLIC",
        status: "PUBLISHED",
        startsAt: "2026-05-10T18:00:00.000Z"
      },
      actorUserId
    );
    expect(silentPrayerEventCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "PUBLISHED",
        approvedBy: actorUserId,
        publishedBy: actorUserId,
        approvedAt: expect.any(Date) as Date,
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }) as unknown
    });
  });

  it("updates only provided fields and returns null when scope prevents the update", async () => {
    const { silentPrayerEventFindFirst, silentPrayerEventUpdateMany, prisma } = prismaMock([
      scopedSilentPrayerEventRecord
    ]);

    await expect(
      new PrismaAdminSilentPrayerRepository(prisma).updateEvent(
        silentPrayerEventRecord.id,
        {
          title: scopedSilentPrayerEventRecord.title,
          intention: null,
          visibility: "ORGANIZATION_UNIT",
          targetOrganizationUnitId: scopedSilentPrayerEventRecord.targetOrganizationUnitId,
          status: "PUBLISHED",
          startsAt: "2026-05-10T18:00:00.000Z",
          endsAt: "2026-05-10T20:00:00.000Z",
          archivedAt: null
        },
        ["11111111-1111-4111-8111-111111111111"],
        actorUserId
      )
    ).resolves.toEqual({
      id: scopedSilentPrayerEventRecord.id,
      title: scopedSilentPrayerEventRecord.title,
      intention: scopedSilentPrayerEventRecord.intention,
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: scopedSilentPrayerEventRecord.targetOrganizationUnitId,
      status: "PUBLISHED",
      startsAt: "2026-05-10T18:00:00.000Z",
      endsAt: null,
      approvedAt: "2026-05-04T07:00:00.000Z",
      publishedAt: "2026-05-04T08:00:00.000Z",
      cancelledAt: null,
      archivedAt: null
    });
    expect(silentPrayerEventUpdateMany).toHaveBeenLastCalledWith({
      where: {
        id: silentPrayerEventRecord.id,
        targetOrganizationUnitId: { in: ["11111111-1111-4111-8111-111111111111"] }
      },
      data: {
        updatedBy: actorUserId,
        title: scopedSilentPrayerEventRecord.title,
        intention: null,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedSilentPrayerEventRecord.targetOrganizationUnitId,
        status: "PUBLISHED",
        startsAt: new Date("2026-05-10T18:00:00.000Z"),
        endsAt: new Date("2026-05-10T20:00:00.000Z"),
        approvedBy: actorUserId,
        approvedAt: expect.any(Date) as Date,
        publishedBy: actorUserId,
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }
    });
    expect(silentPrayerEventFindFirst).toHaveBeenLastCalledWith({
      where: {
        id: silentPrayerEventRecord.id,
        targetOrganizationUnitId: { in: ["11111111-1111-4111-8111-111111111111"] }
      }
    });

    const scopedOut = prismaMock([silentPrayerEventRecord], { updateCount: 0 });
    await expect(
      new PrismaAdminSilentPrayerRepository(scopedOut.prisma).updateEvent(
        silentPrayerEventRecord.id,
        { status: "ARCHIVED" },
        ["22222222-2222-4222-8222-222222222222"],
        actorUserId
      )
    ).resolves.toBeNull();
    expect(scopedOut.silentPrayerEventFindFirst).not.toHaveBeenCalled();
  });

  it("fails fast when Prisma returns an unknown silent-prayer enum", async () => {
    const { prisma } = prismaMock([{ ...silentPrayerEventRecord, visibility: "PRIVATE" }]);

    await expect(
      new PrismaAdminSilentPrayerRepository(prisma).listManageableEvents(null)
    ).rejects.toThrow("Repository returned an unknown silent-prayer visibility.");

    const mock = prismaMock([{ ...silentPrayerEventRecord, status: "deleted" }]);
    await expect(
      new PrismaAdminSilentPrayerRepository(mock.prisma).listManageableEvents(null)
    ).rejects.toThrow("Repository returned an unknown silent-prayer status.");
  });
});

function prismaMock(
  records: SilentPrayerEventRecord[],
  options: { updateCount?: number } = {}
): {
  silentPrayerEventFindMany: ReturnType<typeof vi.fn>;
  silentPrayerEventCreate: ReturnType<typeof vi.fn>;
  silentPrayerEventUpdateMany: ReturnType<typeof vi.fn>;
  silentPrayerEventFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const silentPrayerEventFindMany = vi.fn(() => Promise.resolve(records));
  const silentPrayerEventCreate = vi.fn(() =>
    Promise.resolve(records[0] ?? silentPrayerEventRecord)
  );
  const silentPrayerEventUpdateMany = vi.fn(() =>
    Promise.resolve({ count: options.updateCount ?? 1 })
  );
  const silentPrayerEventFindFirst = vi.fn(() =>
    Promise.resolve(records[0] ?? silentPrayerEventRecord)
  );

  return {
    silentPrayerEventFindMany,
    silentPrayerEventCreate,
    silentPrayerEventUpdateMany,
    silentPrayerEventFindFirst,
    prisma: {
      silentPrayerEvent: {
        findMany: silentPrayerEventFindMany,
        create: silentPrayerEventCreate,
        updateMany: silentPrayerEventUpdateMany,
        findFirst: silentPrayerEventFindFirst
      }
    } as unknown as PrismaService
  };
}
