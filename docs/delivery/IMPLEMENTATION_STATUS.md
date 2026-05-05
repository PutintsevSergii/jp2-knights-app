# Implementation Status Dashboard

**LIVE PROGRESS TRACKER — Visual Status of All 13 Phases**

Updated: May 5, 2026
Canonical source: [docs/traceability.md](../traceability.md)  
Synchronization rule: Update this dashboard whenever traceability.md is updated

---

## Executive Summary

| Phase    | Status         | Progress | Completeness         | Key Outputs                                                                                 | Next Step                              |
| -------- | -------------- | -------- | -------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| **0**    | ✅ COMPLETE    | 100%     | ████████████████████ | Scope, roles, visibility                                                                    | —                                      |
| **1**    | ✅ COMPLETE    | 100%     | ████████████████████ | Monorepo, apps, CI, gates                                                                   | —                                      |
| **2**    | ✅ COMPLETE    | 100%     | ████████████████████ | Prisma, auth helpers, filters, visibility matrix                                            | —                                      |
| **3**    | ✅ COMPLETE    | 100%     | ████████████████████ | `/api/public/home`, public content pages, live PublicHome/About loading                     | Phase 4 public content views           |
| **4**    | ✅ COMPLETE    | 100%     | ████████████████████ | Public APIs, mobile views, admin APIs, audit, admin shell routes                            | —                                      |
| **5**    | ✅ COMPLETE    | 100%     | ████████████████████ | Provider adapter, Firebase verifier, provider links, auth session API                       | —                                      |
| **6**    | ✅ COMPLETE    | 100%     | ████████████████████ | Scoped dashboard API, org-unit routes/audit, mounted Admin Lite shell                       | —                                      |
| **7**    | 🟡 IN PROGRESS | ~85%     | █████████████████░░░ | Candidate request API, mobile form, admin workflow, profile conversion, candidate dashboard | Add admin candidate profile management |
| **8–13** | ⏳ PENDING     | 0%       | ░░░░░░░░░░░░░░░░░░░░ | Brother, events/announcements, roadmap, silent prayer, hardening                            | After Phase 7                          |

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

- ⏳ Brother-visible prayer/event APIs (Phase 8/9)
- ⏳ Participation intent (Phase 9)

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
- ✅ Session cookie creation path with CSRF validation when the provider supports cookies
- ✅ Local inactive/archived user blocking remains enforced by `CurrentUserGuard`
- ✅ Current-user response includes mobile mode, Admin Lite access, membership scope, and officer scope

**Not Yet**:

- ⏳ Auth device tokens and notification preferences (Phase 9 with push)
- ⏳ Candidate funnel workflows (Phase 7)

**Exit criteria**: ✅ Provider verification, local linking, session/logout/refresh handling, inactive-user blocking, and fake-provider replacement tests are implemented

**Next step**: Start Phase 7 candidate funnel

### Phase 6: Admin Lite Foundation ✅

**Status**: COMPLETE (100%)

**Completed**:

- ✅ Guarded `/api/admin/dashboard` endpoint with scoped organization-unit, prayer, and event counts
- ✅ Officer dashboard counts reuse server-side admin scope filters; Super Admin gets global counts
- ✅ Admin Lite `/admin/dashboard` route metadata
- ✅ Framework-neutral rendered dashboard document with navigation to organization units, prayers, and events
- ✅ Dependency-free HTTP web shell mounts `/admin`, `/admin/dashboard`, `/admin/prayers`, and `/admin/events`
- ✅ Admin dashboard API client, demo fixture, state handling, and route tests
- ✅ Admin Lite `/admin/organization-units` route with API/demo loading, shared DTO validation, demo fixture, and write-action metadata
- ✅ Admin Lite organization-unit create and scoped detail/edit form routes at `/admin/organization-units/new` and `/admin/organization-units/{id}`
- ✅ Organization-unit create/update/archive audit side effects with before/after summaries
- ✅ Mounted Admin Lite app shell with shared navigation, active route state, runtime-mode chrome, and mounted status pages
- ✅ Contract check now requires all currently implemented Phase 3-6 OpenAPI paths

**Not Yet**:

- ⏳ Candidate funnel workflows (Phase 7)
- ⏳ Brother/admin registry workflows beyond implemented Phase 6 foundation (later phases)

**Exit criteria**: ✅ Scoped dashboard, organization-unit list/detail/form routes, audit side effects, and mounted Admin Lite UI shell exist

**Next step**: Continue Phase 7 admin candidate request UI/client workflow

### Phase 7: Candidate Funnel 🟡

**Status**: IN PROGRESS (~85%)

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

**In Progress**:

- 🟡 Admin candidate profile list/detail management workflow

**Exit criteria**: 🟡 Candidate request API, public form, admin UI foundation, profile persistence, request conversion, and candidate dashboard exist; admin candidate profile management remains

**Next step**: Add admin candidate profile list/detail management foundation

### Phases 4–13: Roadmap

| Phase  | Name                             | Status         | Timeline        |
| ------ | -------------------------------- | -------------- | --------------- |
| **4**  | Public Content: Prayers & Events | ✅ Complete    | Completed May 4 |
| **5**  | Authentication & Modes           | ✅ Complete    | Completed May 4 |
| **6**  | Admin Lite Foundation            | ✅ Complete    | Completed May 5 |
| **7**  | Candidate Funnel                 | 🟡 In progress | Started May 5   |
| **8**  | Brother Companion Core           | ⏳ Not started | After Phase 7   |
| **9**  | Events/Announcements/Push        | ⏳ Not started | After Phase 8   |
| **10** | Formation Roadmap                | ⏳ Not started | After Phase 9   |
| **11** | Silent Online Prayer             | ⏳ Not started | After Phase 10  |
| **12** | Privacy/Security/Audit           | ⏳ Not started | After Phase 11  |
| **13** | Release Hardening & Pilot        | ⏳ Not started | After Phase 12  |

---

## Quality Gate Status

| Gate                     | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Notes                                                                                                           |
| ------------------------ | ------- | ------- | ------- | ------- | ------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| **Lint**                 | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm quality` passed                                                                                           |
| **Typecheck**            | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm quality` passed                                                                                           |
| **Unit tests (80%)**     | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `vitest --coverage`: 90.23% statements / 80.28% branches / 90.60% functions / 91.09% lines                      |
| **Integration tests**    | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Public candidate request API, mobile form, admin API, Admin Lite candidate UI, and candidate dashboard coverage |
| **Build**                | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | `pnpm quality` passed                                                                                           |
| **OpenAPI generation**   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Generated contract includes public/admin candidate request endpoints and candidate dashboard                    |
| **Contract check**       | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Contract check requires public/admin candidate request endpoints and candidate dashboard                        |
| **DB migration check**   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Candidate request migration baseline check passed                                                               |
| **Demo mode smoke test** | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Mobile join-interest demo fallback validates and returns a no-PII response                                      |

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
- Session-cookie creation with CSRF validation and logout cookie clearing
- Current-user response includes mode, Admin Lite access, membership scope, and officer scope

**Phase 6 Complete** ✅:

- Guarded `/api/admin/dashboard` endpoint added for scoped admin counts and task links
- Dashboard counts reuse existing admin prayer/event scope filters
- Admin dashboard DTO, OpenAPI schema, API client, demo fixture, screen model, rendered HTML document, and route metadata added
- Admin web shell mounts implemented dashboard/content routes over HTTP and keeps API/demo mode separation
- Admin organization-unit API client, demo fixture, rendered list/detail/form routes, web-shell mount, and audit side effects added
- Mounted Admin Lite app shell wraps implemented admin routes with shared navigation, active state, runtime-mode chrome, and mounted status pages
- Contract check expanded to require the full currently implemented OpenAPI path set

**Phase 7 In Progress** 🟡:

- Shared public candidate request DTO/schema added with required consent acceptance
- `candidate_requests` Prisma model, migration, active-email uniqueness guard, and local seed fixture added
- `POST /api/public/candidate-requests` added with no-auth access, consent metadata persistence, idempotency keys, repeated-attempt rate limiting, duplicate active email conflict, and no-PII response
- Mobile join-interest form model/client/demo fallback and safe confirmation screen added
- Admin candidate request list/detail/update API added with officer scope filtering and redacted audit summaries
- Admin Lite candidate request API client, list/detail screen models, rendered route shell, mounted navigation, and demo fallback fixture added
- Candidate profile persistence and `POST /admin/candidate-requests/:id/convert` added with scoped conversion, local candidate account creation/reuse, `CANDIDATE` role grant, and redacted audit summary
- Candidate dashboard foundation added with `GET /candidate/dashboard`, active-profile enforcement, scoped assignment/contact data, candidate-visible events, mobile API/demo client, screen model, and React Native screen

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
   - [ ] Add admin candidate profile list/detail management foundation

3. **Maintain completed Phase 3–6 foundation**
   - [x] Connect mobile PublicHome to real `/api/public/home`
   - [x] Public About content table/endpoint seeded
   - [x] Integrate mobile AboutOrder with public content-page API loading
   - [x] Phase 4 content tables created (prayers, events)
   - [x] Phase 5 provider adapter and auth session endpoints
   - [x] Update this dashboard after changes

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

**Last Updated**: May 5, 2026
**Current Phase**: Phase 7 in progress; Phases 0–6 complete
**Next Major Milestone**: Add admin candidate profile list/detail management foundation
