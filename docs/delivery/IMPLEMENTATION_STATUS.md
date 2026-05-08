# Implementation Status Dashboard

**LIVE PROGRESS TRACKER — Visual Status of All 13 Phases**

Updated: May 8, 2026
Canonical source: [docs/traceability.md](../traceability.md)  
Synchronization rule: Update this dashboard whenever traceability.md is updated

---

## Executive Summary

| Phase     | Status         | Progress | Completeness         | Key Outputs                                                                                                                                                                                                       | Next Step                                                              |
| --------- | -------------- | -------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **0**     | ✅ COMPLETE    | 100%     | ████████████████████ | Scope, roles, visibility                                                                                                                                                                                          | —                                                                      |
| **1**     | ✅ COMPLETE    | 100%     | ████████████████████ | Monorepo, apps, CI, gates                                                                                                                                                                                         | —                                                                      |
| **2**     | ✅ COMPLETE    | 100%     | ████████████████████ | Prisma, auth helpers, filters, visibility matrix                                                                                                                                                                  | —                                                                      |
| **3**     | ✅ COMPLETE    | 100%     | ████████████████████ | `/api/public/home`, public content pages, live PublicHome/About loading                                                                                                                                           | Phase 4 public content views                                           |
| **4**     | ✅ COMPLETE    | 100%     | ████████████████████ | Public APIs, mobile views, admin APIs, audit, admin shell routes                                                                                                                                                  | —                                                                      |
| **5**     | ✅ COMPLETE    | 100%     | ████████████████████ | Provider adapter, Firebase verifier, provider links, auth session API, Idle approval gate                                                                                                                         | —                                                                      |
| **6**     | ✅ COMPLETE    | 100%     | ████████████████████ | Scoped dashboard API, sign-in review workflow, org-unit routes/audit, mounted Admin Lite shell                                                                                                                    | —                                                                      |
| **7**     | ✅ COMPLETE    | 100%     | ████████████████████ | Candidate request API, mobile form, admin workflow, profile conversion, candidate dashboard, admin candidate profiles                                                                                             | —                                                                      |
| **8**     | ✅ COMPLETE    | 100%     | ████████████████████ | Brother profile, Brother Today, My Chorągiew, brother prayer/event APIs, Admin Lite Next runtime, request-id/lifecycle/smoke hardening                                                                            | Phase 9                                                                |
| **9**     | ✅ COMPLETE    | 100%     | ████████████████████ | Candidate/brother event reads, mobile event/announcement models, event participation intent API, announcement read APIs, admin announcement API/UI, notification prefs/device tokens, announcement push dispatch  | Phase 10                                                               |
| **10**    | 🟡 IN PROGRESS | 50%      | ██████████░░░░░░░░░░ | V1 Figma/RBAC alignment started; mobile shell split complete; Figma cache, Gold/Grey tokens, auth-entry styling, Candidate Events list/detail, Candidate Announcements, Brother Today, Brother Events, Brother Event Detail, Brother Announcements, Brother Prayer Library, and responsive Admin Lite Candidate Requests complete; formation roadmap next in same phase | Continue native/provider sign-in and Organization Unit Detail |
| **11–13** | ⏳ PENDING     | 0%       | ░░░░░░░░░░░░░░░░░░░░ | Silent prayer, privacy/security hardening, pilot                                                                                                                                                                  | After Phase 10                                                         |

---

## Phase 10A: V1 Figma/RBAC Alignment 🟡

**Status**: IN PROGRESS (approved V1 scope; documentation/planning complete, mobile shell split complete)

**Current source**: [docs/design-updates/06-figma-implementation-plan.md](../design-updates/06-figma-implementation-plan.md)

**Completed in this documentation pass**:

- ✅ Owner approved design-update/Figma alignment as V1 scope on May 7, 2026
- ✅ Read the `docs/design-updates` package and compared it with canonical roles, visibility, and Phase 9 implementation status
- ✅ Recorded inspected Figma priority frames: `Sign In (Gold/Grey)` node `1:2`, `Candidate Events (Gold/Grey)` node `1:47`, `Brother Today (Gold/Grey)` node `1:177`, and `Candidate Requests (Gold/Grey)` node `1:1635`
- ✅ Added the screen-by-screen implementation matrix covering current implementation, exact next screen/component targets, and RBAC constraints
- ✅ Documented why the mobile app currently concentrates orchestration in `apps/mobile/src/App.tsx`, why that is acceptable only as a short-term Phase 0-9 bridge, and why Phase 10A should split the shell before adding more Figma-specific screens
- ✅ Aligned design-role docs with canonical stored roles: `CANDIDATE`, `BROTHER`, `OFFICER`, `SUPER_ADMIN`; `GUEST` and `IDLE` are runtime states; family member remains future/V2
- ✅ Documented that Officer/Super Admin management stays Admin Lite web-first in V1; Figma mobile-sized admin frames inform responsive Admin Lite design and do not authorize an Expo officer mode
- ✅ Updated V1 scope, out-of-scope, V2 backlog, phase breakdown, roadmap, traceability, and this dashboard to place the work in Phase 10A
- ✅ Split the Expo mobile root so `App.tsx` is a thin composition root and public/candidate/brother route surfaces own loaders, selected IDs, join-request state, and event participation actions
- ✅ Added mobile route-group guards and regression coverage that prevents candidate/brother/join-request orchestration from moving back into `App.tsx`
- ✅ Added documented typography roles to shared design tokens and applied them to current mobile shell screens in place of local title/button typography values
- ✅ Extracted upgraded Figma priority-frame screenshots and frame-derived colors, typography, spacing, radius, and shadow values into `docs/design-updates/figma-cache`
- ✅ Added Figma-derived Gold/Grey semantic color, border, radius, shadow, action, and Work Sans typography tokens to shared design tokens
- ✅ Added mobile Sign In and Idle Approval screen foundations as public routes with token-backed React Native screens, safe approval-state copy, and no client-side private role granting
- ✅ Applied the extracted Gold/Grey auth shell to mobile Sign In and Idle Approval; owner direction now clarifies V1 Sign In should adapt the Figma form into Google/Gmail Firebase provider entry rather than email/password credentials
- ✅ Extended `/api/candidate/events` list items with the signed-in candidate's own `currentUserParticipation` intent only, keeping server-side candidate visibility filters and no participant-list exposure
- ✅ Replaced the generic Candidate Events mobile renderer with a dedicated Gold/Grey React Native screen matching the Figma event-card/header/bottom-nav structure and routing RSVP actions through the existing participation API
- ✅ Replaced the generic Brother Today mobile renderer with a dedicated Gold/Grey React Native screen matching the Figma profile summary, quick-action grid, upcoming action cards, organization-unit cards, and brother bottom-nav structure over the existing guarded `/api/brother/today` contract
- ✅ Extracted repeated Candidate Events/Brother Today mobile chrome into `apps/mobile/src/screens/shared` with one filename-matched exported `function` React Native component per file, no extra local PascalCase component definitions, and an inventory README to prevent duplicated headers, nav, state panels, icons, and status components
- ✅ Added `docs/agent/component-boundary-contracts.md` so new Phase 10A screens, route surfaces, API/demo sources, and reusable components declare ownership before root or shell files grow
- ✅ Split mobile screen model builders into one file per screen and reduced `public-screens.ts`, `candidate-screens.ts`, and `brother-screens.ts` to re-export barrels with regression coverage
- ✅ Split Admin Lite multi-screen model files into one file per list/detail/editor screen and reduced the old aggregate files to compatibility barrels with regression coverage
- ✅ Removed nonzero mobile React Native component letter-spacing, added a regression rule for it, disabled unimplemented Candidate Events bottom-navigation destinations instead of routing them to Dashboard, and raised mobile branch coverage above 80%
- ✅ Replaced generic Candidate Event Detail rendering with a dedicated Gold/Grey React Native screen for type, date, time, location, safe description, own RSVP status, and plan/cancel intent actions with no participant-list exposure
- ✅ Replaced generic Candidate Announcements rendering with a dedicated Gold/Grey React Native list screen for pinned one-way announcement cards, published dates, and body copy with no chat/comments/read receipts
- ✅ Replaced generic Brother Events rendering with a dedicated Gold/Grey React Native list screen for brother-visible event cards, type/date/time/location/visibility metadata, bottom navigation, and detail actions with no attendee-list or roster exposure
- ✅ Replaced remaining generic Brother Event Detail and Brother Announcements renderers with dedicated Gold/Grey React Native screens for own participation actions, one-way announcement cards, shared mobile chrome, and no attendee lists, rosters, chat/comments, read receipts, or push-delivery state
- ✅ Added SOLID/Clean Architecture implementation rules and centralized Admin Lite access/scope plus admin/mobile API request primitives to reduce duplicated policy and client plumbing during Phase 10A growth
- ✅ Restyled Admin Lite Candidate Requests from the Figma `1:1635` frame as responsive web, including scoped status metric cards, candidate cards, message previews from the server-side admin list contract, status badges, and Gold/Grey detail forms
- ✅ Added a launchable Brother Prayer Library mobile screen over `/api/brother/prayers`, with API/demo loading, shared DTO validation, Gold/Grey prayer cards, categories, visibility badges, and no prayer tracking or participant-list behavior

**In Progress**:

- 🟡 Wire the actual native/provider sign-in flow once the mobile provider UX is selected
- 🟡 Add the remaining V1 launchable Organization Unit Detail mobile surface for already implemented organization-unit data

**Scope guard**: This workstream is now V1 scope. It still does not add chat, payments, maps, analytics, hierarchy-derived permissions, authenticated family accounts, or a native Expo officer/admin app.

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

- ✅ Mobile brother event detail and participation intent screen model (Phase 9)
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
- ✅ `pnpm smoke:launch` boots the compiled API, checks `/api/health`, exercises Admin Lite under `next dev` and production `next start`, validates mobile demo launch, and verifies production demo-mode rejection
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

### Phase 9: Events, Announcements & Push ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ `event_participation` persistence with partial unique active `(event_id, user_id)` index
- ✅ Guarded `GET /api/brother/events/:id` event detail with description and only the current user's own active participation intent
- ✅ Guarded `POST /api/candidate/events/:id/participation` and `DELETE /api/candidate/events/:id/participation`
- ✅ Guarded `POST /api/brother/events/:id/participation` and `DELETE /api/brother/events/:id/participation`
- ✅ Mobile `BrotherEventDetail` API/demo screen model with authenticated detail client, plan/cancel participation clients, current-user intent copy, and action metadata
- ✅ Participation creation verifies active candidate/brother profile and server-side event visibility before writing
- ✅ Duplicate active participation intents return the existing planning intent; cancellation is limited to the current user's active intent
- ✅ Shared participation response DTO/OpenAPI schema returns no participant lists
- ✅ Focused service/repository/controller/shared DTO tests added for event-detail visibility, own-participation exposure, duplicate, cancellation, and idle/profile denial paths
- ✅ Guarded `GET /api/candidate/events` and `GET /api/candidate/events/:id` with active-profile checks, shared DTO/OpenAPI schemas, server-side candidate visibility filtering, and own active participation intent only on detail
- ✅ Mobile `CandidateEvents` and `CandidateEventDetail` API/demo screen models with authenticated list/detail clients, candidate plan/cancel participation clients, own intent copy, and action metadata
- ✅ `announcements` persistence, migration, and local candidate/brother seed fixtures
- ✅ Guarded `GET /api/candidate/announcements` and `GET /api/brother/announcements` with active-profile checks, shared DTO/OpenAPI schemas, pinned ordering, and server-side candidate/brother visibility filtering
- ✅ Guarded `GET /api/admin/announcements`, `POST /api/admin/announcements`, and `PATCH /api/admin/announcements/:id` with shared DTO/OpenAPI schemas, server-side officer scope filtering, scoped officer writes, Super Admin global management, publish/archive lifecycle timestamps, and body-redacted audit summaries
- ✅ Mobile `CandidateAnnouncements` and `BrotherAnnouncements` API/demo screen models with authenticated clients, shared DTO validation, parsed demo fixtures, ready/empty/loading/error/offline/forbidden/idle-approval states, and one-way message rendering without chat, comments, read receipts, push delivery state, or participant lists
- ✅ Admin Lite `/admin/announcements` Next.js route and mounted shell navigation with shared announcement DTO validation, API/demo loading, parsed demo fixture, list renderer, scoped write-state action metadata, and one-way management UI without chat/comments/read receipts/push delivery state
- ✅ Admin Lite `/admin/announcements/new` and `/admin/announcements/:id` editor routes with write-gated create, API/demo detail resolution from the scoped list contract, readonly fields for non-writers, 404 scoped misses, save/publish/archive action metadata, and no push delivery state rendering
- ✅ `device_tokens` and `notification_preferences` persistence, shared DTO/OpenAPI schemas, guarded `POST /api/auth/device-tokens`, guarded `PUT /api/auth/notification-preferences`, duplicate token ownership transfer by token hash, no raw token return, candidate/brother self-scoped preferences with defaults, and a no-op push adapter boundary
- ✅ Announcement first-publication push dispatch wiring resolves recipients server-side from active candidate/brother role plus profile/membership scope, announcement visibility, active non-revoked device tokens, and announcement notification preferences; dispatch uses generic copy, deep links by announcement id, configured push adapter boundary, and operational audit counts only
- ✅ Mobile Expo API-mode private routing now resolves `/api/auth/me` with optional bearer credentials, maps the current-user DTO into shared mobile mode resolution, and mounts the implemented candidate/brother private dashboard, event, announcement, profile, My Chorągiew, and participation-detail surfaces

**In Progress**:

- ✅ None

**Not Yet**:

- ✅ None

**Exit criteria**: ✅ Candidate/brother event read, participation, announcement read foundation, mobile announcement screen models, admin announcement API/UI, notification preferences, device tokens, push adapter boundary, and audience-safe announcement publish dispatch are in place

**Next step**: Implement Phase 10A Figma/RBAC alignment, then continue Phase 10B formation roadmap

### Phases 4–13: Roadmap

| Phase  | Name                                     | Status         | Timeline        |
| ------ | ---------------------------------------- | -------------- | --------------- |
| **4**  | Public Content: Prayers & Events         | ✅ Complete    | Completed May 4 |
| **5**  | Authentication & Modes                   | ✅ Complete    | Completed May 4 |
| **6**  | Admin Lite Foundation                    | ✅ Complete    | Completed May 5 |
| **7**  | Candidate Funnel                         | ✅ Complete    | Completed May 5 |
| **8**  | Brother Companion Core                   | ✅ Complete    | Completed May 6 |
| **9**  | Events/Announcements/Push                | ✅ Complete    | Completed May 7 |
| **10** | Figma/RBAC Alignment + Formation Roadmap | 🟡 In progress | Current         |
| **11** | Silent Online Prayer                     | ⏳ Not started | After Phase 10  |
| **12** | Privacy/Security/Audit                   | ⏳ Not started | After Phase 11  |
| **13** | Release Hardening & Pilot                | ⏳ Not started | After Phase 12  |

---

## Quality Gate Status

| Gate                     | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Notes                                                                                                                                                                                                                                            |
| ------------------------ | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lint**                 | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Phase 10A Admin Lite Candidate Requests slice passed `pnpm quality` lint                                                                                                                                                                        |
| **Typecheck**            | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Phase 10A Admin Lite Candidate Requests slice passed `pnpm quality` typecheck                                                                                                                                                                   |
| **Unit tests (80%)**     | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `vitest --coverage`: 92.64% statements / 82.55% branches / 94.92% functions / 93.03% lines                                                                                                                                                     |
| **Integration tests**    | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Candidate/brother event read, participation, announcement read, mobile private routing/renderer, Brother Prayer Library mobile route/rendering, Admin Lite Candidate Requests responsive list/detail rendering, admin announcement API/list/editor UI, notification preference/device-token, and push recipient dispatch coverage |
| **Build**                | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Phase 10A Admin Lite Candidate Requests slice passed `pnpm quality` build                                                                                                                                                                       |
| **OpenAPI generation**   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Generated contract includes the Admin Candidate Request list `messagePreview` field plus existing candidate/brother event, participation, announcement, admin announcement, and auth notification endpoints                                      |
| **Contract check**       | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Contract check passed after regenerating `generated/openapi.json`                                                                                                                                                                               |
| **DB migration check**   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Prisma schema and migration baseline validate                                                                                                                                                                                                   |
| **Demo mode smoke test** | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Launch smoke passed after localhost bind escalation                                                                                                                                                                                              |

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

**Phase 9 Complete** ✅:

- Brother event detail API added with active-profile checks, server-side event visibility, and own active participation intent only
- Mobile BrotherEventDetail screen model and authenticated API clients added for event detail plus brother plan/cancel participation actions
- Event participation intent persistence and candidate/brother mutation APIs added with active-profile checks, server-side event visibility, duplicate active intent handling, own-intent cancellation, and no participant list exposure
- Candidate event list/detail API added with active-profile checks, server-side candidate visibility, shared DTO/OpenAPI schemas, and own active participation intent only on detail
- Mobile CandidateEvents/CandidateEventDetail screen models and authenticated API clients added for candidate event list/detail plus candidate plan/cancel participation actions
- Candidate and brother announcement read APIs added with `announcements` persistence, shared DTO/OpenAPI schemas, active-profile checks, pinned ordering, server-side audience/scope filtering, and no comments/read receipts/push delivery details
- Admin announcement management API/UI, notification preferences, device-token registration, and announcement first-publish push dispatch are complete with server-side recipient resolution and operational audit counts
- Mobile Expo entry point now resolves authenticated candidate/brother mode from `/auth/me` and mounts the implemented private screen models through a shared private renderer

**Phase 10A In Progress** 🟡:

- Owner-approved V1 Figma/RBAC alignment is now tracked in `docs/design-updates/06-figma-implementation-plan.md`
- V1 scope/out-of-scope/V2 backlog docs now place Gold/Grey visual parity, dedicated member screens, responsive Admin Lite parity, and role/RBAC UI-state alignment inside V1
- The mobile shell split is complete: `apps/mobile/src/App.tsx` now delegates to public/candidate/brother route surfaces, and those surfaces own routing loaders, selected IDs, join-request state, and event participation actions
- Mobile route-group guards and regression tests now keep candidate/brother/join-request orchestration out of the root composition component
- Local Figma cache now stores priority-frame screenshots and extracted Gold/Grey colors, Work Sans typography, spacing, radius, and shadow values under `docs/design-updates/figma-cache`
- Shared typography and Gold/Grey semantic tokens now cover display, screen title, section title, body, secondary, label, button, action, border, radius, and shadow roles
- Mobile Sign In and Idle Approval screen foundations are now mounted in the public route surface with the extracted Gold/Grey auth shell; Idle users can inspect approval state without private roles/scopes, and provider credential submission remains explicitly pending
- Candidate Events now has a dedicated Figma-aligned mobile screen. Its list API returns only the current user's own participation intent for RSVP badge/action state and does not expose participant lists.
- Candidate Event Detail now has a dedicated Figma-aligned mobile screen over the existing guarded detail and participation APIs, with date/time/location sections, safe description, and only the current user's own RSVP status/action.
- Candidate Announcements now has a dedicated Figma-aligned mobile list screen over the existing guarded announcements API, with pinned one-way cards and no chat/comments/read receipts/push delivery state.
- Brother Today now has a dedicated Figma-aligned mobile screen over the existing guarded `/api/brother/today` contract, including profile summary, quick actions, brother-visible event cards, organization-unit cards, and no roster/participant-list exposure.
- Brother Events now has a dedicated Figma-aligned mobile list screen over the existing guarded `/api/brother/events` contract, including type/date/time/location/visibility metadata, detail navigation, and no attendee-list or roster exposure.
- Mobile Phase 10A UI rule coverage now prevents nonzero React Native component letter-spacing and keeps Candidate Events bottom navigation honest by disabling unavailable destinations instead of faking routes.
- Admin Lite Candidate Requests now uses responsive Gold/Grey metric cards, candidate cards, status badges, and detail follow-up forms over the existing server-scoped admin API. The list contract now includes a bounded `messagePreview`; no officer scope or private filtering moved client-side.
- Brother Prayer Library now has API/demo mobile loading and a dedicated Gold/Grey React Native screen over the guarded `/api/brother/prayers` contract, rendering server-filtered categories and prayer cards without adding tracking, participant lists, chat/comments, or client-side visibility filtering.
- Phase 10 is split operationally into 10A Figma/RBAC alignment and 10B Formation Roadmap so visual parity lands before pilot hardening

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

5. **Start Phase 10A Figma/RBAC Alignment**
   - [x] Add owner-approved V1 scope update for Figma/RBAC alignment
   - [x] Add exact implementation plan with Figma nodes, screen targets, and RBAC constraints
   - [x] Document mobile `App.tsx` concentration, the short-term rationale, and the Phase 10A shell-split sequence
   - [x] Split the Expo root into thin composition plus public/candidate/brother route groups before adding more Figma-specific private screens
   - [x] Add documented shared typography roles and apply them to current mobile shell screens
   - [x] Add public Sign In and Idle Approval screen foundations
   - [x] Add component boundary contracts to keep future screens and route surfaces split by responsibility
   - [x] Split mobile screen model builders into dedicated per-screen files; keep plural screen files as barrels only
   - [x] Split Admin Lite aggregate screen model files into dedicated per-screen files; keep aggregate screen files as barrels only
   - [x] Extract exact Figma Gold/Grey frame values/screenshots for priority frames and cache them locally
   - [x] Add shared Gold/Grey semantic color tokens
   - [x] Build Figma-matched Sign In and Idle approval shell styling once exact visual values are available
   - [ ] Wire native/provider sign-in submission
   - [x] Replace generic Candidate Events renderer with a dedicated RN screen backed by list-level own RSVP state
   - [x] Replace generic Candidate Event Detail renderer with a dedicated RN screen backed by detail-level own RSVP state
   - [x] Replace generic Candidate Announcements renderer with a dedicated RN screen backed by candidate-visible one-way announcement state
   - [x] Replace generic Brother Today renderer with a dedicated RN screen
   - [x] Replace generic Brother Events renderer with a dedicated RN screen
   - [x] Apply shared header/card/bottom-nav system to remaining brother detail/announcement surfaces
   - [x] Restyle Admin Lite Candidate Requests as responsive web from the Figma frame
   - [x] Add Brother Prayer Library mobile surface over the existing guarded prayer list contract
   - [ ] Add Organization Unit Detail mobile surface without brother roster exposure

6. **Start Phase 10B Formation Roadmap**
   - [ ] Add localization foundation: shared translation-key contract/adapter, default English catalog, and mobile/admin helpers so new Phase 10B UI copy is not hardcoded
   - [ ] Define roadmap data tables/contracts from the canonical phase scope
   - [ ] Add candidate/brother roadmap read APIs and screen models
   - [ ] Add admin roadmap submission review workflow
   - [x] Add smoke targets for API boot, Admin Lite mounted routes, mobile demo launch, and production-mode demo rejection
   - [x] Document V1 organization constraints explicitly: no hierarchy-derived permissions, no cross-unit rollups, no read replicas, and no `/v2` routes without owner approval
   - [x] Document pilot candidate follow-up timeline expectations
   - [ ] Expand realistic seed/load fixtures across multiple chorągwie, roles, inactive users, archived records, and visibility levels
   - [ ] Replace hardcoded user-facing copy in Phase 10B-touched mobile/admin screens with localization keys while preserving approved content loaded from content tables
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

**Last Updated**: May 7, 2026
**Current Phase**: Phase 10A Figma/RBAC alignment in progress; Phases 0–9 complete
**Next Major Milestone**: Implement V1 Figma/RBAC screen and token alignment
