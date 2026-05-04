import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminPrayerController } from "./admin-prayer.controller.js";
import type { AdminPrayerService } from "./admin-prayer.service.js";
import type {
  AdminPrayerSummary,
  CreateAdminPrayerRequest,
  UpdateAdminPrayerRequest
} from "./admin-prayer.types.js";

const prayer: AdminPrayerSummary = {
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

const principal: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminPrayerController", () => {
  it("delegates admin prayer listing using the guard-attached principal", async () => {
    const controller = new AdminPrayerController({
      listAdminPrayers: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ prayers: [prayer] });
      }
    } as unknown as AdminPrayerService);

    await expect(controller.listAdminPrayers({ principal })).resolves.toEqual({
      prayers: [prayer]
    });
  });

  it("delegates admin prayer create and update commands", async () => {
    const controller = new AdminPrayerController({
      createAdminPrayer: (
        receivedPrincipal: CurrentUserPrincipal,
        body: CreateAdminPrayerRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(body).toEqual({
          title: "New",
          body: "Body",
          language: "en",
          visibility: "PUBLIC",
          status: "DRAFT"
        });
        return Promise.resolve({ prayer });
      },
      updateAdminPrayer: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: UpdateAdminPrayerRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(prayer.id);
        expect(body).toEqual({ status: "ARCHIVED" });
        return Promise.resolve({ prayer: { ...prayer, status: "ARCHIVED" } });
      }
    } as unknown as AdminPrayerService);

    await expect(
      controller.createAdminPrayer(
        { principal },
        {
          title: "New",
          body: "Body",
          language: "en",
          visibility: "PUBLIC",
          status: "DRAFT"
        }
      )
    ).resolves.toEqual({ prayer });
    await expect(
      controller.updateAdminPrayer({ principal }, prayer.id, {
        status: "ARCHIVED"
      })
    ).resolves.toEqual({ prayer: { ...prayer, status: "ARCHIVED" } });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new AdminPrayerController({} as AdminPrayerService);

    expect(() => controller.listAdminPrayers({})).toThrow("CurrentUserGuard");
    expect(() =>
      controller.createAdminPrayer(
        {},
        {
          title: "Blocked",
          body: "Blocked",
          language: "en",
          visibility: "PUBLIC",
          status: "DRAFT"
        }
      )
    ).toThrow("CurrentUserGuard");
    expect(() => controller.updateAdminPrayer({}, prayer.id, { status: "ARCHIVED" })).toThrow(
      "CurrentUserGuard"
    );
  });
});
