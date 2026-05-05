import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuthSessionService } from "./auth-session.service.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import type { CurrentUserPrincipal, RequestWithPrincipal } from "./current-user.types.js";

const activePrincipal: CurrentUserPrincipal = {
  id: "user_1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: ["organizationUnit-a"]
};

describe("CurrentUserGuard", () => {
  it("attaches an active principal resolved by the session provider", async () => {
    const request: RequestWithPrincipal = {};
    const guard = new CurrentUserGuard(sessionProvider(activePrincipal));

    await expect(guard.canActivate(httpContext(request))).resolves.toBe(true);
    expect(request.principal).toEqual(activePrincipal);
  });

  it("rejects missing authentication", async () => {
    const guard = new CurrentUserGuard(sessionProvider(null));

    await expect(guard.canActivate(httpContext({}))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects inactive principals from protected routes", async () => {
    const guard = new CurrentUserGuard(
      sessionProvider({
        ...activePrincipal,
        status: "inactive"
      })
    );

    await expect(guard.canActivate(httpContext({}))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows invited idle principals so /auth/me can return pending approval state", async () => {
    const request: RequestWithPrincipal = {};
    const guard = new CurrentUserGuard(
      sessionProvider({
        ...activePrincipal,
        status: "invited",
        roles: [],
        approval: {
          state: "pending",
          expiresAt: "2026-06-04T08:00:00.000Z",
          scopeOrganizationUnitId: null
        }
      })
    );

    await expect(guard.canActivate(httpContext(request))).resolves.toBe(true);
    expect(request.principal?.approval?.state).toBe("pending");
  });
});

function sessionProvider(principal: CurrentUserPrincipal | null): AuthSessionService {
  return {
    resolveCurrentUser: () => Promise.resolve(principal)
  } as unknown as AuthSessionService;
}

function httpContext(request: RequestWithPrincipal): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request
    })
  } as ExecutionContext;
}
