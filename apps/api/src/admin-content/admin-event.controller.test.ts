import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminEventController } from "./admin-event.controller.js";
import type { AdminEventService } from "./admin-event.service.js";
import type {
  AdminEventSummary,
  CreateAdminEventRequest,
  UpdateAdminEventRequest
} from "./admin-event.types.js";

const event: AdminEventSummary = {
  id: "44444444-4444-4444-8444-444444444444",
  title: "Open Evening",
  description: "Public introduction evening.",
  type: "open-evening",
  startAt: "2026-05-10T18:00:00.000Z",
  endAt: null,
  locationLabel: "Riga",
  visibility: "FAMILY_OPEN",
  targetOrganizationUnitId: null,
  status: "draft",
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

describe("AdminEventController", () => {
  it("delegates admin event listing using the guard-attached principal", async () => {
    const controller = new AdminEventController({
      listAdminEvents: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ events: [event] });
      }
    } as unknown as AdminEventService);

    await expect(controller.listAdminEvents({ principal })).resolves.toEqual({
      events: [event]
    });
  });

  it("delegates admin event create and update commands", async () => {
    const controller = new AdminEventController({
      createAdminEvent: (
        receivedPrincipal: CurrentUserPrincipal,
        body: CreateAdminEventRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(body).toEqual({
          title: "New",
          type: "open-evening",
          startAt: "2026-05-10T18:00:00.000Z",
          visibility: "PUBLIC",
          status: "draft"
        });
        return Promise.resolve({ event });
      },
      updateAdminEvent: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: UpdateAdminEventRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(event.id);
        expect(body).toEqual({ status: "archived" });
        return Promise.resolve({ event: { ...event, status: "archived" } });
      }
    } as unknown as AdminEventService);

    await expect(
      controller.createAdminEvent(
        { principal },
        {
          title: "New",
          type: "open-evening",
          startAt: "2026-05-10T18:00:00.000Z",
          visibility: "PUBLIC",
          status: "draft"
        }
      )
    ).resolves.toEqual({ event });
    await expect(
      controller.updateAdminEvent({ principal }, event.id, {
        status: "archived"
      })
    ).resolves.toEqual({ event: { ...event, status: "archived" } });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new AdminEventController({} as AdminEventService);

    expect(() => controller.listAdminEvents({})).toThrow("CurrentUserGuard");
    expect(() =>
      controller.createAdminEvent(
        {},
        {
          title: "Blocked",
          type: "open-evening",
          startAt: "2026-05-10T18:00:00.000Z",
          visibility: "PUBLIC",
          status: "draft"
        }
      )
    ).toThrow("CurrentUserGuard");
    expect(() => controller.updateAdminEvent({}, event.id, { status: "archived" })).toThrow(
      "CurrentUserGuard"
    );
  });
});
