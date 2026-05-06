# Traceability Matrix — CANONICAL Implementation Status

**THIS IS THE SINGLE SOURCE OF TRUTH for implementation progress.**

Use this document to:

- See current phase and what's complete in that phase
- Understand requirement-to-implementation mapping (FR-\* → APIs → screens → data → tests)
- Find the expected implementation surface for any V1 feature
- Report progress to stakeholders (update the narrative below each phase completion)

**Last Updated**: May 6, 2026 (Phases 0–7 complete; Phase 8 in progress)

---

## Current Implementation Progress

The rows below describe the full expected V1 surface (all 42 requirements). The narrative describes what's actually implemented right now.

### Current Phase: Phase 8 (Brother Companion Core)

Implementation is complete through the Phase 7 Candidate Funnel. Phase 8 Brother
Companion Core is in progress:

- Phase 1 repository/infrastructure baseline is in place.
- Phase 2 shared auth/visibility helpers, mobile-mode resolution, published-content
  filtering, Prisma identity/organization/audit baseline, migration checks, and
  seed fixtures are in place. The shared public/private visibility matrix now
  covers guest, candidate, brother, officer, and Super Admin paths.
- Runtime-mode parsing is shared, and API/admin/mobile reject `demo` mode when
  `NODE_ENV=production`.
- Phase 3 public discovery is complete with an unauthenticated
  `/api/public/home` shell and public content pages that return no private
  content.
- Mobile launch-state resolution now opens `PublicHome` without a session, marks
  demo mode visibly, and routes active candidates/brothers to their mode landing
  screens.
- Mobile public screen models now map the public-home DTO into token-backed
  `PublicHome` ready/empty/loading/error/offline/forbidden states for the future
  Expo screen.
- Mobile now has an Expo entry point and React Native `PublicHome` screen that
  renders the public screen model without requiring login.
- Mobile `api` mode now loads `/api/public/home` through a small API client,
  validates the response with the shared DTO schema, and maps request failures
  to error/offline states. Mobile `demo` mode keeps using the local fallback
  discovery payload without backend calls.
- Phase 3 now includes a public content-page foundation: `content_pages` table,
  seed fallback content for `about-order`, and unauthenticated
  `/api/public/content-pages/{slug}` endpoint that returns only currently
  published `PUBLIC` pages with English fallback.
- Mobile `AboutOrder` now uses a typed public-content-page API client in `api`
  mode, validates the shared DTO response, maps loading/error/offline/empty
  states, and keeps a local approved fallback page in `demo` mode.
- Phase 4 includes `prayer_categories`, `prayers`, and `events` tables,
  representative public/private seed fixtures, and unauthenticated
  `/api/public/prayers`, `/api/public/prayers/{id}`, `/api/public/events`, and
  `/api/public/events/{id}` read endpoints. Public prayer reads return only
  currently published `PUBLIC` prayers; public event reads return only currently
  published `PUBLIC` or `FAMILY_OPEN` events.
- Mobile Phase 4 now includes API-mode public prayer and event list clients,
  demo fallback fixtures, and React Native list views for
  `PublicPrayerCategories` and `PublicEventsList`. These validate shared DTOs,
  handle loading/empty/error/offline states, and stay on public-safe summary data.
- Mobile public prayer and event detail screens now load
  `/api/public/prayers/{id}` and `/api/public/events/{id}` in API mode, validate
  shared DTOs, support demo fallback details, and keep private content hidden by
  depending on the public API contracts.
- Phase 4 admin prayer API CRUD includes guarded
  `/api/admin/prayers` list/create and `/api/admin/prayers/{id}` patch/archive
  contracts. Officers can read public and assigned organization-unit scoped
  prayers; Super Admin can create/update/archive in this first slice.
- Phase 4 admin event API CRUD includes guarded
  `/api/admin/events` list/create and `/api/admin/events/{id}` patch
  contracts. Officers can read public/family-open and assigned
  organization-unit scoped events, and officer writes are constrained to assigned
  organization units; Super Admin can manage global and scoped events.
- Phase 4 admin prayer/event mutations now write audit log side effects for
  create/update/archive/publish/cancel workflows using actor, entity, scope, and
  redacted before/after summaries that omit full prayer bodies and event descriptions.
- Admin Lite Phase 4 now includes a tested prayer/event content workflow
  foundation in the admin app: authenticated API clients for list/create/update,
  DTO validation, forbidden/offline/error state mapping, and token-backed list
  view models with create/edit/publish/cancel/archive actions for future rendered
  admin screens.
- Admin Lite Phase 4 now includes framework-neutral rendered prayer/event list
  HTML templates that consume those view models, preserve action metadata for
  create/edit/publish/cancel/archive workflows, escape dynamic content, and
  support ready/empty/forbidden/demo states.
- Admin Lite Phase 4 now wires `/admin/prayers` and `/admin/events` into the
  admin TypeScript shell: API mode fetches guarded backend content, demo mode
  uses local fixtures without backend calls, failures map to rendered status
  documents, and the shell exposes route metadata for future web mounting.
- Phase 5 adds reusable `@jp2/auth-provider` with the stable
  `ExternalAuthProvider` contract, a Firebase Admin SDK-backed provider, and a
  static fake provider used only for local/test replacement coverage.
- Phase 5/6 Firebase Idle approval is implemented: first-time verified
  Firebase sign-in now creates or links only a public-only local identity,
  creates a pending `identity_access_reviews` row with a 30-day expiry, and
  exposes safe `/api/auth/me` approval state without private roles or scopes.
  Pending, rejected, and expired Idle identities remain `public` mobile mode
  and cannot enter Admin Lite, candidate, or brother surfaces. Private API
  denials for Idle users now return stable `IDLE_APPROVAL_REQUIRED` errors
  without loading protected data, and mobile maps that code to approval guidance
  while keeping public content usable.
- Protected routes without any authenticated session now fail closed with `403`
  and no protected payload; invalid/expired provider credentials still use
  `401`. Public consent-backed candidate requests remain unauthenticated and
  require explicit accepted consent in the shared DTO before persistence.
- Phase 5 adds `identity_provider_accounts` with active provider-subject
  uniqueness, local seed links for demo admin/officer users, and API-side local
  account resolution from provider identity to JP2 roles, status, memberships,
  and officer scope.
- `/api/auth/session`, `/api/auth/logout`, and `/api/auth/refresh` are now
  implemented. Bearer ID-token clients resolve the local current user;
  providers that support session cookies can establish `httpOnly` cookies after
  CSRF validation; logout clears local cookie state; refresh revalidates the
  guarded principal.
- `/api/auth/me` now verifies bearer tokens or provider session cookies through
  the replaceable provider adapter before loading the local user. Inactive or
  archived local users still fail closed through `CurrentUserGuard`; invited
  Idle users are allowed only far enough for `/auth/me` and `/auth/session` to
  return public-only pending/rejected/expired approval state.
- Phase 6 now includes guarded Admin Lite identity access review endpoints:
  `/api/admin/identity-access-reviews`,
  `/api/admin/identity-access-reviews/{id}`,
  `/api/admin/identity-access-reviews/{id}/confirm`,
  `/api/admin/identity-access-reviews/{id}/reject`, and
  `/api/admin/identity-access-reviews/expire`. Super Admin can decide globally;
  officers must be in scope and hold an active
  `identity_access_approver_assignments` privilege for the review scope.
  Confirmation assigns explicit local role/scope, creates or reuses the
  matching candidate profile, membership, or officer assignment, and writes an
  audit log. Rejection and expiry keep the user public-only.
- Phase 6 now includes a guarded `/api/admin/dashboard` endpoint that returns
  scoped counts and task links for identity access reviews, organization units,
  prayers, and events. Officers receive counts constrained to their assigned
  organization-unit scope and public/family-open content; Super Admin receives
  global counts.
- Admin Lite Phase 6 now exposes `/admin/dashboard` route metadata and a
  framework-neutral rendered dashboard document with scoped navigation to the
  implemented sign-in review, organization-unit, prayer, and event surfaces.
  Demo mode uses local dashboard fixtures without backend calls.
- Admin Lite now has a dependency-free Node HTTP web shell that mounts
  `/admin`, `/admin/dashboard`, `/admin/identity-access-reviews`,
  `/admin/prayers`, and `/admin/events` to the rendered route documents,
  forwards bearer tokens in API mode, and keeps demo mode backend-free.
- Admin Lite Phase 6 now mounts `/admin/organization-units` through the Node
  HTTP shell with API/demo loading, shared DTO validation, read-only officer
  state, Super Admin create/edit/archive action metadata, and demo fixtures.
- Admin Lite Phase 6 now renders organization-unit create and scoped detail/edit
  form documents at `/admin/organization-units/new` and
  `/admin/organization-units/{id}`. Detail reads reuse the server-filtered
  organization-unit list contract, so officers cannot render unrelated units.
- Admin organization-unit create/update/archive mutations now write audit log
  side effects with actor, entity, scope, and before/after summaries.
- Admin Lite Phase 6 now has an app-level mounted UI shell with shared
  navigation, active-route state, runtime-mode chrome, and mounted 404/status
  pages across dashboard, organization units, prayers, and events.
- Nx quality gates ignore local `.claude/worktrees` agent worktrees so copied
  project files do not create duplicate Nx project names.
- Phase 7 now includes the public candidate request creation foundation:
  shared DTO validation, `candidate_requests` table/migration, local seed
  fixture, and unauthenticated `/api/public/candidate-requests` endpoint. The
  endpoint requires explicit consent, stores consent text version/timestamp,
  supports optional idempotency keys, rate-limits repeated attempts, rejects
  duplicate active request emails, and returns only request id/status.
- Mobile Phase 7 now includes the public join-interest form model and rendered
  React Native form/confirmation screens. API mode submits through a typed
  `/api/public/candidate-requests` client with shared request/response schema
  validation and idempotency key support; demo mode stays backend-free with a
  validated fallback response. The confirmation copy avoids account or
  membership promises and only exposes the request reference id.
- Admin Phase 7 now includes the candidate request management API foundation:
  guarded `GET /api/admin/candidate-requests`,
  `GET /api/admin/candidate-requests/{id}`, and
  `PATCH /api/admin/candidate-requests/{id}` endpoints. Super Admin sees all
  non-archived requests; officers see only assigned requests in their officer
  organization-unit scope. Updates can change status, assignment, and officer
  note with audit summaries that redact the full message and email.
- Admin Lite Phase 7 now mounts `/admin/candidate-requests` and
  `/admin/candidate-requests/{id}` in the dependency-free web shell. API mode
  loads the guarded backend list/detail contracts through typed clients with
  shared DTO validation; demo mode uses local candidate-request fixtures without
  backend calls; rendered list/detail documents expose review, follow-up status,
  assignment, and officer-note action metadata.
- Phase 7 now includes the candidate profile persistence and request conversion
  foundation: `candidate_profile_status` enum, `candidate_profiles` table,
  demo candidate profile fixture, shared candidate-profile response DTOs, and
  guarded `POST /api/admin/candidate-requests/{id}/convert`. Conversion creates
  or reuses the local invited user, grants `CANDIDATE`, creates an active
  candidate profile, marks the request `converted_to_candidate`, keeps officer
  scope server-side constrained, and writes redacted audit summaries.
- Phase 7 now includes admin candidate profile management:
  guarded `GET /api/admin/candidates`, `GET /api/admin/candidates/{id}`, and
  `PATCH /api/admin/candidates/{id}` endpoints. Super Admin sees all
  non-archived candidate profiles; officers see only candidate profiles in
  assigned organization-unit scope. Updates can change active/paused/archived
  status, scoped assignment, and responsible officer with audit summaries that
  redact email. Admin Lite mounts `/admin/candidates` and
  `/admin/candidates/{id}` with API/demo loading, shared DTO validation, list and
  detail screen models, write action metadata, and mounted navigation.
- Phase 7 now includes the candidate dashboard activation foundation: guarded
  `GET /api/candidate/dashboard`, shared DTO validation, active-profile
  enforcement, scoped assigned choragiew/responsible-officer contact fields,
  candidate-visible upcoming event summaries, no brother-only event visibility,
  and a mobile API client, demo fixture, React Native dashboard screen, and
  token-backed screen model with ready/empty/loading/error/offline/forbidden
  states.
- Phase 8 now includes the first Brother Companion Core slice: guarded
  `GET /api/brother/profile` and `GET /api/brother/today` endpoints, shared
  DTO validation, active brother membership enforcement, own-profile-only
  responses, read-only membership/current-degree summaries, and brother-visible
  upcoming event filtering for `PUBLIC`, `FAMILY_OPEN`, `BROTHER`, and own
  organization-unit events. Mobile now has API clients, demo fixtures, and
  token-backed `BrotherToday` and `BrotherProfile` screen models with
  ready/empty/loading/error/offline/forbidden states.
- Phase 8 now includes the Mobile My Chorągiew slice over
  `/api/brother/my-organization-units`: API mode sends bearer credentials and
  validates the shared DTO, demo mode uses a backend-free parsed fallback, and
  the React Native screen/model renders active organization-unit summaries only
  with ready/empty/loading/error/offline/forbidden/idle-approval states.
- Phase 8 now includes the brother prayer read API foundation:
  guarded `GET /api/brother/prayers` with shared query/response DTO validation,
  active brother membership enforcement, category/search/language/pagination
  filters, and server-side visibility limited to currently published `PUBLIC`,
  `FAMILY_OPEN`, `BROTHER`, or own organization-unit prayers.
- Phase 8 now includes brother event read coverage:
  guarded `GET /api/brother/events` with shared query/response DTO validation,
  active brother membership enforcement, `from`/type/pagination filters, and
  server-side visibility limited to currently published, non-cancelled,
  non-archived `PUBLIC`, `FAMILY_OPEN`, `BROTHER`, or own organization-unit
  events. Mobile now has an authenticated API client, demo fallback, and
  `BrotherEvents` screen model with ready/empty/loading/error/offline/forbidden
  states.
- Phase 8 now runs Admin Lite on a real Next.js App Router target. `@jp2/admin`
  has Next/React runtime dependencies, `next dev`, `next build`, and `next
  start` scripts, Nx `admin:build` now runs `next build`, and the previous
  dependency-free HTTP shell remains available as `dev:http-shell` for
  compatibility. `/admin`, `/admin/dashboard`,
  `/admin/identity-access-reviews`, candidate request list/detail, candidate
  profile list/detail, organization-unit list/create/detail, prayers, and events
  all live under `apps/admin/src/app` as dynamic route handlers. The route
  handlers delegate to the existing Admin Lite render/client/model layer, which
  preserves current API clients, shared DTO validation, screen models, action
  metadata, and demo fixtures while moving the runtime to Next.js. Route smoke
  tests cover demo mode without backend calls, dashboard API bearer forwarding,
  identity-access review queue mounting, all list routes, and dynamic
  detail/form routes. `next build` verifies the complete current route surface.
- Delivery-risk review recommendations are now tracked as in-progress hardening
  and planning items alongside Phase 8, without expanding V1 scope:
  - Implementation maturity: keep Admin Lite's dependency-free HTTP shell as the
    accepted V1 foundation while the incremental Next.js/App Router admin
    migration is now a real Next.js runtime target for the current implemented
    Admin Lite route surface. Future admin routes should follow the same adapter
    pattern until React Server Component rewrites are intentionally scheduled
    with parity tests.
  - Next.js Admin Lite follow-up steps for Phase 8 hardening:
    keep `dev:http-shell` only as a short-term compatibility fallback; add
    Next `dev/start` smoke checks after the broader smoke target is introduced;
    verify production auth/session cookie behavior through the Next route
    handlers; and convert framework-neutral HTML renderers to native React
    Server Components only after route parity and authorization smoke tests are
    stable.
  - Production readiness: add smoke/E2E targets for API boot, Admin Lite routes,
    mobile demo launch, and production-mode demo rejection. CI already runs
    lint/typecheck/test/coverage/build/contracts/migration checks; the next
    solution is to add launch and journey-level checks rather than duplicate
    existing unit gates.
  - Realtime and scalability: keep single PostgreSQL and no `/v2` routes for
    V1. Treat read replicas, API version expansion, hierarchy rollups, and
    cross-unit reporting as deferred scale/backlog decisions. Phase 11 must
    include Redis TTL tuning tests for duplicate joins, reconnects, disconnect
    expiry, and multi-instance counter correctness.
  - Organization model constraints: document that V1 permissions stay explicit
    and chorągiew-scoped. Do not add hierarchy-derived permissions or cross-unit
    rollups without owner-approved scope expansion.
  - Observability: add API request-id generation/propagation so every error
    response and audit log can be correlated, then define the pilot logging and
    metrics destination during release hardening.
  - Candidate lifecycle: tighten the documented and service-level status
    transition rules for request follow-up, rejection, invitation, conversion,
    officer assignment, and timeline expectations before extending candidate
    workflows.
- Generated OpenAPI currently includes `/api/health`, `/api/public/home`,
  `/api/public/content-pages/{slug}`,
  `/api/public/prayers`, `/api/public/prayers/{id}`,
  `/api/public/events`, `/api/public/events/{id}`,
  `/api/public/candidate-requests`,
  `/api/auth/session`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`,
  `/api/candidate/dashboard`,
  `/api/brother/profile`, `/api/brother/today`, `/api/brother/prayers`,
  `/api/brother/events`,
  `/api/brother/my-organization-units`,
  `/api/admin/dashboard`,
  `/api/admin/organization-units`, `/api/admin/organization-units/{id}`,
  `/api/admin/candidate-requests`, `/api/admin/candidate-requests/{id}`,
  `/api/admin/candidate-requests/{id}/convert`,
  `/api/admin/candidates`, `/api/admin/candidates/{id}`,
  `/api/admin/prayers`, `/api/admin/prayers/{id}`,
  `/api/admin/events`, and `/api/admin/events/{id}` as foundation contracts
  with request/response schemas.
- Auth device-token and notification-preference endpoints remain Phase 9 work
  with push/notification preferences.
- `/api/brother/my-organization-units` currently returns the active brother's
  organization-unit summaries only, and mobile renders those scoped summaries
  without brother rosters. Officer summaries, event participation intent, event
  details, and announcements remain Phase 9+ work.
- `/api/admin/organization-units` currently supports scoped active listing plus Super Admin
  create/update/archive with audit side effects. The Admin Lite HTTP shell mounts
  organization-unit list, create, and scoped detail/edit form documents over the
  existing contracts.
- Admin Lite now has a real Next.js App Router runtime target for the current
  implemented route surface. The dependency-free HTTP shell remains available as
  a compatibility fallback while future route and React Server Component
  hardening steps are handled incrementally.
- Remaining Phase 8 through 13 product workflows are not implemented yet unless
  explicitly listed above.

### How to Update This Document

**After each phase completion:**

1. Update the "Current Phase" section above
2. Update the narrative bullets with what's newly complete
3. Update the requirement rows below to mark phase/status in "Key tests" or other fields if needed
4. Commit with message: "Phase X complete: [specific accomplishments]"

**Before each phase starts:**

1. Review the roadmap in [docs/delivery/implementation-roadmap.md](delivery/implementation-roadmap.md)
2. Verify Phase N-1 exit criteria are met
3. Update "Current Phase" to Phase N

**If requirements change:**

1. Update scope docs first: [docs/product/v1-scope.md](product/v1-scope.md), [docs/product/out-of-scope.md](product/out-of-scope.md)
2. Update requirement row in matrix below
3. Update [docs/delivery/DECISION_LOG.md](delivery/DECISION_LOG.md) if architectural impact
4. Update [docs/delivery/RISK_AND_MITIGATION.md](delivery/RISK_AND_MITIGATION.md) if risk impact

| Requirement                                | APIs                                                                                                                                  | Screens                                      | Data                                                                                     | Key tests                                                                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-001 Authentication                 | `/auth/session`, `/auth/logout`, `/auth/refresh`, `GET /auth/me`                                                                      | Login, Admin Login                           | users, identity_provider_accounts, user_roles, memberships                               | Firebase adapter verification, fake-provider replacement, inactive-user blocking, provider-linking                                                                          |
| FR-AUTH-001 Firebase Idle Approval         | `/auth/session`, `GET /auth/me`; `/admin/identity-access-reviews`, `/admin/identity-access-reviews/{id}`, `/admin/identity-access-reviews/{id}/confirm`, `/admin/identity-access-reviews/{id}/reject`, `/admin/identity-access-reviews/expire` | login pending approval, admin idle approvals | users, identity_provider_accounts, identity_access_reviews, identity_access_approver_assignments, user_roles, memberships, candidate_profiles, officer_assignments, audit_logs | Firebase sign-in stays idle/public-only, 30-day expiry, scoped country/region approval privilege, audited role/scope assignment, rejection/expiry public-only state, Next.js identity-access route smoke test |
| NFR-DEMO-001 Demo mode                     | runtime mode config                                                                                                                   | Mobile/Admin launch shells                   | demo fixtures once screen flows exist                                                    | shared parser, mobile/admin/API production rejection tests                                                                                                                  |
| FR-PUBLIC-001 Public Home                  | `GET /public/home`                                                                                                                    | `PublicHome`                                 | prayers, events, content pages                                                           | public no-auth, no private content, empty state                                                                                                                             |
| FR-PUBLIC-002 About the Order              | `GET /public/content-pages/{slug}`                                                                                                    | `AboutOrder`                                 | content_pages                                                                            | published `PUBLIC` content only, private/missing pages 404, English fallback, mobile API/demo states                                                                        |
| FR-PRAYER-001 Public Prayer Library        | `GET /public/prayers`, `GET /public/prayers/:id`                                                                                      | public prayer category/list/detail           | prayer_categories, prayers                                                               | published public only, private id returns 404, mobile list/detail API/demo states                                                                                           |
| FR-EVENT-001 Public Events                 | `GET /public/events`, `GET /public/events/:id`                                                                                        | public event list/detail                     | events                                                                                   | public/family only, date filters, mobile list/detail API/demo states                                                                                                        |
| FR-PRAYER-002 Public Silent Prayer         | `GET/POST /public/silent-prayer-events`                                                                                               | public silent prayer                         | silent_prayer_events, silent_prayer_participation, Redis presence                        | anonymous aggregate only, duplicate join                                                                                                                                    |
| FR-CANDIDATE-REQ-001 Join Interest Request | `POST /public/candidate-requests`                                                                                                     | join request form                            | candidate_requests                                                                       | consent-required shared DTO, server persistence with consent metadata, idempotency key retry, repeated-attempt rate limit, duplicate active email conflict, no-PII response |
| FR-ADMIN-001 Candidate Request Management  | `GET /admin/candidate-requests`, `GET/PATCH /admin/candidate-requests/:id`, `POST /admin/candidate-requests/:id/convert`              | candidate request list/detail                | candidate_requests, audit_logs                                                           | officer scope, status transitions, audit, admin client/shell API/demo states, Next.js list/detail route smoke tests                                                         |
| FR-ADMIN-008 Candidate Profile Management  | `GET /admin/candidates`, `GET/PATCH /admin/candidates/:id`; `POST /admin/candidates/:id/convert-to-brother` pending brother lifecycle | candidate list/detail                        | candidate_profiles, users, user_roles, audit_logs; memberships pending brother lifecycle | officer scope, profile update audit, admin client/shell API/demo states, Next.js list/detail route smoke tests, brother conversion deferred to brother lifecycle             |
| FR-CANDIDATE-001 Candidate Dashboard       | `GET /candidate/dashboard`                                                                                                            | candidate dashboard                          | candidate_profiles, events; roadmap_assignments/announcements pending later phases       | active profile required, scoped event visibility, mobile API/client state mapping, no brother content                                                                       |
| FR-ROADMAP-001 Candidate Roadmap           | `GET /candidate/roadmap`                                                                                                              | candidate roadmap                            | roadmap_definitions, assignments                                                         | assigned candidate only                                                                                                                                                     |
| FR-CANDIDATE-002 Candidate Events          | `GET /candidate/events`                                                                                                               | candidate events                             | events                                                                                   | candidate visibility, organization-unit candidate rule                                                                                                                      |
| FR-CANDIDATE-003 Candidate Announcements   | `GET /candidate/announcements`                                                                                                        | candidate announcements                      | announcements                                                                            | pinned sort, no brother announcements                                                                                                                                       |
| FR-BROTHER-001 Brother Today               | `GET /brother/today`                                                                                                                  | brother today                                | users, memberships, organization_units, events; announcements/roadmap pending later      | personalized profile cards, own organization units, brother-safe event visibility, mobile API/demo states                                                                   |
| FR-BROTHER-002 Brother Profile             | `GET /brother/profile`                                                                                                                | brother profile                              | users, user_roles, memberships, organization_units                                       | self only, active membership required, critical data read-only, mobile API/demo states                                                                                      |
| FR-ORG-001 My Organization Units           | `GET /brother/my-organization-units`                                                                                                  | my organization units                        | organization_units, officer_assignments, events                                          | own scope, no brother list, mobile API/demo/screen states                                                                                                                   |
| FR-PRAYER-003 Brother Prayer Library       | `GET /brother/prayers`                                                                                                                | brother prayer screens                       | prayers                                                                                  | published public/family/brother/own organization-unit filtering, no candidate/officer/admin/unrelated-scope prayers                                                        |
| FR-EVENT-002 Brother Events                | `GET /brother/events`                                                                                                                 | BrotherEvents screen model                   | events                                                                                   | guarded active-brother read API, shared DTO validation, published/non-cancelled visibility filtering, mobile API/demo model tests                                           |
| FR-EVENT-003 Event Participation Intent    | `POST/DELETE /candidate/events/:id/participation`, `POST/DELETE /brother/events/:id/participation`                                    | event detail                                 | event_participation                                                                      | visible event only, duplicate update                                                                                                                                        |
| FR-ANN-001 Brother Announcements           | `GET /brother/announcements`                                                                                                          | announcement list/detail                     | announcements                                                                            | no chat/comments, relevant only                                                                                                                                             |
| FR-ROADMAP-002 Formation Roadmap           | `GET /brother/roadmap`                                                                                                                | formation roadmap                            | roadmap\_\*                                                                              | own roadmap, no auto degree                                                                                                                                                 |
| FR-ROADMAP-003 Roadmap Step Submission     | `POST /brother/roadmap/steps/:stepId/submissions`                                                                                     | step detail                                  | roadmap_submissions, file_attachments optional                                           | pending duplicate, attachment policy                                                                                                                                        |
| FR-ROADMAP-004 Roadmap Approval            | `GET/PATCH /admin/roadmap-submissions/:id`                                                                                            | roadmap request detail                       | roadmap_submissions, audit_logs                                                          | officer scope, rejection comment, audit                                                                                                                                     |
| FR-PRAYER-004 Silent Brother Prayer        | brother silent prayer routes and socket events                                                                                        | brother silent prayer                        | silent_prayer_events, Redis presence                                                     | once per user, reconnect                                                                                                                                                    |
| FR-NOTIF-001 Notification Preferences      | `PUT /auth/notification-preferences`, `POST /auth/device-tokens`                                                                      | settings                                     | notification_preferences, device_tokens                                                  | self only, duplicate token ownership                                                                                                                                        |
| FR-ADMIN-002 Admin Dashboard               | `GET /admin/dashboard`                                                                                                                | admin dashboard                              | scoped aggregates                                                                        | guarded scoped counts, admin dashboard route/demo fixture, no unrelated scope, Next.js `/admin/dashboard` route smoke tests for demo/API modes                               |
| FR-ADMIN-003 Brother Registry              | `/admin/brothers` routes                                                                                                              | brother list/detail/editor                   | users, user_roles, memberships, audit_logs                                               | officer scope, critical audit                                                                                                                                               |
| FR-ORG-002 Organization Unit Management    | `/admin/organization-units` routes                                                                                                    | organization unit list/detail                | organization_units, officer_assignments, audit_logs                                      | scoped list API, Super Admin create/update/archive, audit side effects, rendered Admin Lite list/detail/form routes, Next.js list/create/detail route smoke tests            |
| FR-ADMIN-004 Prayer Management             | `/admin/prayers` routes                                                                                                               | prayer list/editor                           | prayers, audit_logs                                                                      | guarded list/create/patch API, admin app list/editor workflow model, visibility required, archive not delete, audit side effects, Next.js list route smoke test              |
| FR-ADMIN-005 Event Management              | `/admin/events` routes                                                                                                                | event list/editor                            | events, audit_logs                                                                       | guarded list/create/patch API, admin app list/editor workflow model, officer scope, public/private explicit, archive not delete, audit side effects, Next.js list route smoke test |
| FR-ADMIN-006 Announcement Management       | `/admin/announcements` routes                                                                                                         | announcement list/editor                     | announcements, audit_logs                                                                | audience-safe push                                                                                                                                                          |
| FR-ADMIN-007 Silent Prayer Management      | `/admin/silent-prayer-events` routes                                                                                                  | silent prayer editor                         | silent_prayer_events, audit_logs                                                         | no participant list                                                                                                                                                         |
| FR-AUDIT-001 Audit Logging                 | mutation side effects, `/admin/audit-logs`                                                                                            | audit log                                    | audit_logs                                                                               | before/after redaction, access control                                                                                                                                      |
| FR-CONTENT-001 Content Approval            | admin content routes                                                                                                                  | content editors                              | publishable content tables                                                               | unapproved publish blocked                                                                                                                                                  |
| FR-PRIV-001 Privacy Controls               | all APIs; shared `@jp2/shared-auth` role/scope/visibility helpers                                                                     | all screens                                  | all private tables                                                                       | shared auth matrix, permission, visibility, leak tests                                                                                                                      |
