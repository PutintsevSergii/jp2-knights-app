# JP2 App Glossary

This glossary defines Order-specific terms, user types, organizational structures, and technical concepts used throughout the JP2 App documentation and codebase.

## Order & Spirituality Terms

### Chorągiew

Polish word meaning "flag" or "banner"; the primary organization unit in V1. A local community of brothers within the Order, typically anchored to a city or region. Each chorągiew has one assigned officer and serves a distinct geographic or community area.

**In the app**: Chorągiew is the scope boundary for officer administration and member filtering. Brother can belong to exactly one chorągiew.

### Reguła

The canonical Rule/Constitution of the Order. V1 does not embed the full Reguła in code; official text requires pastoral approval before publication.

### Degree (Formation)

A stage of advancement within the Order brotherhood. The exact degree names and advancement requirements are defined by Order leadership and configured through the Roadmap system, not hardcoded in code.

**In the app**: Brothers see their current degree on their profile and can submit roadmap steps to advance. Officers approve or reject advancement.

### Formation Roadmap

A personalized path for each brother to progress through degrees and spiritual development. In V1, this is a configurable system where officers can define steps and approve submissions; it is not an automated system.

**In the app**: `Roadmap`, `RoadmapStage`, `RoadmapStep`, `RoadmapSubmission` entities manage the journey.

### Officer (Poczmistrz)

An elected or appointed leader responsible for a single chorągiew. Officers can manage members, approve roadmap steps, create events/announcements, and access an Admin Lite panel scoped to their chorągiew only.

**In the app**: Role is `OFFICER`. Access is scoped by `officer_assignments` table linking officer to organization units.

### Brother (Brat)

A confirmed member of the Order. Brothers have full access to the app including private/member-only content, formation roadmap, and silent prayer.

**In the app**: Role is `BROTHER`. Visibility filtering ensures brothers see their own chorągiew content and brother-only public content only.

### Candidate (Kandydat)

A person who has expressed interest in joining and has been invited or activated for onboarding. Candidates see a guided path, basic formation roadmap, and content marked for candidates. Candidates cannot see brother-only content.

**In the app**: Role is `CANDIDATE`. Requires active membership with status `ACTIVE` in a candidate-scoped profile.

### Guest (Gość)

An unauthenticated user who has not logged in. Guests can discover the Order, read public prayers and events, submit join interest requests, and participate in public silent prayer anonymously.

**In the app**: No role; represented by unauthenticated session state. `APP_MODE=public` routing.

### Idle User

A person who has authenticated with Firebase through the V1 Google/Gmail provider, but has not been approved for app access. Idle users remain public-only for up to 30 days.

**In the app**: Not a role. Local authorization must not grant Candidate, Brother, Officer, or Admin access until a scoped country/region approver or Super Admin confirms the person and assigns roles/scopes.

### Country/Region Approver

An admin-assigned privilege for reviewing Idle Firebase sign-ins within a country or region scope. Any participant of the Order may receive this privilege if assigned by an authorized admin.

**In the app**: A scoped Admin Lite capability, audited and revocable. It does not come automatically from Firebase sign-in.

## Organizational Structure

### Organization Unit

A generic entity representing any level of the Order's structure. V1 uses this for chorągiew; V2 may introduce province, commandery, and generalate.

**Schema**: `organization_units` table with `type` (enum), `parent_unit_id` (optional), name, location, status.

**In the app**: Type is currently `CHORAGIEW` for V1; visibility and scope rules assume one chorągiew per brother.

### Officer Assignment

A record linking a user to an organization unit with administrative authority. One officer can be assigned to one chorągiew in V1; assignments include optional effective/expiry dates.

**Schema**: `officer_assignments` table with `user_id`, `organization_unit_id`, `assigned_at`, `revoked_at`.

## User & Authentication

### User

A person in the system. Users have identity (name, email, phone), roles, and memberships. A user can have exactly one active role at a time in V1 (though migration to multi-role is possible in V2).

**Schema**: `users` table with `email` (unique), `phone`, `name`, `status` (ACTIVE/INACTIVE/SUSPENDED).

### Provider Account

An account linked to an external identity provider (e.g., Firebase). Allows a user to log in via provider-backed verification without storing passwords locally.

**Schema**: `identity_provider_accounts` table with `user_id`, `provider_name`, `provider_user_id`, `created_at`.

### Session

A temporary authenticated state for a user. Sessions are backed by secure cookies or tokens, refreshed periodically, and revoked on logout or inactivity.

**Implementation**: Adapter-based, initially Firebase-backed; test/fake provider available for development.

### Device Token

A push notification identifier for mobile devices. Stored with user consent and revoked on logout or explicit disable. Hashed where possible.

**Schema**: `device_tokens` table with `user_id`, `token_hash`, `platform` (ios/android), `created_at`.

## Content & Visibility

### Visibility

An audience-control mechanism for any publishable content (prayers, events, announcements, etc.). Visibility values are: `PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, `BROTHER`, `CHORAGIEW`, `OFFICER`, `ADMIN`.

- **PUBLIC**: visible without login.
- **FAMILY_OPEN**: visible without login, marked safe for families.
- **CANDIDATE**: visible only to authenticated candidates and admins in candidate context.
- **BROTHER**: visible only to authenticated brothers.
- **CHORAGIEW**: visible only to members of the specific chorągiew plus scoped officers.
- **OFFICER**: visible only to officers/super admins of the relevant unit.
- **ADMIN**: visible only in admin panel and to super admins.

**In the app**: All publishable content uses visibility. Filtering is enforced server-side in APIs, never only in clients.

### Content Status

The publication lifecycle of content: `DRAFT`, `REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`.

- **DRAFT**: work in progress; not visible except to creator/admin.
- **REVIEW**: awaiting approval; visible to approvers only.
- **APPROVED**: ready to publish but not yet live.
- **PUBLISHED**: live and visible according to visibility rules.
- **ARCHIVED**: retired; no longer visible but retained for history/legal.

**In the app**: Used for prayers, events, announcements, silent prayer events, roadmap, and official content pages.

### Publishable Content

Any user-created or official content with status and visibility controls: prayers, events, announcements, silent prayer events, approved information pages, candidate roadmap, formation roadmap.

**Single source**: See `docs/architecture/content-publishing-model.md`.

## Community & Prayer

### Silent Prayer (Modlitwa Cicha)

A real-time communal prayer session with no chat, audio, or video. Participants join anonymously (guests) or authenticated (brothers/candidates) and see an aggregate counter of participants. No participant lists are exposed.

**In the app**: Powered by Socket.IO + Redis presence. `SilentPrayerEvent` entity with real-time join/leave/disconnect.

### Event Participation Intent

A simple marker that a user intends to attend or is interested in an event. Not verified attendance; useful for officer estimation and user reminders.

**Schema**: `event_participation` table with `user_id`, `event_id`, `created_at`, `status` (INTERESTED/ATTENDING/DECLINED).

### Announcement

A time-sensitive message from admin/officer to an audience. Announcements do not become chat; no replies, comments, or threads.

**Schema**: `announcements` table with `title`, `body`, `visibility`, `status`, `pinned_at`, `published_at`.

## Technical & Operational

### Demo Mode

A backend-free runtime mode for mobile and admin to work locally without the API. Demo mode uses in-memory fixtures and is visibly labeled. **Demo mode is automatically rejected in production builds.**

**Configuration**: `APP_RUNTIME_MODE=demo` (vs `api` or `test`).

**In the app**: Separate fixture/mock data for screens, no API calls, explicit "DEMO" label on launch screen.

### Runtime Mode

Controls which backend and fixtures the app uses: `api` (real API), `demo` (local fixtures), or `test` (test fixtures).

**Configuration**: Environment variable `APP_RUNTIME_MODE`.

**Single source**: `docs/architecture/app-runtime-modes.md`.

### Quality Gates

Automated checks that must pass before code is merged: lint, typecheck, unit tests (80% coverage), integration tests, build, contract generation/checks, migration checks, smoke tests.

**Single source**: `docs/agent/quality-gates.md`.

### Traceability

A mapping of requirements (FR-_, NFR-_) to the expected implementation surface (APIs, screens, database tables, tests).

**Single source**: `docs/traceability.md`.

### Audit Log

An immutable record of critical administrative actions (user created, role changed, degree changed, content published, roadmap approved, visibility changed, officer assigned).

**Schema**: `audit_logs` table with `action`, `actor_user_id`, `subject_user_id`, `subject_type`, `subject_id`, `changes`, `timestamp`.

**Access**: Super Admin only by default; limited officer queries possible with approval in V2.

### Phase

A cohesive slice of implementation, numbered 0–13. Each phase has exit criteria (apps launch, scope is enforced, tests pass) and touches only relevant files.

**Single source**: `docs/delivery/implementation-roadmap.md`, `docs/delivery/phase-breakdown.md`.

## Architecture Patterns

### Provider Adapter

An abstraction layer for external integrations (auth providers, push notification services, email providers, storage). Allows swapping implementations without changing business logic.

**Example**: Firebase auth provider adapter can be replaced with a fake provider for testing.

**Single source**: `docs/architecture/auth-provider-adapter.md`.

### DTO (Data Transfer Object)

A validated schema for API request/response payloads. Defined using shared Zod schemas in `@jp2/shared-types` and generated into OpenAPI contracts.

**Single source**: `docs/api/api-contract-format.md`.

### Monorepo

A single repository containing all apps and libraries (mobile, admin, API, shared). Managed by Nx with workspace-level tasks (lint, test, build, quality gates).

**Structure**: `/apps` (mobile, admin, api), `/libs/shared` (types, validation, auth, design tokens).

**Single source**: `docs/architecture/monorepo-structure.md`.

### Role-Based Access Control (RBAC)

Permission system based on user role: `SUPER_ADMIN`, `OFFICER`, `BROTHER`, `CANDIDATE`, or unauthenticated `GUEST`.

**Single source**: `docs/product/roles-and-permissions.md`.

### Scope

A boundary for data access, typically chorągiew. Officers can only see/edit members of their assigned chorągiew; brothers see only their own chorągiew events/announcements.

**Enforcement**: Backend guards and service filters; never client-only.

**Single source**: `docs/architecture/privacy-and-security.md`.

## Pilot & Deployment

### Pilot

A real-world validation with one chorągiew, one officer, one super admin, and 5–20 brothers. Pilot tests all four user modes (guest, candidate, brother, officer) and validates quality gates before general release.

**Scope**: Defined in `docs/delivery/pilot-validation-plan.md`.

### Super Admin

A global administrator role with access to all chorągwie, all users, all content, and all admin functions. Super Admin is created during seed data and rarely changed.

**In the app**: Role is `SUPER_ADMIN`. Visible only in admin panel. No mobile mode.

---

## See Also

- [Product Vision](product/product-vision.md)
- [V1 Scope](product/v1-scope.md)
- [Roles and Permissions](product/roles-and-permissions.md)
- [Visibility Model](product/visibility-model.md)
- [Database Design](data/database-design.md)
