import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  brotherEventWhere,
  brotherPrayerWhere,
  brotherUpcomingEventWhere,
  PrismaBrotherCompanionRepository
} from "./brother-companion.repository.js";

const organizationUnitRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "CHORAGIEW" as const,
  parentUnitId: null,
  name: "Pilot Choragiew",
  city: "Riga",
  country: "Latvia",
  parish: null,
  publicDescription: "Pilot community",
  status: "active" as const
};

const profileRecord = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "brother@example.test",
  phone: null,
  displayName: "Demo Brother",
  status: "active",
  preferredLanguage: "en",
  roles: [{ role: "BROTHER" as const }],
  memberships: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      currentDegree: "First Degree",
      joinedAt: new Date("2026-01-15T00:00:00.000Z"),
      organizationUnit: organizationUnitRecord
    }
  ]
};

const prayerCategoryRecord = {
  id: "55555555-5555-4555-8555-555555555555",
  slug: "daily",
  title: "Daily Prayer",
  language: "en"
};

const prayerRecord = {
  id: "66666666-6666-4666-8666-666666666666",
  title: "Brother Prayer",
  body: "A brother-visible prayer.",
  language: "en",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: organizationUnitRecord.id,
  category: prayerCategoryRecord
};

describe("brotherUpcomingEventWhere", () => {
  it("limits events to published public, brother, and own organization-unit visibility", () => {
    const now = new Date("2026-05-05T00:00:00.000Z");

    expect(brotherUpcomingEventWhere([organizationUnitRecord.id], now)).toEqual({
      status: "published",
      archivedAt: null,
      startAt: { gte: now },
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: {
                in: [organizationUnitRecord.id]
              }
            }
          ]
        }
      ]
    });
    expect(brotherUpcomingEventWhere([], now)).toEqual({
      status: "published",
      archivedAt: null,
      startAt: { gte: now },
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [{ visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } }]
        }
      ]
    });
  });
});

describe("brotherEventWhere", () => {
  it("applies filters and excludes cancelled, archived, unpublished, and hidden events", () => {
    const now = new Date("2026-05-05T00:00:00.000Z");

    expect(
      brotherEventWhere(
        {
          from: "2026-06-01T00:00:00.000Z",
          type: "formation",
          limit: 20,
          offset: 0
        },
        [organizationUnitRecord.id],
        now
      )
    ).toEqual({
      status: "published",
      archivedAt: null,
      startAt: { gte: new Date("2026-06-01T00:00:00.000Z") },
      type: "formation",
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: {
                in: [organizationUnitRecord.id]
              }
            }
          ]
        }
      ]
    });
  });
});

describe("brotherPrayerWhere", () => {
  it("limits prayers to published public, brother, and own organization-unit visibility", () => {
    const now = new Date("2026-05-05T00:00:00.000Z");

    expect(
      brotherPrayerWhere(
        {
          categoryId: prayerCategoryRecord.id,
          q: "brother",
          language: "en",
          limit: 20,
          offset: 0
        },
        [organizationUnitRecord.id],
        now
      )
    ).toEqual({
      language: "en",
      status: "PUBLISHED",
      archivedAt: null,
      categoryId: prayerCategoryRecord.id,
      AND: [
        {
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
        },
        {
          OR: [
            { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
            {
              visibility: "ORGANIZATION_UNIT",
              targetOrganizationUnitId: {
                in: [organizationUnitRecord.id]
              }
            }
          ]
        },
        {
          OR: [
            { title: { contains: "brother", mode: "insensitive" } },
            { body: { contains: "brother", mode: "insensitive" } }
          ]
        }
      ]
    });
  });
});

describe("PrismaBrotherCompanionRepository", () => {
  it("maps active brother profile with memberships and active roles", async () => {
    const { prisma, userFindFirst } = prismaMock();
    userFindFirst.mockResolvedValueOnce(profileRecord);

    await expect(
      new PrismaBrotherCompanionRepository(prisma).findActiveBrotherProfile(profileRecord.id)
    ).resolves.toEqual({
      id: profileRecord.id,
      displayName: "Demo Brother",
      email: "brother@example.test",
      phone: null,
      preferredLanguage: "en",
      status: "active",
      roles: ["BROTHER"],
      memberships: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          currentDegree: "First Degree",
          joinedAt: "2026-01-15",
          organizationUnit: organizationUnitRecord
        }
      ]
    });
    expect(userFindFirst).toHaveBeenCalledWith({
      where: {
        id: profileRecord.id,
        status: "active",
        archivedAt: null,
        roles: {
          some: {
            role: "BROTHER",
            revokedAt: null
          }
        }
      },
      include: expect.any(Object) as unknown
    });
  });

  it("returns null when the brother has no active membership profile", async () => {
    const { prisma, userFindFirst } = prismaMock();
    userFindFirst.mockResolvedValueOnce({
      ...profileRecord,
      memberships: []
    });

    await expect(
      new PrismaBrotherCompanionRepository(prisma).findActiveBrotherProfile(profileRecord.id)
    ).resolves.toBeNull();
  });

  it("maps upcoming brother-visible events and rejects hidden visibility leaks", async () => {
    const { eventFindMany, prisma } = prismaMock();
    eventFindMany.mockResolvedValueOnce([
      {
        id: "44444444-4444-4444-8444-444444444444",
        title: "Brother Gathering",
        type: "formation",
        startAt: new Date("2026-06-01T10:00:00.000Z"),
        endAt: null,
        locationLabel: "Riga",
        visibility: "ORGANIZATION_UNIT"
      }
    ]);

    await expect(
      new PrismaBrotherCompanionRepository(prisma).findUpcomingEvents([organizationUnitRecord.id])
    ).resolves.toEqual([
      {
        id: "44444444-4444-4444-8444-444444444444",
        title: "Brother Gathering",
        type: "formation",
        startAt: "2026-06-01T10:00:00.000Z",
        endAt: null,
        locationLabel: "Riga",
        visibility: "ORGANIZATION_UNIT"
      }
    ]);
    expect(eventFindMany).toHaveBeenCalledWith({
      where: expect.any(Object) as unknown,
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
      take: 3
    });

    eventFindMany.mockResolvedValueOnce([
      {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Candidate Gathering",
        type: "formation",
        startAt: new Date("2026-06-02T10:00:00.000Z"),
        endAt: null,
        locationLabel: null,
        visibility: "CANDIDATE"
      }
    ]);
    await expect(
      new PrismaBrotherCompanionRepository(prisma).findUpcomingEvents([])
    ).rejects.toThrow("Repository returned an event visibility hidden from brothers.");
  });

  it("maps paginated brother-visible events", async () => {
    const { eventFindMany, prisma } = prismaMock();
    eventFindMany.mockResolvedValueOnce([
      {
        id: "44444444-4444-4444-8444-444444444444",
        title: "Brother Gathering",
        type: "formation",
        startAt: new Date("2026-06-01T10:00:00.000Z"),
        endAt: null,
        locationLabel: "Riga",
        visibility: "BROTHER"
      }
    ]);

    await expect(
      new PrismaBrotherCompanionRepository(prisma).findVisibleBrotherEvents(
        {
          from: "2026-06-01T00:00:00.000Z",
          type: "formation",
          limit: 10,
          offset: 5
        },
        [organizationUnitRecord.id]
      )
    ).resolves.toEqual([
      {
        id: "44444444-4444-4444-8444-444444444444",
        title: "Brother Gathering",
        type: "formation",
        startAt: "2026-06-01T10:00:00.000Z",
        endAt: null,
        locationLabel: "Riga",
        visibility: "BROTHER"
      }
    ]);
    expect(eventFindMany).toHaveBeenCalledWith({
      where: expect.any(Object) as unknown,
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
      take: 10,
      skip: 5
    });
  });


  it("maps brother-visible prayer categories and prayers", async () => {
    const { prayerCategoryFindMany, prayerFindMany, prisma } = prismaMock();
    prayerCategoryFindMany.mockResolvedValueOnce([prayerCategoryRecord]);
    prayerFindMany.mockResolvedValueOnce([prayerRecord]);

    const repository = new PrismaBrotherCompanionRepository(prisma);

    await expect(repository.findPublishedBrotherPrayerCategories("en")).resolves.toEqual([
      prayerCategoryRecord
    ]);
    await expect(
      repository.findVisibleBrotherPrayers(
        {
          language: "en",
          limit: 20,
          offset: 0
        },
        [organizationUnitRecord.id]
      )
    ).resolves.toEqual([
      {
        id: prayerRecord.id,
        title: prayerRecord.title,
        excerpt: prayerRecord.body,
        language: prayerRecord.language,
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: organizationUnitRecord.id,
        category: prayerCategoryRecord
      }
    ]);
    expect(prayerFindMany).toHaveBeenCalledWith({
      where: expect.any(Object) as unknown,
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
});

function prismaMock(): {
  eventFindMany: ReturnType<typeof vi.fn>;
  prayerCategoryFindMany: ReturnType<typeof vi.fn>;
  prayerFindMany: ReturnType<typeof vi.fn>;
  userFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const eventFindMany = vi.fn(() => Promise.resolve([]));
  const prayerCategoryFindMany = vi.fn(() => Promise.resolve([]));
  const prayerFindMany = vi.fn(() => Promise.resolve([]));
  const userFindFirst = vi.fn(() => Promise.resolve(null));

  return {
    eventFindMany,
    prayerCategoryFindMany,
    prayerFindMany,
    userFindFirst,
    prisma: {
      event: {
        findMany: eventFindMany
      },
      prayerCategory: {
        findMany: prayerCategoryFindMany
      },
      prayer: {
        findMany: prayerFindMany
      },
      user: {
        findFirst: userFindFirst
      }
    } as unknown as PrismaService
  };
}
