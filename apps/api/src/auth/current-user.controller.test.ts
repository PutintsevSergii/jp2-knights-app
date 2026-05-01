import { describe, expect, it } from "vitest";
import { CurrentUserController } from "./current-user.controller.js";
import { CurrentUserService } from "./current-user.service.js";
import type { RequestWithPrincipal } from "./current-user.types.js";

describe("CurrentUserController", () => {
  it("returns the guarded current user response", () => {
    const controller = new CurrentUserController(new CurrentUserService());
    const request: RequestWithPrincipal = {
      principal: {
        id: "admin_1",
        email: "admin@example.test",
        displayName: "Demo Admin",
        preferredLanguage: null,
        status: "active",
        roles: ["SUPER_ADMIN"]
      }
    };

    expect(controller.getCurrentUser(request)).toMatchObject({
      user: {
        id: "admin_1",
        email: "admin@example.test",
        roles: ["SUPER_ADMIN"]
      },
      access: {
        mobileMode: "public",
        adminLite: true
      }
    });
  });

  it("fails closed if invoked without the guard-attached principal", () => {
    const controller = new CurrentUserController(new CurrentUserService());

    expect(() => controller.getCurrentUser({})).toThrow("CurrentUserGuard");
  });
});
