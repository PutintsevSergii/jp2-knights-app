import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import {
  ExternalAuthError,
  type ExternalAuthProvider,
  type ExternalIdentity
} from "@jp2/auth-provider";
import { describe, expect, it } from "vitest";
import type { AuthIdentityRepository } from "./auth-identity.repository.js";
import { AuthSessionService } from "./auth-session.service.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

describe("AuthSessionService", () => {
  it("resolves the principal already attached to the request abstraction", async () => {
    const principal = {
      id: "user_1",
      email: "brother@example.test",
      displayName: "Demo Brother",
      status: "active" as const,
      roles: ["BROTHER" as const]
    };

    await expect(authSessionService().resolveCurrentUser({ principal })).resolves.toBe(principal);
  });

  it("returns null when no provider token or session cookie is available", async () => {
    await expect(authSessionService().resolveCurrentUser({})).resolves.toBeNull();
  });

  it("authenticates bearer tokens through the external provider and local identity repository", async () => {
    const principal = activePrincipal();
    const service = authSessionService({
      provider: providerFor({
        provider: "fake",
        subject: "subject-1",
        email: "brother@example.test",
        emailVerified: true,
        claims: {}
      }),
      repository: repositoryFor(principal)
    });

    await expect(
      service.resolveCurrentUser({ headers: { authorization: "Bearer provider-token" } })
    ).resolves.toEqual(principal);
  });

  it("maps provider token failures to unauthorized responses", async () => {
    const service = authSessionService({
      provider: {
        providerId: "fake",
        verifyAccessToken: () => {
          throw new ExternalAuthError("invalid-token", "bad token");
        }
      }
    });

    await expect(
      service.resolveCurrentUser({ headers: { authorization: "Bearer bad-token" } })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("creates provider session cookies only after CSRF validation", async () => {
    const service = authSessionService({
      provider: {
        ...providerFor(identity()),
        createSessionCookie: () => Promise.resolve("secure-cookie")
      }
    });

    await expect(
      service.createSession(
        {
          idToken: "provider-token",
          csrfToken: "csrf-token-value"
        },
        {
          headers: {
            "x-csrf-token": "csrf-token-value"
          }
        }
      )
    ).resolves.toMatchObject({
      sessionCookie: "secure-cookie"
    });
  });

  it("rejects session cookie creation when CSRF validation fails", async () => {
    const service = authSessionService({
      provider: {
        ...providerFor(identity()),
        createSessionCookie: () => Promise.resolve("secure-cookie")
      }
    });

    await expect(
      service.createSession(
        {
          idToken: "provider-token",
          csrfToken: "csrf-token-value"
        },
        {
          headers: {
            "x-csrf-token": "different-token"
          }
        }
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function authSessionService(options: {
  provider?: ExternalAuthProvider;
  repository?: AuthIdentityRepository;
} = {}) {
  return new AuthSessionService(
    options.provider ?? providerFor(null),
    options.repository ?? repositoryFor(activePrincipal())
  );
}

function providerFor(identity: ExternalIdentity | null): ExternalAuthProvider {
  return {
    providerId: identity?.provider ?? "fake",
    verifyAccessToken: () => {
      if (!identity) {
        throw new ExternalAuthError("invalid-token", "missing fake identity");
      }

      return Promise.resolve(identity);
    }
  };
}

function identity(): ExternalIdentity {
  return {
    provider: "fake",
    subject: "subject-1",
    email: "brother@example.test",
    emailVerified: true,
    claims: {}
  };
}

function repositoryFor(principal: CurrentUserPrincipal): AuthIdentityRepository {
  return {
    resolvePrincipal: () => Promise.resolve(principal)
  };
}

function activePrincipal(): CurrentUserPrincipal {
  return {
    id: "user_1",
    email: "brother@example.test",
    displayName: "Demo Brother",
    status: "active",
    roles: ["BROTHER"],
    memberOrganizationUnitIds: ["organizationUnit-a"]
  };
}
