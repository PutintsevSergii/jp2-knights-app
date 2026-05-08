# Authentication and Authorization

## Session Model

V1 should use Firebase Authentication as the first external identity provider, behind
the replaceable adapter defined in [auth-provider-adapter.md](auth-provider-adapter.md).
The backend must support:

- Firebase ID token verification for mobile/API clients;
- secure Admin Lite session cookies when deployment topology supports same-site cookies;
- logout and session invalidation;
- provider identity to local user linking/sync;
- Firebase Authentication sign-in providers as external identity options with a local Idle approval gate;
- get current user;
- inactive-user blocking;
- role and scope checks on every protected endpoint.

Firebase proves who the person is. The JP2 database decides what that person may do.
Roles, status, memberships, candidate profiles, and officer scope are loaded from local
tables after provider token verification.

## Firebase Sign-In Idle Approval

Firebase Authentication provider sign-in must authenticate identity only. It must never grant
Candidate, Brother, Officer, Admin Lite, or Super Admin access by itself.

When a person signs in with the V1 Google/Gmail Firebase provider and no
already-approved local access exists:

1. The API creates or links a local identity-provider account.
2. The local user is placed in Idle mode for 30 days.
3. `/auth/me` and mode resolution keep the user public-only and return pending
   approval guidance instead of private roles.
4. A country/region approver or Super Admin reviews the idle user in Admin Lite.
5. Confirmation assigns the appropriate local roles and scopes; rejection or
   expiry keeps the user public-only.

Country/region approver is an admin-assigned privilege. Any participant of the
Order can receive it if assigned by an authorized admin. The privilege must be
scoped, audited, and revocable. Super Admin can approve globally.

## Roles

| Role        | App surface                                                           |
| ----------- | --------------------------------------------------------------------- |
| Guest       | Public mobile only                                                    |
| Candidate   | Candidate mobile                                                      |
| Brother     | Brother mobile                                                        |
| Officer     | Admin Lite scoped to assigned organization units; may also be brother |
| Super Admin | Admin Lite global                                                     |

## Authorization Layers

1. Authentication guard: verifies provider token or session cookie through the adapter.
2. Status guard: blocks inactive/archived users.
3. Role guard: verifies required role.
4. Scope guard: verifies organization-unit scope or ownership.
5. Visibility filter: limits content result sets.

`@jp2/shared-auth` is the shared Phase 2 source for role checks, app-mode access,
officer organization-unit scope, admin scoped-record reads, and visibility decisions. API
guards/services should call these helpers instead of duplicating role or visibility
logic in endpoint modules.

Provider SDKs, Firebase claims, and token verification details must not leak into domain
services. Domain services receive a `CurrentUserPrincipal` resolved from local data.

## Public/Private Separation

Public APIs must never rely on frontend hiding. They should query only public/family-open published records and reject private identifiers.

## Candidate Restrictions

Candidates may see only public, family-open, candidate, and assigned candidate organization-unit content. Candidate accounts cannot access brother roadmap, brother announcements, private brother events, brother profiles, or admin functions.

## Provider Replacement Rule

Firebase-specific code belongs only in the auth provider adapter. Replacing Firebase
with another OIDC/JWT provider should require a new adapter implementation, configuration
changes, and provider-link migration only; it must not require changes to role helpers,
visibility helpers, domain services, or screen-specific authorization logic.
