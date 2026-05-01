# Decision Log

This document records major architectural, product, and operational decisions made during the JP2 App implementation. Each decision is documented with the problem, options considered, chosen approach, rationale, and any implementation notes.

Use this to understand the "why" behind key choices and to avoid revisiting settled decisions.

## Format

```markdown
## [Date] Decision Name (ADR-NNN)

**Problem**: What question or challenge required a decision?

**Options**:
1. Option A — description and tradeoffs
2. Option B — description and tradeoffs
3. Option C — description and tradeoffs

**Decision**: Selected option and responsible decision-maker.

**Rationale**: Why this choice was best given the problem and constraints.

**Implementation Notes**: How this decision affects code, architecture, or process.

**Related Decisions**: Links to other decisions that informed or constrain this one.

**Status**: DECIDED | IN REVIEW | DEPRECATED
```

---

## Established Decisions

### May 1, 2026 — Scope Control via Explicit Approval Gate (ADR-001)

**Problem**: How do we prevent V1 scope creep while allowing justified V2/out-of-scope features to be considered?

**Options**:
1. No explicit gate — agents implement what makes sense; review in PR.
2. Explicit gate with human approval — agents must pause and ask before implementing V2 items.
3. Hybrid — certain categories (chat, payments, maps) are hard-blocked; others need approval.

**Decision**: Option 2 with governance document (AGENTS.md). Explicit human-owner approval required for any V2 or out-of-scope feature.

**Rationale**: 
- Religious/community software can easily drift into surveillance or inappropriate features if unchecked.
- Scope discipline protects the V1 pilot and prevents months of wasted effort.
- Forcing agents to articulate rationale (product value, security impact, implementation cost) leads to better decisions.

**Implementation Notes**:
- AGENTS.md defines the scope-change process: explain rationale → list impact → ask for approval → update docs before coding.
- Scope changes update `docs/product/v1-scope.md`, `docs/product/v2-backlog.md`, `docs/traceability.md`, and relevant implementation docs.
- The human owner is the final arbiter; escalate ambiguous cases early rather than coding and asking for forgiveness.

**Related Decisions**: ADR-002 (privacy defaults), ADR-003 (no-duplicate policy)

**Status**: DECIDED

---

### May 1, 2026 — Privacy-First Data Model (ADR-002)

**Problem**: How do we ensure the app does not become a system of spiritual surveillance or expose private data by accident?

**Options**:
1. Add privacy controls in admin panel post-launch; fix in V2 if problems arise.
2. Privacy-first defaults from the start; opt-in for any public data exposure; test visibility early.
3. Minimal approach — only public content; lock down other tables administratively.

**Decision**: Option 2 with explicit test requirements. Privacy is built in from Phase 0 onboarding (through Phase 2 visibility tests).

**Rationale**:
- Religious/community data is inherently sensitive (beliefs, participation, spiritual history).
- Discovering a surveillance risk in production is worse than being overly cautious in V1.
- Privacy by default also simplifies GDPR/RODO compliance for launch in EU.
- Testing visibility early (Phase 2 permission matrix tests) catches bugs before reaching users.

**Implementation Notes**:
- All publishable content uses visibility enum (`PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, `BROTHER`, `CHORAGIEW`, `OFFICER`, `ADMIN`).
- Public APIs never return private content; enforcement is server-side, never client-only.
- Officer access is scoped by chorągiew; a rogue officer cannot see unrelated units.
- Silent prayer exposes aggregate counters only; no participant lists are stored or exported.
- Archive instead of delete for community/audit records; erasure is a separate legal process.

**Data Safety Rules** (enforced from Phase 0):
- No public list of brothers.
- No exact home addresses.
- No public personal prayer logs.
- No public roadmap history.
- No public leaderboards or rankings.
- No aggressive streaks or shame-based progress UI.
- No geocheck-ins in V1.

**Related Decisions**: ADR-001 (scope control), ADR-004 (audit logging)

**Status**: DECIDED

---

### May 1, 2026 — No-Duplicate Policy for Shared Contracts (ADR-003)

**Problem**: How do we prevent inconsistencies in roles, visibility, validation schemas, error shapes, and permission checks across mobile, admin, and API?

**Options**:
1. Each app/library owns its own enums, schemas, and utilities; accept some duplication.
2. Single source of truth for contracts; all apps import shared enums/schemas/helpers.
3. Code generator approach — generate enums, DTOs, client from a central definition.

**Decision**: Option 2 with single-source libraries in `/libs/shared`. Shared roles, visibility, validation, error contracts, auth helpers.

**Rationale**:
- Security-sensitive logic (roles, permissions, visibility) cannot be duplicated without introducing bugs.
- Zod schema sharing ensures mobile/admin/API validate identically.
- Generated OpenAPI client ensures API contract compatibility.
- Simpler than a full code-generation pipeline; easier for agents to understand and maintain.

**Implementation Notes**:
- Single sources (from `docs/agent/no-duplicate-policy.md`):
  - Stored roles: `@jp2/shared-types` role enum
  - Visibility values: `@jp2/shared-auth` visibility enum + filter utility
  - DTO validation: shared Zod schemas
  - Permission checks: `@jp2/shared-auth` helpers + backend guards
  - Error shape: common contract + exception mapper
  - API client: generated from OpenAPI
  - Design tokens: shared token package with platform adapters

- Required agent behavior:
  - Search before creating anything reusable.
  - Prefer moving a repeated pattern into `/libs/shared` over copying it.
  - Keep shared utilities boring and domain-specific; no speculative frameworks.

**Related Decisions**: ADR-002 (privacy-first), ADR-005 (monorepo structure)

**Status**: DECIDED

---

### May 1, 2026 — Monorepo with Nx + pnpm + TypeScript Strict Mode (ADR-005)

**Problem**: What tooling structure allows mobile, admin, and API to share types, validation, and design tokens while remaining deployable independently?

**Options**:
1. Separate repositories with npm package sharing (more decoupled but slower to develop).
2. Monorepo with Nx + npm (npm workspaces; standard but not optimized for large trees).
3. Monorepo with Nx + pnpm + TypeScript strict mode (fast, strict type safety, shared dev experience).

**Decision**: Option 3. Nx monorepo with pnpm workspaces and TypeScript strict mode throughout.

**Rationale**:
- Shared types (roles, visibility, DTOs) need to be co-developed without version friction.
- pnpm is faster and has better disk usage than npm.
- TypeScript strict mode catches more errors at compile time.
- Nx provides workspace-level tasks (lint, test, build, quality gates) and dependency graph visualization.
- Allows fine-grained deployment: each app can be released independently without releasing the whole repo.

**Implementation Notes**:
- Structure: `/apps` (mobile, admin, api), `/libs/shared` (types, validation, auth, design tokens), plus domain libraries as needed.
- Launch commands: `pnpm dev:api`, `pnpm dev:mobile`, `pnpm dev:admin` (and demo variants).
- Quality gates run at workspace level: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Generated artifacts (OpenAPI, Prisma client) are cached and updated before dependent tasks run.

**Related Decisions**: ADR-003 (no-duplicate policy), ADR-006 (API framework choice)

**Status**: DECIDED

---

### May 1, 2026 — NestJS for API, Next.js App Router for Admin, Expo React Native for Mobile (ADR-006)

**Problem**: Which frameworks for API, admin web, and mobile best support TypeScript sharing, demo mode, and rapid iteration?

**Options**:
1. Node.js Express/Fastify, plain React, React Native (lightweight but less integrated).
2. NestJS, Next.js, Expo React Native (opinionated, integrated, strong TypeScript support).
3. Remix/Astro for admin, tRPC for API integration (newer but less battle-tested for religious apps).

**Decision**: Option 2. NestJS for API, Next.js App Router for admin, Expo for mobile.

**Rationale**:
- NestJS enforces modular structure, dependency injection, and guards (helpful for permission checks).
- Next.js App Router supports API routes, middleware, and deployment to Vercel or any Node host.
- Expo allows developing mobile in JavaScript/TypeScript, testing in browser dev server, and exporting to native via EAS.
- All three share TypeScript, allowing seamless DTO/schema imports.
- Strong community, good documentation, and battle-tested.

**Implementation Notes**:
- API uses NestJS modules per domain (identity, organization, prayers, events, etc.).
- Admin uses Next.js App Router with shared API client (generated from OpenAPI).
- Mobile uses Expo with React Native, with shared design tokens and API client.
- Demo mode uses in-memory fixtures in each app; no API calls needed locally.

**Related Decisions**: ADR-005 (monorepo), ADR-007 (database choice)

**Status**: DECIDED

---

### May 1, 2026 — PostgreSQL + Prisma + migrations-as-code (ADR-007)

**Problem**: How do we manage a database schema that evolves with features while maintaining an audit trail and a clear path to production deployments?

**Options**:
1. TypeORM entities with auto-migration (simpler locally but risky in production).
2. Raw SQL migrations with a migration tool (more control but more boilerplate).
3. Prisma schema + generated migrations with `prisma migrate` (good balance of safety and usability).

**Decision**: Option 3. PostgreSQL as source of truth, Prisma schema definition, migrations generated via `prisma migrate dev` and committed to git.

**Rationale**:
- Prisma schema is the single source of truth; generated migrations are committed to version control.
- `prisma migrate` ensures schema matches compiled Prisma client.
- Database constraints are explicit (not_null, unique, foreign keys) and validated before deploy.
- Seed data is version-controlled alongside migrations, enabling reproducible test data.
- Clear audit trail: every change is a git commit with a migration SQL file.

**Implementation Notes**:
- Schema lives in `/apps/api/prisma/schema.prisma`.
- Migrations are generated into `/apps/api/prisma/migrations/` with timestamp-prefixed names.
- Each feature phase updates the schema and generates migrations in the same commit.
- Seed data in `/apps/api/prisma/seed.ts` is run after migrations and is updated as phases add features.
- CI validates that migrations apply cleanly on a fresh database.

**Related Decisions**: ADR-006 (API framework), ADR-004 (audit logging)

**Status**: DECIDED

---

### May 1, 2026 — Audit Logging from Phase 2 (ADR-004)

**Problem**: How do we ensure critical administrative actions are traceable for legal and operational accountability without adding excessive logging overhead?

**Options**:
1. Add audit logging in Phase 12 (late, but simpler to scope initially).
2. Build audit logging infrastructure in Phase 2; require agents to log critical actions.
3. No audit logging in V1; defer to V2 when legal requirements are clearer.

**Decision**: Option 2. Audit logging infrastructure in Phase 2; critical actions logged from Phase 2 onward.

**Rationale**:
- Religious/community organizations are often subject to governance or legal requirements around critical decisions (membership, degree changes, fund handling if added).
- An audit log retrofitted in V2 will miss early data and be harder to integrate into existing code.
- Audit table schema is simple (action, actor, subject, changes, timestamp); no performance impact.
- Forces early thinking about what "critical" means (user created, role changed, degree changed, content published, visibility changed, officer assigned).

**Critical Actions for V1**:
- User created, deactivated, or status changed.
- Role assigned or revoked.
- Degree assigned or changed.
- Roadmap step approved or rejected.
- Officer assigned or revoked.
- Content published or archived.
- Silent prayer event created or cancelled.

**Implementation Notes**:
- `AuditLog` entity with `action`, `actor_user_id`, `subject_user_id`, `subject_type`, `subject_id`, `changes` (JSON), `timestamp`.
- Logged at service layer; NestJS interceptor or decorator applied to critical mutations.
- Super Admin can view audit logs in admin panel; limited officer audit view deferred to V2.
- Audit redaction for sensitive fields (passwords, tokens, payment info); not applicable to V1 but pattern established.

**Related Decisions**: ADR-002 (privacy-first), ADR-007 (database choice)

**Status**: DECIDED

---

### May 1, 2026 — Demo Mode Rejection in Production (ADR-008)

**Problem**: How do we allow local development with demo fixtures while ensuring the app cannot accidentally ship or run in demo mode in production?

**Options**:
1. Runtime check at app startup (demo mode rejects if `NODE_ENV=production`).
2. Build-time stripping of demo mode code from production builds.
3. Trust agents/CI to never set `APP_RUNTIME_MODE=demo` in production.

**Decision**: Option 1 with CI validation. Runtime check in app shells (mobile, admin, API) rejects demo mode if `NODE_ENV=production`. CI smoke test validates the rejection.

**Rationale**:
- Runtime check is simple and catches accidents (e.g., a developer mistakenly shipping with demo fixtures).
- Production deployments set `NODE_ENV=production`, making the rejection automatic.
- Build-time stripping is more complex and easier to bypass.
- Trust + validation is stronger than trust alone.

**Implementation Notes**:
- Mobile/admin/API shared shells import a runtime-mode parser.
- If `APP_RUNTIME_MODE=demo` and `NODE_ENV=production`, throw an error and refuse to start.
- CI includes a smoke test: `pnpm build` and verify that `NODE_ENV=production APP_RUNTIME_MODE=demo` fails.
- Local development uses `NODE_ENV=development APP_RUNTIME_MODE=demo` for full flexibility.

**Related Decisions**: ADR-006 (framework choice), ADR-005 (monorepo structure)

**Status**: DECIDED

---

### May 1, 2026 — Adapter Pattern for External Integrations (ADR-009)

**Problem**: How do we allow swapping auth providers, push notification services, and future integrations without rewriting business logic?

**Options**:
1. Inline each provider's API into domain logic (tightly coupled, harder to test).
2. Adapter pattern with provider interface (slightly more boilerplate, much easier to swap).
3. Full inversion-of-control container (powerful but over-engineered for V1).

**Decision**: Option 2. Adapter pattern with interfaces for auth providers, push providers, and future integrations.

**Rationale**:
- Allows testing with a fake auth provider (no Firebase dependency in unit tests).
- Allows swapping Firebase auth to a different provider without touching business logic.
- Simple to implement; clear where provider-specific code lives.

**Implementation Notes**:
- `AuthProviderAdapter` interface in `libs/shared/auth` with methods for `verifyToken()`, `linkAccount()`, `unlinkAccount()`.
- Firebase implementation in `apps/api/src/auth/providers/firebase.adapter.ts`.
- Test/fake implementation in `apps/api/src/auth/providers/fake.adapter.ts`.
- Dependency injection in NestJS allows swapping adapters at runtime.
- Same pattern applies to push notifications, storage (if file uploads added), email, etc.

**Related Decisions**: ADR-006 (API framework), ADR-005 (monorepo structure)

**Status**: DECIDED

---

### May 1, 2026 — Design Tokens for Theming (ADR-010)

**Problem**: How do we maintain a single brand/design system across mobile (React Native) and admin (Next.js) without hardcoding colors, spacing, typography in each app?

**Options**:
1. Each app owns its design system (less coordination, easier to diverge).
2. Shared design-token package with platform adapters (extra setup but centralized control).
3. CSS-in-JS with theme provider (works for web; harder for React Native).

**Decision**: Option 2. Shared design-token package (`@jp2/shared-design-tokens`) with platform adapters for mobile (React Native) and web (Next.js).

**Rationale**:
- Religious organization branding should be consistent across all platforms.
- Centralized tokens allow the Order to update brand colors, typography, spacing without touching code.
- Platform adapters handle differences (React Native doesn't support CSS units; Tailwind works on web).

**Implementation Notes**:
- Token definitions in `libs/shared/design-tokens/tokens.json` (colors, spacing, typography, radii, state colors).
- Platform adapters in `libs/shared/design-tokens/mobile/` and `libs/shared/design-tokens/web/`.
- Mobile adapter exports hooks like `useColors()`, `useSpacing()`.
- Web adapter exports Tailwind config or CSS-in-JS object.
- Component variants use tokens instead of hardcoded hex/px values.

**Related Decisions**: ADR-005 (monorepo structure), ADR-003 (no-duplicate policy)

**Status**: DECIDED

---

## Decisions Under Review

(None currently. New decisions will be added here during Phase 3+.)

---

## Deprecated Decisions

(None yet. Decisions are rarely reversed, but if one becomes obsolete, it will be marked here with the superseding decision.)

---

## How to Use This Document

**For agents**: Before making a significant architectural or product decision, check this log to see if it's already been decided. If you're proposing a change to a decided item, include the reasoning for the change and request review.

**For stakeholders**: Use this to understand the key choices that shaped the app. If you disagree with a decision, raise it early; changing course mid-implementation is more costly than correcting direction at the start.

**For future maintainers**: This log is the "why" behind the architecture. It helps you understand constraints and tradeoffs when modifying the system years later.

---

## Template for New Decisions

Copy this template when a new major decision needs to be documented:

```markdown
## [Date] Decision Name (ADR-NNN)

**Problem**: [What question needed a decision?]

**Options**:
1. [Option A] — [description and tradeoffs]
2. [Option B] — [description and tradeoffs]
3. [Option C] — [description and tradeoffs]

**Decision**: [Chosen option and responsible decision-maker]

**Rationale**: [Why this choice was best]

**Implementation Notes**: [How this decision affects code, architecture, or process]

**Related Decisions**: [Links to other relevant decisions]

**Status**: DECIDED | IN REVIEW | DEPRECATED
```
