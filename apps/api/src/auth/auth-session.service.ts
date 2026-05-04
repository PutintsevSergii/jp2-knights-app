import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ExternalAuthError, type ExternalAuthProvider, type ExternalIdentity } from "@jp2/auth-provider";
import { AuthIdentityRepository } from "./auth-identity.repository.js";
import { EXTERNAL_AUTH_PROVIDER } from "./auth.tokens.js";
import type {
  AuthSessionRequest,
  CurrentUserPrincipal,
  RequestWithPrincipal
} from "./current-user.types.js";

export interface CreatedAuthSession {
  principal: CurrentUserPrincipal;
  sessionCookie: string | null;
  expiresAt: Date | null;
}

@Injectable()
export class AuthSessionService {
  constructor(
    @Inject(EXTERNAL_AUTH_PROVIDER)
    private readonly externalAuthProvider: ExternalAuthProvider,
    private readonly authIdentityRepository: AuthIdentityRepository
  ) {}

  async resolveCurrentUser(request: RequestWithPrincipal): Promise<CurrentUserPrincipal | null> {
    if (request.principal) {
      return request.principal;
    }

    const bearerToken = bearerTokenFrom(request);

    if (bearerToken) {
      return this.resolveAccessToken(bearerToken);
    }

    const sessionCookie = request.cookies?.jp2_session;

    if (sessionCookie && this.externalAuthProvider.verifySessionCookie) {
      return this.resolveIdentity(() =>
        this.externalAuthProvider.verifySessionCookie!(sessionCookie, { checkRevoked: true })
      );
    }

    return null;
  }

  resolveSessionRequest(data: AuthSessionRequest): Promise<CurrentUserPrincipal> {
    return this.resolveAccessToken(data.idToken);
  }

  async createSession(
    data: AuthSessionRequest,
    request: RequestWithPrincipal
  ): Promise<CreatedAuthSession> {
    const principal = await this.resolveSessionRequest(data);

    if (!this.externalAuthProvider.createSessionCookie || !data.csrfToken) {
      return {
        principal,
        sessionCookie: null,
        expiresAt: null
      };
    }

    if (csrfTokenFrom(request) !== data.csrfToken) {
      throw new BadRequestException("CSRF token validation failed.");
    }

    const expiresInMs = 5 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresInMs);
    const sessionCookie = await this.externalAuthProvider.createSessionCookie(data.idToken, {
      expiresInMs,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });

    return {
      principal,
      sessionCookie,
      expiresAt
    };
  }

  private async resolveAccessToken(token: string): Promise<CurrentUserPrincipal> {
    return this.resolveIdentity(() =>
      this.externalAuthProvider.verifyAccessToken(token, { checkRevoked: true })
    );
  }

  private async resolveIdentity(
    loadIdentity: () => Promise<ExternalIdentity>
  ): Promise<CurrentUserPrincipal> {
    try {
      const identity = await loadIdentity();

      if (!identity) {
        throw new UnauthorizedException("Authentication is required.");
      }

      return this.authIdentityRepository.resolvePrincipal(identity);
    } catch (error) {
      if (error instanceof ExternalAuthError) {
        throw new UnauthorizedException("Provider authentication failed.");
      }

      throw error;
    }
  }
}

function bearerTokenFrom(request: RequestWithPrincipal): string | null {
  const authorization = request.headers?.authorization ?? request.headers?.Authorization;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;

  if (!value) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/iu.exec(value);
  return match?.[1] ?? null;
}

function csrfTokenFrom(request: RequestWithPrincipal): string | null {
  const token = request.headers?.["x-csrf-token"];
  const value = Array.isArray(token) ? token[0] : token;

  return value ?? null;
}
