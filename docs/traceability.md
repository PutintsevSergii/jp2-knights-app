# Traceability Matrix — CANONICAL Implementation Status

**THIS IS THE SINGLE SOURCE OF TRUTH for implementation progress.**

Use this document to:

- See current phase and what's complete in that phase
- Understand requirement-to-implementation mapping (FR-\* → APIs → screens → data → tests)
- Find the expected implementation surface for any V1 feature
- Report progress to stakeholders (update the narrative below each phase completion)

**Last Updated**: May 4, 2026 (Phase 2 ~80% complete; Phase 3 public discovery shell complete; Phase 4 ~68% in progress)

---

## Current Implementation Progress

The rows below describe the full expected V1 surface (all 42 requirements). The narrative describes what's actually implemented right now.

### Current Phase: Phase 2 (Core Domain), Phase 3 (Public Discovery) & Phase 4 (Public Content)

Implementation is through the Phase 3 public discovery shell, plus the active Phase 4 public content slice:

- Phase 1 repository/infrastructure baseline is in place.
- Phase 2 shared auth/visibility helpers, mobile-mode resolution, published-content
  filtering, Prisma identity/organization/audit baseline, migration checks, and
  seed fixtures are in place.
- Runtime-mode parsing is shared, and API/admin/mobile reject `demo` mode when
  `NODE_ENV=production`.
- Phase 3 has started with an unauthenticated `/api/public/home` fallback
  discovery shell that returns no private content while approved content tables
  remain Phase 4 work.
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
- Phase 4 has started with `prayer_categories`, `prayers`, and `events` tables,
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
- Phase 4 admin prayer API CRUD has started with guarded
  `/api/admin/prayers` list/create and `/api/admin/prayers/{id}` patch/archive
  contracts. Officers can read public and assigned organization-unit scoped
  prayers; Super Admin can create/update/archive in this first slice.
- Nx quality gates ignore local `.claude/worktrees` agent worktrees so copied
  project files do not create duplicate Nx project names.
- Generated OpenAPI currently includes `/api/health`, `/api/public/home`,
  `/api/public/content-pages/{slug}`,
  `/api/public/prayers`, `/api/public/prayers/{id}`,
  `/api/public/events`, `/api/public/events/{id}`,
  `/api/auth/me`, `/api/brother/my-organization-units`,
  `/api/admin/organization-units`, `/api/admin/organization-units/{id}`,
  `/api/admin/prayers`, and `/api/admin/prayers/{id}` as foundation contracts
  with request/response schemas.
- `/api/auth/me` is a guarded current-user contract backed by a session abstraction;
  Firebase-backed provider verification, provider-account linking, login/session-cookie
  establishment, logout, refresh/session handling, and real token/session persistence
  remain Phase 5 work behind the replaceable auth provider adapter.
- `/api/brother/my-organization-units` currently returns the active brother's
  organization-unit summaries only; officer summaries, events, and announcements remain Phase 8/9 work.
- `/api/admin/organization-units` currently supports scoped active listing plus Super Admin
  create/update/archive. Full Admin Lite navigation, detail views, audit logging,
  and broader admin workflows remain later-phase work.
- Phase 4 admin event CRUD, admin prayer UI/audit workflow, and Phases 5 through 13
  product workflows are not implemented yet unless explicitly
  listed above.

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

| Requirement                                | APIs                                                                                                                     | Screens                            | Data                                                              | Key tests                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| NFR-SEC-001 Authentication                 | `/auth/session`, `/auth/logout`, `/auth/refresh`, `GET /auth/me`                                                         | Login, Admin Login                 | users, identity_provider_accounts, user_roles, memberships        | Firebase adapter verification, fake-provider replacement, inactive-user blocking, provider-linking   |
| NFR-DEMO-001 Demo mode                     | runtime mode config                                                                                                      | Mobile/Admin launch shells         | demo fixtures once screen flows exist                             | shared parser, mobile/admin/API production rejection tests                                           |
| FR-PUBLIC-001 Public Home                  | `GET /public/home`                                                                                                       | `PublicHome`                       | prayers, events, content pages                                    | public no-auth, no private content, empty state                                                      |
| FR-PUBLIC-002 About the Order              | `GET /public/content-pages/{slug}`                                                                                       | `AboutOrder`                       | content_pages                                                     | published `PUBLIC` content only, private/missing pages 404, English fallback, mobile API/demo states |
| FR-PRAYER-001 Public Prayer Library        | `GET /public/prayers`, `GET /public/prayers/:id`                                                                         | public prayer category/list/detail | prayer_categories, prayers                                        | published public only, private id returns 404, mobile list/detail API/demo states                    |
| FR-EVENT-001 Public Events                 | `GET /public/events`, `GET /public/events/:id`                                                                           | public event list/detail           | events                                                            | public/family only, date filters, mobile list/detail API/demo states                                 |
| FR-PRAYER-002 Public Silent Prayer         | `GET/POST /public/silent-prayer-events`                                                                                  | public silent prayer               | silent_prayer_events, silent_prayer_participation, Redis presence | anonymous aggregate only, duplicate join                                                             |
| FR-CANDIDATE-REQ-001 Join Interest Request | `POST /public/candidate-requests`                                                                                        | join request form                  | candidate_requests                                                | consent required, validation, idempotency, rate limit                                                |
| FR-ADMIN-001 Candidate Request Management  | `GET /admin/candidate-requests`, `GET/PATCH /admin/candidate-requests/:id`, `POST /admin/candidate-requests/:id/convert` | candidate request list/detail      | candidate_requests, audit_logs                                    | officer scope, status transitions, audit                                                             |
| FR-ADMIN-008 Candidate Profile Management  | `GET /admin/candidates`, `GET/PATCH /admin/candidates/:id`, `POST /admin/candidates/:id/convert-to-brother`              | candidate list/detail              | candidate_profiles, users, user_roles, memberships, audit_logs    | officer scope, conversion audit, no duplicate active membership                                      |
| FR-CANDIDATE-001 Candidate Dashboard       | `GET /candidate/dashboard`                                                                                               | candidate dashboard                | candidate_profiles, roadmap_assignments, events, announcements    | active profile required, no brother content                                                          |
| FR-ROADMAP-001 Candidate Roadmap           | `GET /candidate/roadmap`                                                                                                 | candidate roadmap                  | roadmap_definitions, assignments                                  | assigned candidate only                                                                              |
| FR-CANDIDATE-002 Candidate Events          | `GET /candidate/events`                                                                                                  | candidate events                   | events                                                            | candidate visibility, organization-unit candidate rule                                               |
| FR-CANDIDATE-003 Candidate Announcements   | `GET /candidate/announcements`                                                                                           | candidate announcements            | announcements                                                     | pinned sort, no brother announcements                                                                |
| FR-BROTHER-001 Brother Today               | `GET /brother/today`                                                                                                     | brother today                      | memberships, prayers, events, announcements, roadmap              | personalized filters, empty cards                                                                    |
| FR-BROTHER-002 Brother Profile             | `GET /brother/profile`                                                                                                   | brother profile                    | users, memberships                                                | self only, critical data read-only                                                                   |
| FR-ORG-001 My Organization Units           | `GET /brother/my-organization-units`                                                                                     | my organization units              | organization_units, officer_assignments, events                   | own scope, no brother list                                                                           |
| FR-PRAYER-003 Brother Prayer Library       | `GET /brother/prayers`                                                                                                   | brother prayer screens             | prayers                                                           | brother/own organization-unit filtering                                                              |
| FR-EVENT-002 Brother Events                | `GET /brother/events`                                                                                                    | brother event screens              | events                                                            | relevant only, cancelled behavior                                                                    |
| FR-EVENT-003 Event Participation Intent    | `POST/DELETE /candidate/events/:id/participation`, `POST/DELETE /brother/events/:id/participation`                       | event detail                       | event_participation                                               | visible event only, duplicate update                                                                 |
| FR-ANN-001 Brother Announcements           | `GET /brother/announcements`                                                                                             | announcement list/detail           | announcements                                                     | no chat/comments, relevant only                                                                      |
| FR-ROADMAP-002 Formation Roadmap           | `GET /brother/roadmap`                                                                                                   | formation roadmap                  | roadmap\_\*                                                       | own roadmap, no auto degree                                                                          |
| FR-ROADMAP-003 Roadmap Step Submission     | `POST /brother/roadmap/steps/:stepId/submissions`                                                                        | step detail                        | roadmap_submissions, file_attachments optional                    | pending duplicate, attachment policy                                                                 |
| FR-ROADMAP-004 Roadmap Approval            | `GET/PATCH /admin/roadmap-submissions/:id`                                                                               | roadmap request detail             | roadmap_submissions, audit_logs                                   | officer scope, rejection comment, audit                                                              |
| FR-PRAYER-004 Silent Brother Prayer        | brother silent prayer routes and socket events                                                                           | brother silent prayer              | silent_prayer_events, Redis presence                              | once per user, reconnect                                                                             |
| FR-NOTIF-001 Notification Preferences      | `PUT /auth/notification-preferences`, `POST /auth/device-tokens`                                                         | settings                           | notification_preferences, device_tokens                           | self only, duplicate token ownership                                                                 |
| FR-ADMIN-002 Admin Dashboard               | `GET /admin/dashboard`                                                                                                   | admin dashboard                    | scoped aggregates                                                 | no unrelated scope                                                                                   |
| FR-ADMIN-003 Brother Registry              | `/admin/brothers` routes                                                                                                 | brother list/detail/editor         | users, user_roles, memberships, audit_logs                        | officer scope, critical audit                                                                        |
| FR-ORG-002 Organization Unit Management    | `/admin/organization-units` routes                                                                                       | organization unit list/detail      | organization_units, officer_assignments                           | super admin write, archive                                                                           |
| FR-ADMIN-004 Prayer Management             | `/admin/prayers` routes                                                                                                  | prayer list/editor                 | prayers, audit_logs                                               | guarded list/create/patch API, visibility required, archive not delete                               |
| FR-ADMIN-005 Event Management              | `/admin/events` routes                                                                                                   | event list/editor                  | events, audit_logs                                                | public/private explicit, scope                                                                       |
| FR-ADMIN-006 Announcement Management       | `/admin/announcements` routes                                                                                            | announcement list/editor           | announcements, audit_logs                                         | audience-safe push                                                                                   |
| FR-ADMIN-007 Silent Prayer Management      | `/admin/silent-prayer-events` routes                                                                                     | silent prayer editor               | silent_prayer_events, audit_logs                                  | no participant list                                                                                  |
| FR-AUDIT-001 Audit Logging                 | mutation side effects, `/admin/audit-logs`                                                                               | audit log                          | audit_logs                                                        | before/after redaction, access control                                                               |
| FR-CONTENT-001 Content Approval            | admin content routes                                                                                                     | content editors                    | publishable content tables                                        | unapproved publish blocked                                                                           |
| FR-PRIV-001 Privacy Controls               | all APIs; shared `@jp2/shared-auth` role/scope/visibility helpers                                                        | all screens                        | all private tables                                                | shared auth matrix, permission, visibility, leak tests                                               |
