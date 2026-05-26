import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminSilentPrayerController } from "./admin-silent-prayer.controller.js";
import type { AdminSilentPrayerService } from "./admin-silent-prayer.service.js";
import type {
  AdminSilentPrayerEventSummary,
  CreateAdminSilentPrayerEventRequest,
  UpdateAdminSilentPrayerEventRequest
} from "./admin-silent-prayer.types.js";

const silentPrayerEvent: AdminSilentPrayerEventSummary = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Morning Prayer",
  intention: "For peace.",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  status: "DRAFT",
  startsAt: "2026-05-10T18:00:00.000Z",
  endsAt: null,
  approvedAt: null,
  publishedAt: null,
  cancelledAt: null,
  archivedAt: null
};

const principal: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminSilentPrayerController", () => {
  it("delegates admin silent-prayer listing using the guard-attached principal", async () => {
    const controller = new AdminSilentPrayerController({
      listAdminSilentPrayerEvents: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ silentPrayerEvents: [silentPrayerEvent] });
      }
    } as unknown as AdminSilentPrayerService);

    await expect(controller.listAdminSilentPrayerEvents({ principal })).resolves.toEqual({
      silentPrayerEvents: [silentPrayerEvent]
    });
  });

  it("delegates admin silent-prayer create and update commands", async () => {
    const controller = new AdminSilentPrayerController({
      createAdminSilentPrayerEvent: (
        receivedPrincipal: CurrentUserPrincipal,
        body: CreateAdminSilentPrayerEventRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(body).toEqual({
          title: "New",
          visibility: "PUBLIC",
          status: "DRAFT",
          startsAt: "2026-05-10T18:00:00.000Z"
        });
        return Promise.resolve({ silentPrayerEvent });
      },
      updateAdminSilentPrayerEvent: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: UpdateAdminSilentPrayerEventRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(silentPrayerEvent.id);
        expect(body).toEqual({ status: "ARCHIVED" });
        return Promise.resolve({
          silentPrayerEvent: { ...silentPrayerEvent, status: "ARCHIVED" }
        });
      }
    } as unknown as AdminSilentPrayerService);

    await expect(
      controller.createAdminSilentPrayerEvent(
        { principal },
        {
          title: "New",
          visibility: "PUBLIC",
          status: "DRAFT",
          startsAt: "2026-05-10T18:00:00.000Z"
        }
      )
    ).resolves.toEqual({ silentPrayerEvent });
    await expect(
      controller.updateAdminSilentPrayerEvent({ principal }, silentPrayerEvent.id, {
        status: "ARCHIVED"
      })
    ).resolves.toEqual({
      silentPrayerEvent: { ...silentPrayerEvent, status: "ARCHIVED" }
    });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new AdminSilentPrayerController({} as AdminSilentPrayerService);

    expect(() => controller.listAdminSilentPrayerEvents({})).toThrow("CurrentUserGuard");
    expect(() =>
      controller.createAdminSilentPrayerEvent(
        {},
        {
          title: "Blocked",
          visibility: "PUBLIC",
          status: "DRAFT",
          startsAt: "2026-05-10T18:00:00.000Z"
        }
      )
    ).toThrow("CurrentUserGuard");
    expect(() =>
      controller.updateAdminSilentPrayerEvent({}, silentPrayerEvent.id, {
        status: "ARCHIVED"
      })
    ).toThrow("CurrentUserGuard");
  });
});
