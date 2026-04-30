# Authentication and Authorization

## Session Model

V1 should use secure short-lived access tokens plus refresh/session handling. The backend must support:

- login;
- logout;
- refresh session;
- get current user;
- inactive-user blocking;
- role and scope checks on every protected endpoint.

## Roles

| Role        | App surface                                             |
| ----------- | ------------------------------------------------------- |
| Guest       | Public mobile only                                      |
| Candidate   | Candidate mobile                                        |
| Brother     | Brother mobile                                          |
| Officer     | Admin Lite scoped to one chorągiew; may also be brother |
| Super Admin | Admin Lite global                                       |

## Authorization Layers

1. Authentication guard: verifies session.
2. Status guard: blocks inactive/archived users.
3. Role guard: verifies required role.
4. Scope guard: verifies chorągiew or ownership.
5. Visibility filter: limits content result sets.

`@jp2/shared-auth` is the shared Phase 2 source for role checks, app-mode access,
officer chorągiew scope, admin scoped-record reads, and visibility decisions. API
guards/services should call these helpers instead of duplicating role or visibility
logic in endpoint modules.

## Public/Private Separation

Public APIs must never rely on frontend hiding. They should query only public/family-open published records and reject private identifiers.

## Candidate Restrictions

Candidates may see only public, family-open, candidate, and assigned candidate chorągiew content. Candidate accounts cannot access brother roadmap, brother announcements, private brother events, brother profiles, or admin functions.
