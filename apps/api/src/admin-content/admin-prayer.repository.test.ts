import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAdminPrayerRepository } from "./admin-prayer.repository.js";

const prayerRecord = {
  id: "33333333-3333-4333-8333-333333333333",
  categoryId: null,
  title: "Morning Offering",
  body: "A public morning prayer.",
  language: "en",
  visibility: "PUBLIC",
  targetOrganizationUnitId: null,
  status: "DRAFT",
  publishedAt: null,
  archivedAt: null
};

type PrayerRecord = {
  id: string;
  categoryId: string | null;
  title: string;
  body: string;
  language: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  status: string;
  publishedAt: Date | null;
  archivedAt: Date | null;
};

const scopedPrayerRecord = {
  ...prayerRecord,
  id: "44444444-4444-4444-8444-444444444444",
  categoryId: "22222222-2222-4222-8222-222222222222",
  title: "Scoped Prayer",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  status: "PUBLISHED",
  publishedAt: new Date("2026-05-04T08:00:00.000Z")
};

describe("PrismaAdminPrayerRepository", () => {
  it("lists every prayer for super-admin scope", async () => {
    const { prayerFindMany, prisma } = prismaMock([prayerRecord]);

    await expect(new PrismaAdminPrayerRepository(prisma).listManageablePrayers(null)).resolves.toEqual([
      {
        id: prayerRecord.id,
        categoryId: null,
        title: prayerRecord.title,
        body: prayerRecord.body,
        language: prayerRecord.language,
        visibility: "PUBLIC",
        targetOrganizationUnitId: null,
        status: "DRAFT",
        publishedAt: null,
        archivedAt: null
      }
    ]);
    expect(prayerFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("limits officer scope to public, family-open, and assigned organization-unit prayers", async () => {
    const { prayerFindMany, prisma } = prismaMock([scopedPrayerRecord]);

    await expect(
      new PrismaAdminPrayerRepository(prisma).listManageablePrayers([
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toEqual([
      {
        id: scopedPrayerRecord.id,
        categoryId: scopedPrayerRecord.categoryId,
        title: scopedPrayerRecord.title,
        body: scopedPrayerRecord.body,
        language: scopedPrayerRecord.language,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedPrayerRecord.targetOrganizationUnitId,
        status: "PUBLISHED",
        publishedAt: "2026-05-04T08:00:00.000Z",
        archivedAt: null
      }
    ]);
    expect(prayerFindMany).toHaveBeenCalledWith({
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
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("creates prayer records with nullable optional fields and lifecycle timestamps", async () => {
    const { prayerCreate, prisma } = prismaMock([prayerRecord]);
    const repository = new PrismaAdminPrayerRepository(prisma);

    await expect(
      repository.createPrayer({
        title: "New Prayer",
        body: "New prayer body.",
        language: "en",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).resolves.toEqual({
      id: prayerRecord.id,
      categoryId: null,
      title: prayerRecord.title,
      body: prayerRecord.body,
      language: prayerRecord.language,
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    });
    expect(prayerCreate).toHaveBeenLastCalledWith({
      data: {
        categoryId: null,
        title: "New Prayer",
        body: "New prayer body.",
        language: "en",
        visibility: "PUBLIC",
        targetOrganizationUnitId: null,
        status: "DRAFT",
        publishedAt: null,
        archivedAt: null
      }
    });

    await repository.createPrayer({
      title: "Published Prayer",
      body: "Published prayer body.",
      language: "en",
      visibility: "PUBLIC",
      status: "PUBLISHED"
    });
    expect(prayerCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "PUBLISHED",
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }) as unknown
    });

    await repository.createPrayer({
      title: "Archived Prayer",
      body: "Archived prayer body.",
      language: "en",
      visibility: "PUBLIC",
      status: "ARCHIVED"
    });
    expect(prayerCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "ARCHIVED",
        publishedAt: null,
        archivedAt: expect.any(Date) as Date
      }) as unknown
    });
  });

  it("updates only provided fields and keeps archive metadata non-destructive", async () => {
    const { prayerUpdate, prisma } = prismaMock([scopedPrayerRecord]);

    await expect(
      new PrismaAdminPrayerRepository(prisma).updatePrayer(prayerRecord.id, {
        categoryId: scopedPrayerRecord.categoryId,
        title: scopedPrayerRecord.title,
        body: scopedPrayerRecord.body,
        language: "pl",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedPrayerRecord.targetOrganizationUnitId,
        status: "PUBLISHED",
        archivedAt: null
      })
    ).resolves.toEqual({
      id: scopedPrayerRecord.id,
      categoryId: scopedPrayerRecord.categoryId,
      title: scopedPrayerRecord.title,
      body: scopedPrayerRecord.body,
      language: scopedPrayerRecord.language,
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: scopedPrayerRecord.targetOrganizationUnitId,
      status: "PUBLISHED",
      publishedAt: "2026-05-04T08:00:00.000Z",
      archivedAt: null
    });
    expect(prayerUpdate).toHaveBeenLastCalledWith({
      where: { id: prayerRecord.id },
      data: {
        categoryId: scopedPrayerRecord.categoryId,
        title: scopedPrayerRecord.title,
        body: scopedPrayerRecord.body,
        language: "pl",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedPrayerRecord.targetOrganizationUnitId,
        status: "PUBLISHED",
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }
    });

    await new PrismaAdminPrayerRepository(prisma).updatePrayer(prayerRecord.id, {
      status: "ARCHIVED",
      archivedAt: "2026-05-04T09:00:00.000Z"
    });
    expect(prayerUpdate).toHaveBeenLastCalledWith({
      where: { id: prayerRecord.id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date("2026-05-04T09:00:00.000Z")
      }
    });
  });

  it("fails fast when Prisma returns an unknown prayer enum", async () => {
    const { prisma } = prismaMock([{ ...prayerRecord, visibility: "PRIVATE" }]);

    await expect(new PrismaAdminPrayerRepository(prisma).listManageablePrayers(null)).rejects.toThrow(
      "Repository returned an unknown prayer visibility."
    );

    const mock = prismaMock([{ ...prayerRecord, status: "DELETED" }]);
    await expect(new PrismaAdminPrayerRepository(mock.prisma).listManageablePrayers(null)).rejects.toThrow(
      "Repository returned an unknown prayer status."
    );
  });
});

function prismaMock(records: PrayerRecord[]): {
  prayerFindMany: ReturnType<typeof vi.fn>;
  prayerCreate: ReturnType<typeof vi.fn>;
  prayerUpdate: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const prayerFindMany = vi.fn(() => Promise.resolve(records));
  const prayerCreate = vi.fn(() => Promise.resolve(records[0] ?? prayerRecord));
  const prayerUpdate = vi.fn(() => Promise.resolve(records[0] ?? prayerRecord));

  return {
    prayerFindMany,
    prayerCreate,
    prayerUpdate,
    prisma: {
      prayer: {
        findMany: prayerFindMany,
        create: prayerCreate,
        update: prayerUpdate
      }
    } as unknown as PrismaService
  };
}
