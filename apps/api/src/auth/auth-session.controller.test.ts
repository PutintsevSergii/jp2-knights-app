import { describe, expect, it, vi } from "vitest";
import { AuthSessionController } from "./auth-session.controller.js";
import type { AuthSessionService } from "./auth-session.service.js";
import { CurrentUserService } from "./current-user.service.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

const principal: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  preferredLanguage: "en",
  status: "active",
  roles: ["SUPER_ADMIN"],
  officerOrganizationUnitIds: ["organizationUnit-a"]
};

describe("AuthSessionController", () => {
  it("creates a local current-user session response from a provider ID token", async () => {
    const controller = new AuthSessionController(authSessionService(principal), new CurrentUserService());
    const request = {};

    await expect(
      controller.createSession({ idToken: "provider-token" }, request)
    ).resolves.toMatchObject({
      currentUser: {
        user: {
          id: "admin_1",
          email: "admin@example.test"
        },
        access: {
          adminLite: true,
          officerOrganizationUnitIds: ["organizationUnit-a"]
        }
      },
      session: {
        transport: "bearer",
        expiresAt: null
      }
    });
  });

  it("clears the session cookie on logout", () => {
    const controller = new AuthSessionController(authSessionService(principal), new CurrentUserService());
    const response = {
      clearCookie: vi.fn()
    };

    expect(controller.logout(response)).toEqual({ success: true });
    expect(response.clearCookie).toHaveBeenCalledWith("jp2_session", {
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });
  });

  it("refreshes from the guard-attached principal", () => {
    const controller = new AuthSessionController(authSessionService(principal), new CurrentUserService());

    expect(controller.refresh({ principal })).toMatchObject({
      currentUser: {
        user: {
          id: "admin_1"
        }
      },
      session: {
        transport: "bearer"
      }
    });
  });
});

function authSessionService(resolvedPrincipal: CurrentUserPrincipal): AuthSessionService {
  return {
    resolveCurrentUser: () => Promise.resolve(resolvedPrincipal),
    resolveSessionRequest: () => Promise.resolve(resolvedPrincipal),
    createSession: () =>
      Promise.resolve({
        principal: resolvedPrincipal,
        sessionCookie: null,
        expiresAt: null
      })
  } as unknown as AuthSessionService;
}
