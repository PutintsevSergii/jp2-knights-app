import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminAnnouncementController } from "./admin-announcement.controller.js";
import type { AdminAnnouncementService } from "./admin-announcement.service.js";
import type {
  AdminAnnouncementSummary,
  CreateAdminAnnouncementRequest,
  UpdateAdminAnnouncementRequest
} from "./admin-announcement.types.js";

const announcement: AdminAnnouncementSummary = {
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

const principal: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminAnnouncementController", () => {
  it("delegates admin announcement listing using the guard-attached principal", async () => {
    const controller = new AdminAnnouncementController({
      listAdminAnnouncements: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ announcements: [announcement] });
      }
    } as unknown as AdminAnnouncementService);

    await expect(controller.listAdminAnnouncements({ principal })).resolves.toEqual({
      announcements: [announcement]
    });
  });

  it("delegates admin announcement create and update commands", async () => {
    const controller = new AdminAnnouncementController({
      createAdminAnnouncement: (
        receivedPrincipal: CurrentUserPrincipal,
        body: CreateAdminAnnouncementRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(body).toEqual({
          title: "New",
          body: "Body",
          visibility: "PUBLIC",
          status: "DRAFT"
        });
        return Promise.resolve({ announcement });
      },
      updateAdminAnnouncement: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: UpdateAdminAnnouncementRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(announcement.id);
        expect(body).toEqual({ status: "ARCHIVED" });
        return Promise.resolve({ announcement: { ...announcement, status: "ARCHIVED" } });
      }
    } as unknown as AdminAnnouncementService);

    await expect(
      controller.createAdminAnnouncement(
        { principal },
        {
          title: "New",
          body: "Body",
          visibility: "PUBLIC",
          status: "DRAFT"
        }
      )
    ).resolves.toEqual({ announcement });
    await expect(
      controller.updateAdminAnnouncement({ principal }, announcement.id, {
        status: "ARCHIVED"
      })
    ).resolves.toEqual({ announcement: { ...announcement, status: "ARCHIVED" } });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new AdminAnnouncementController({} as AdminAnnouncementService);

    expect(() => controller.listAdminAnnouncements({})).toThrow("CurrentUserGuard");
    expect(() =>
      controller.createAdminAnnouncement(
        {},
        {
          title: "Blocked",
          body: "Body",
          visibility: "PUBLIC",
          status: "DRAFT"
        }
      )
    ).toThrow("CurrentUserGuard");
    expect(() =>
      controller.updateAdminAnnouncement({}, announcement.id, { status: "ARCHIVED" })
    ).toThrow("CurrentUserGuard");
  });
});
