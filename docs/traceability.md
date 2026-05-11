# Traceability Matrix — CANONICAL Implementation Status

**THIS IS THE SINGLE SOURCE OF TRUTH for implementation progress.**

Use this document to:

- See current phase and what's complete in that phase
- Understand requirement-to-implementation mapping (FR-\* → APIs → screens → data → tests)
- Find the expected implementation surface for any V1 feature
- Report progress to stakeholders (update the narrative below each phase completion)

**Last Updated**: May 9, 2026 (Phases 0–9 complete; Phase 10A V1 Figma/RBAC alignment and Phase 10B localization foundation in progress)

---

## Current Implementation Progress

The rows below describe the full expected V1 surface (all 42 requirements). The narrative describes what's actually implemented right now.

### Current Phase: Phase 10 (V1 Figma/RBAC Alignment + Formation Roadmap) — In Progress

Implementation is complete through Phase 9 Events, Announcements, and Push. The owner approved pulling the design-update/Figma alignment work into V1 on May 7, 2026. Phase 10 now starts with a 10A Figma/RBAC alignment track before or alongside Phase 10B Formation Roadmap:

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
- Phase 10A architecture alignment now includes explicit SOLID/Clean
  Architecture implementation rules, a centralized Admin Lite access/scope
  policy seam, shared Admin Lite and mobile API request primitives, and
  regression tests that prevent duplicated admin-scope and HTTP request plumbing
  from reappearing in new feature code.
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
- Phase 8 hardening now adds API request-id generation and propagation:
  inbound `x-request-id` values are normalized and echoed, missing ids are
  generated as `req_*`, error responses use the current request id, and audit
  log writes automatically include the request-context id unless an explicit
  audit request id is supplied.
- Candidate request lifecycle hardening now enforces server-side status
  transitions: `new -> contacted/rejected`, `contacted -> invited/rejected`,
  `invited -> rejected`, and conversion only from `invited`; rejected or
  converted requests are terminal, and rejection requires an officer note. Admin
  Lite candidate-request actions now mirror that sequence by withholding the
  invite action until a request is contacted.
- Phase 8 added launch-level smoke coverage, now exposed through
  `pnpm smoke:launch`,
  which boots the compiled API, checks generated request ids on `/api/health`,
  exercises Admin Lite under `next dev` and production `next start`, verifies
  App Router session-cookie forwarding to backend API clients, checks mobile
  demo launch, and validates production demo-mode rejection for API, admin, and
  mobile paths. `pnpm quality` now runs this smoke target after build.
- Phase 9 first slice now includes event participation intent persistence and
  guarded candidate/brother mutations: `event_participation` table with a
  partial unique active `(event_id, user_id)` index,
  `POST/DELETE /api/candidate/events/{id}/participation`, and
  `POST/DELETE /api/brother/events/{id}/participation`. The endpoints require
  active candidate/brother profiles, verify event visibility server-side before
  creating an intent, update duplicate active intents instead of creating
  duplicates, cancel only the current user's active intent, and return no
  participant lists.
- Phase 9 now also includes guarded `GET /api/brother/events/{id}` event detail
  reads. The endpoint reuses active-brother profile enforcement and
  brother-visible event filtering, returns event description and timing, and
  exposes only the current user's own active participation intent.
- Mobile Phase 9 now includes a `BrotherEventDetail` API/demo screen model and
  authenticated mobile clients for `GET /api/brother/events/{id}` plus
  `POST/DELETE /api/brother/events/{id}/participation`. The model renders
  current-user intent state and plan/cancel action metadata without exposing
  participant lists.
- Phase 9 now includes guarded candidate event reads:
  `GET /api/candidate/events` and `GET /api/candidate/events/{id}`. The
  endpoints require an active candidate profile, validate shared query/response
  DTOs, filter server-side to currently published, non-cancelled, non-archived
  `PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, or assigned organization-unit events,
  and expose only the current user's own active participation intent on detail
  responses.
- Mobile Phase 9 now includes `CandidateEvents` and `CandidateEventDetail`
  API/demo screen models with authenticated clients for
  `GET /api/candidate/events`, `GET /api/candidate/events/{id}`, and
  `POST/DELETE /api/candidate/events/{id}/participation`. The models render
  candidate-visible event summaries, own intent state, and plan/cancel action
  metadata without exposing participant lists or brother-only terminology.
- Phase 9 now includes the announcement read foundation:
  `announcements` table/migration, local candidate/brother seed fixtures, shared
  DTO/OpenAPI schemas, guarded `GET /api/candidate/announcements`, and guarded
  `GET /api/brother/announcements`. Candidate reads require an active candidate
  profile and return only currently published, non-archived `PUBLIC`,
  `FAMILY_OPEN`, `CANDIDATE`, or assigned organization-unit announcements.
  Brother reads require an active brother profile and return only currently
  published, non-archived `PUBLIC`, `FAMILY_OPEN`, `BROTHER`, or own
  organization-unit announcements. Pinned items sort first, and neither endpoint
  exposes comments, read receipts, push delivery state, or unrelated scopes.
- Phase 9 now includes admin announcement management contracts:
  guarded `GET /api/admin/announcements`, `POST /api/admin/announcements`, and
  `PATCH /api/admin/announcements/{id}` endpoints with shared DTO/OpenAPI
  schemas, server-side officer scope filtering, scoped officer writes, Super
  Admin global management, lifecycle timestamp handling for publish/archive
  states, and audit summaries that redact announcement body text.
- Mobile Phase 9 now includes `CandidateAnnouncements` and
  `BrotherAnnouncements` API/demo screen models. API mode sends bearer
  credentials to `GET /api/candidate/announcements` and
  `GET /api/brother/announcements`, validates the shared list DTOs, maps
  forbidden/idle/offline/error/empty states through the existing private mobile
  load-state helpers, and demo mode uses backend-free parsed announcement
  fixtures. The screen models render message bodies from the server-filtered
  list contracts without chat, replies, read receipts, push delivery state, or
  participant lists.
- Admin Lite Phase 9 now mounts `/admin/announcements` in the shared Next.js
  App Router and dependency-free shell surfaces. The route reuses the shared
  admin announcement DTO validator, API/demo data loading, parsed demo fixture,
  framework-neutral list renderer, scoped write-state action metadata, and
  Admin Lite navigation. It renders one-way announcement management actions
  without chat, comments, read receipts, or push delivery state.
- Admin Lite Phase 9 now also mounts `/admin/announcements/new` and
  `/admin/announcements/:id` editor documents. Create is write-gated, detail
  rendering resolves the scoped announcement from the existing list contract,
  read-only admins receive readonly fields, scoped misses return 404, and the
  editor exposes save/publish/archive action metadata without rendering push
  delivery state.
- Phase 9 now includes notification preference and device-token foundations:
  `device_tokens` and `notification_preferences` tables/migration, shared
  DTO/OpenAPI schemas, guarded `POST /api/auth/device-tokens`, guarded
  `PUT /api/auth/notification-preferences`, duplicate token ownership transfer
  by token hash, no raw token return/logging, candidate/brother self-scoped
  preference writes with defaults, and a no-op push adapter boundary for later
  provider dispatch.
- Phase 9 now wires announcement publishing to audience-safe push dispatch:
  first publication resolves candidate/brother recipients server-side from
  announcement visibility, active profile/membership scope, active non-revoked
  device tokens, and announcement notification preferences. Dispatch uses
  generic notification copy, deep links by announcement id, the configured push
  adapter boundary, and operational audit summaries with attempted/accepted/
  failed counts only.
- Mobile API mode now resolves optional bearer credentials from
  `EXPO_PUBLIC_AUTH_TOKEN`/`APP_AUTH_TOKEN` through `/api/auth/me`, maps the
  validated current-user DTO into shared mobile-mode resolution, and mounts the
  implemented candidate/brother private route surfaces in the Expo entry point.
  Candidate dashboard/events/announcements/event-detail and Brother
  Today/profile/My Chorągiew/events/announcements/event-detail now load their
  guarded API contracts from the running app shell instead of remaining
  model-only exports.
- Delivery-risk review recommendations are now resolved or explicitly deferred
  without expanding V1 scope:
  - Implementation maturity: Admin Lite's dependency-free HTTP shell remains
    available as `dev:http-shell` only for short-term compatibility. New Admin
    routes should target the Next App Router adapter. Retiring the shell and
    converting framework-neutral HTML renderers to React Server Components are
    post-Phase-8 cleanup decisions that require parity tests.
  - Production readiness: Phase 8 adds launch-level smoke coverage for API boot,
    Admin Lite Next routes, mobile demo launch, and production-mode demo
    rejection. Deeper journey E2E remains release-hardening work.
  - Realtime and scalability: keep single PostgreSQL and no `/v2` routes for
    V1. Treat read replicas, API version expansion, hierarchy rollups, and
    cross-unit reporting as deferred scale/backlog decisions. Phase 11 must
    include Redis TTL tuning tests for duplicate joins, reconnects, disconnect
    expiry, and multi-instance counter correctness.
  - Organization model constraints: V1 permissions are now documented as
    explicit, assignment-based, and organization-unit scoped. Hierarchy-derived
    permissions and cross-unit rollups require owner-approved scope expansion.
  - Observability: request-id generation/propagation is now implemented for API
    errors and audit logs. Pilot log and metric destination selection remains
    release-hardening work.
  - Candidate lifecycle: core request status transitions and rejection note
    requirements are now enforced server-side, and V1 human follow-up timeline
    expectations are documented. Automated reminders remain out of scope until
    explicitly approved.
- Generated OpenAPI currently includes `/api/health`, `/api/public/home`,
  `/api/public/content-pages/{slug}`,
  `/api/public/prayers`, `/api/public/prayers/{id}`,
  `/api/public/events`, `/api/public/events/{id}`,
  `/api/public/candidate-requests`,
  `/api/auth/session`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`,
  `/api/auth/device-tokens`, `/api/auth/notification-preferences`,
  `/api/candidate/dashboard`,
  `/api/candidate/events`, `/api/candidate/events/{id}`,
  `/api/candidate/events/{id}/participation`,
  `/api/candidate/announcements`,
  `/api/brother/profile`, `/api/brother/today`, `/api/brother/prayers`,
  `/api/brother/events`,
  `/api/brother/events/{id}`,
  `/api/brother/events/{id}/participation`,
  `/api/brother/announcements`,
  `/api/brother/my-organization-units`,
  `/api/admin/dashboard`,
  `/api/admin/organization-units`, `/api/admin/organization-units/{id}`,
  `/api/admin/candidate-requests`, `/api/admin/candidate-requests/{id}`,
  `/api/admin/candidate-requests/{id}/convert`,
  `/api/admin/candidates`, `/api/admin/candidates/{id}`,
  `/api/admin/prayers`, `/api/admin/prayers/{id}`,
  `/api/admin/events`, `/api/admin/events/{id}`,
  `/api/admin/announcements`, and `/api/admin/announcements/{id}` as foundation
  contracts with request/response schemas.
- Announcement publish dispatch is wired through the provider adapter boundary.
  The default local/test adapter remains no-op because V1 stores token hashes or
  provider-safe references rather than raw provider tokens.
- `/api/brother/my-organization-units` currently returns the active brother's
  organization-unit summaries only, and mobile renders those scoped summaries
  without brother rosters. Officer summaries and announcement push preferences
  beyond the self-service preference toggle remain later work.
- `/api/admin/organization-units` currently supports scoped active listing plus Super Admin
  create/update/archive with audit side effects. The Admin Lite HTTP shell mounts
  organization-unit list, create, and scoped detail/edit form documents over the
  existing contracts.
- Admin Lite now has a real Next.js App Router runtime target for the current
  implemented route surface. The dependency-free HTTP shell remains available as
  a compatibility fallback while future route and React Server Component
  hardening steps are handled incrementally.
- Phase 10A V1 Figma/RBAC alignment is now in progress and tracked in
  [docs/design-updates/06-figma-implementation-plan.md](design-updates/06-figma-implementation-plan.md).
  It records the inspected Figma frames (`Sign In`, `Candidate Events`,
  `Brother Today`, and `Candidate Requests`), exact route/component targets,
  role/RBAC constraints, and per-screen implementation status.
- Phase 10A now includes the mobile shell split required before Figma-specific
  screen buildout. `apps/mobile/src/App.tsx` is a thin composition root that
  reads runtime/auth launch state and delegates to public, candidate, or brother
  route surfaces. `mobile-public-surface.tsx`,
  `mobile-candidate-surface.tsx`, and `mobile-brother-surface.tsx` now own
  their loaders, selected IDs, join-request form state, and event participation
  actions. Route-group guards live in `mobile-routes.ts`, with regression
  coverage preventing candidate/brother/join-request orchestration from moving
  back into the root.
- Phase 10A now includes a local Figma extraction cache under
  `docs/design-updates/figma-cache`: screenshots and frame-derived colors,
  typography, spacing, radius, and shadow values for `Sign In`,
  `Candidate Events`, `Brother Today`, and `Candidate Requests`. The inspected
  Figma file has no local variables or local styles, so these cached frame
  values are the implementation source.
- Phase 10A now also includes the Figma Gold/Grey design-token alignment slice:
  semantic brand colors, border/chrome colors, radius, shadow, Work Sans
  typography roles, and action tokens are centralized in
  `libs/shared/design-tokens/src/index.ts`.
- Phase 10A now includes the mobile auth-entry screen foundation and first
  Figma-matched auth styling slice: `Login` is a real public route with a
  Gold/Grey Sign In screen model and React Native screen, and Idle Firebase
  approval users can navigate to a dedicated public-only `IdleApproval` screen
  using the same auth shell. These screens expose only safe approval state/copy,
  keep public navigation available, and do not grant private roles or scopes
  client-side. Owner direction now clarifies V1 Sign In is Google/Gmail through
  Firebase only; the Sign In Figma frame is the Gold/Grey shell baseline, not
  approval for email/password credentials.
- Phase 10A now replaces the Sign In email/password-oriented controls with a
  Google/Firebase provider action. Mobile has a focused provider sign-in adapter
  seam, a shared-validation-backed `/api/auth/session` client, and route
  handoff that resolves the returned current user into Candidate, Brother, or
  Idle Approval state while keeping private API calls on the provider bearer
  token.
- Phase 10A now includes the concrete Expo/Firebase Google provider adapter for
  that Sign In seam. Mobile depends on `firebase`, `expo-auth-session`, and
  `expo-web-browser`; reads `EXPO_PUBLIC_FIREBASE_*`,
  `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`, and optional `EXPO_PUBLIC_APP_SCHEME`
  configuration; exchanges the Google ID token for a Firebase ID token through
  the Firebase client SDK; and still falls back to an explicit unconfigured
  provider when credentials are absent.
- Phase 10A now includes the first Figma-driven private mobile screen slice:
  `/api/candidate/events` list items expose the signed-in candidate's own
  `currentUserParticipation` intent for list badges/actions, without exposing
  participant lists or changing server-side event visibility filters. Mobile now
  mounts a dedicated Gold/Grey `CandidateEventsScreen.tsx` for the Figma
  `Candidate Events` frame with RSVP-needed/planning/not-attending card states,
  detail navigation, and list-level RSVP actions routed through the existing
  candidate event participation API.
- Phase 10A now includes the Brother Today Figma renderer slice. The existing
  guarded `/api/brother/today` contract and demo fixture now feed a richer
  Brother Today screen model with profile summary, quick actions,
  brother-visible upcoming event cards, and organization-unit cards. Mobile now
  mounts a dedicated Gold/Grey `BrotherTodayScreen.tsx` for the Figma
  `Brother Today` frame while keeping brother RBAC, organization-unit filtering,
  and event participation state on the existing server/API boundaries.
- Phase 10A now also has a component boundary contract in
  [docs/agent/component-boundary-contracts.md](agent/component-boundary-contracts.md).
  Future screen, route-surface, API/demo, and reusable component work must
  declare file ownership and forbidden responsibilities before adding more
  behavior to roots or shells.
- Phase 10A now includes the first shared mobile component extraction for the
  Figma private screens. Candidate Events and Brother Today reuse components
  from `apps/mobile/src/screens/shared` for top app bar, bottom navigation, demo
  banner, state panels, metadata icons, status dots, badge icons, and quick
  action icons. The shared folder has a required inventory README, and the
  component boundary contract now requires one filename-matched exported
  `function` React/React Native component per file, rejects extra local
  PascalCase component definitions, and requires inventory updates for new
  shared components.
- Phase 10A now enforces one screen model/builder per file for mobile screen
  models. `public-screens.ts`, `candidate-screens.ts`, and
  `brother-screens.ts` are barrels only, while concrete builders live in
  dedicated files such as `public-home-screen.ts`, `candidate-events-screen.ts`,
  and `brother-today-screen.ts`; regression coverage prevents builders from
  moving back into the plural files.
- The same one-screen-model-per-file rule now also applies to Admin Lite
  multi-screen model files. `admin-content-screens.ts`,
  `admin-candidate-requests-screen.ts`, `admin-candidates-screen.ts`, and
  `admin-organization-units-screen.ts` are compatibility barrels only, while
  concrete list/detail/editor builders live in dedicated per-screen files with
  regression coverage.
- Phase 10A mobile alignment now removes nonzero letter-spacing from React
  Native component styles, normalizes shared typography letter-spacing tokens to
  zero, adds regression coverage for that UI rule, and keeps unimplemented
  Candidate Events bottom-navigation destinations disabled instead of routing
  them to unrelated Dashboard behavior. Mobile auth API tests now cover
  unauthenticated current-user launch checks, fallback token parsing, and global
  fetch usage, raising the mobile branch coverage slice above the 80% rule.
- Phase 10A now replaces the generic Candidate Event Detail private renderer
  with a dedicated Gold/Grey React Native screen derived from the Candidate
  Events frame. It renders event type, date, time, location, safe description,
  the current user's own RSVP state, and plan/cancel intent actions over the
  existing guarded detail and participation contracts without participant lists.
- Phase 10A now also replaces the generic Candidate Announcements renderer with
  a dedicated Gold/Grey React Native list screen. It renders pinned
  one-way announcement cards with published dates and body copy over the
  existing guarded list contract, while continuing to exclude chat, comments,
  read receipts, push delivery state, unrelated scopes, and brother-only
  content.
- Phase 10A now replaces the generic Brother Events private renderer with a
  dedicated Gold/Grey React Native list screen. It renders brother-visible event
  cards with type, date, time, location, visibility metadata, bottom navigation,
  and detail actions over the existing guarded list contract, while continuing
  to exclude attendee lists, brother rosters, chat/comments/read receipts, and
  client-side permission filtering.
- Phase 10A now replaces the remaining generic Brother Event Detail and Brother
  Announcements private renderers with dedicated Gold/Grey React Native screens.
  Brother Event Detail renders type, date, time, location, safe description, the
  current user's own RSVP state, and plan/cancel actions over the existing
  guarded detail and participation contracts. Brother Announcements renders
  pinned one-way announcement cards with published dates and body copy over the
  existing guarded list contract. Both keep attendee lists, rosters, chat,
  comments, read receipts, push-delivery state, and client-side permission
  filtering out of the UI.
- Phase 10A now restyles Admin Lite Candidate Requests from the Figma
  `Candidate Requests (Gold/Grey)` frame. The scoped admin list contract now
  includes a bounded `messagePreview` sourced server-side, and the Admin Lite
  web list/detail renderers use responsive Gold/Grey metric cards, candidate
  cards, status badges, and follow-up forms while preserving the existing
  officer/Super Admin scoped API boundaries.
- Phase 10A now adds a launchable Brother Prayer Library mobile surface over
  the existing guarded `/api/brother/prayers` contract. API mode sends bearer
  credentials and validates the shared DTO, demo mode uses parsed fallback
  public/brother/own-chorągiew prayers, and the dedicated Gold/Grey React
  Native screen renders categories, prayer cards, language/visibility badges,
  and brother bottom navigation without adding prayer tracking, participant
  lists, chat, comments, or client-side visibility filtering.
- Phase 10A now adds the V1 mobile Organization Unit Detail surface for
  `FR-ORG-001`. The Brother route group loads the existing server-filtered
  `/api/brother/my-organization-units` response in API mode, demo mode reuses
  the parsed fallback unit fixture, and the new Gold/Grey React Native detail
  screen renders read-only type/status/location/parish/description fields with
  no brother roster, member list, participant list, or client-side scope
  expansion.
- Phase 10B now includes the localization foundation for `NFR-LOC-001`.
  `@jp2/shared-i18n` defines stable translation keys, a default English
  catalog, locale normalization, interpolation, fallback behavior, and tests.
  Mobile and Admin Lite now expose small app-local helpers over that shared
  translator so new roadmap UI copy can use keys instead of hardcoded strings.
  Approved content such as prayers, official descriptions, and formation text
  still belongs in content/data workflows rather than the UI catalog.
- Phase 10A implementation should next add pilot Firebase/Google environment
  values for mobile builds or continue restyling remaining Figma-covered Admin
  Lite routes as responsive web.
- Phase 10B Formation Roadmap, Phase 11 Silent Prayer, Phase 12 privacy/security
  hardening, and Phase 13 pilot readiness are not implemented yet unless
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

| Requirement                                | APIs                                                                                                                                                                                                                                           | Screens                                                                                              | Data                                                                                                                                                                           | Key tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-001 Authentication                 | `/auth/session`, `/auth/logout`, `/auth/refresh`, `GET /auth/me`                                                                                                                                                                               | Login, Admin Login                                                                                   | users, identity_provider_accounts, user_roles, memberships                                                                                                                     | Firebase adapter verification, fake-provider replacement, inactive-user blocking, provider-linking, mobile provider-token session exchange                                                                                                                                                                                                                                                                                                                                                                                     |
| FR-AUTH-001 Firebase Idle Approval         | `/auth/session`, `GET /auth/me`; `/admin/identity-access-reviews`, `/admin/identity-access-reviews/{id}`, `/admin/identity-access-reviews/{id}/confirm`, `/admin/identity-access-reviews/{id}/reject`, `/admin/identity-access-reviews/expire` | login pending approval, admin idle approvals                                                         | users, identity_provider_accounts, identity_access_reviews, identity_access_approver_assignments, user_roles, memberships, candidate_profiles, officer_assignments, audit_logs | Firebase sign-in stays idle/public-only, 30-day expiry, scoped country/region approval privilege, audited role/scope assignment, rejection/expiry public-only state, Next.js identity-access route smoke test, mobile provider Sign In routes to Candidate/Brother/Idle Approval only from server current-user response                                                                                                                                                                                                        |
| NFR-DEMO-001 Demo mode                     | runtime mode config                                                                                                                                                                                                                            | Mobile/Admin launch shells                                                                           | demo fixtures once screen flows exist                                                                                                                                          | shared parser, mobile/admin/API production rejection tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR-PUBLIC-001 Public Home                  | `GET /public/home`                                                                                                                                                                                                                             | `PublicHome`                                                                                         | prayers, events, content pages                                                                                                                                                 | public no-auth, no private content, empty state                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| FR-PUBLIC-002 About the Order              | `GET /public/content-pages/{slug}`                                                                                                                                                                                                             | `AboutOrder`                                                                                         | content_pages                                                                                                                                                                  | published `PUBLIC` content only, private/missing pages 404, English fallback, mobile API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-PRAYER-001 Public Prayer Library        | `GET /public/prayers`, `GET /public/prayers/:id`                                                                                                                                                                                               | public prayer category/list/detail                                                                   | prayer_categories, prayers                                                                                                                                                     | published public only, private id returns 404, mobile list/detail API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| FR-EVENT-001 Public Events                 | `GET /public/events`, `GET /public/events/:id`                                                                                                                                                                                                 | public event list/detail                                                                             | events                                                                                                                                                                         | public/family only, date filters, mobile list/detail API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-PRAYER-002 Public Silent Prayer         | `GET/POST /public/silent-prayer-events`                                                                                                                                                                                                        | public silent prayer                                                                                 | silent_prayer_events, silent_prayer_participation, Redis presence                                                                                                              | anonymous aggregate only, duplicate join                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| FR-CANDIDATE-REQ-001 Join Interest Request | `POST /public/candidate-requests`                                                                                                                                                                                                              | join request form                                                                                    | candidate_requests                                                                                                                                                             | consent-required shared DTO, server persistence with consent metadata, idempotency key retry, repeated-attempt rate limit, duplicate active email conflict, no-PII response                                                                                                                                                                                                                                                                                                                                                   |
| FR-ADMIN-001 Candidate Request Management  | `GET /admin/candidate-requests`, `GET/PATCH /admin/candidate-requests/:id`, `POST /admin/candidate-requests/:id/convert`                                                                                                                       | candidate request list/detail                                                                        | candidate_requests, audit_logs                                                                                                                                                 | officer scope, status transitions, audit, admin client/shell API/demo states, Next.js list/detail route smoke tests                                                                                                                                                                                                                                                                                                                                                                                                           |
| FR-ADMIN-008 Candidate Profile Management  | `GET /admin/candidates`, `GET/PATCH /admin/candidates/:id`; `POST /admin/candidates/:id/convert-to-brother` pending brother lifecycle                                                                                                          | candidate list/detail                                                                                | candidate_profiles, users, user_roles, audit_logs; memberships pending brother lifecycle                                                                                       | officer scope, profile update audit, admin client/shell API/demo states, Next.js list/detail route smoke tests, brother conversion deferred to brother lifecycle                                                                                                                                                                                                                                                                                                                                                              |
| FR-CANDIDATE-001 Candidate Dashboard       | `GET /candidate/dashboard`                                                                                                                                                                                                                     | candidate dashboard                                                                                  | candidate_profiles, events; roadmap_assignments/announcements pending later phases                                                                                             | active profile required, scoped event visibility, mobile API/client state mapping and Expo route mounting, no brother content                                                                                                                                                                                                                                                                                                                                                                                                 |
| FR-ROADMAP-001 Candidate Roadmap           | `GET /candidate/roadmap`                                                                                                                                                                                                                       | candidate roadmap                                                                                    | roadmap_definitions, assignments                                                                                                                                               | assigned candidate only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| FR-CANDIDATE-002 Candidate Events          | `GET /candidate/events`, `GET /candidate/events/:id`                                                                                                                                                                                           | dedicated Figma-aligned CandidateEvents and CandidateEventDetail screens mounted in Expo             | events, event_participation                                                                                                                                                    | active candidate profile required, shared DTO validation, published/non-cancelled visibility filtering, own participation intent on list/detail, mobile API/demo model/renderer tests, no participant lists                                                                                                                                                                                                                                                                                                                   |
| FR-CANDIDATE-003 Candidate Announcements   | `GET /candidate/announcements`                                                                                                                                                                                                                 | dedicated Figma-aligned CandidateAnnouncements screen mounted in Expo                                | announcements                                                                                                                                                                  | active profile required, shared DTO/OpenAPI schemas, pinned sort, published public/family/candidate/own organization-unit filtering, mobile API/demo model/renderer tests, no brother/officer/admin/unrelated-scope announcements, no chat/comments/read receipts/push delivery state                                                                                                                                                                                                                                          |
| FR-BROTHER-001 Brother Today               | `GET /brother/today`                                                                                                                                                                                                                           | dedicated Figma-aligned BrotherToday screen mounted in Expo                                          | users, memberships, organization_units, events; announcements/roadmap pending later                                                                                            | personalized profile summary, quick actions, own organization units, brother-safe event visibility, mobile API/demo states, Expo route mounting, and renderer/model tests                                                                                                                                                                                                                                                                                                                                                     |
| FR-BROTHER-002 Brother Profile             | `GET /brother/profile`                                                                                                                                                                                                                         | brother profile                                                                                      | users, user_roles, memberships, organization_units                                                                                                                             | self only, active membership required, critical data read-only, mobile API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR-ORG-001 My Organization Units           | `GET /brother/my-organization-units`                                                                                                                                                                                                           | dedicated MyOrganizationUnits and OrganizationUnitDetail screens mounted in Expo                      | organization_units, officer_assignments, events                                                                                                                                | own scope only, server-filtered brother organization-unit response, API/demo screen states, route/detail action metadata, read-only detail fields, no brother roster/member list/participant list, no client-side scope expansion                                                                                                                                                                                                                                                                                               |
| FR-PRAYER-003 Brother Prayer Library       | `GET /brother/prayers`                                                                                                                                                                                                                         | dedicated BrotherPrayers screen mounted in Expo                                                       | prayers                                                                                                                                                                        | published public/family/brother/own organization-unit filtering, shared DTO validation, mobile API/demo model/renderer tests, no candidate/officer/admin/unrelated-scope prayers, no prayer tracking, participant lists, chat, comments, or client-side visibility filtering                                                                                                                                                                                                                                                   |
| FR-EVENT-002 Brother Events                | `GET /brother/events`, `GET /brother/events/:id`                                                                                                                                                                                               | dedicated Figma-aligned BrotherEvents screen plus BrotherEventDetail screen model mounted in Expo    | events, event_participation                                                                                                                                                    | guarded active-brother read APIs, shared DTO validation, published/non-cancelled visibility filtering, own participation intent only on detail, mobile API/demo model/renderer tests, no attendee lists/rosters, no client-side visibility filtering                                                                                                                                                                                                                                                                          |
| FR-EVENT-003 Event Participation Intent    | `POST/DELETE /candidate/events/:id/participation`, `POST/DELETE /brother/events/:id/participation`                                                                                                                                             | CandidateEventDetail and BrotherEventDetail mounted private renderer                                 | event_participation                                                                                                                                                            | active candidate/brother profile required, visible open event only for creation, duplicate active intent returns existing record, cancellation limited to own active intent, mobile plan/cancel action metadata, no participant lists                                                                                                                                                                                                                                                                                         |
| FR-ANN-001 Brother Announcements           | `GET /brother/announcements`                                                                                                                                                                                                                   | BrotherAnnouncements screen model mounted in Expo                                                    | announcements                                                                                                                                                                  | active brother profile required, shared DTO/OpenAPI schemas, pinned sort, published public/family/brother/own organization-unit filtering, mobile API/demo state handling, no chat/comments/read receipts, no candidate/officer/admin/unrelated-scope announcements                                                                                                                                                                                                                                                           |
| FR-ROADMAP-002 Formation Roadmap           | `GET /brother/roadmap`                                                                                                                                                                                                                         | formation roadmap                                                                                    | roadmap\_\*                                                                                                                                                                    | own roadmap, no auto degree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| FR-ROADMAP-003 Roadmap Step Submission     | `POST /brother/roadmap/steps/:stepId/submissions`                                                                                                                                                                                              | step detail                                                                                          | roadmap_submissions, file_attachments optional                                                                                                                                 | pending duplicate, attachment policy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-ROADMAP-004 Roadmap Approval            | `GET/PATCH /admin/roadmap-submissions/:id`                                                                                                                                                                                                     | roadmap request detail                                                                               | roadmap_submissions, audit_logs                                                                                                                                                | officer scope, rejection comment, audit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| FR-PRAYER-004 Silent Brother Prayer        | brother silent prayer routes and socket events                                                                                                                                                                                                 | brother silent prayer                                                                                | silent_prayer_events, Redis presence                                                                                                                                           | once per user, reconnect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| FR-NOTIF-001 Notification Preferences      | `PUT /auth/notification-preferences`, `POST /auth/device-tokens`                                                                                                                                                                               | settings                                                                                             | notification_preferences, device_tokens                                                                                                                                        | guarded approved private access for token registration, raw tokens hashed and never returned, duplicate token ownership transfers by token hash, candidate/brother self-only preference updates with defaults, announcement publish dispatch respects opt-outs and active non-revoked device tokens through the configured push adapter boundary                                                                                                                                                                              |
| FR-ADMIN-002 Admin Dashboard               | `GET /admin/dashboard`                                                                                                                                                                                                                         | admin dashboard                                                                                      | scoped aggregates                                                                                                                                                              | guarded scoped counts, admin dashboard route/demo fixture, no unrelated scope, Next.js `/admin/dashboard` route smoke tests for demo/API modes                                                                                                                                                                                                                                                                                                                                                                                |
| FR-ADMIN-003 Brother Registry              | `/admin/brothers` routes                                                                                                                                                                                                                       | brother list/detail/editor                                                                           | users, user_roles, memberships, audit_logs                                                                                                                                     | officer scope, critical audit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| FR-ORG-002 Organization Unit Management    | `/admin/organization-units` routes                                                                                                                                                                                                             | organization unit list/detail                                                                        | organization_units, officer_assignments, audit_logs                                                                                                                            | scoped list API, Super Admin create/update/archive, audit side effects, rendered Admin Lite list/detail/form routes, Next.js list/create/detail route smoke tests                                                                                                                                                                                                                                                                                                                                                             |
| FR-ADMIN-004 Prayer Management             | `/admin/prayers` routes                                                                                                                                                                                                                        | prayer list/editor                                                                                   | prayers, audit_logs                                                                                                                                                            | guarded list/create/patch API, admin app list/editor workflow model, visibility required, archive not delete, audit side effects, Next.js list route smoke test                                                                                                                                                                                                                                                                                                                                                               |
| FR-ADMIN-005 Event Management              | `/admin/events` routes                                                                                                                                                                                                                         | event list/editor                                                                                    | events, audit_logs                                                                                                                                                             | guarded list/create/patch API, admin app list/editor workflow model, officer scope, public/private explicit, archive not delete, audit side effects, Next.js list route smoke test                                                                                                                                                                                                                                                                                                                                            |
| FR-ADMIN-006 Announcement Management       | `GET/POST /admin/announcements`, `PATCH /admin/announcements/:id`; `/admin/announcements`, `/admin/announcements/new`, `/admin/announcements/:id`                                                                                              | announcement list/editor mounted                                                                     | announcements, audit_logs                                                                                                                                                      | guarded admin announcement API contracts, officer scope filtering/writes, Super Admin global management, lifecycle timestamps, body-redacted audit summaries; Admin Lite Next.js list/create/detail editor routes with shared DTO validation, API/demo loading, scoped action metadata, readonly state, 404 scoped misses, and no chat/comments/read receipts/push delivery state; first publish resolves audience-safe candidate/brother push recipients and dispatches generic notifications through the configured adapter |
| FR-ADMIN-007 Silent Prayer Management      | `/admin/silent-prayer-events` routes                                                                                                                                                                                                           | silent prayer editor                                                                                 | silent_prayer_events, audit_logs                                                                                                                                               | no participant list                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| FR-AUDIT-001 Audit Logging                 | mutation side effects, `/admin/audit-logs`                                                                                                                                                                                                     | audit log                                                                                            | audit_logs                                                                                                                                                                     | before/after redaction, access control                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR-CONTENT-001 Content Approval            | admin content routes                                                                                                                                                                                                                           | content editors                                                                                      | publishable content tables                                                                                                                                                     | unapproved publish blocked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR-PRIV-001 Privacy Controls               | all APIs; shared `@jp2/shared-auth` role/scope/visibility helpers                                                                                                                                                                              | all screens                                                                                          | all private tables                                                                                                                                                             | shared auth matrix, permission, visibility, leak tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| NFR-LOC-001 Localization Foundation         | no API surface; shared `@jp2/shared-i18n` contract for UI copy keys                                                                                                                                                                            | future Phase 10B mobile/Admin Lite roadmap screens                                                   | default English UI catalog; approved content remains in content/data tables                                                                                                     | shared i18n catalog coverage, locale fallback, interpolation, dynamic key checks, and mobile/admin adapter helper tests                                                                                                                                                                                                                                                                                                                                                                                                       |
