# Traceability Matrix — CANONICAL Implementation Status

**THIS IS THE SINGLE SOURCE OF TRUTH for implementation progress.**

Use this document to:

- See current phase and what's complete in that phase
- Understand requirement-to-implementation mapping (FR-\* → APIs → screens → data → tests)
- Find the expected implementation surface for any V1 feature
- Report progress to stakeholders (update the narrative below each phase completion)

**Last Updated**: June 1, 2026 (Phases 0–9 and Phase 11 complete; Phase 10A/10B and Phase 12 privacy/audit/content-approval hardening in progress; candidate request export/erasure privacy controls and content approval workflow hardening expanded)

---

## Current Implementation Progress

The rows below describe the full expected V1 surface (all 42 requirements). The narrative describes what's actually implemented right now.

### Current Phase: Phase 10 (V1 Figma/RBAC Alignment + Formation Roadmap) In Progress; Phase 11 Realtime Foundation Complete; Phase 12 Privacy/Audit Hardening Started

Implementation is complete through Phase 9 Events, Announcements, and Push, and Phase 11 Silent Online Prayer is now complete. The owner approved pulling the design-update/Figma alignment work into V1 on May 7, 2026. Phase 10 now starts with a 10A Figma/RBAC alignment track before or alongside Phase 10B Formation Roadmap. Phase 11 silent-prayer work now includes the REST/presence foundation, Socket.IO/Redis wiring, Admin Lite management API/audit slice, and mobile live Socket.IO client behavior:

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
- Phase 10A architecture cleanup now centralizes member-audience visibility
  metadata and status presentation metadata, splits the Roadmap persistence
  surface into interface, Prisma, query-builder, and presentation helper files,
  reduces Admin Lite content-route loading duplication through typed resolvers,
  and moves public silent-prayer response patching out of the public route
  controller.
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
  `/api/public/silent-prayer-events`,
  `/api/public/silent-prayer-events/{id}/join`,
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
  `/api/brother/silent-prayer-events`,
  `/api/brother/silent-prayer-events/{id}/join`,
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
- Phase 10A maintainability cleanup now centralizes role-specific mobile bottom
  navigation through shared candidate/brother nav components and extracts event
  status badges plus event detail metadata cards. Admin Lite candidate,
  candidate-request, organization-unit, dashboard, identity-access, mounted
  layout, and content renderer/shell surfaces now reuse shared HTML document,
  status-code, escaping, header, action-link/button, empty-state, and form-field
  primitives instead of local copies where their markup contracts match.
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
- Phase 10B now also includes the roadmap data and shared contract foundation
  for `FR-ROADMAP-001` through `FR-ROADMAP-004`: Prisma models and migration
  for `roadmap_definitions`, `roadmap_stages`, `roadmap_steps`,
  `roadmap_assignments`, and `roadmap_submissions`; shared roadmap target,
  assignment, submission, assigned-read, create-submission, and review DTO
  schemas; local seed fixtures for one candidate roadmap, one brother roadmap,
  and one pending brother submission.
- Phase 10B now implements the first roadmap read slice for
  `FR-ROADMAP-001` and `FR-ROADMAP-002`: guarded `GET /candidate/roadmap` and
  `GET /brother/roadmap` endpoints return only the current user's active or
  completed assigned, published roadmap; candidate reads require an active
  candidate profile, brother reads require active brother membership, scoped
  organization-unit assignments are enforced server-side, and latest submission
  summaries are limited to the current user's own assignment. Mobile now has
  typed candidate/brother roadmap API clients, parsed demo fixtures, route
  mounting in the candidate/brother surfaces, and screen models with
  ready/empty/loading/error/offline/forbidden/idle-approval states.
- Phase 10B now implements the brother roadmap submission write slice for
  `FR-ROADMAP-003`: guarded `POST /brother/roadmap/steps/:stepId/submissions`
  accepts the shared create-submission DTO, requires active brother membership,
  verifies the route/body step ids match, limits writes to the current user's
  active assigned published brother roadmap in their active organization-unit
  scope, allows only published steps that require submission, persists optional
  attachment metadata, and rejects duplicate pending submissions without
  exposing other users or auto-degree behavior.
- Phase 10B now adds the mobile brother roadmap submission flow for
  `FR-ROADMAP-003`: the Expo brother roadmap route uses a typed private JSON
  POST client over the existing guarded submission contract, renders a dedicated
  roadmap screen with reflection inputs only on submit-required unsubmitted or
  rejected steps, validates shared DTO responses, refreshes only the current
  brother's latest submission state, supports demo-safe pending submissions, and
  does not expose other brothers' submissions, participant lists, or automatic
  degree changes.
- Phase 10B now implements the scoped Admin Lite roadmap review slice for
  `FR-ROADMAP-004`: guarded `GET /admin/roadmap-submissions`,
  `GET /admin/roadmap-submissions/:id`, and
  `PATCH /admin/roadmap-submissions/:id` endpoints list, read, and approve or
  reject roadmap submissions visible to the current admin scope. Officers are
  limited to submissions whose roadmap assignments belong to their assigned
  organization units; Super Admins can review globally. List responses expose
  previews, detail responses expose the full submitted body only inside the
  scoped admin boundary, rejection comments are required by the shared DTO, and
  review decisions write audit summaries that redact the full submission body.
  Admin Lite now mounts `/admin/roadmap-submissions` and detail routes with
  typed API clients, demo fixtures, responsive rendered queue/detail screens,
  active navigation, and approve/reject action metadata without automatic
  degree changes or cross-user roadmap rollups.
- Phase 10B now adds Super Admin read-only roadmap definition inspection for
  `FR-ROADMAP-004`: guarded `GET /admin/roadmap-definitions` and
  `GET /admin/roadmap-definitions/:id` expose non-archived roadmap definitions
  with stages, steps, and aggregate counts for configuration review. Admin Lite
  mounts `/admin/roadmap-definitions` and detail routes with typed API clients,
  shared DTO validation, demo fixtures, responsive rendered list/detail screens,
  and active navigation. Create/edit/status/assignment mutations remain
  deferred until owner-confirmed formation wording and workflow scope are
  available, and the slice does not add automatic degree changes.
- Phase 10B now adds Super Admin read-only roadmap assignment inspection for
  `FR-ROADMAP-004`: guarded `GET /admin/roadmap-assignments` and
  `GET /admin/roadmap-assignments/:id` expose non-archived assignments with
  assignee, roadmap, organization-unit, lifecycle, and submission-status counts.
  Detail responses include submission status metadata only, not submitted body
  text. Admin Lite mounts `/admin/roadmap-assignments` and detail routes with
  typed API clients, shared DTO validation, demo fixtures, responsive rendered
  list/detail screens, and active navigation. Assignment update/archive
  mutations remain deferred pending owner-confirmed workflow scope.
- Phase 10B now starts the owner-approved roadmap assignment mutation workflow
  for `FR-ROADMAP-004`: guarded `POST /admin/roadmap-assignments` lets Super
  Admin create an active assignment from an already-published roadmap definition
  for an eligible candidate or brother. The API validates the shared DTO,
  rejects missing unpublished definitions, verifies the assignee has the
  matching active candidate profile or brother membership for the requested
  organization-unit scope, prevents duplicate active/completed assignments for
  the same definition and scope, and writes audit summaries without assignee
  email or submission body text. Admin Lite now mounts
  `/admin/roadmap-assignments/new` through the Next/App shell with a rendered
  Super Admin create-assignment form over the shared POST contract, typed create
  client support, create/back action metadata, demo-safe rendering, and active
  roadmap-assignment navigation.
- Phase 10B seed/load fixtures now cover realistic multi-scope roadmap states
  for `FR-ROADMAP-001` through `FR-ROADMAP-004`: the local seed includes active
  officers, candidates, and brothers across two chorągiew units; active
  candidate and brother roadmap assignments in each unit; pending and rejected
  brother roadmap submissions; an inactive brother with archived roadmap
  assignment/submission records; and draft/archived roadmap definitions for
  Admin Lite configuration-state inspection. The migration/seed baseline check
  now asserts these fixtures remain present, and repository coverage documents
  assigned-roadmap filters for current-user, published, non-archived,
  in-scope reads.
- Phase 10B localization cleanup now moves another roadmap UI slice onto
  `NFR-LOC-001`: shared `@jp2/shared-i18n` catalog keys cover mobile roadmap
  step status/submission labels and Admin Lite roadmap assignment list/detail/
  create-form titles, state copy, actions, form labels, assignment counts, and
  empty/forbidden/offline copy. Mobile and Admin Lite adapters consume those
  keys in the roadmap screen models while approved roadmap definition/stage/step
  content remains data-backed.
- Phase 10B localization cleanup now also covers the Admin Lite roadmap
  submission queue/detail surface for `NFR-LOC-001`: shared catalog keys drive
  submission list/detail titles, state copy, review/view/approve/reject/back
  actions, attachment-count labels, empty-preview copy, scoped/global fallback
  labels, review form labels, and submission status labels. The submitted body
  and roadmap definition/stage/step titles remain data-backed content.
- Phase 10B localization cleanup now covers the Admin Lite roadmap definition
  list/detail/shell surface for `NFR-LOC-001`: shared catalog keys drive
  definition list/detail titles, state copy, shell document title, route label,
  back/view/refresh actions, count labels, published-status labels,
  not-published fallback copy, and step fallback/submission requirement labels.
  Roadmap definition, stage, and step titles/descriptions remain data-backed
  content and are not moved into the UI catalog.
- Phase 10A maintainability cleanup now splits the shared validation contract
  surface into domain modules behind the stable `@jp2/shared-validation`
  barrel and centralizes private mobile route resource loading for candidate
  and brother surfaces. This keeps DTO/schema ownership, API/demo loading,
  auth-token gating, error-state mapping, and cancellation behavior reusable
  before the Phase 10B roadmap screens expand the private mobile route groups.
- Possible post-current-scope operational improvement is documented for a
  low-cost Google Cloud Run + Cloud SQL deployment profile. The audit recommends
  a Redis read-aside cache layer for high-traffic read paths before pilot scale:
  public content lists/details, auth principal resolution, brother profile/today
  reads, candidate dashboard/event reads, and Admin Lite dashboard counts. It
  also records Prisma connection-pool hardening with explicit
  `connection_limit`/`pool_timeout`, startup retry and shutdown hooks, migration
  deployment through a standalone Cloud Run Job, and preserving the existing
  shallow `/api/health` route as the Cloud Run readiness probe. This is a
  possible improvement queued after the existing Phase 10A/10B items and does
  not authorize V2 features, read replicas, analytics, hierarchy rollups, or
  client-side permission filtering.
- Phase 10A implementation should next add pilot Firebase/Google environment
  values for mobile builds or continue restyling remaining Figma-covered Admin
  Lite routes as responsive web. Phase 10B owner-approved definition mutation
  remains pending confirmation of the exact formation wording.
- Phase 11 silent-prayer REST/presence foundation now includes the
  `silent_prayer_events` table/migration and public/brother seed fixtures;
  shared DTO schemas; generated OpenAPI-ready public and brother list/join
  contracts; server-side active-window, publish/cancel/archive, and visibility
  filtering; a Redis-shaped presence store boundary; an in-memory deterministic
  store; and service tests for anonymous aggregate counting, authenticated
  duplicate joins, heartbeat/reconnect TTL refresh, disconnect expiry, explicit
  leave decrement, multi-instance shared-store counter correctness, scoped
  brother visibility, and required event/participant identifiers. Responses
  expose aggregate counts, expiry, and socket room metadata only. They do not
  expose participant lists, anonymous session ids, user ids, rosters, or prayer
  history.
- Phase 11 now wires the presence core into a Socket.IO namespace
  (`/silent-prayer`) with public join, brother join, heartbeat, leave, joined,
  presence, and error events. The gateway delegates visibility and brother
  scope checks back to `SilentPrayerService`, resolves brother socket auth
  through the existing `AuthSessionService`, broadcasts aggregate presence only,
  and clears per-socket local room metadata on disconnect while Redis TTL expiry
  remains the counter cleanup boundary. A Redis-backed presence store and
  Socket.IO Redis adapter are enabled by `REDIS_URL`; production fails fast when
  Redis is missing, while local/test environments keep the deterministic
  in-memory store. Tests cover gateway validation/auth/privacy behavior, socket
  join/heartbeat/leave flow, service denial mapping, Redis TTL key writes,
  Redis-prefix counting, Redis shutdown, and production Redis fail-fast config.
- Phase 11 now adds Admin Lite silent-prayer event management contracts:
  `GET/POST /admin/silent-prayer-events` and
  `PATCH /admin/silent-prayer-events/{id}`. The API reuses shared publishable
  content status/visibility schemas, scopes officer reads/writes by assigned
  organization units, lets Super Admin manage global/public sessions, records
  create/update audit log summaries, and deliberately omits intention text and
  all participant/session identity from audit summaries. Generated OpenAPI and
  contract checks now include these admin routes.
- Phase 11 mobile silent-prayer screens now include typed public and brother
  list/join API clients over the existing REST contracts, demo fixtures,
  Expo-mounted `PublicSilentPrayer` and brother `SilentPrayer` route surfaces,
  aggregate-only React Native screens, and model/renderer/API tests. Public
  joins use an anonymous session id and brother joins require bearer auth; both
  screens show counters and socket-room-backed join metadata without exposing
  participant lists, anonymous session ids, user ids, rosters, chat, comments,
  or prayer history. Mobile now also uses the official Socket.IO client for the
  `/silent-prayer` namespace: after REST join it replays the socket join,
  refreshes presence with heartbeat events, applies aggregate presence updates
  to screen state, emits leave on route exit, replays joins on reconnect, and
  maps socket errors without surfacing identity details.
- Phase 12 privacy/audit hardening has started with a guarded read-only
  `GET /api/admin/audit-logs` API and mounted Admin Lite `/admin/audit-logs`
  route. The audit-log read surface is Super Admin-only, validates a shared
  DTO, returns latest redacted before/after summaries plus actor display name,
  entity, scope, request id, and timestamp, and deliberately omits raw IP
  addresses, actor email, nested JSON, and any unredacted source payload.
  Officers and Idle users are denied before audit rows load. Admin Lite API and
  demo mode use the same DTO/client/screen model path, with Next route and
  navigation coverage.
- Phase 12 privacy export support now includes Super Admin-only
  `GET /api/admin/candidate-requests/{id}/export` for candidate request
  personal-data export, including archived requests. The endpoint returns the
  shared candidate-request detail export DTO for subject-access handling and
  writes a redacted audit event that records the export without copying
  candidate email, phone, message, or officer note into `audit_logs`. Officers
  are denied before export rows load.
- Phase 12 subject export support now also includes Super Admin-only
  `GET /api/admin/candidates/{id}/export` for candidate profile personal-data
  export, including archived profiles. The endpoint returns a shared candidate
  profile export DTO for subject-access handling and writes a redacted audit
  event that records export metadata without copying candidate email or display
  name into `audit_logs`. Officers are denied before export rows load.
- Phase 12 candidate profile legal erasure now includes Super Admin-only
  `POST /api/admin/candidates/{id}/erase` for candidate-only users. The endpoint
  rejects converted profiles and linked users with active brother/officer/Super
  Admin access, anonymizes the linked user identity, revokes candidate roles,
  provider links, and device tokens, archives candidate profiles instead of
  deleting them, returns only id/user/erasure/archive metadata, and writes audit
  summaries without copying erased email, display name, phone, provider, or token
  values. Officers are denied before erasure rows load.
- Phase 12 now includes the first candidate-request legal erasure slice:
  Super Admin-only `POST /api/admin/candidate-requests/{id}/erase` anonymizes
  candidate request personal identifiers and archives the row instead of
  deleting it, denies officers before rows load, returns only erasure/archive
  timestamps, and writes redacted audit summaries that preserve action evidence
  without copying erased email, phone, message, or officer-note values.
- Phase 12 device-token lifecycle support now includes guarded
  `POST /api/auth/device-tokens/revoke`. It requires approved private access,
  hashes the submitted token before lookup, revokes only an active token owned by
  the current user, returns an idempotent `revoked`/`revokedAt` response, and
  exposes no token id, raw token, hash, or last-four metadata.
- Phase 12 content approval hardening now blocks direct publish transitions for
  prayer, event, announcement, and silent-prayer admin content unless an
  approved status or approval timestamp already exists. Prayer, event, and
  announcement admin DTO/OpenAPI responses now expose `approvedAt`; event
  approval metadata is stored through migration `000013_event_approval_metadata`;
  create/update persistence records creator/updater plus approval/publisher
  metadata where supported; and tests cover direct-publish rejection before
  audit or push side effects.
- Admin Lite Phase 12 content workflow models now reflect the same approval
  gate: prayer, event, and announcement rows expose `Approve` before `Publish`,
  only expose `Publish` after an approved status or `approvedAt` timestamp
  exists, and keep published/cancelled/archived terminal states from showing
  invalid publish actions. The announcement editor uses the same action model
  so scoped detail routes no longer advertise publish actions the API rejects.
  Typed Admin Lite API helpers now back those lifecycle actions with reusable
  approve/publish/archive/cancel PATCH payloads, including event approval via
  `approvedAt` timestamp, so callers do not duplicate lifecycle status strings.
- Phase 13 pilot readiness is not implemented yet unless explicitly listed
  above.

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

| Requirement                                | APIs                                                                                                                                                                                                                                           | Screens                                                                                                                             | Data                                                                                                                                                                           | Key tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-001 Authentication                 | `/auth/session`, `/auth/logout`, `/auth/refresh`, `GET /auth/me`                                                                                                                                                                               | Login, Admin Login                                                                                                                  | users, identity_provider_accounts, user_roles, memberships                                                                                                                     | Firebase adapter verification, fake-provider replacement, inactive-user blocking, provider-linking, mobile provider-token session exchange                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| FR-AUTH-001 Firebase Idle Approval         | `/auth/session`, `GET /auth/me`; `/admin/identity-access-reviews`, `/admin/identity-access-reviews/{id}`, `/admin/identity-access-reviews/{id}/confirm`, `/admin/identity-access-reviews/{id}/reject`, `/admin/identity-access-reviews/expire` | login pending approval, admin idle approvals                                                                                        | users, identity_provider_accounts, identity_access_reviews, identity_access_approver_assignments, user_roles, memberships, candidate_profiles, officer_assignments, audit_logs | Firebase sign-in stays idle/public-only, 30-day expiry, scoped country/region approval privilege, audited role/scope assignment, rejection/expiry public-only state, Next.js identity-access route smoke test, mobile provider Sign In routes to Candidate/Brother/Idle Approval only from server current-user response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| NFR-DEMO-001 Demo mode                     | runtime mode config                                                                                                                                                                                                                            | Mobile/Admin launch shells                                                                                                          | demo fixtures once screen flows exist                                                                                                                                          | shared parser, mobile/admin/API production rejection tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| FR-PUBLIC-001 Public Home                  | `GET /public/home`                                                                                                                                                                                                                             | `PublicHome`                                                                                                                        | prayers, events, content pages                                                                                                                                                 | public no-auth, no private content, empty state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| FR-PUBLIC-002 About the Order              | `GET /public/content-pages/{slug}`                                                                                                                                                                                                             | `AboutOrder`                                                                                                                        | content_pages                                                                                                                                                                  | published `PUBLIC` content only, private/missing pages 404, English fallback, mobile API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| FR-PRAYER-001 Public Prayer Library        | `GET /public/prayers`, `GET /public/prayers/:id`                                                                                                                                                                                               | public prayer category/list/detail                                                                                                  | prayer_categories, prayers                                                                                                                                                     | published public only, private id returns 404, mobile list/detail API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR-EVENT-001 Public Events                 | `GET /public/events`, `GET /public/events/:id`                                                                                                                                                                                                 | public event list/detail                                                                                                            | events                                                                                                                                                                         | public/family only, date filters, mobile list/detail API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| FR-PRAYER-002 Public Silent Prayer         | `GET /public/silent-prayer-events`, `POST /public/silent-prayer-events/:id/join`; `/silent-prayer` Socket.IO namespace with `silent-prayer:public:join`, `silent-prayer:heartbeat`, `silent-prayer:leave`, `silent-prayer:presence`               | `PublicSilentPrayer` mobile route/screen                                                                                            | silent_prayer_events, optional silent_prayer_participation later, Redis-backed presence store                                                                                   | published active public/family sessions only, archived/cancelled/future/unpublished hidden, anonymous aggregate only, duplicate anonymous session joins do not inflate counters, TTL expiry, explicit leave decrement, multi-instance shared-store counter correctness, Socket.IO public join/heartbeat/leave aggregate broadcasts, Redis TTL key writes/counting/shutdown, production Redis fail-fast config, mobile REST list/join client validation, demo fixture, aggregate-only renderer tests, mobile Socket.IO join replay/heartbeat/leave/reconnect/error tests, no participant identity/session id returned from count/join/socket presence responses                                                                                                                                                                                                 |
| FR-CANDIDATE-REQ-001 Join Interest Request | `POST /public/candidate-requests`                                                                                                                                                                                                              | join request form                                                                                                                   | candidate_requests                                                                                                                                                             | consent-required shared DTO, server persistence with consent metadata, idempotency key retry, repeated-attempt rate limit, duplicate active email conflict, no-PII response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-ADMIN-001 Candidate Request Management  | `GET /admin/candidate-requests`, `GET/PATCH /admin/candidate-requests/:id`, `GET /admin/candidate-requests/:id/export`, `POST /admin/candidate-requests/:id/erase`, `POST /admin/candidate-requests/:id/convert`                                  | candidate request list/detail                                                                                                       | candidate_requests, audit_logs                                                                                                                                                 | officer scope, status transitions, audit, Super Admin-only candidate request export including archived requests, Super Admin-only candidate request erasure anonymizes personal identifiers and archives instead of deleting, export/erasure audit redaction, admin client/shell API/demo states, Next.js list/detail route smoke tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| FR-ADMIN-008 Candidate Profile Management  | `GET /admin/candidates`, `GET/PATCH /admin/candidates/:id`, `GET /admin/candidates/:id/export`, `POST /admin/candidates/:id/erase`; `POST /admin/candidates/:id/convert-to-brother` pending brother lifecycle                                  | candidate list/detail                                                                                                               | candidate_profiles, users, user_roles, identity_provider_accounts, device_tokens, audit_logs; memberships pending brother lifecycle                                            | officer scope, profile update audit, Super Admin-only candidate profile export including archived profiles, export audit redaction, Super Admin-only candidate-only profile erasure anonymizes linked user identity, revokes candidate roles/provider links/device tokens, archives profiles instead of deleting, rejects converted/non-candidate users, admin client/shell API/demo states, Next.js list/detail route smoke tests, brother conversion deferred to brother lifecycle                                                                                                                                                                                                                                                                                                                                                                                |
| FR-CANDIDATE-001 Candidate Dashboard       | `GET /candidate/dashboard`                                                                                                                                                                                                                     | candidate dashboard                                                                                                                 | candidate_profiles, events; roadmap_assignments/announcements pending later phases                                                                                             | active profile required, scoped event visibility, mobile API/client state mapping and Expo route mounting, no brother content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR-ROADMAP-001 Candidate Roadmap           | `GET /candidate/roadmap`                                                                                                                                                                                                                       | candidate roadmap screen model mounted in Expo route surface                                                                        | `roadmap_definitions`, `roadmap_stages`, `roadmap_steps`, `roadmap_assignments`; demo candidate roadmap seed                                                                   | active candidate profile required, own assigned published roadmap only, scoped organization-unit assignment filtering, shared DTO validation, API/demo mobile states, no brother roadmap or submission action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR-CANDIDATE-002 Candidate Events          | `GET /candidate/events`, `GET /candidate/events/:id`                                                                                                                                                                                           | dedicated Figma-aligned CandidateEvents and CandidateEventDetail screens mounted in Expo                                            | events, event_participation                                                                                                                                                    | active candidate profile required, shared DTO validation, published/non-cancelled visibility filtering, own participation intent on list/detail, mobile API/demo model/renderer tests, no participant lists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-CANDIDATE-003 Candidate Announcements   | `GET /candidate/announcements`                                                                                                                                                                                                                 | dedicated Figma-aligned CandidateAnnouncements screen mounted in Expo                                                               | announcements                                                                                                                                                                  | active profile required, shared DTO/OpenAPI schemas, pinned sort, published public/family/candidate/own organization-unit filtering, mobile API/demo model/renderer tests, no brother/officer/admin/unrelated-scope announcements, no chat/comments/read receipts/push delivery state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| FR-BROTHER-001 Brother Today               | `GET /brother/today`                                                                                                                                                                                                                           | dedicated Figma-aligned BrotherToday screen mounted in Expo                                                                         | users, memberships, organization_units, events; announcements/roadmap links                                                                                                    | personalized profile summary, quick actions including formation roadmap, own organization units, brother-safe event visibility, mobile API/demo states, Expo route mounting, and renderer/model tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| FR-BROTHER-002 Brother Profile             | `GET /brother/profile`                                                                                                                                                                                                                         | brother profile                                                                                                                     | users, user_roles, memberships, organization_units                                                                                                                             | self only, active membership required, critical data read-only, mobile API/demo states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| FR-ORG-001 My Organization Units           | `GET /brother/my-organization-units`                                                                                                                                                                                                           | dedicated MyOrganizationUnits and OrganizationUnitDetail screens mounted in Expo                                                    | organization_units, officer_assignments, events                                                                                                                                | own scope only, server-filtered brother organization-unit response, API/demo screen states, route/detail action metadata, read-only detail fields, no brother roster/member list/participant list, no client-side scope expansion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR-PRAYER-003 Brother Prayer Library       | `GET /brother/prayers`                                                                                                                                                                                                                         | dedicated BrotherPrayers screen mounted in Expo                                                                                     | prayers                                                                                                                                                                        | published public/family/brother/own organization-unit filtering, shared DTO validation, mobile API/demo model/renderer tests, no candidate/officer/admin/unrelated-scope prayers, no prayer tracking, participant lists, chat, comments, or client-side visibility filtering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FR-EVENT-002 Brother Events                | `GET /brother/events`, `GET /brother/events/:id`                                                                                                                                                                                               | dedicated Figma-aligned BrotherEvents screen plus BrotherEventDetail screen model mounted in Expo                                   | events, event_participation                                                                                                                                                    | guarded active-brother read APIs, shared DTO validation, published/non-cancelled visibility filtering, own participation intent only on detail, mobile API/demo model/renderer tests, no attendee lists/rosters, no client-side visibility filtering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| FR-EVENT-003 Event Participation Intent    | `POST/DELETE /candidate/events/:id/participation`, `POST/DELETE /brother/events/:id/participation`                                                                                                                                             | CandidateEventDetail and BrotherEventDetail mounted private renderer                                                                | event_participation                                                                                                                                                            | active candidate/brother profile required, visible open event only for creation, duplicate active intent returns existing record, cancellation limited to own active intent, mobile plan/cancel action metadata, no participant lists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| FR-ANN-001 Brother Announcements           | `GET /brother/announcements`                                                                                                                                                                                                                   | BrotherAnnouncements screen model mounted in Expo                                                                                   | announcements                                                                                                                                                                  | active brother profile required, shared DTO/OpenAPI schemas, pinned sort, published public/family/brother/own organization-unit filtering, mobile API/demo state handling, no chat/comments/read receipts, no candidate/officer/admin/unrelated-scope announcements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FR-ROADMAP-002 Formation Roadmap           | `GET /brother/roadmap`                                                                                                                                                                                                                         | formation roadmap screen model mounted in Expo route surface                                                                        | `roadmap_definitions`, `roadmap_stages`, `roadmap_steps`, `roadmap_assignments`; demo brother roadmap seed                                                                     | active brother membership required, own assigned published roadmap only, scoped organization-unit assignment filtering, latest own submission state, API/demo mobile states, no auto degree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-ROADMAP-003 Roadmap Step Submission     | `POST /brother/roadmap/steps/:stepId/submissions`                                                                                                                                                                                              | brother roadmap submission form mounted in Expo brother roadmap surface                                                             | `roadmap_submissions` with optional `attachment_meta`; demo pending brother submission seed                                                                                    | active brother membership required, route/body step id match required, own active assigned published brother roadmap only, scoped organization-unit assignment filtering, published `requiresSubmission` step only, shared DTO attachment policy, duplicate pending submission conflict, mobile private JSON POST client and dedicated roadmap renderer tests, no participant lists or auto-degree behavior                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-ROADMAP-004 Roadmap Approval            | `GET /admin/roadmap-submissions`, `GET/PATCH /admin/roadmap-submissions/:id`, `GET /admin/roadmap-definitions`, `GET /admin/roadmap-definitions/:id`, `GET/POST /admin/roadmap-assignments`, `GET /admin/roadmap-assignments/:id`              | Admin Lite roadmap submission queue/detail plus roadmap definition and assignment list/detail/create form mounted in Next/App shell | `roadmap_definitions`, `roadmap_stages`, `roadmap_steps`, `roadmap_assignments`, `roadmap_submissions`, audit_logs                                                             | Admin Lite access required for submission review, officer scope constrained by assignment organization unit, Super Admin global review; roadmap definition inspection is Super Admin-only and read-only; assignment reads are Super Admin-only and assignment creation is Super Admin-only from already-published definitions to eligible candidate/brother users in matching scope; assignment detail exposes submission status metadata only, not submitted body text; list previews only, scoped detail body, shared rejection-comment validation, duplicate active/completed assignment conflict handling, audited approve/reject/create decisions with full body and assignee email redacted, no auto-degree behavior or cross-user rollups; definition create/edit/status mutations remain follow-up pending owner-confirmed formation wording |
| FR-PRAYER-004 Silent Brother Prayer        | `GET /brother/silent-prayer-events`, `POST /brother/silent-prayer-events/:id/join`; `/silent-prayer` Socket.IO namespace with `silent-prayer:brother:join`, `silent-prayer:heartbeat`, `silent-prayer:leave`, `silent-prayer:presence`             | brother `SilentPrayer` mobile route/screen                                                                                          | silent_prayer_events, Redis-backed presence store                                                                                                                              | active brother membership required, published active public/family/brother/own-organization-unit sessions only, unrelated scoped sessions hidden, once per authenticated user, heartbeat TTL refresh, reconnect before expiry without count inflation, disconnect expiry, multi-instance shared-store aggregate correctness, Socket.IO brother join resolves auth through existing session service and delegates scope checks to service, Redis adapter enabled by `REDIS_URL`, mobile bearer-auth REST list/join client validation, demo fixture, aggregate-only renderer tests, mobile Socket.IO auth handshake/join replay/heartbeat/leave/reconnect/error tests, no participant list/roster/user id returned from REST or socket responses                                                                                                                                                               |
| FR-NOTIF-001 Notification Preferences      | `PUT /auth/notification-preferences`, `POST /auth/device-tokens`, `POST /auth/device-tokens/revoke`                                                                                                                                            | settings                                                                                                                            | notification_preferences, device_tokens                                                                                                                                        | guarded approved private access for token registration and revocation, raw tokens hashed and never returned, duplicate token ownership transfers by token hash, current-user-only idempotent device-token revocation exposes no token id/hash/last-four metadata, candidate/brother self-only preference updates with defaults, announcement publish dispatch respects opt-outs and active non-revoked device tokens through the configured push adapter boundary                                                                                                                                                                                                                                                                                                                                                                                            |
| FR-ADMIN-002 Admin Dashboard               | `GET /admin/dashboard`                                                                                                                                                                                                                         | admin dashboard                                                                                                                     | scoped aggregates                                                                                                                                                              | guarded scoped counts, admin dashboard route/demo fixture, no unrelated scope, Next.js `/admin/dashboard` route smoke tests for demo/API modes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| FR-ADMIN-003 Brother Registry              | `/admin/brothers` routes                                                                                                                                                                                                                       | brother list/detail/editor                                                                                                          | users, user_roles, memberships, audit_logs                                                                                                                                     | officer scope, critical audit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FR-ORG-002 Organization Unit Management    | `/admin/organization-units` routes                                                                                                                                                                                                             | organization unit list/detail                                                                                                       | organization_units, officer_assignments, audit_logs                                                                                                                            | scoped list API, Super Admin create/update/archive, audit side effects, rendered Admin Lite list/detail/form routes, Next.js list/create/detail route smoke tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR-ADMIN-004 Prayer Management             | `/admin/prayers` routes                                                                                                                                                                                                                        | prayer list/editor                                                                                                                  | prayers, audit_logs                                                                                                                                                            | guarded list/create/patch API, admin app list/editor workflow model, visibility required, archive not delete, audit side effects, Next.js list route smoke test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| FR-ADMIN-005 Event Management              | `/admin/events` routes                                                                                                                                                                                                                         | event list/editor                                                                                                                   | events, audit_logs                                                                                                                                                             | guarded list/create/patch API, admin app list/editor workflow model, officer scope, public/private explicit, archive not delete, audit side effects, Next.js list route smoke test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| FR-ADMIN-006 Announcement Management       | `GET/POST /admin/announcements`, `PATCH /admin/announcements/:id`; `/admin/announcements`, `/admin/announcements/new`, `/admin/announcements/:id`                                                                                              | announcement list/editor mounted                                                                                                    | announcements, audit_logs                                                                                                                                                      | guarded admin announcement API contracts, officer scope filtering/writes, Super Admin global management, lifecycle timestamps, body-redacted audit summaries; Admin Lite Next.js list/create/detail editor routes with shared DTO validation, API/demo loading, scoped action metadata, readonly state, 404 scoped misses, and no chat/comments/read receipts/push delivery state; first publish resolves audience-safe candidate/brother push recipients and dispatches generic notifications through the configured adapter                                                                                                                                                                                                                                                                                                                        |
| FR-ADMIN-007 Silent Prayer Management      | `GET/POST /admin/silent-prayer-events`, `PATCH /admin/silent-prayer-events/{id}`                                                                                                                                                              | silent prayer editor                                                                                                                | silent_prayer_events, audit_logs                                                                                                                                               | guarded Admin Lite list/create/patch API, officer scope filtering/writes, Super Admin global management, lifecycle metadata, OpenAPI contract checks, audit summaries without intention text, no participant list/session id/user id/roster exposure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FR-AUDIT-001 Audit Logging                 | mutation side effects, `GET /admin/audit-logs`                                                                                                                                                                                                 | Admin Lite audit log list mounted at `/admin/audit-logs`                                                                             | audit_logs                                                                                                                                                                     | critical mutations write redacted before/after summaries; Super Admin-only audit-log read API; candidate request export/erasure and candidate profile export/erasure audit side effects; officers/Idle users denied before rows load; shared DTO validation; Admin Lite API/demo/Next route tests; raw IP, actor email, nested JSON, erased candidate email/phone/message/officer note/profile display name/provider/token values, exported candidate profile email/display name, and unredacted source payloads omitted from audit surfaces                                                                                                                                                                                                                                                                                                                        |
| FR-CONTENT-001 Content Approval            | admin content routes                                                                                                                                                                                                                           | content editors                                                                                                                     | publishable content tables                                                                                                                                                     | unapproved publish blocked for prayer, event, announcement, and silent-prayer admin content; approval metadata exposed for prayer/event/announcement admin DTOs; direct publish create/update attempts fail before audit logging or announcement push dispatch; approved content can still move to published status; Admin Lite prayer/event/announcement list models and announcement detail editor show approval-before-publish action metadata so operators do not see publish actions until content is approved; typed Admin Lite API helpers centralize approve/publish/archive/cancel PATCH payloads for prayer/event/announcement content, including event approval timestamps                                                                                                                                                                                                                                                                                                                                                                  |
| FR-PRIV-001 Privacy Controls               | all APIs; shared `@jp2/shared-auth` role/scope/visibility helpers; `GET /admin/candidate-requests/:id/export`, `POST /admin/candidate-requests/:id/erase`, `GET /admin/candidates/:id/export`, `POST /admin/candidates/:id/erase`, `POST /auth/device-tokens/revoke` | all screens                                                                                                                         | all private tables                                                                                                                                                             | shared auth matrix, permission, visibility, leak tests; Super Admin-only candidate request subject export/legal erasure and candidate profile subject export/legal erasure; officers denied before export/erasure rows load; request erasure anonymizes candidate request personal identifiers, clears message/officer note/idempotency key, archives the row, returns only erasure metadata; candidate profile erasure is candidate-only, rejects converted/non-candidate users, anonymizes the linked user identity, revokes candidate roles/provider links/device tokens, archives profiles instead of deleting, returns only erasure metadata; self-service device-token revocation hashes request tokens, revokes current-user active tokens only, and exposes no token id/hash/last-four metadata; audit summaries exclude candidate email, phone, message, officer note, profile display name, provider, and token values                                                                                                         |
| NFR-LOC-001 Localization Foundation        | no API surface; shared `@jp2/shared-i18n` contract for UI copy keys                                                                                                                                                                            | future Phase 10B mobile/Admin Lite roadmap screens                                                                                  | default English UI catalog; approved content remains in content/data tables                                                                                                    | shared i18n catalog coverage, locale fallback, interpolation, dynamic key checks, and mobile/admin adapter helper tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
