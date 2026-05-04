import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAdminEventRepository } from "./admin-event.repository.js";

const eventRecord = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  description: "Public introduction evening.",
  type: "open-evening",
  startAt: new Date("2026-05-10T18:00:00.000Z"),
  endAt: null,
  locationLabel: "Riga",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  status: "draft",
  publishedAt: null,
  cancelledAt: null,
  archivedAt: null
};

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startAt: Date;
  endAt: Date | null;
  locationLabel: string | null;
  visibility: string;
  targetOrganizationUnitId: string | null;
  status: string;
  publishedAt: Date | null;
  cancelledAt: Date | null;
  archivedAt: Date | null;
};

const scopedEventRecord = {
  ...eventRecord,
  id: "55555555-5555-4555-8555-555555555555",
  title: "Scoped Retreat",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  status: "published",
  publishedAt: new Date("2026-05-04T08:00:00.000Z")
};

describe("PrismaAdminEventRepository", () => {
  it("lists every event for super-admin scope", async () => {
    const { eventFindMany, prisma } = prismaMock([eventRecord]);

    await expect(new PrismaAdminEventRepository(prisma).listManageableEvents(null)).resolves.toEqual([
      {
        id: eventRecord.id,
        title: eventRecord.title,
        description: eventRecord.description,
        type: eventRecord.type,
        startAt: "2026-05-10T18:00:00.000Z",
        endAt: null,
        locationLabel: eventRecord.locationLabel,
        visibility: "FAMILY_OPEN",
        targetOrganizationUnitId: null,
        status: "draft",
        publishedAt: null,
        cancelledAt: null,
        archivedAt: null
      }
    ]);
    expect(eventFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ startAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("limits officer scope to public, family-open, and assigned organization-unit events", async () => {
    const { eventFindMany, prisma } = prismaMock([scopedEventRecord]);

    await expect(
      new PrismaAdminEventRepository(prisma).listManageableEvents([
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toEqual([
      {
        id: scopedEventRecord.id,
        title: scopedEventRecord.title,
        description: scopedEventRecord.description,
        type: scopedEventRecord.type,
        startAt: "2026-05-10T18:00:00.000Z",
        endAt: null,
        locationLabel: scopedEventRecord.locationLabel,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedEventRecord.targetOrganizationUnitId,
        status: "published",
        publishedAt: "2026-05-04T08:00:00.000Z",
        cancelledAt: null,
        archivedAt: null
      }
    ]);
    expect(eventFindMany).toHaveBeenCalledWith({
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
      orderBy: [{ startAt: "asc" }, { updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("creates event records with nullable optional fields and lifecycle timestamps", async () => {
    const { eventCreate, prisma } = prismaMock([eventRecord]);
    const repository = new PrismaAdminEventRepository(prisma);

    await expect(
      repository.createEvent({
        title: "New Event",
        type: "open-evening",
        startAt: "2026-05-10T18:00:00.000Z",
        visibility: "PUBLIC",
        status: "draft"
      })
    ).resolves.toEqual({
      id: eventRecord.id,
      title: eventRecord.title,
      description: eventRecord.description,
      type: eventRecord.type,
      startAt: "2026-05-10T18:00:00.000Z",
      endAt: null,
      locationLabel: eventRecord.locationLabel,
      visibility: "FAMILY_OPEN",
      targetOrganizationUnitId: null,
      status: "draft",
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    });
    expect(eventCreate).toHaveBeenLastCalledWith({
      data: {
        title: "New Event",
        description: null,
        type: "open-evening",
        startAt: new Date("2026-05-10T18:00:00.000Z"),
        endAt: null,
        locationLabel: null,
        visibility: "PUBLIC",
        targetOrganizationUnitId: null,
        status: "draft",
        publishedAt: null,
        cancelledAt: null,
        archivedAt: null
      }
    });

    await repository.createEvent({
      title: "Published Event",
      type: "retreat",
      startAt: "2026-05-10T18:00:00.000Z",
      visibility: "PUBLIC",
      status: "published"
    });
    expect(eventCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "published",
        publishedAt: expect.any(Date) as Date,
        cancelledAt: null,
        archivedAt: null
      }) as unknown
    });

    await repository.createEvent({
      title: "Cancelled Event",
      type: "retreat",
      startAt: "2026-05-10T18:00:00.000Z",
      visibility: "PUBLIC",
      status: "cancelled"
    });
    expect(eventCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "cancelled",
        publishedAt: null,
        cancelledAt: expect.any(Date) as Date,
        archivedAt: null
      }) as unknown
    });
  });

  it("updates only provided fields and returns null when scope prevents the update", async () => {
    const { eventFindFirst, eventUpdateMany, prisma } = prismaMock([scopedEventRecord]);

    await expect(
      new PrismaAdminEventRepository(prisma).updateEvent(
        eventRecord.id,
        {
          title: scopedEventRecord.title,
          description: null,
          type: "retreat",
          startAt: "2026-05-10T18:00:00.000Z",
          endAt: "2026-05-10T20:00:00.000Z",
          locationLabel: "Parish Hall",
          visibility: "ORGANIZATION_UNIT",
          targetOrganizationUnitId: scopedEventRecord.targetOrganizationUnitId,
          status: "published",
          archivedAt: null
        },
        ["11111111-1111-4111-8111-111111111111"]
      )
    ).resolves.toEqual({
      id: scopedEventRecord.id,
      title: scopedEventRecord.title,
      description: scopedEventRecord.description,
      type: scopedEventRecord.type,
      startAt: "2026-05-10T18:00:00.000Z",
      endAt: null,
      locationLabel: scopedEventRecord.locationLabel,
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: scopedEventRecord.targetOrganizationUnitId,
      status: "published",
      publishedAt: "2026-05-04T08:00:00.000Z",
      cancelledAt: null,
      archivedAt: null
    });
    expect(eventUpdateMany).toHaveBeenLastCalledWith({
      where: {
        id: eventRecord.id,
        targetOrganizationUnitId: { in: ["11111111-1111-4111-8111-111111111111"] }
      },
      data: {
        title: scopedEventRecord.title,
        description: null,
        type: "retreat",
        startAt: new Date("2026-05-10T18:00:00.000Z"),
        endAt: new Date("2026-05-10T20:00:00.000Z"),
        locationLabel: "Parish Hall",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedEventRecord.targetOrganizationUnitId,
        status: "published",
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }
    });
    expect(eventFindFirst).toHaveBeenLastCalledWith({
      where: {
        id: eventRecord.id,
        targetOrganizationUnitId: { in: ["11111111-1111-4111-8111-111111111111"] }
      }
    });

    const scopedOut = prismaMock([eventRecord], { updateCount: 0 });
    await expect(
      new PrismaAdminEventRepository(scopedOut.prisma).updateEvent(
        eventRecord.id,
        { status: "archived" },
        ["22222222-2222-4222-8222-222222222222"]
      )
    ).resolves.toBeNull();
    expect(scopedOut.eventFindFirst).not.toHaveBeenCalled();
  });

  it("fails fast when Prisma returns an unknown event enum", async () => {
    const { prisma } = prismaMock([{ ...eventRecord, visibility: "PRIVATE" }]);

    await expect(new PrismaAdminEventRepository(prisma).listManageableEvents(null)).rejects.toThrow(
      "Repository returned an unknown event visibility."
    );

    const mock = prismaMock([{ ...eventRecord, status: "deleted" }]);
    await expect(new PrismaAdminEventRepository(mock.prisma).listManageableEvents(null)).rejects.toThrow(
      "Repository returned an unknown event status."
    );
  });
});

function prismaMock(
  records: EventRecord[],
  options: { updateCount?: number } = {}
): {
  eventFindMany: ReturnType<typeof vi.fn>;
  eventCreate: ReturnType<typeof vi.fn>;
  eventUpdateMany: ReturnType<typeof vi.fn>;
  eventFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const eventFindMany = vi.fn(() => Promise.resolve(records));
  const eventCreate = vi.fn(() => Promise.resolve(records[0] ?? eventRecord));
  const eventUpdateMany = vi.fn(() => Promise.resolve({ count: options.updateCount ?? 1 }));
  const eventFindFirst = vi.fn(() => Promise.resolve(records[0] ?? eventRecord));

  return {
    eventFindMany,
    eventCreate,
    eventUpdateMany,
    eventFindFirst,
    prisma: {
      event: {
        findMany: eventFindMany,
        create: eventCreate,
        updateMany: eventUpdateMany,
        findFirst: eventFindFirst
      }
    } as unknown as PrismaService
  };
}
