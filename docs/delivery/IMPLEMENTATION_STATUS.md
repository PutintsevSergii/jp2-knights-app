# Implementation Status Dashboard

**LIVE PROGRESS TRACKER — Visual Status of All 13 Phases**

Updated: May 6, 2026
Canonical source: [docs/traceability.md](../traceability.md)  
Synchronization rule: Update this dashboard whenever traceability.md is updated

---

## Executive Summary

| Phase    | Status         | Progress | Completeness         | Key Outputs                                                                                                           | Next Step                    |
| -------- | -------------- | -------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **0**    | ✅ COMPLETE    | 100%     | ████████████████████ | Scope, roles, visibility                                                                                              | —                            |
| **1**    | ✅ COMPLETE    | 100%     | ████████████████████ | Monorepo, apps, CI, gates                                                                                             | —                            |
| **2**    | ✅ COMPLETE    | 100%     | ████████████████████ | Prisma, auth helpers, filters, visibility matrix                                                                      | —                            |
| **3**    | ✅ COMPLETE    | 100%     | ████████████████████ | `/api/public/home`, public content pages, live PublicHome/About loading                                               | Phase 4 public content views |
| **4**    | ✅ COMPLETE    | 100%     | ████████████████████ | Public APIs, mobile views, admin APIs, audit, admin shell routes                                                      | —                            |
| **5**    | ✅ COMPLETE    | 100%     | ████████████████████ | Provider adapter, Firebase verifier, provider links, auth session API, Idle approval gate                            | —                            |
| **6**    | ✅ COMPLETE    | 100%     | ████████████████████ | Scoped dashboard API, sign-in review workflow, org-unit routes/audit, mounted Admin Lite shell                       | —                            |
| **7**    | ✅ COMPLETE    | 100%     | ████████████████████ | Candidate request API, mobile form, admin workflow, profile conversion, candidate dashboard, admin candidate profiles | —                            |
| **8**    | ✅ COMPLETE    | 100%    | ████████████████████ | Brother profile, Brother Today, My Chorągiew, brother prayer/event APIs, Admin Lite Next runtime, request-id/lifecycle/smoke hardening | Phase 9 |
| **9–13** | ⏳ PENDING     | 0%      | ░░░░░░░░░░░░░░░░░░░░ | Events/announcements, push, roadmap, silent prayer, hardening                                                         | Start Phase 9                |

---

## Phase Status Details

### Phase 0: Product & Technical Baseline ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ V1 scope definition (public discovery + candidate + brother + admin lite)
- ✅ Out-of-scope boundaries (no chat, payments, maps, analytics, surveillance)
- ✅ Role and permission matrix (guest, candidate, brother, officer, super admin)
- ✅ Visibility model (7 levels: public, family-open, candidate, brother, choragiew, officer, admin)
- ✅ Product vision and non-negotiables

**Exit criteria**: ✅ All met

---

### Phase 1: Repository & Infrastructure ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Nx monorepo with pnpm (TypeScript strict mode)
- ✅ `/apps/api` (NestJS), `/apps/admin` TypeScript shell/workflow foundation, `/apps/mobile` (Expo React Native)
- ✅ `/libs/shared` (types, validation, auth helpers, design tokens)
- ✅ Demo mode infrastructure (production rejects demo)
- ✅ Docker Compose for PostgreSQL + Redis
- ✅ Quality gates (lint, typecheck, test, coverage, build, contracts, migrations)
- ✅ CI/CD baseline

**Launch commands**: `pnpm dev:api`, `pnpm dev:mobile`, `pnpm dev:admin`, `pnpm dev:mobile:demo`

**Exit criteria**: ✅ All met

---

### Phase 2: Core Domain & API Foundation ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Identity domain: User, UserRole, UserStatus, Session abstraction
- ✅ Organization domain: OrganizationUnit (generic), Membership, OfficerAssignment
- ✅ Content base model: Status enum (draft/review/approved/published/archived), Visibility enum
- ✅ Audit metadata tables and logging infrastructure
- ✅ Prisma schema and migrations for identity/organization/audit baseline
- ✅ OpenAPI generation target
- ✅ Shared auth/visibility helpers with tests
- ✅ Shared public/private visibility matrix covers guest, candidate, brother, officer, and Super Admin paths

**Exit criteria**: ✅ All met

---

### Phase 3: Public Discovery Mode ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ `/api/public/home` endpoint (contract defined, returns DTO)
- ✅ Mobile `PublicHome` screen (React Native component implemented)
- ✅ Mobile launch resolution (detects guest/candidate/brother, routes appropriately)
- ✅ Demo mode visibility (marked "DEMO" on launch screen)
- ✅ Mobile API mode loads `/api/public/home`, validates DTO responses, and maps error/offline states
- ✅ `/api/public/content-pages/{slug}` endpoint for published `PUBLIC` About content
- ✅ `content_pages` table and `about-order` seed fixture
- ✅ Mobile `AboutOrder` screen integration with API-mode content loading, shared DTO validation, state handling, and demo fallback

**Not Yet**:

- ⏳ Join interest form (Phase 7)

**Exit criteria**: ✅ Public shell, home, about content, and join/login routing links are in place

**Next step**: Phase 4 public content views

### Phase 4: Public Content: Prayers & Events ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ `prayer_categories`, `prayers`, and `events` tables with migration
- ✅ Representative public and private prayer/event seed fixtures
- ✅ `/api/public/prayers` list endpoint with category, language, search, and safe pagination filters
- ✅ `/api/public/prayers/{id}` detail endpoint; private/unpublished IDs resolve as 404
- ✅ `/api/public/events` list endpoint for upcoming public/family-open events
- ✅ `/api/public/events/{id}` detail endpoint; private/unpublished IDs resolve as 404
- ✅ Mobile public prayer category/list view with API-mode DTO validation, state handling, and demo fallback
- ✅ Mobile public events list view with API-mode DTO validation, state handling, and demo fallback
- ✅ Mobile public prayer detail view with API-mode DTO validation, state handling, and demo fallback
- ✅ Mobile public event detail view with API-mode DTO validation, state handling, and demo fallback
- ✅ Admin prayer list/create/patch API with guarded access, shared validation, scoped officer reads, and Super Admin writes
- ✅ Admin event list/create/patch API with guarded access, shared validation, officer-scoped reads/writes, and Super Admin global writes
- ✅ Admin prayer/event mutation audit side effects with actor, entity, scope, and redacted before/after summaries
- ✅ Admin app prayer/event workflow foundation with authenticated API clients, DTO validation, state mapping, and list action view models
- ✅ Framework-neutral rendered admin prayer/event list templates with action metadata, escaped dynamic content, and ready/empty/forbidden/demo states
- ✅ Admin shell route integration for `/admin/prayers` and `/admin/events` with API/demo data resolution, rendered status documents, and route metadata

**Not Yet**:

- ⏳ Brother event detail and participation intent (Phase 9)
- ⏳ Brother announcements and push surfaces (Phase 9)

**Exit criteria**: ✅ Public APIs, mobile public views, admin prayer/event APIs, audit side effects, admin workflow models, rendered templates, and shell routes are implemented

**Next step**: Phase 5 authentication and modes

---

### Phase 5: Authentication & Modes ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Reusable `@jp2/auth-provider` package with provider-agnostic `ExternalAuthProvider`
- ✅ Firebase Admin SDK-backed provider verifier with session-cookie and revocation support
- ✅ Static fake provider for local/test replacement coverage without Firebase classes
- ✅ `identity_provider_accounts` migration, Prisma model, and local seed links
- ✅ Provider identity to local JP2 user linking by active provider link or verified email
- ✅ `/api/auth/session`, `/api/auth/logout`, `/api/auth/refresh`, and `/api/auth/me`
- ✅ Firebase sign-in Idle approval gate: first-time verified identities stay public-only with 30-day pending review state
- ✅ Protected Candidate, Brother, and Admin Lite APIs return `IDLE_APPROVAL_REQUIRED` for Idle identities before loading private data
- ✅ Missing-session protected access fails closed with `403`, while public consent-backed candidate requests remain unauthenticated
- ✅ Mobile maps Idle approval errors to pending-approval copy while public content stays usable
- ✅ Session cookie creation path with CSRF validation when the provider supports cookies
- ✅ Local inactive/archived user blocking remains enforced by `CurrentUserGuard`
- ✅ Current-user response includes mobile mode, Admin Lite access, membership scope, officer scope, and safe approval state

**Not Yet**:

- ⏳ Auth device tokens and notification preferences (Phase 9 with push)

**Exit criteria**: ✅ Provider verification, local linking, session/logout/refresh handling, inactive-user blocking, fake-provider replacement tests, Firebase Idle approval gate, protected-route Idle denial code, and mobile Idle guidance are implemented

**Next step**: Phase 9 auth device tokens and notification preferences

### Phase 6: Admin Lite Foundation ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Guarded `/api/admin/dashboard` endpoint with scoped identity review, organization-unit, prayer, and event counts
- ✅ Officer dashboard counts reuse server-side admin scope filters; Super Admin gets global counts
- ✅ Guarded `/api/admin/identity-access-reviews` list/detail/confirm/reject/expire endpoints
- ✅ Scoped country/region approver privilege enforced through `identity_access_approver_assignments`; Super Admin can decide globally
- ✅ Identity review confirmation assigns explicit local role/scope and writes audit side effects
- ✅ Admin Lite `/admin/identity-access-reviews` route with API/demo loading, shared DTO validation, and confirm/reject action metadata
- ✅ Admin Lite `/admin/dashboard` route metadata
- ✅ Framework-neutral rendered dashboard document with navigation to sign-in reviews, organization units, prayers, and events
- ✅ Dependency-free HTTP web shell mounts `/admin`, `/admin/dashboard`, `/admin/identity-access-reviews`, `/admin/prayers`, and `/admin/events`
- ✅ Admin dashboard API client, demo fixture, state handling, and route tests
- ✅ Admin Lite `/admin/organization-units` route with API/demo loading, shared DTO validation, demo fixture, and write-action metadata
- ✅ Admin Lite organization-unit create and scoped detail/edit form routes at `/admin/organization-units/new` and `/admin/organization-units/{id}`
- ✅ Organization-unit create/update/archive audit side effects with before/after summaries
- ✅ Mounted Admin Lite app shell with shared navigation, active route state, runtime-mode chrome, and mounted status pages
- ✅ Contract check now requires all currently implemented Phase 3-6 OpenAPI paths

**Not Yet**:

- ⏳ Brother/admin registry workflows beyond implemented Phase 6 foundation (later phases)

**Exit criteria**: ✅ Scoped dashboard, identity review workflow, organization-unit list/detail/form routes, audit side effects, and mounted Admin Lite UI shell exist

**Next step**: Continue Phase 7 admin candidate request UI/client workflow

### Phase 7: Candidate Funnel ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Shared public candidate request DTO/schema with consent-required validation
- ✅ `candidate_requests` Prisma model, migration, active-email uniqueness guard, and local seed fixture
- ✅ `POST /api/public/candidate-requests` unauthenticated endpoint
- ✅ Endpoint stores consent text version/timestamp and returns only request id/status
- ✅ Endpoint supports optional idempotency keys and rate-limits repeated attempts
- ✅ Duplicate active request emails return conflict instead of creating another active request
- ✅ Mobile public join-interest form model and rendered React Native form/confirmation screens
- ✅ Mobile public candidate request API client validates shared request/response schemas
- ✅ Mobile demo fallback submits without backend calls and returns a validated no-PII response
- ✅ Admin `GET /api/admin/candidate-requests` and `GET/PATCH /api/admin/candidate-requests/:id`
- ✅ Admin candidate request reads are server-side scoped: Super Admin global, officers assigned-unit only
- ✅ Admin candidate request updates audit status/assignment/note changes with email/message redaction
- ✅ Admin Lite candidate request API client, list/detail screen models, rendered shell routes, mounted navigation, and demo fallback fixtures
- ✅ Candidate profile persistence foundation with `candidate_profiles` migration, demo fixture, conversion DTO/contract, and guarded `POST /api/admin/candidate-requests/:id/convert`
- ✅ Candidate request conversion creates/reuses invited local user, grants `CANDIDATE`, creates active candidate profile, marks request converted, and writes redacted audit summaries
- ✅ Guarded `GET /api/candidate/dashboard` with active candidate profile enforcement, scoped assigned choragiew/responsible-officer contact fields, candidate-visible event summaries, and no brother-only event visibility
- ✅ Mobile candidate dashboard API client, demo fixture, screen model, and React Native dashboard screen with ready/empty/loading/error/offline/forbidden states
- ✅ Admin `GET /api/admin/candidates`, `GET /api/admin/candidates/:id`, and `PATCH /api/admin/candidates/:id`
- ✅ Admin candidate profile reads are server-side scoped: Super Admin global, officers assigned-unit only
- ✅ Admin candidate profile updates audit active/paused/archive status, assignment, and responsible-officer changes with email redaction
- ✅ Admin Lite candidate profile API client, list/detail screen models, rendered shell routes, mounted navigation, and demo fallback fixtures

**In Progress**:

- ✅ None

**Exit criteria**: ✅ Candidate request API, public form, admin UI foundation, profile persistence, request conversion, candidate dashboard, and admin candidate profile management exist

**Next step**: Phase 8 complete; start Phase 9 events/announcements/push

### Phase 8: Brother Companion Core ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Guarded `GET /api/brother/profile` endpoint with active brother membership enforcement
- ✅ Guarded `GET /api/brother/today` endpoint with personalized cards, active organization units, and brother-safe upcoming event visibility
- ✅ Shared brother profile/today DTO validation and generated OpenAPI schemas
- ✅ Mobile brother profile/today API clients with auth headers, DTO validation, and failure-state mapping
- ✅ Mobile brother demo fixtures and `BrotherToday`/`BrotherProfile` screen models with ready/empty/loading/error/offline/forbidden states
- ✅ Mobile My Chorągiew API client/demo fallback/screen model and React Native screen over `/api/brother/my-organization-units`, rendering scoped organization-unit summaries only
- ✅ Guarded `GET /api/brother/prayers` with active brother enforcement, shared DTO/OpenAPI schema, category/search/language/pagination filters, and published public/family/brother/own-organization-unit visibility
- ✅ Guarded `GET /api/brother/events` with active brother enforcement, shared DTO/OpenAPI schema, `from`/type/pagination filters, and published non-cancelled public/family/brother/own-organization-unit visibility
- ✅ Mobile brother event API client, demo fallback, and `BrotherEvents` screen model with ready/empty/loading/error/offline/forbidden states
- ✅ Admin Lite now has real Next.js/React runtime dependencies, `next dev`, `next build`, and `next start` scripts; the prior dependency-free shell remains available as `dev:http-shell`
- ✅ Nx `admin:build` now runs `next build`, and `next build` verifies every current Admin Lite route as a dynamic App Router route
- ✅ Next.js/App Router Admin Lite route surface mounts through a reusable route adapter that keeps the existing render/client/model layer as the source of truth: `/admin`, `/admin/dashboard`, `/admin/identity-access-reviews`, candidate request list/detail, candidate profile list/detail, organization-unit list/create/detail, prayers, and events
- ✅ Admin route smoke tests cover demo mode without backend calls, dashboard API mode bearer forwarding, identity-access review queue mounting, all current list routes, and dynamic detail/form routes
- ✅ API request-id middleware now normalizes/echoes incoming `x-request-id`, generates missing request ids, exposes them to error responses, and threads request-context ids into audit log writes
- ✅ Candidate request lifecycle transitions are now enforced server-side, conversion requires `invited`, rejection requires an officer note, terminal requests cannot be updated, and Admin Lite actions mirror the allowed follow-up sequence
- ✅ Next App Router handlers forward bearer credentials and session cookies to backend API clients, with tests and production `next start` smoke coverage
- ✅ `pnpm smoke:phase8` boots the compiled API, checks `/api/health`, exercises Admin Lite under `next dev` and production `next start`, validates mobile demo launch, and verifies production demo-mode rejection
- ✅ V1 organization constraints and candidate follow-up expectations are documented without expanding scope

**In Progress**:

- ✅ None

**Post-Phase-8 cleanup/deferred work**:

- Retire `dev:http-shell` only after the next Admin Lite route additions prove App Router parity remains stable.
- Convert framework-neutral Admin Lite HTML renderers to React Server Components only with separate parity tests.
- Choose the pilot logging/metrics destination during release hardening.
- Phase 11 must add Redis TTL/reconnect/duplicate-join/multi-instance tests before silent-prayer realtime sockets.

**Exit criteria**: ✅ Brother Today/profile, assigned organization-unit mobile views, brother prayer/event reads, current Admin Lite route surface under Next.js App Router, request-id propagation, candidate lifecycle enforcement, launch smoke, and production auth/session cookie hardening are complete

**Next step**: Start Phase 9 events/announcements/push

### Phases 4–13: Roadmap

| Phase  | Name                             | Status         | Timeline        |
| ------ | -------------------------------- | -------------- | --------------- |
| **4**  | Public Content: Prayers & Events | ✅ Complete    | Completed May 4 |
| **5**  | Authentication & Modes           | ✅ Complete    | Completed May 4 |
| **6**  | Admin Lite Foundation            | ✅ Complete    | Completed May 5 |
| **7**  | Candidate Funnel                 | ✅ Complete    | Completed May 5 |
| **8**  | Brother Companion Core           | ✅ Complete    | Completed May 6 |
| **9**  | Events/Announcements/Push        | ⏳ Not started | Next            |
| **10** | Formation Roadmap                | ⏳ Not started | After Phase 9   |
| **11** | Silent Online Prayer             | ⏳ Not started | After Phase 10  |
| **12** | Privacy/Security/Audit           | ⏳ Not started | After Phase 11  |
| **13** | Release Hardening & Pilot        | ⏳ Not started | After Phase 12  |

---

## Quality Gate Status

| Gate                     | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Notes                                                                                       |
| ------------------------ | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------------------------------------------------------------------------------------------- |
| **Lint**                 | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm quality` passed                                                                       |
| **Typecheck**            | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm quality` passed                                                                       |
| **Unit tests (80%)**     | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `vitest --coverage`: 90.89% statements / 81.56% branches / 93.08% functions / 91.63% lines  |
| **Integration tests**    | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Brother prayer/event visibility tests, Admin Lite Next route smoke/cookie tests, request-id middleware, and candidate lifecycle tests added |
| **Build**                | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm quality` passed; admin build now runs `next build`                                    |
| **OpenAPI generation**   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Generated contract includes identity access review endpoints                                |
| **Contract check**       | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Contract check requires identity access review endpoints                                    |
| **DB migration check**   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Identity access review migration and seed fixtures included                                 |
| **Demo mode smoke test** | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm smoke:phase8` covers API boot, Admin Next dev/start, mobile demo launch, and production demo rejection |

---

## Current Implementation Progress (from traceability.md)

### What's Implemented

**Phase 2 Foundation** ✅:

- Shared auth/visibility helpers with tests
- Mobile-mode resolution (guest/candidate/brother/officer detection)
- Published-content filtering
- Prisma identity/organization/audit baseline
- Migration checks in CI
- Seed fixtures (super admin, officer, sample members)
- Runtime-mode parsing (api/demo/test)
- API/admin/mobile reject demo mode in production
- Provider-role visibility matrix tests cover guest/candidate/brother/officer/Super Admin

**Phase 3 Complete** ✅:

- Unauthenticated `/api/public/home` endpoint (fallback discovery shell)
- Mobile `PublicHome` screen with state model (ready/empty/loading/error/offline/forbidden)
- Mobile Expo entry point
- Mobile API-mode public-home loader with shared DTO validation and demo-mode fallback
- Public content-page endpoint with `content_pages` migration and `about-order` seed fixture
- Mobile `AboutOrder` API-mode loader and screen with shared DTO validation, demo fallback, and loading/error/offline/empty states
- Generated OpenAPI with contracts: `/api/health`, `/api/public/home`, `/api/public/content-pages/{slug}`, auth session endpoints, `/api/auth/me`, org unit endpoints
- `/api/brother/my-organization-units` (returns summaries only)
- `/api/admin/organization-units` (scoped listing + super admin CRUD)

**Phase 4 Complete** ✅:

- Public prayer library API and public event API reads
- Public prayer/event read endpoints with visibility-filtered repositories and representative seed fixtures
- Generated OpenAPI includes public prayer/event endpoints
- Mobile public prayer and event list/detail views with API-mode DTO validation, demo fallback, and loading/error/offline/empty states
- Admin prayer API CRUD with scoped listing, Super Admin writes, and archive-by-status
- Admin event API CRUD with scoped listing/writes and publish/cancel/archive status handling
- Admin prayer/event audit side effects added for create/update workflows
- Admin app prayer/event API client and list action workflow models added
- Admin prayer/event rendered HTML templates added from workflow models
- Admin shell routes for `/admin/prayers` and `/admin/events` added
- Public content visibility enforcement added for public prayer/event reads

**Phase 5 Complete** ✅:

- Reusable `@jp2/auth-provider` library with provider-agnostic contract
- Firebase Admin SDK provider verifier with session-cookie/revocation support
- Static fake provider for replacement tests
- `identity_provider_accounts` migration and demo seed links
- API-side provider-account linking and local user resolution
- `/api/auth/session`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`
- Firebase sign-in Idle approval gate keeps new provider identities public-only with 30-day review state
- Protected Candidate/Brother/Admin Lite routes reject Idle identities with `IDLE_APPROVAL_REQUIRED` before private repository reads
- Missing-session protected routes return `403`; public consent-backed candidate requests stay unauthenticated and validation-gated
- Mobile public launch and private content clients render Idle approval guidance while preserving public content access
- Session-cookie creation with CSRF validation and logout cookie clearing
- Current-user response includes mode, Admin Lite access, membership scope, officer scope, and approval state

**Phase 6 Complete** ✅:

- Guarded `/api/admin/dashboard` endpoint added for scoped admin counts and task links, including pending identity reviews
- Guarded `/api/admin/identity-access-reviews` list/detail/confirm/reject/expire endpoints added
- Admin Identity Access Review DTOs, OpenAPI schema, API client, demo fixture, rendered HTML document, route metadata, and web-shell mount added
- Dashboard counts reuse existing admin prayer/event scope filters
- Admin dashboard DTO, OpenAPI schema, API client, demo fixture, screen model, rendered HTML document, and route metadata added
- Admin web shell mounts implemented dashboard/content routes over HTTP and keeps API/demo mode separation
- Admin organization-unit API client, demo fixture, rendered list/detail/form routes, web-shell mount, and audit side effects added
- Mounted Admin Lite app shell wraps implemented admin routes with shared navigation, active state, runtime-mode chrome, and mounted status pages
- Contract check expanded to require the full currently implemented OpenAPI path set

**Phase 7 Complete** ✅:

- Shared public candidate request DTO/schema added with required consent acceptance
- `candidate_requests` Prisma model, migration, active-email uniqueness guard, and local seed fixture added
- `POST /api/public/candidate-requests` added with no-auth access, consent metadata persistence, idempotency keys, repeated-attempt rate limiting, duplicate active email conflict, and no-PII response
- Mobile join-interest form model/client/demo fallback and safe confirmation screen added
- Admin candidate request list/detail/update API added with officer scope filtering and redacted audit summaries
- Admin Lite candidate request API client, list/detail screen models, rendered route shell, mounted navigation, and demo fallback fixture added
- Candidate profile persistence and `POST /admin/candidate-requests/:id/convert` added with scoped conversion, local candidate account creation/reuse, `CANDIDATE` role grant, and redacted audit summary
- Candidate dashboard foundation added with `GET /candidate/dashboard`, active-profile enforcement, scoped assignment/contact data, candidate-visible events, mobile API/demo client, screen model, and React Native screen
- Admin candidate profile management added with guarded list/detail/update API, scoped officer reads, audited status/assignment/responsible-officer updates, Admin Lite client/screen/shell routes, mounted navigation, and demo fallback

**Phase 8 Complete** ✅:

- Brother profile API added with own active profile, active memberships, roles, current degree, join date, and read-only critical data
- Brother Today API added with personalized cards, active organization units, and upcoming events filtered to public/family/brother/own-organization-unit visibility
- Mobile brother profile/today API clients, demo fixtures, and screen models added with shared DTO validation and state handling
- Mobile My Chorągiew API client, demo fixture, React Native screen, and screen model added over `/brother/my-organization-units`; it renders organization-unit summaries only and no brother roster
- Brother prayer API added with guarded `/brother/prayers`, shared DTO/OpenAPI schema, and published public/family/brother/own-organization-unit visibility filtering
- Brother event API added with guarded `/brother/events`, shared DTO/OpenAPI schema, published non-cancelled public/family/brother/own-organization-unit visibility filtering, and mobile API/demo/screen model coverage
- Admin Lite now has a real Next.js App Router runtime for the current implemented route surface, preserving current API/client/DTO/model/fixture behavior through the shared route adapter
- API request-id generation/propagation, candidate request lifecycle enforcement, App Router cookie forwarding, launch smoke checks, V1 organization constraints, and candidate follow-up expectations are complete
- Deferred hardening remains scoped to later phases: realistic seed/load expansion, Phase 11 Redis realtime tests, pilot logging/metrics destination, and optional Admin Lite renderer cleanup

---

## Critical Path & Milestones

### Immediate (Next 1–2 commits)

1. **Phase 6 Admin Lite foundation**
   - [x] Add scoped dashboard route and navigation around implemented admin content routes
   - [x] Add guarded scoped dashboard API
   - [x] Mount dependency-free Admin Lite HTTP web shell around implemented rendered routes
   - [x] Add organization-unit rendered list route and audit side effects
   - [x] Keep officer/Super Admin access server-side scoped
   - [x] Add organization-unit detail/form rendering beyond list action metadata
   - [x] Mount full Admin Lite UI target

2. **Start Phase 7 Candidate Funnel**
   - [x] Add candidate request public DTO/schema and API contract
   - [x] Add `candidate_requests` persistence and seed/test fixtures
   - [x] Add public join-interest form model/client/demo fallback
   - [x] Add admin candidate request management API
   - [x] Add admin candidate request client/screen/demo fallback
   - [x] Add candidate profile persistence and conversion foundation
   - [x] Add candidate dashboard/profile activation foundation
   - [x] Add admin candidate profile list/detail management foundation

3. **Maintain completed Phase 3–6 foundation**
   - [x] Connect mobile PublicHome to real `/api/public/home`
   - [x] Public About content table/endpoint seeded
   - [x] Integrate mobile AboutOrder with public content-page API loading
   - [x] Phase 4 content tables created (prayers, events)
   - [x] Phase 5 provider adapter and auth session endpoints
   - [x] Update this dashboard after changes

4. **Production-readiness review hardening**
   - [x] Plan and complete the Next.js/App Router Admin Lite runtime for the current implemented route surface, reusing existing admin API clients, DTO schemas, screen models, and fixtures
   - [x] Add brother event read API/client/screen model coverage for Phase 8 companion parity
   - [x] Add request-id middleware/interceptor and thread the generated id through error responses and audit log writes
   - [x] Define and enforce candidate request status transitions, rejection-note requirements, terminal request behavior, and conversion preconditions
   - [x] Add Next `dev/start` smoke checks and production auth/session cookie checks for the App Router handlers
   - [x] Decide `dev:http-shell` remains a short-term compatibility fallback; retirement is post-Phase-8 cleanup after future route parity stays stable
   - [x] Defer framework-neutral Admin Lite renderer conversion to React Server Components until a separate parity-tested cleanup task
   - [x] Add smoke targets for API boot, Admin Lite mounted routes, mobile demo launch, and production-mode demo rejection
   - [x] Document V1 organization constraints explicitly: no hierarchy-derived permissions, no cross-unit rollups, no read replicas, and no `/v2` routes without owner approval
   - [x] Document pilot candidate follow-up timeline expectations
   - [ ] Expand realistic seed/load fixtures across multiple chorągwie, roles, inactive users, archived records, and visibility levels
   - [ ] Queue Phase 11 Redis TTL/reconnect/duplicate-join/multi-instance tests for silent prayer before implementing realtime sockets

### Medium Term (Next 5–10 commits)

3. **Phase 4: Public Content**
   - [x] Prayer library API
   - [x] Event API
   - [x] Public prayer/event mobile list screens
   - [x] Public prayer/event mobile detail screens
   - [x] Admin prayer list/create/patch API
   - [x] Admin event API
   - [x] Admin workflow models/API clients for prayer/event management
   - [x] Rendered Admin Lite prayer/event templates
   - [x] Admin shell/route integration for rendered screens
   - [x] Admin audit workflows for prayer/event mutations

4. **Phase 5: Authentication**
   - [x] Firebase provider adapter
   - [x] Login/logout/session API flow
   - [x] Mode switching based on role
   - [x] Firebase sign-in Idle approval gate with 30-day expiry and country/region admin confirmation

---

## How to Keep This Dashboard Current

### After Each Phase Completion

1. **Update traceability.md** with what's done (canonical source)
2. **Update this file** (IMPLEMENTATION_STATUS.md):
   - Update phase status (✅ COMPLETE / 🟡 IN PROGRESS / ⏳ PENDING)
   - Update progress percentage
   - Update progress bar
   - Update completed/in-progress/not-yet sections
   - Update exit criteria status
   - Add commit reference

### Example Commit

```bash
git add <code changes>
git add docs/traceability.md          # Update canonical source
git add docs/delivery/IMPLEMENTATION_STATUS.md  # Update visual dashboard

git commit -m "Phase 3: Implement public discovery.
- Add public prayer/event content tables
- Implement prayer library API
- Implement event API
- Update traceability.md and IMPLEMENTATION_STATUS.md"
```

### Weekly Status Review

Every week (or per phase):

1. Check [docs/traceability.md](../traceability.md) for actual progress
2. Update the tables and sections in this file
3. Keep progress bars visually accurate
4. Update "Next step" fields

---

## Synchronization Rules

**GOLDEN RULE**: If traceability.md changes, update this file.

| Change Type               | Action                                              |
| ------------------------- | --------------------------------------------------- |
| New requirement completed | Update phase section + progress bar + exit criteria |
| Phase finished            | Mark phase as ✅ COMPLETE, set progress to 100%     |
| Phase started             | Mark phase as 🟡 IN PROGRESS, set progress > 0%     |
| Quality gate changes      | Update quality gate status table                    |
| Milestones achieved       | Update "Critical Path" section                      |
| Commits added             | Add to phase history/timeline                       |

---

## Legend

| Symbol | Meaning                  |
| ------ | ------------------------ |
| ✅     | Complete / Passing / Met |
| 🟡     | In Progress / Partial    |
| ⏳     | Pending / Not Started    |
| ░░░░   | Progress bar (empty)     |
| ████   | Progress bar (filled)    |

---

## Quick Links

- **Detailed requirements & mapping**: [docs/traceability.md](../traceability.md)
- **Phase roadmap**: [docs/delivery/implementation-roadmap.md](implementation-roadmap.md)
- **Phase exit criteria**: [docs/delivery/phase-breakdown.md](phase-breakdown.md)
- **Quality requirements**: [docs/agent/quality-gates.md](../agent/quality-gates.md)
- **How to keep in sync**: [docs/STATUS_CONSOLIDATION_GUIDE.md](../STATUS_CONSOLIDATION_GUIDE.md)

---

**Last Updated**: May 6, 2026
**Current Phase**: Phase 9 pending; Phases 0–8 complete
**Next Major Milestone**: Start events/announcements/push
