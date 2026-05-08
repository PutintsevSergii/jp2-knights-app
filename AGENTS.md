# AGENTS.md

This file is the operating contract for coding agents working in this repository.

## 📋 Quick Checklist for Coding Agents

**Before starting work**:
- ✅ Check [docs/traceability.md](docs/traceability.md) — what phase are we in?
- ✅ Read phase scope in [docs/delivery/implementation-roadmap.md](docs/delivery/implementation-roadmap.md)
- ✅ Search repo for existing patterns (roles, visibility, DTOs, schemas)
- ✅ Run quality gates: `pnpm quality`

**While implementing**:
- ✅ Keep APIs server-side filtered (never client-side only)
- ✅ Update OpenAPI/DTOs if changing contracts
- ✅ Add tests for new logic (80% coverage minimum)
- ✅ Update [docs/traceability.md](docs/traceability.md) as you complete requirements

**Before submitting work**:
- ✅ All quality gates pass
- ✅ [docs/traceability.md](docs/traceability.md) updated with what's done
- ✅ [docs/delivery/IMPLEMENTATION_STATUS.md](docs/delivery/IMPLEMENTATION_STATUS.md) updated to reflect traceability changes (same commit)
- ✅ See "Synchronizing traceability.md and IMPLEMENTATION_STATUS.md" section in Coding Workflow for exact procedure
- ✅ Relevant doc updates in same commit
- ✅ Final response includes test results and coverage

---

## Start Here — Full Setup

**⭐ CANONICAL SOURCE FOR PROGRESS**: [docs/traceability.md](docs/traceability.md)

1. Read [docs/README.md](docs/README.md) and [docs/GLOSSARY.md](docs/GLOSSARY.md).
2. **Check [docs/traceability.md](docs/traceability.md)** — the ONE source of truth for:
   - What phase we're in right now
   - What's already implemented
   - What requirements are mapped to APIs/screens/data/tests
3. Read [docs/GETTING_STARTED_BY_ROLE.md](docs/GETTING_STARTED_BY_ROLE.md) to find the engineer's onboarding path.
4. Read the canonical docs for the current task: scope, roles, visibility, functional requirements, phase, API, data, and screens.
5. Check [docs/delivery/DECISION_LOG.md](docs/delivery/DECISION_LOG.md) to understand why key choices were made.
6. Search the repository before creating new code. Reuse existing contracts, utilities, tests, and patterns.

**After completing a task or phase**: Update [docs/traceability.md](docs/traceability.md) with what you accomplished

## Architecture Defaults

- TypeScript strict mode, pnpm, Nx, Expo React Native, Next.js App Router, NestJS REST, OpenAPI 3.1, shared Zod schemas, Prisma migrations, PostgreSQL, Redis, Socket.IO, Expo Notifications.
- Public/private separation is enforced server-side.
- Admin and mobile use API contracts, never direct database access.
- Shared enums, DTOs, validation schemas, API clients, auth helpers, visibility filters, and error contracts are single sources of truth.
- Shared design tokens are the single source for branding, colors, typography, spacing, radii, state colors, and component variants across mobile and admin.
- Approved Figma screens are functional requirements, not visual references only. If a Figma screen requires data, state, actions, filters, counts, or workflow behavior that current APIs/DTOs do not support, document the gap, verify V1 scope/RBAC/privacy, and update backend APIs, shared DTOs/OpenAPI, demo fixtures, clients, tests, and docs in the same change.
- Provider integrations belong behind adapters.
- Mobile/admin support `api` and backend-free `demo` runtime modes. Demo mode is for local development, CI smoke checks, and controlled demos only; production builds must reject it.

## ⛔ Non-Negotiables (Hard Rules)

### Scope
- Keep V1 scope disciplined. If a V2 or out-of-scope item has a strong product, security, or architectural argument, pause implementation and ask the human owner for permission with the rationale, tradeoffs, and impact. See [docs/delivery/DECISION_LOG.md](docs/delivery/DECISION_LOG.md) (ADR-001) for the scope control policy.
- Implement approved scope expansions only after the human owner gives explicit permission and the relevant docs are updated in the same change.
- **Never silently add**: chat, payments, maps, analytics, social features, or extended hierarchy. If justified, ask first.

### Security & Privacy
- Public APIs must never return private content (enforced server-side, never client-side only).
- Officer access must be scoped by chorągiew (no cross-unit leaks).
- Silent prayer exposes aggregate counters only, never participant lists.
- Do not duplicate security-sensitive logic such as roles, visibility, permissions, DTOs, error shapes, API clients, or content status workflows. See [docs/agent/no-duplicate-policy.md](docs/agent/no-duplicate-policy.md).
- Ensure accessibility (WCAG 2.1 Level AA). See [docs/product/ACCESSIBILITY_AND_INCLUSION.md](docs/product/ACCESSIBILITY_AND_INCLUSION.md).

### Data Handling
- Business entities are archived/deactivated instead of destructively deleted unless explicitly approved.
- Mitigate identified risks. See [docs/delivery/RISK_AND_MITIGATION.md](docs/delivery/RISK_AND_MITIGATION.md).

### UI & Styling
- Do not hardcode brand colors, spacing, typography, radius, or status styling in screens. Use shared design tokens and platform adapters.
- During Figma implementation, do not fake missing functionality in the UI. Missing Figma-required behavior must be implemented through the correct API/domain layer first unless it is explicitly deferred or rejected by scope/RBAC/privacy rules.

### Status Tracking
- **Update [docs/traceability.md](docs/traceability.md) in the same commit as your code changes.** This is THE source of truth for progress.
- Never leave status docs out of sync with implementation.

## Coding Workflow

1. Identify the phase and requirement IDs.
2. Read existing code/tests/docs for the same module.
3. Make the smallest cohesive change that satisfies the requirement.
4. Update API DTOs/OpenAPI, generated clients, migrations, seeds, tests, docs, and traceability in the same change when affected.
5. Update demo fixtures when DTOs, screens, roles, visibility, or workflows change.
6. Update design tokens/component variants when styling or branding changes.
7. Add or update tests that would fail without the change.
8. Run quality gates before completing the task.

### Figma-To-Implementation Requirements

For approved V1 Figma work, especially Phase 10A:

1. Treat each Figma frame as a functional screen specification covering data, visible states, actions, filters, counts, navigation, and empty/error/loading/forbidden states.
2. Compare the frame against current backend endpoints, shared DTOs/Zod schemas, OpenAPI, API clients, demo fixtures, screen models, route surfaces, and tests before implementing the UI.
3. If the design requires fields or behavior missing from current contracts, document the gap in the relevant implementation plan and update the API/domain layer before or with the screen.
4. Keep all privacy and RBAC boundaries server-side. UI visibility may improve ergonomics, but it must never become the security boundary.
5. Implement V1-valid gaps end to end: database/migration if needed, service/repository logic, DTO/schema/OpenAPI, generated clients, demo fixtures, mobile/admin screen models, renderers, tests, and traceability/status docs.
6. If a Figma element implies out-of-scope behavior such as chat, payments, maps, analytics, social features, private rosters, participant lists, or hierarchy-derived permissions, pause that part, document the scope/privacy/security impact, and request owner approval before implementation.

### Synchronizing traceability.md and IMPLEMENTATION_STATUS.md

**Both documents must stay in sync in the same commit.** Here's the concrete workflow:

#### Step 1: Update docs/traceability.md

Find the requirement row (FR-*, NFR-*) in the matrix. Update the "Current Implementation Progress" narrative at the top:

```markdown
## Current Implementation Progress

### Current Phase: Phase 3 (Public Discovery)

Implementation now includes:

- Phase 1 repository/infrastructure baseline is in place.
- Phase 2 shared auth/visibility helpers... [existing narrative]
- **Phase 3 NEW** (added May 2, 2026):
  - ✅ FR-PUBLIC-001: `/api/public/home` endpoint fully implemented with unauthenticated access
  - ✅ FR-PUBLIC-002: About the Order content endpoint returns approved content only
  - ✅ Mobile PublicHome screen renders public API responses with state handling (ready/empty/loading/error/offline)
  - ✅ Tests added: 8 integration tests for public visibility, 6 tests for content filtering
  - (see requirement rows below for full details)
```

#### Step 2: Update docs/delivery/IMPLEMENTATION_STATUS.md

Find the corresponding phase section and update three places:

**A. Executive Summary table** — Update the phase row:

```markdown
| **3** | 🟡 IN PROGRESS | ~45% | ██████████░░░░░░░░░░ | `/api/public/home`, PublicHome screen, About the Order | Link content tables (Phase 4) |
```

**B. Phase Status Details section** — Move completed items from "In Progress" to "Completed":

```markdown
### Phase 3: Public Discovery 🟡

**Status**: IN PROGRESS (~45%)

**Completed**:
- ✅ `/api/public/home` endpoint (contract defined, returns DTO, rejects private content)
- ✅ Mobile `PublicHome` screen (React Native component implemented, handles state)
- ✅ Mobile launch resolution (detects guest/candidate/brother, routes appropriately)
- ✅ Demo mode visibility (marked "DEMO" on launch screen)
- ✅ About the Order content endpoint

**In Progress**:
- 🟡 Content approval workflow integration
- 🟡 Prayer/event seed data population

**Exit criteria**: 🟡 Public/API foundation complete, content integration in progress

**Next step**: Implement prayer library API (Phase 4)
```

**C. Quality Gate Status table** — Mark any tests added:

```markdown
| **Unit tests (80%)** | ✅ | 🟡 ~82% | 🟡 ~75% | Growing; 14 public endpoint tests added |
| **Integration tests** | ✅ | 🟡 In progress | 🟡 8 public visibility tests added | Permission/visibility matrix |
```

#### Step 3: Commit Both Files

```bash
git add <your code changes>
git add docs/traceability.md
git add docs/delivery/IMPLEMENTATION_STATUS.md

git commit -m "Phase 3: Implement public home and about order endpoints

- Add /api/public/home unauthenticated endpoint with visibility filtering
- Add /api/public/about unauthenticated content endpoint
- Implement PublicHome mobile screen with state handling
- Add 8 integration tests for public visibility filtering
- Update traceability.md (Phase 3 progress narrative)
- Update IMPLEMENTATION_STATUS.md (phase summary, quality gates)"
```

#### Key Rules

- **Same commit**: Code + traceability.md + IMPLEMENTATION_STATUS.md all in one change
- **Update narrative first**: Write what's done in traceability.md's "Current Implementation Progress"
- **Update dashboard second**: Reflect that progress in IMPLEMENTATION_STATUS.md tables and sections
- **Both reference each other**: IMPLEMENTATION_STATUS.md links to traceability.md for details; agents check traceability.md first
- **Never update only one**: If you update the code and traceability.md but forget IMPLEMENTATION_STATUS.md, the dashboard drifts

## Quality Gates

Follow [docs/agent/quality-gates.md](docs/agent/quality-gates.md). Required gates include lint, typecheck, tests, coverage, build, contract generation/checks, migration checks, and relevant smoke/E2E/privacy tests.

Unit test coverage must be at least 80% for statements, branches, functions, and lines in every implemented app/library. Add integration tests where behavior crosses API, database, Redis, notification, storage, or module boundaries.

Never mark a task complete with a red pipeline. Do not skip, weaken, or delete tests to make the pipeline green. If a required command does not exist yet, Phase 1 must add it.

## Documentation Rules

- Canonical docs are listed in [docs/README.md](docs/README.md).
- Behavior changes update docs in the same change.
- Requirement/API/screen/table/test mapping changes update [docs/traceability.md](docs/traceability.md).
- Technical decision changes update [docs/architecture/technical-decisions.md](docs/architecture/technical-decisions.md).
- Approved scope changes update [docs/product/v1-scope.md](docs/product/v1-scope.md), [docs/product/out-of-scope.md](docs/product/out-of-scope.md), [docs/product/v2-backlog.md](docs/product/v2-backlog.md), and delivery/API/data/screen docs as relevant before or with implementation.

## Final Response Requirements

Every completed coding task must report:

- short summary of exactly what was done;
- what changed;
- which requirement/phase it satisfies;
- quality gates run and results;
- coverage result after the change, including statement, branch, function, and line coverage when coverage tooling exists;
- how many tests were added or changed, which tests were run, and what behavior those tests cover;
- whether TDD was used. If yes, state the failing test written first and the implementation that made it pass. If no, state why TDD was not used, for example documentation-only work, scaffolding, or mechanical configuration;
- migrations/seeds/contracts/docs updated;
- any residual risk or explicit owner-approved exception.

If no tests were added, explicitly say `Tests added: 0` and explain why existing tests or documentation-only validation were sufficient.

## Approval Process for Scope Changes

When a V2 or out-of-scope feature is proposed:

1. **Pause implementation** — do not code anything yet.
2. **Document the case** in a task description or PR comment with:
   - Product value: Why do users need this? What problem does it solve?
   - Technical impact: How many files change? How long will it take?
   - Risk impact: Does it introduce new risks? See [docs/delivery/RISK_AND_MITIGATION.md](docs/delivery/RISK_AND_MITIGATION.md).
   - Privacy/security impact: Does it expose new data or create surveillance risk?
3. **Request explicit approval** from the human owner (Product Owner or Lead Architect).
4. **Get written confirmation** (comment in task/PR; saved for record).
5. **Update docs** before or with the implementation:
   - [docs/product/v1-scope.md](docs/product/v1-scope.md) or [docs/product/v2-backlog.md](docs/product/v2-backlog.md)
   - [docs/traceability.md](docs/traceability.md)
   - Relevant API/data/screen docs
   - [docs/delivery/DECISION_LOG.md](docs/delivery/DECISION_LOG.md) (if a major decision)
6. **Proceed with implementation** only after approval and docs are updated.

**Example**: "I'd like to add email notifications (not in V1 scope). Value: officers get updates when roadmap submissions arrive. Impact: adds EmailProvider adapter, SMTP integration, 3-4 days work. Risk: potential spam if rate limiting not careful. Privacy: email addresses already stored; this doesn't create new risk. Requesting approval to proceed."
