import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaOrganizationRepository } from "./organization.repository.js";

const organizationUnitRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "CHORAGIEW" as const,
  parentUnitId: null,
  name: "Pilot Organization Unit",
  city: "Riga",
  country: "LV",
  parish: null,
  publicDescription: "Pilot",
  status: "active" as const
};

describe("PrismaOrganizationRepository", () => {
  it("loads active membership organization units with active membership and unit filters", async () => {
    const { membershipFindMany, prisma } = prismaMock({
      membershipResults: [{
        organizationUnit: organizationUnitRecord
      }],
      organizationUnitResults: []
    });

    await expect(
      new PrismaOrganizationRepository(prisma).findActiveMembershipOrganizationUnits("brother_1")
    ).resolves.toEqual([organizationUnitRecord]);
    expect(membershipFindMany).toHaveBeenCalledWith({
      where: {
        userId: "brother_1",
        status: "active",
        archivedAt: null,
        organizationUnit: {
          status: "active",
          archivedAt: null
        }
      },
      include: {
        organizationUnit: true
      },
      orderBy: [{ organizationUnit: { country: "asc" } }, { organizationUnit: { city: "asc" } }]
    });
  });

  it("returns an empty list when no active membership organization unit exists", async () => {
    const { prisma } = prismaMock({ membershipResults: [], organizationUnitResults: [] });

    await expect(
      new PrismaOrganizationRepository(prisma).findActiveMembershipOrganizationUnits("brother_1")
    ).resolves.toEqual([]);
  });

  it("lists active organizationUnit records in stable display order", async () => {
    const { organizationUnitFindMany, prisma } = prismaMock({
      membershipResults: [],
      organizationUnitResults: [organizationUnitRecord]
    });

    await expect(new PrismaOrganizationRepository(prisma).listActiveOrganizationUnits()).resolves.toEqual([
      organizationUnitRecord
    ]);
    expect(organizationUnitFindMany).toHaveBeenCalledWith({
      where: {
        status: "active",
        archivedAt: null
      },
      orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }]
    });
  });

  it("lists active officer-scoped organizationUnit records by id", async () => {
    const { organizationUnitFindMany, prisma } = prismaMock({
      membershipResults: [],
      organizationUnitResults: [organizationUnitRecord]
    });

    await expect(
      new PrismaOrganizationRepository(prisma).listActiveOrganizationUnitsByIds([organizationUnitRecord.id])
    ).resolves.toEqual([organizationUnitRecord]);
    expect(organizationUnitFindMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [organizationUnitRecord.id]
        },
        status: "active",
        archivedAt: null
      },
      orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }]
    });
  });

  it("returns an empty list without querying for officers with no assigned organizationUnit", async () => {
    const { organizationUnitFindMany, prisma } = prismaMock({
      membershipResults: [],
      organizationUnitResults: [organizationUnitRecord]
    });

    await expect(
      new PrismaOrganizationRepository(prisma).listActiveOrganizationUnitsByIds([])
    ).resolves.toEqual([]);
    expect(organizationUnitFindMany).not.toHaveBeenCalled();
  });

  it("creates organizationUnit records with nullable optional public fields", async () => {
    const { organizationUnitCreate, prisma } = prismaMock({
      membershipResults: [],
      organizationUnitResults: [organizationUnitRecord]
    });

    await expect(
      new PrismaOrganizationRepository(prisma).createOrganizationUnit({
        type: "CHORAGIEW",
        name: "New Organization Unit",
        city: "Vilnius",
        country: "LT"
      })
    ).resolves.toEqual(organizationUnitRecord);
    expect(organizationUnitCreate).toHaveBeenCalledWith({
      data: {
        type: "CHORAGIEW",
        parentUnitId: null,
        name: "New Organization Unit",
        city: "Vilnius",
        country: "LT",
        parish: null,
        publicDescription: null
      }
    });
  });

  it("archives organizationUnit records through update metadata instead of hard delete", async () => {
    const { organizationUnitUpdate, prisma } = prismaMock({
      membershipResults: [],
      organizationUnitResults: [organizationUnitRecord]
    });

    await expect(
      new PrismaOrganizationRepository(prisma).updateOrganizationUnit(organizationUnitRecord.id, {
        status: "archived"
      })
    ).resolves.toEqual(organizationUnitRecord);
    expect(organizationUnitUpdate).toHaveBeenCalledWith({
      where: { id: organizationUnitRecord.id },
      data: {
        status: "archived",
        archivedAt: expect.any(Date) as Date
      }
    });
  });

  it("updates provided organizationUnit fields only and clears archive metadata for active status", async () => {
    const { organizationUnitUpdate, prisma } = prismaMock({
      membershipResults: [],
      organizationUnitResults: [organizationUnitRecord]
    });

    await expect(
      new PrismaOrganizationRepository(prisma).updateOrganizationUnit(organizationUnitRecord.id, {
        type: "COMMANDERY",
        parentUnitId: "22222222-2222-4222-8222-222222222222",
        name: "Updated Organization Unit",
        city: "Vilnius",
        country: "LT",
        parish: null,
        publicDescription: "Updated public description",
        status: "active"
      })
    ).resolves.toEqual(organizationUnitRecord);
    expect(organizationUnitUpdate).toHaveBeenCalledWith({
      where: { id: organizationUnitRecord.id },
      data: {
        type: "COMMANDERY",
        parentUnitId: "22222222-2222-4222-8222-222222222222",
        name: "Updated Organization Unit",
        city: "Vilnius",
        country: "LT",
        parish: null,
        publicDescription: "Updated public description",
        status: "active",
        archivedAt: null
      }
    });
  });
});

function prismaMock(options: {
  membershipResults: Array<{ organizationUnit: typeof organizationUnitRecord }>;
  organizationUnitResults: Array<typeof organizationUnitRecord>;
}): {
  organizationUnitFindMany: ReturnType<typeof vi.fn>;
  organizationUnitCreate: ReturnType<typeof vi.fn>;
  organizationUnitUpdate: ReturnType<typeof vi.fn>;
  membershipFindMany: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const membershipFindMany = vi.fn(() => Promise.resolve(options.membershipResults));
  const organizationUnitFindMany = vi.fn(() => Promise.resolve(options.organizationUnitResults));
  const organizationUnitCreate = vi.fn(() => Promise.resolve(organizationUnitRecord));
  const organizationUnitUpdate = vi.fn(() => Promise.resolve(organizationUnitRecord));

  return {
    organizationUnitCreate,
    organizationUnitFindMany,
    organizationUnitUpdate,
    membershipFindMany,
    prisma: {
      membership: {
        findMany: membershipFindMany
      },
      organizationUnit: {
        create: organizationUnitCreate,
        findMany: organizationUnitFindMany,
        update: organizationUnitUpdate
      }
    } as unknown as PrismaService
  };
}
