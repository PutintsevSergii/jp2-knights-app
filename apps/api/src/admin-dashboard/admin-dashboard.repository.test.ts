import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import {
  adminDashboardOrganizationUnitWhere,
  PrismaAdminDashboardRepository
} from "./admin-dashboard.repository.js";

describe("PrismaAdminDashboardRepository", () => {
  it("counts dashboard records with the shared admin scope filters", async () => {
    const organizationUnitCount = vi.fn(() => Promise.resolve(1));
    const prayerCount = vi.fn(() => Promise.resolve(2));
    const eventCount = vi.fn(() => Promise.resolve(3));
    const prisma = {
      organizationUnit: { count: organizationUnitCount },
      prayer: { count: prayerCount },
      event: { count: eventCount }
    } as unknown as PrismaService;

    await expect(
      new PrismaAdminDashboardRepository(prisma).loadCounts([
        "11111111-1111-4111-8111-111111111111"
      ])
    ).resolves.toEqual({
      organizationUnits: 1,
      prayers: 2,
      events: 3
    });
    expect(organizationUnitCount).toHaveBeenCalledWith({
      where: {
        status: "active",
        archivedAt: null,
        id: {
          in: ["11111111-1111-4111-8111-111111111111"]
        }
      }
    });
    expect(prayerCount).toHaveBeenCalledWith({
      where: {
        OR: [
          { visibility: { in: ["PUBLIC", "FAMILY_OPEN"] } },
          {
            targetOrganizationUnitId: {
              in: ["11111111-1111-4111-8111-111111111111"]
            }
          }
        ]
      }
    });
    expect(eventCount).toHaveBeenCalledWith({
      where: {
        OR: [
          { visibility: { in: ["PUBLIC", "FAMILY_OPEN"] } },
          {
            targetOrganizationUnitId: {
              in: ["11111111-1111-4111-8111-111111111111"]
            }
          }
        ]
      }
    });
  });

  it("counts active organization units globally for super admins", () => {
    expect(adminDashboardOrganizationUnitWhere(null)).toEqual({
      status: "active",
      archivedAt: null
    });
  });
});
