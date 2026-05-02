import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaPublicContentRepository } from "./public-content.repository.js";

const aboutPageRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "about-order",
  title: "About the Order",
  body: "Approved public information.",
  language: "en"
};

const prayerCategoryRecord = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "daily",
  title: "Daily Prayer",
  language: "en"
};

const prayerRecord = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Morning Offering",
  body: "A public morning prayer.",
  language: "en",
  category: prayerCategoryRecord
};

const eventRecord = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  description: "Public introduction evening.",
  type: "open-evening",
  startAt: new Date("2026-05-10T18:00:00.000Z"),
  endAt: null,
  locationLabel: "Riga",
  visibility: "PUBLIC"
};

describe("PrismaPublicContentRepository", () => {
  it("queries only currently published PUBLIC content pages", async () => {
    const { contentPageFindFirst, prisma } = prismaMock([aboutPageRecord]);
    const now = new Date("2026-05-02T00:00:00.000Z");

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicContentPage(
        "about-order",
        "en",
        now
      )
    ).resolves.toEqual(aboutPageRecord);
    expect(contentPageFindFirst).toHaveBeenCalledWith({
      where: {
        slug: "about-order",
        language: "en",
        visibility: "PUBLIC",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      }
    });
  });

  it("falls back to English when the requested language is not published", async () => {
    const { contentPageFindFirst, prisma } = prismaMock([null, aboutPageRecord]);

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicContentPage(
        "about-order",
        "pl",
        new Date("2026-05-02T00:00:00.000Z")
      )
    ).resolves.toEqual(aboutPageRecord);
    expect(contentPageFindFirst).toHaveBeenCalledTimes(2);
    expect(contentPageFindFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          language: "pl"
        }) as unknown
      })
    );
    expect(contentPageFindFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          language: "en"
        }) as unknown
      })
    );
  });

  it("does not repeat the fallback lookup when English is requested", async () => {
    const { contentPageFindFirst, prisma } = prismaMock([null]);

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicContentPage(
        "missing",
        "en",
        new Date("2026-05-02T00:00:00.000Z")
      )
    ).resolves.toBeNull();
    expect(contentPageFindFirst).toHaveBeenCalledTimes(1);
  });

  it("queries only published PUBLIC prayer categories and prayers", async () => {
    const { prayerCategoryFindMany, prayerFindMany, prisma } = prismaMock([]);
    prayerCategoryFindMany.mockResolvedValueOnce([prayerCategoryRecord]);
    prayerFindMany.mockResolvedValueOnce([prayerRecord]);
    const now = new Date("2026-05-02T00:00:00.000Z");
    const repository = new PrismaPublicContentRepository(prisma);

    await expect(repository.findPublishedPublicPrayerCategories("en", now)).resolves.toEqual([
      prayerCategoryRecord
    ]);
    await expect(
      repository.findPublishedPublicPrayers(
        {
          categoryId: prayerCategoryRecord.id,
          q: "morning",
          language: "en",
          limit: 20,
          offset: 0
        },
        now
      )
    ).resolves.toEqual([
      {
        id: prayerRecord.id,
        title: prayerRecord.title,
        excerpt: prayerRecord.body,
        language: prayerRecord.language,
        category: prayerCategoryRecord
      }
    ]);

    expect(prayerCategoryFindMany).toHaveBeenCalledWith({
      where: {
        language: "en",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });
    expect(prayerFindMany).toHaveBeenCalledWith({
      where: {
        language: "en",
        visibility: "PUBLIC",
        status: "PUBLISHED",
        archivedAt: null,
        categoryId: prayerCategoryRecord.id,
        AND: [
          {
            OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
          },
          {
            OR: [
              { title: { contains: "morning", mode: "insensitive" } },
              { body: { contains: "morning", mode: "insensitive" } }
            ]
          }
        ]
      },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            language: true
          }
        }
      },
      orderBy: [{ title: "asc" }],
      take: 20,
      skip: 0
    });
  });

  it("returns 404-safe null for unpublished or private public prayer detail lookups", async () => {
    const { prayerFindFirst, prisma } = prismaMock([]);
    const now = new Date("2026-05-02T00:00:00.000Z");

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicPrayer(prayerRecord.id, now)
    ).resolves.toBeNull();
    expect(prayerFindFirst).toHaveBeenCalledWith({
      where: {
        id: prayerRecord.id,
        visibility: "PUBLIC",
        status: "PUBLISHED",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            language: true
          }
        }
      }
    });
  });

  it("queries only published PUBLIC or FAMILY_OPEN upcoming events", async () => {
    const { eventFindMany, prisma } = prismaMock([]);
    eventFindMany.mockResolvedValueOnce([eventRecord]);
    const now = new Date("2026-05-02T00:00:00.000Z");

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicEvents(
        { type: "open-evening", limit: 20, offset: 0 },
        now
      )
    ).resolves.toEqual([
      {
        id: eventRecord.id,
        title: eventRecord.title,
        type: eventRecord.type,
        startAt: "2026-05-10T18:00:00.000Z",
        endAt: null,
        locationLabel: eventRecord.locationLabel,
        visibility: eventRecord.visibility
      }
    ]);
    expect(eventFindMany).toHaveBeenCalledWith({
      where: {
        visibility: { in: ["PUBLIC", "FAMILY_OPEN"] },
        status: "published",
        archivedAt: null,
        startAt: { gte: now },
        type: "open-evening",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
      take: 20,
      skip: 0
    });
  });

  it("returns public event details only through the public visibility filter", async () => {
    const { eventFindFirst, prisma } = prismaMock([]);
    eventFindFirst.mockResolvedValueOnce(eventRecord);
    const now = new Date("2026-05-02T00:00:00.000Z");

    await expect(
      new PrismaPublicContentRepository(prisma).findPublishedPublicEvent(eventRecord.id, now)
    ).resolves.toEqual({
      id: eventRecord.id,
      title: eventRecord.title,
      type: eventRecord.type,
      startAt: "2026-05-10T18:00:00.000Z",
      endAt: null,
      locationLabel: eventRecord.locationLabel,
      visibility: eventRecord.visibility,
      description: eventRecord.description
    });
    expect(eventFindFirst).toHaveBeenCalledWith({
      where: {
        id: eventRecord.id,
        visibility: { in: ["PUBLIC", "FAMILY_OPEN"] },
        status: "published",
        archivedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      }
    });
  });
});

function prismaMock(results: Array<typeof aboutPageRecord | null>): {
  contentPageFindFirst: ReturnType<typeof vi.fn>;
  prayerCategoryFindMany: ReturnType<typeof vi.fn>;
  prayerFindMany: ReturnType<typeof vi.fn>;
  prayerFindFirst: ReturnType<typeof vi.fn>;
  eventFindMany: ReturnType<typeof vi.fn>;
  eventFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const contentPageFindFirst = vi.fn(() => Promise.resolve(results.shift() ?? null));
  const prayerCategoryFindMany = vi.fn(() => Promise.resolve([]));
  const prayerFindMany = vi.fn(() => Promise.resolve([]));
  const prayerFindFirst = vi.fn(() => Promise.resolve(null));
  const eventFindMany = vi.fn(() => Promise.resolve([]));
  const eventFindFirst = vi.fn(() => Promise.resolve(null));

  return {
    contentPageFindFirst,
    prayerCategoryFindMany,
    prayerFindMany,
    prayerFindFirst,
    eventFindMany,
    eventFindFirst,
    prisma: {
      contentPage: {
        findFirst: contentPageFindFirst
      },
      prayerCategory: {
        findMany: prayerCategoryFindMany
      },
      prayer: {
        findMany: prayerFindMany,
        findFirst: prayerFindFirst
      },
      event: {
        findMany: eventFindMany,
        findFirst: eventFindFirst
      }
    } as unknown as PrismaService
  };
}
