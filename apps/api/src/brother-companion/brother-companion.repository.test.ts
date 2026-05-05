import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
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
});

function prismaMock(): {
  eventFindMany: ReturnType<typeof vi.fn>;
  userFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const eventFindMany = vi.fn(() => Promise.resolve([]));
  const userFindFirst = vi.fn(() => Promise.resolve(null));

  return {
    eventFindMany,
    userFindFirst,
    prisma: {
      event: {
        findMany: eventFindMany
      },
      user: {
        findFirst: userFindFirst
      }
    } as unknown as PrismaService
  };
}
