# Auth API

| Method | Path                             | Auth            | Required role                         | Request                                              | Response                                        | Validation/errors | Acceptance                                                                           |
| ------ | -------------------------------- | --------------- | ------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| POST   | `/auth/session`                  | No              | None                                  | Firebase ID token plus CSRF token when using cookies | secure session cookie plus current user         | 400,401,403       | Recent verified provider login can establish Admin Lite/web session                  |
| POST   | `/auth/logout`                   | Yes             | Any                                   | none or active session cookie                        | success and cleared cookie/session state        | 401               | Session invalidated locally; provider refresh revocation handled for security events |
| POST   | `/auth/refresh`                  | Refresh/session | Any                                   | provider-managed refresh/session context             | refreshed current user/session where applicable | 401               | Expired or revoked provider session rejected                                         |
| GET    | `/auth/me`                       | Yes             | Any                                   | bearer Firebase ID token or session cookie           | user, roles, mode, memberships summary, approval state | 401 invalid token, 403 missing/inactive | App can resolve mode from local authorization data                                   |
| POST   | `/auth/device-tokens`            | Yes             | Candidate/Brother/Officer/Super Admin | platform, token                                      | registered token id                             | 400               | Token belongs to current user                                                        |
| PUT    | `/auth/notification-preferences` | Yes             | Candidate/Brother                     | category booleans                                    | updated preferences                             | 400               | Preferences respected                                                                |

## Current Implementation Notes

- `GET /auth/me`, `POST /auth/session`, `POST /auth/logout`, and `POST /auth/refresh` are implemented in Phase 5.
- API guards verify bearer ID tokens or `jp2_session` cookies through the replaceable provider adapter before loading local authorization data.
- `AUTH_PROVIDER_MODE=firebase` uses the Firebase Admin SDK provider. `AUTH_PROVIDER_MODE=fake` is allowed only outside production for local seeded demo identities.
- Session-cookie creation requires a matching `csrfToken` request body value and `x-csrf-token` header before setting the `httpOnly` cookie.
- Firebase Authentication provider sign-in is implemented behind the local Idle approval gate. A verified first-time Firebase identity creates or links a local identity, creates a pending `identity_access_reviews` row expiring 30 days after first sign-in, and returns public-only access until an authorized country/region approver or Super Admin confirms it.
- `/auth/me` returns `access.approval` for pending/rejected/expired Idle identities. During Idle, `roles` is empty, `mobileMode` is `public`, `adminLite` is `false`, and scoped private IDs are empty/null.
- `POST /auth/device-tokens` and `PUT /auth/notification-preferences` remain Phase 9 work with push/notification preferences.

## Idle Approval Contract

The Firebase sign-in idle approval gate belongs to the authentication and Admin
Lite approval surface:

- `POST /auth/session` accepts the configured Firebase token transport for
  enabled Firebase sign-in providers.
- `GET /auth/me` exposes enough safe state for clients to show pending
  approval without exposing private data.
- Protected Candidate, Brother, and Admin Lite APIs reject Idle identities with
  the stable `IDLE_APPROVAL_REQUIRED` error code before protected data is loaded.
- Admin Lite includes scoped approval endpoints for listing, confirming,
  rejecting, and expiring Idle Firebase sign-ins.
- Confirmation assigns local roles/scopes explicitly and writes audit logs.

## Security Rules

- Inactive users receive 403 and no private data.
- Role assignments in `/auth/me` must be enough for mode selection but must not expose unrelated admin data.
- Firebase identity proves authentication only. App roles, status, memberships, candidate profile, and officer scope come from local database tables.
- Firebase identity alone never grants Candidate, Brother, Officer, Admin Lite, or Super Admin access.
- Provider tokens, refresh tokens, session cookies, and device tokens must never be returned in DTOs or logs.
- Demo mode uses fixture principals and must not call Firebase or any production identity provider.
