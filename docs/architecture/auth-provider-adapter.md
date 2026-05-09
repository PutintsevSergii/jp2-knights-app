# Auth Provider Adapter

V1 authentication should use Firebase Authentication first, but the application must not become Firebase-shaped. Firebase is the first external identity provider behind a replaceable adapter. JP2 application identity, status, roles, memberships, officer scope, and visibility decisions remain owned by the JP2 database and shared auth helpers.

## Goals

- Use a proven managed identity provider for sign-in, credential recovery, MFA/provider options, and token issuance.
- Verify provider-issued tokens on the API before serving any private route.
- Create or update the local `users` row from verified provider identity data.
- Support Firebase Authentication sign-in providers while keeping app access behind local approval.
- Keep authorization provider-agnostic so Firebase can be replaced later by another OIDC/JWT provider or an internal auth service.
- Package provider verification behind a reusable module that can be used by other projects without JP2 domain concepts.

## Recommended Token Model

### Mobile and API Clients

Mobile clients should authenticate with Firebase client SDKs and send a Firebase ID token to the JP2 API as:

```http
Authorization: Bearer <firebase-id-token>
```

The API verifies the token with the Firebase Admin SDK, resolves the Firebase `uid`, syncs allowed identity profile fields into the local database, then loads the local user, roles, status, memberships, and officer assignments. Firebase token claims are not sufficient authorization by themselves.

Firebase ID tokens are short-lived JWTs. Client SDKs are responsible for refreshing them. The backend must reject expired, invalid, disabled-user, wrong-project, or revoked tokens according to the configured route risk.

### Admin Web

Admin Lite may use either of these patterns behind the same backend adapter:

1. Bearer Firebase ID tokens on API requests. This is simplest and matches mobile.
2. API-created Firebase session cookies for same-site admin deployments. The admin client signs in with Firebase, sends a recent ID token to an API session endpoint, and the API sets a secure `httpOnly`, `SameSite` cookie after CSRF validation.

For Admin Lite, prefer session cookies when the admin frontend and API deployment topology can support secure same-site cookies. Otherwise use bearer ID tokens with strict HTTPS, short cache lifetimes, and no token persistence outside the Firebase SDK.

## Adapter Boundary

Provider-specific SDKs must live only in the provider adapter module. Backend guards and domain services consume normalized identity data.

Required reusable package surface:

```ts
export interface ExternalAuthProvider {
  readonly providerId: string;
  verifyAccessToken(token: string, options?: VerifyTokenOptions): Promise<ExternalIdentity>;
  createSessionCookie?(idToken: string, options: SessionCookieOptions): Promise<string>;
  verifySessionCookie?(cookie: string, options?: VerifyTokenOptions): Promise<ExternalIdentity>;
  revokeUserSessions?(providerSubject: string): Promise<void>;
}

export interface ExternalIdentity {
  provider: "firebase" | string;
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
```

The package should be reusable outside this product, so it must not import Prisma models, JP2 roles, JP2 visibility values, Nest controllers, or product-specific DTOs. A Nest wrapper module is acceptable, but the core verifier should remain framework-light.

Suggested repo shape for Phase 5:

```text
libs/auth/provider/
  src/
    external-auth-provider.ts
    firebase-auth-provider.ts
    nest-auth-provider.module.ts
```

The existing `@jp2/shared-auth` package remains the product authorization helper package. It should not verify Firebase tokens.

## Current Implementation

Phase 5 implements the provider boundary as `@jp2/auth-provider` in
`libs/auth/provider`. The package exposes `ExternalAuthProvider`,
`FirebaseAdminAuthProvider`, `createFirebaseAdminAuthProvider`, and
`StaticTokenAuthProvider`.

API configuration selects the provider with `AUTH_PROVIDER_MODE`:

- `firebase`: uses the Firebase Admin SDK and reads `FIREBASE_PROJECT_ID` plus
  optional `FIREBASE_SERVICE_ACCOUNT_JSON`; otherwise it falls back to
  application-default credentials.
- `fake`: local/test-only static tokens for seeded demo identities. This mode is
  rejected when `NODE_ENV=production`.

Nest guards depend on the `ExternalAuthProvider` token and local
`AuthIdentityRepository`, not Firebase classes. Local roles, status,
memberships, and officer scope are loaded from PostgreSQL after provider
verification.

## Stable Contract

The stable contract between the auth provider module and the JP2 API is:

| Contract                                 | Stable meaning                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providerId`                             | Lowercase provider identifier stored in `identity_provider_accounts.provider`, initially `firebase`; custom providers use their own stable id       |
| `ExternalIdentity.subject`               | Provider-local immutable user id; for Firebase this is `uid`; for custom providers this should be the OIDC `sub` or equivalent immutable account id |
| `ExternalIdentity.email` / `phoneNumber` | Verified profile/contact data used only for local account linking and safe profile sync                                                             |
| `ExternalIdentity.claims`                | Raw provider claims for logging-safe diagnostics and migration support; never source-of-truth JP2 authorization                                     |
| `verifyAccessToken`                      | Verifies bearer tokens from mobile/admin/API clients and returns normalized identity                                                                |
| `verifySessionCookie`                    | Verifies secure web session cookies when the provider supports cookie sessions                                                                      |
| `createSessionCookie`                    | Optional web session exchange for Admin Lite; if unsupported, Admin uses bearer tokens                                                              |
| `revokeUserSessions`                     | Optional provider-side session revocation for security events; if unsupported, local deactivation still blocks access                               |

The stable contract between the JP2 API and local authorization remains `CurrentUserPrincipal` plus `@jp2/shared-auth`. That contract must not include Firebase classes or Firebase-specific claims.

## Custom Provider Replacement Guideline

Firebase can be replaced by any provider that can verify an access token and produce an `ExternalIdentity`. A custom provider may be OIDC, another managed identity platform, or an internal auth service. Replacement must follow this sequence:

1. Implement `ExternalAuthProvider` in a new adapter, for example `custom-auth-provider.ts`.
2. Set a new `providerId`, for example `custom`, and configure the API to use that adapter through environment/config, not code branching in guards.
3. Verify tokens using the provider's official SDK or standards-based JWT/OIDC verification. At minimum verify signature, expiry, issuer, audience, subject, and issued-at time.
4. Map the provider's immutable user id to `ExternalIdentity.subject`.
5. Migrate or create `identity_provider_accounts` rows from `(firebase, firebase_uid)` to `(custom, custom_subject)` only after a verified identity match, usually by verified email/phone plus an owner-approved migration procedure.
6. Keep local `users`, `user_roles`, `memberships`, `candidate_profiles`, and `officer_assignments` unchanged unless the migration explicitly changes application authorization data.
7. Run the fake-provider replacement tests, provider adapter tests, `/auth/me` integration tests, inactive-user tests, and role/scope visibility matrix before enabling the new provider.
8. Remove Firebase credentials/config only after all deployed clients have moved to the new provider.

Provider replacement must not change:

- `@jp2/shared-auth` role, mode, scope, or visibility helpers;
- domain services that receive `CurrentUserPrincipal`;
- API DTOs except auth/session endpoints when the transport changes;
- local app authorization tables;
- public/private visibility rules.

Provider replacement may change:

- client sign-in SDK and login UI provider wording;
- provider adapter implementation and secrets;
- provider-link migration scripts;
- session-cookie support if the new provider supports a different web session model;
- operational runbooks for token revocation and account recovery.

## Implementation Acceptance for Replaceability

Phase 5 is not complete unless these checks pass:

- API guards depend on `ExternalAuthProvider`, not `FirebaseAuth` or Firebase token types.
- A fake provider adapter can authenticate a test principal through `/auth/me`.
- Firebase adapter tests are isolated from JP2 role/scope tests.
- The provider-link table can store more than one provider id.
- Local deactivation blocks access even when provider token verification succeeds.
- Documentation names the configured provider and the rollback/replacement path for pilot deployments.

## Local User Sync

After token verification, the JP2 API maps the external identity to a local user:

1. Find an active provider link by `(provider, provider_subject)`.
2. If no link exists, link to a pre-provisioned local user only when the verified email or phone matches a pending invited/candidate/officer record under the product rules.
3. If no safe match exists, reject with 403 or route to the approved candidate/request flow. Public sign-in must not silently create an authorized brother, officer, or candidate.
4. Update safe profile fields such as email, phone, display name, and `last_login_at` according to product ownership rules.
5. Load local status, roles, memberships, candidate profile, and officer assignments from PostgreSQL.
6. Build `CurrentUserPrincipal` from local data and run shared role/scope/visibility helpers.

Application authorization comes from local tables, not Firebase custom claims. Firebase custom claims may be used only for coarse provider-side hints or future migration support. They must not become the source of truth for JP2 roles or officer scope.

## Firebase Sign-In Idle Gate

Firebase sign-in must use the configured Google/Gmail Firebase Authentication
provider for V1. Email/password and other Firebase provider buttons are not V1
surfaces unless the owner explicitly expands scope. A future adapter may emit the
same normalized `ExternalIdentity`. The provider choice does not change the
access rule: a verified Firebase ID token proves identity only.

Mobile obtains that Firebase ID token through the Expo/Firebase Google adapter:
the user completes Google sign-in through `expo-auth-session`, the mobile client
exchanges the Google ID token for a Firebase ID token with the Firebase client
SDK, and the JP2 API verifies only the Firebase ID token. If Firebase or Google
client IDs are not present in the Expo public environment, mobile keeps the
provider action explicit but unconfigured; it must not fall back to
email/password or grant local roles client-side.

If a Firebase-authenticated identity has no already-approved local access:

- create or link a local user in Idle mode;
- record an Idle expiry 30 days after first Firebase sign-in;
- return public/idle mode from `/auth/me`;
- do not assign `CANDIDATE`, `BROTHER`, `OFFICER`, or `SUPER_ADMIN`;
- do not create memberships, candidate profiles, or officer assignments;
- expose the idle user to the scoped country/region approval workflow.

Only an authorized country/region approver or Super Admin may confirm the user.
Country/region approver privilege is assigned by admin to a participant of the
Order, scoped to approved regions/countries, audited, and revocable. Confirmation
must explicitly assign the resulting role and scope. Rejection or 30-day expiry
must keep the user public-only.

## Data Model Addition

Phase 5 stores provider-specific identity outside `users`, and the Phase 5/6
Idle gate stores the local review workflow separately:

| Table                                  | Purpose                                           | Key columns                                                                                                                                                                   |
| -------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identity_provider_accounts`           | Links verified external identities to local users | `id`, `user_id`, `provider`, `provider_subject`, `email`, `email_verified`, `phone`, `display_name`, `photo_url`, `last_sign_in_at`, `created_at`, `updated_at`, `revoked_at` |
| `identity_access_reviews`              | Tracks 30-day Idle access decisions              | `id`, `user_id`, `provider_account_id`, `status`, `scope_organization_unit_id`, `requested_role`, `assigned_role`, `expires_at`, `decided_by`, `decided_at`, `decision_note` |
| `identity_access_approver_assignments` | Scoped approver privilege                        | `id`, `user_id`, `organization_unit_id`, `created_by`, `created_at`, `revoked_at`                                                                                             |

Constraints:

- unique active `(provider, provider_subject)`;
- index `user_id`;
- provider values are lowercase stable identifiers such as `firebase`;
- provider tokens and refresh tokens are never stored;
- session cookies are not stored unless a future server-session design explicitly requires hashed session ids.

## Security Rules

- All protected API routes verify a provider token or session cookie before loading local authorization state.
- Inactive or archived local users receive 403 even if Firebase authentication succeeds.
- Admin and other high-risk routes should enable provider revocation checks, accepting the additional provider call where needed.
- Logout clears local cookies/session state and should revoke or invalidate server-side session cookies where used. Firebase refresh-token revocation is required for explicit security events such as lost device, account compromise, disabled user, or critical role removal.
- CSRF protection is required for session-cookie login/logout endpoints.
- ID tokens, session cookies, device tokens, provider refresh tokens, and service-account credentials must never be logged.
- Firebase service-account credentials come from deployment secrets, not committed files.
- Demo mode uses fixture principals and must not call Firebase.

## Tests Required in Phase 5

- Adapter unit tests for valid, expired, invalid-signature, wrong-audience/project, disabled/revoked, and malformed tokens.
- API integration tests proving `/auth/me` loads local user roles/status/scope after provider verification.
- First-login linking tests for invited user, candidate, brother/officer, email mismatch, unverified email, and duplicate provider subject.
- Logout/session-cookie tests including CSRF failure and cookie clearing when the cookie path is used.
- Permission tests proving Firebase-authenticated but inactive local users cannot access private APIs.
- Replacement test using a fake provider adapter to prove API guards do not depend on Firebase classes.

## References

- Firebase ID token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firebase session cookies: https://firebase.google.com/docs/auth/admin/manage-cookies
- Firebase session revocation: https://firebase.google.com/docs/auth/admin/manage-sessions
- Firebase custom claims: https://firebase.google.com/docs/auth/admin/custom-claims
