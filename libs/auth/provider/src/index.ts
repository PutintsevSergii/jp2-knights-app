import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

export interface ExternalAuthProvider {
  readonly providerId: string;
  verifyAccessToken(token: string, options?: VerifyTokenOptions): Promise<ExternalIdentity>;
  createSessionCookie?(idToken: string, options: SessionCookieOptions): Promise<string>;
  verifySessionCookie?(cookie: string, options?: VerifyTokenOptions): Promise<ExternalIdentity>;
  revokeUserSessions?(providerSubject: string): Promise<void>;
}

export interface ExternalIdentity {
  provider: string;
  subject: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  displayName?: string;
  photoUrl?: string;
  authTime?: Date;
  issuedAt?: Date;
  expiresAt?: Date;
  claims: Readonly<Record<string, unknown>>;
}

export interface VerifyTokenOptions {
  checkRevoked?: boolean;
  requiredAudience?: string;
}

export interface SessionCookieOptions {
  expiresInMs: number;
  secure: boolean;
  httpOnly: true;
  sameSite: "lax" | "strict" | "none";
  domain?: string;
  path?: string;
}

export type ExternalAuthErrorCode =
  | "invalid-token"
  | "expired-token"
  | "wrong-audience"
  | "revoked-token"
  | "disabled-user"
  | "malformed-token"
  | "provider-unconfigured";

export class ExternalAuthError extends Error {
  constructor(
    readonly code: ExternalAuthErrorCode,
    message: string
  ) {
    super(message);
  }
}

export interface FirebaseVerifiedToken {
  uid: string;
  aud?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  name?: string;
  picture?: string;
  auth_time?: number;
  iat?: number;
  exp?: number;
  disabled?: boolean;
  revoked?: boolean;
  [claim: string]: unknown;
}

export type FirebaseTokenVerifier = (
  token: string,
  options?: VerifyTokenOptions
) => Promise<FirebaseVerifiedToken>;

export class FirebaseAuthProvider implements ExternalAuthProvider {
  readonly providerId = "firebase";

  constructor(private readonly verifyToken: FirebaseTokenVerifier) {}

  async verifyAccessToken(
    token: string,
    options: VerifyTokenOptions = {}
  ): Promise<ExternalIdentity> {
    const claims = await mapProviderError(() => this.verifyToken(token, options));
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (!claims.uid) {
      throw new ExternalAuthError("malformed-token", "Firebase token did not include uid.");
    }

    if (options.requiredAudience && claims.aud && claims.aud !== options.requiredAudience) {
      throw new ExternalAuthError("wrong-audience", "Firebase token audience did not match.");
    }

    if (typeof claims.exp === "number" && claims.exp < nowSeconds) {
      throw new ExternalAuthError("expired-token", "Firebase token is expired.");
    }

    if (claims.disabled) {
      throw new ExternalAuthError("disabled-user", "Firebase user is disabled.");
    }

    if (options.checkRevoked && claims.revoked) {
      throw new ExternalAuthError("revoked-token", "Firebase token has been revoked.");
    }

    const identity: ExternalIdentity = {
      provider: this.providerId,
      subject: claims.uid,
      claims
    };

    if (claims.email !== undefined) identity.email = claims.email;
    if (claims.email_verified !== undefined) identity.emailVerified = claims.email_verified;
    if (claims.phone_number !== undefined) identity.phoneNumber = claims.phone_number;
    if (claims.name !== undefined) identity.displayName = claims.name;
    if (claims.picture !== undefined) identity.photoUrl = claims.picture;
    setDate(identity, "authTime", claims.auth_time);
    setDate(identity, "issuedAt", claims.iat);
    setDate(identity, "expiresAt", claims.exp);

    return identity;
  }
}

export interface FirebaseAdminAuthProviderOptions {
  projectId?: string;
  serviceAccountJson?: string;
  appName?: string;
}

export class FirebaseAdminAuthProvider extends FirebaseAuthProvider {
  constructor(private readonly auth: Auth) {
    super((token, options) => auth.verifyIdToken(token, options?.checkRevoked));
  }

  createSessionCookie(idToken: string, options: SessionCookieOptions): Promise<string> {
    return this.auth.createSessionCookie(idToken, {
      expiresIn: options.expiresInMs
    });
  }

  async verifySessionCookie(
    cookie: string,
    options: VerifyTokenOptions = {}
  ): Promise<ExternalIdentity> {
    const claims = await this.auth.verifySessionCookie(cookie, options.checkRevoked);
    return this.verifyAccessTokenFromClaims(claims, options);
  }

  revokeUserSessions(providerSubject: string): Promise<void> {
    return this.auth.revokeRefreshTokens(providerSubject);
  }

  private verifyAccessTokenFromClaims(
    claims: FirebaseVerifiedToken,
    options: VerifyTokenOptions
  ): Promise<ExternalIdentity> {
    return new FirebaseAuthProvider(() => Promise.resolve(claims)).verifyAccessToken(
      "session-cookie",
      options
    );
  }
}

/* v8 ignore start -- Firebase Admin SDK app bootstrap depends on deployment credentials. */
export function createFirebaseAdminAuthProvider(
  options: FirebaseAdminAuthProviderOptions = {}
): FirebaseAdminAuthProvider {
  return new FirebaseAdminAuthProvider(getAuth(resolveFirebaseApp(options)));
}

function resolveFirebaseApp(options: FirebaseAdminAuthProviderOptions): App {
  const appName = options.appName ?? "[DEFAULT]";
  const existingApp = getApps().find((app) => app.name === appName);

  if (existingApp) {
    return existingApp;
  }

  const credential = options.serviceAccountJson
    ? cert(JSON.parse(options.serviceAccountJson) as Record<string, string>)
    : applicationDefault();
  const appOptions = options.projectId
    ? {
        credential,
        projectId: options.projectId
      }
    : {
        credential
      };

  return initializeApp(appOptions, appName === "[DEFAULT]" ? undefined : appName);
}
/* v8 ignore stop */

export class StaticTokenAuthProvider implements ExternalAuthProvider {
  constructor(
    readonly providerId: string,
    private readonly identitiesByToken: ReadonlyMap<string, ExternalIdentity>
  ) {}

  static fromRecords(
    providerId: string,
    records: Readonly<Record<string, Omit<ExternalIdentity, "provider" | "claims">>>
  ): StaticTokenAuthProvider {
    return new StaticTokenAuthProvider(
      providerId,
      new Map(
        Object.entries(records).map(([token, identity]) => [
          token,
          {
            ...identity,
            provider: providerId,
            claims: {
              subject: identity.subject,
              email: identity.email ?? null
            }
          }
        ])
      )
    );
  }

  verifyAccessToken(token: string): Promise<ExternalIdentity> {
    const identity = this.identitiesByToken.get(token);

    if (!identity) {
      return Promise.reject(
        new ExternalAuthError("invalid-token", "Static auth token is not recognized.")
      );
    }

    if (identity.expiresAt && identity.expiresAt.getTime() <= Date.now()) {
      return Promise.reject(
        new ExternalAuthError("expired-token", "Static auth token is expired.")
      );
    }

    return Promise.resolve(identity);
  }
}

function secondsToDate(value: unknown): Date | undefined {
  return typeof value === "number" ? new Date(value * 1000) : undefined;
}

function setDate(
  identity: ExternalIdentity,
  key: "authTime" | "issuedAt" | "expiresAt",
  value: unknown
) {
  const date = secondsToDate(value);

  if (date) {
    identity[key] = date;
  }
}

async function mapProviderError<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ExternalAuthError) {
      throw error;
    }

    throw new ExternalAuthError("invalid-token", "External auth provider rejected the token.");
  }
}
