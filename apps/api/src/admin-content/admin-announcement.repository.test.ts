import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAdminAnnouncementRepository } from "./admin-announcement.repository.js";

const announcementRecord = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  body: "Public introduction evening.",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  pinned: false,
  status: "DRAFT",
  publishedAt: null,
  archivedAt: null
};

type AnnouncementRecord = {
  id: string;
  title: string;
  body: string;
  visibility: string;
  targetOrganizationUnitId: string | null;
  pinned: boolean;
  status: string;
  publishedAt: Date | null;
  archivedAt: Date | null;
};

const scopedAnnouncementRecord = {
  ...announcementRecord,
  id: "55555555-5555-4555-8555-555555555555",
  title: "Scoped Formation",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  pinned: true,
  status: "PUBLISHED",
  publishedAt: new Date("2026-05-04T08:00:00.000Z")
};

describe("PrismaAdminAnnouncementRepository", () => {
  it("lists every announcement for super-admin scope", async () => {
    const { announcementFindMany, prisma } = prismaMock([announcementRecord]);

    await expect(
      new PrismaAdminAnnouncementRepository(prisma).listManageableAnnouncements(null)
    ).resolves.toEqual([
      {
        id: announcementRecord.id,
        title: announcementRecord.title,
        body: announcementRecord.body,
        visibility: "FAMILY_OPEN",
        targetOrganizationUnitId: null,
        pinned: false,
        status: "DRAFT",
        publishedAt: null,
        archivedAt: null
      }
    ]);
    expect(announcementFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("limits officer scope to public, family-open, and assigned organization-unit announcements", async () => {
    const { announcementFindMany, prisma } = prismaMock([scopedAnnouncementRecord]);

    await expect(
      new PrismaAdminAnnouncementRepository(prisma).listManageableAnnouncements([
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toEqual([
      {
        id: scopedAnnouncementRecord.id,
        title: scopedAnnouncementRecord.title,
        body: scopedAnnouncementRecord.body,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedAnnouncementRecord.targetOrganizationUnitId,
        pinned: true,
        status: "PUBLISHED",
        publishedAt: "2026-05-04T08:00:00.000Z",
        archivedAt: null
      }
    ]);
    expect(announcementFindMany).toHaveBeenCalledWith({
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
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }, { title: "asc" }]
    });
  });

  it("creates announcement records with lifecycle timestamps", async () => {
    const { announcementCreate, prisma } = prismaMock([announcementRecord]);
    const repository = new PrismaAdminAnnouncementRepository(prisma);

    await expect(
      repository.createAnnouncement({
        title: "New Announcement",
        body: "Announcement body.",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).resolves.toEqual({
      id: announcementRecord.id,
      title: announcementRecord.title,
      body: announcementRecord.body,
      visibility: "FAMILY_OPEN",
      targetOrganizationUnitId: null,
      pinned: false,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    });
    expect(announcementCreate).toHaveBeenLastCalledWith({
      data: {
        title: "New Announcement",
        body: "Announcement body.",
        visibility: "PUBLIC",
        targetOrganizationUnitId: null,
        pinned: false,
        status: "DRAFT",
        publishedAt: null,
        archivedAt: null
      }
    });

    await repository.createAnnouncement({
      title: "Published",
      body: "Published body.",
      visibility: "PUBLIC",
      status: "PUBLISHED"
    });
    expect(announcementCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "PUBLISHED",
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }) as unknown
    });

    await repository.createAnnouncement({
      title: "Archived",
      body: "Archived body.",
      visibility: "PUBLIC",
      status: "ARCHIVED"
    });
    expect(announcementCreate).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        status: "ARCHIVED",
        publishedAt: null,
        archivedAt: expect.any(Date) as Date
      }) as unknown
    });
  });

  it("updates only provided fields and returns null when scope prevents the update", async () => {
    const { announcementFindFirst, announcementUpdateMany, prisma } = prismaMock([
      scopedAnnouncementRecord
    ]);

    await expect(
      new PrismaAdminAnnouncementRepository(prisma).updateAnnouncement(
        announcementRecord.id,
        {
          title: scopedAnnouncementRecord.title,
          body: "Updated body.",
          visibility: "ORGANIZATION_UNIT",
          targetOrganizationUnitId: scopedAnnouncementRecord.targetOrganizationUnitId,
          pinned: true,
          status: "PUBLISHED",
          archivedAt: null
        },
        ["11111111-1111-4111-8111-111111111111"]
      )
    ).resolves.toEqual({
      id: scopedAnnouncementRecord.id,
      title: scopedAnnouncementRecord.title,
      body: scopedAnnouncementRecord.body,
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: scopedAnnouncementRecord.targetOrganizationUnitId,
      pinned: true,
      status: "PUBLISHED",
      publishedAt: "2026-05-04T08:00:00.000Z",
      archivedAt: null
    });
    expect(announcementUpdateMany).toHaveBeenLastCalledWith({
      where: {
        id: announcementRecord.id,
        targetOrganizationUnitId: { in: ["11111111-1111-4111-8111-111111111111"] }
      },
      data: {
        title: scopedAnnouncementRecord.title,
        body: "Updated body.",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: scopedAnnouncementRecord.targetOrganizationUnitId,
        pinned: true,
        status: "PUBLISHED",
        publishedAt: expect.any(Date) as Date,
        archivedAt: null
      }
    });
    expect(announcementFindFirst).toHaveBeenLastCalledWith({
      where: {
        id: announcementRecord.id,
        targetOrganizationUnitId: { in: ["11111111-1111-4111-8111-111111111111"] }
      }
    });

    const scopedOut = prismaMock([announcementRecord], { updateCount: 0 });
    await expect(
      new PrismaAdminAnnouncementRepository(scopedOut.prisma).updateAnnouncement(
        announcementRecord.id,
        { status: "ARCHIVED" },
        ["22222222-2222-4222-8222-222222222222"]
      )
    ).resolves.toBeNull();
    expect(scopedOut.announcementFindFirst).not.toHaveBeenCalled();
  });

  it("fails fast when Prisma returns an unknown announcement enum", async () => {
    const { prisma } = prismaMock([{ ...announcementRecord, visibility: "PRIVATE" }]);

    await expect(
      new PrismaAdminAnnouncementRepository(prisma).listManageableAnnouncements(null)
    ).rejects.toThrow("Repository returned an unknown announcement visibility.");

    const mock = prismaMock([{ ...announcementRecord, status: "deleted" }]);
    await expect(
      new PrismaAdminAnnouncementRepository(mock.prisma).listManageableAnnouncements(null)
    ).rejects.toThrow("Repository returned an unknown announcement status.");
  });
});

function prismaMock(
  records: AnnouncementRecord[],
  options: { updateCount?: number } = {}
): {
  announcementFindMany: ReturnType<typeof vi.fn>;
  announcementCreate: ReturnType<typeof vi.fn>;
  announcementUpdateMany: ReturnType<typeof vi.fn>;
  announcementFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const announcementFindMany = vi.fn(() => Promise.resolve(records));
  const announcementCreate = vi.fn(() => Promise.resolve(records[0] ?? announcementRecord));
  const announcementUpdateMany = vi.fn(() =>
    Promise.resolve({ count: options.updateCount ?? 1 })
  );
  const announcementFindFirst = vi.fn(() => Promise.resolve(records[0] ?? announcementRecord));

  return {
    announcementFindMany,
    announcementCreate,
    announcementUpdateMany,
    announcementFindFirst,
    prisma: {
      announcement: {
        findMany: announcementFindMany,
        create: announcementCreate,
        updateMany: announcementUpdateMany,
        findFirst: announcementFindFirst
      }
    } as unknown as PrismaService
  };
}
