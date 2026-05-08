# Agent Framework Recap

## Overview

This document summarizes the approaches, rules, and component structures used by coding agents in the JP project. The framework is designed to maintain code quality, security, and traceability through disciplined implementation phases.

---

## Core Principles

### 1. **Single Source of Truth for Progress**
- **Primary document**: `docs/traceability.md` 
- Every phase, requirement, and implementation status is tracked in one location
- Prevents drift between code, tests, and documentation
- Must be updated in the same commit as code changes

### 2. **Phase-Based Implementation with Strict Scope Control**
- Work is organized into discrete phases with clear scope boundaries
- **V1 scope is non-negotiable**: expansion requires explicit human owner approval
- Before implementing any out-of-scope feature, agents must:
  - Document the product value and why V1 alternative is insufficient
  - Explain privacy, security, operational, and maintenance impact
  - Identify all affected docs, APIs, data, screens, tests
  - Get written approval before coding

### 3. **Quality Gates as Mandatory Pass/Fail Checks**
- Pipeline must be green before task completion
- No tests are skipped to make gates pass
- Coverage minimum: 80% for statements, branches, functions, and lines
- Generated artifacts must be produced by the command graph, not local state
- Full gates on phase completion; affected commands during development

### 4. **No Duplicate Policy for Security**
Duplication is a product risk for security-sensitive code. Single sources of truth:
- Stored roles (shared enum)
- Visibility filters (shared visibility utility)
- Content statuses (shared workflow helper)
- API error shapes (common error contract)
- DTO validation (shared Zod schemas)
- API clients (generated from OpenAPI)
- Permission checks (shared auth helpers)
- Design tokens (shared token package)

### 5. **Component Boundary Contracts**
Files have explicit ownership and responsibilities:
- Root files are composition points only
- Screen models are pure builders (no React/network)
- Route surfaces own loaders, selected IDs, and actions
- Renderer components receive models and callbacks
- Shared components have documented inventory

### 6. **Figma-As-Specification**
- Each Figma frame is a functional screen specification
- Missing data/behavior in Figma requires API/domain layer changes first
- Client-side visibility filtering is never the security boundary

---

## Agent Workflow

### Before Starting Work
1. Read [docs/traceability.md](docs/traceability.md) — what phase are we in?
2. Read phase scope in [docs/delivery/implementation-roadmap.md](docs/delivery/implementation-roadmap.md)
3. Search repo for existing patterns (roles, visibility, DTOs, schemas)
4. Read canonical docs for current task (scope, roles, visibility, requirements)
5. Run quality gates to establish baseline

### During Implementation
- Keep APIs server-side filtered (never client-side only)
- Update OpenAPI/DTOs if changing contracts
- Add tests for new logic (80% coverage minimum)
- Reuse existing shared contracts instead of duplicating
- Keep the app runnable after each phase

### Before Submitting Work
- All quality gates pass
- [docs/traceability.md](docs/traceability.md) updated with what's done
- [docs/delivery/IMPLEMENTATION_STATUS.md](docs/delivery/IMPLEMENTATION_STATUS.md) updated
- Relevant doc updates in same commit
- Final response includes test results and coverage

---

## Key Rules & Non-Negotiables

### Security & Privacy
- **Public APIs** never return private content (enforced server-side, never client-side)
- **Officer access** scoped by organizational unit (no cross-unit leaks)
- **Duplication** of security-sensitive logic is not acceptable temporary debt
- **Content status workflows** use single shared implementation

### Scope Control
- V1 scope is disciplined and non-negotiable
- Silently adding: chat, payments, maps, analytics, social features = prohibited
- Scope expansion requires: rationale + tradeoffs + impact + human owner approval

### Data Handling
- Business entities are archived/deactivated, not destructively deleted
- Avoid destructive deletes unless explicitly approved
- Mitigate identified risks per [RISK_AND_MITIGATION.md]

### UI & Styling
- No hardcoded colors, spacing, typography, radius in screens
- Use shared design tokens and platform adapters
- During Figma implementation, do not fake missing functionality

### Testing
- Unit test coverage: 80% minimum (statements, branches, functions, lines)
- Integration tests required where behavior crosses API/database/Redis/notification/storage boundaries
- Permission/visibility matrix testing for all roles
- Officer scope tested with at least two organizational units

---

## Component Structure Patterns

### Mobile Architecture
```
apps/mobile/src/
├── App.tsx                        # Thin composition root
├── mobile-routes.ts               # Route unions only, no React
├── mobile-public-surface.tsx      # Public route state/loading/navigation
├── mobile-candidate-surface.tsx   # Candidate route state/actions
├── mobile-brother-surface.tsx     # Brother route state/actions
├── *-screen.ts                    # Pure screen model/builder
├── *-screens.ts                   # Barrel re-exports only
├── *-api.ts                       # Typed API calls, DTO validation
├── *-fixtures.ts                  # Demo mode payloads
├── screens/
│   ├── *.tsx                      # React Native renderers
│   ├── shared/*.tsx               # Shared reusable components
│   └── shared/README.md           # Component inventory
```

### Admin Architecture
```
apps/admin/src/
├── app/**/route.ts               # HTTP boundary, no duplicate logic
├── **/*-api.ts                   # DTO mapping only
├── **/*-screen.ts                # Screen model/builder
├── **/*-screens.ts               # Barrel re-exports only
```

### Shared Libraries
```
libs/shared/
├── auth/                          # Role, visibility, permission helpers
├── design-tokens/                 # Canonical token values
├── types/                         # Shared DTOs, Zod schemas, enums
```

---

## Documentation Synchronization

### Files That Must Stay In Sync (Same Commit)
1. **Code changes** (`src/`, `apps/`, `libs/`)
2. **docs/traceability.md** — narrative of what's implemented
3. **docs/delivery/IMPLEMENTATION_STATUS.md** — phase dashboard
4. **Relevant API/data/screen docs** — behavior changes
5. **docs/architecture/technical-decisions.md** — decision changes
6. **Test files** — new test coverage

### Traceability Update Procedure
1. Find requirement row (FR-*, NFR-*) in matrix
2. Update "Current Implementation Progress" narrative
3. Update phase details (completed/in-progress items)
4. Update IMPLEMENTATION_STATUS.md tables:
   - Executive Summary phase row
   - Phase Status Details section
   - Quality Gate Status table

---

## Quality Gates Checklist

### Standard Commands
```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm contract:generate
pnpm contract:check
pnpm db:migrate:check
```

### Extra Gates by Change Type
| Change | Extra Gates |
|--------|------------|
| API contract | OpenAPI generation, generated client compile, API integration tests |
| Auth/permission/visibility | Matrix tests for all roles, multiple organizational units |
| Database migration | Clean migrate, previous-state migrate, seed load, rollback checks |
| Mobile screen | Mode routing smoke test, offline/error/forbidden states, a11y labels |
| Admin screen | Officer scope E2E, form validation, audit behavior |
| UI/theming | Token usage check, no hardcoded colors, contrast checks |
| App shell/runtime | Launch smoke checks, demo mode without backend, production rejects demo |
| Notification | Preference filtering, token revocation, audience-safe payload |

---

## Definition of Done

### Backend Feature
- DTOs validated, role/scope/visibility enforced
- Success, forbidden, validation, and edge case tests
- Unit tests for new/changed business logic
- Integration tests for API/database/module boundaries
- Critical mutations audited
- OpenAPI and generated clients updated
- No duplicate enum/schema/guard/client

### Mobile Screen
- Loading, empty, error, forbidden/offline states handled
- Uses correct mode endpoint and shared DTO types
- Does not hide unauthorized data locally
- Accessibility labels and readable text
- Uses shared design tokens, no hardcoded colors
- Works in API mode and demo mode with fixtures

### Admin Screen
- Scoped data only (no cross-unit leaks)
- Form validation, visibility controls explicit
- Officer scope tested with at least 2 units
- No direct database access from UI
- Works in API and demo mode

### API Endpoint
- Method/path/auth/role documented
- Request/response validated
- Common error contract used
- Permission and visibility tests
- Covers: success, validation, auth/permission, visibility/scope, side effects

### Database Migration
- Snake_case names, constraints, indexes
- Archive/deactivate policy considered
- Applies from clean database and previous state
- Destructive changes include explicit approval

---

## Final Response Requirements

Every completed task must report:
1. **What was done** — short summary
2. **What changed** — code, tests, docs
3. **Which phase/requirement** it satisfies
4. **Quality gates run** — which gates, results
5. **Test coverage** — statement/branch/function/line coverage
6. **Tests added/changed** — how many, what behavior covered
7. **TDD used?** — if yes, failing test written first; if no, explain why
8. **Migrations/contracts/docs** updated
9. **Residual risk** or owner-approved exceptions

---

## Key Takeaways for Reuse

✅ **Reusable across projects:**
- Phase-based scope control approach
- Quality gate patterns and coverage requirements
- Component boundary contract structure
- No duplicate policy for security code
- Documentation synchronization workflow
- Testing matrix for roles/visibility/permissions
- Definition of Done checklists

⚠️ **Project-specific, adapt as needed:**
- Specific tech stack (NestJS, Next.js, Expo, PostgreSQL, etc.)
- Particular roles/visibility/RBAC rules
- Specific design token values and component variants
- Organizational unit/scoping terminology
- File paths and naming conventions

