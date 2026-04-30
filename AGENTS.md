# AGENTS.md

This file is the operating contract for coding agents working in this repository.

## Start Here

1. Read [docs/README.md](docs/README.md).
2. Read the canonical docs for the current task: scope, roles, visibility, functional requirements, phase, API, data, and screens.
3. Check [docs/traceability.md](docs/traceability.md) for the requirement-to-code surface.
4. Search the repository before creating new code. Reuse existing contracts, utilities, tests, and patterns.

## Architecture Defaults

- TypeScript strict mode, pnpm, Nx, Expo React Native, Next.js App Router, NestJS REST, OpenAPI 3.1, shared Zod schemas, Prisma migrations, PostgreSQL, Redis, Socket.IO, Expo Notifications.
- Public/private separation is enforced server-side.
- Admin and mobile use API contracts, never direct database access.
- Shared enums, DTOs, validation schemas, API clients, auth helpers, visibility filters, and error contracts are single sources of truth.
- Shared design tokens are the single source for branding, colors, typography, spacing, radii, state colors, and component variants across mobile and admin.
- Provider integrations belong behind adapters.
- Mobile/admin support `api` and backend-free `demo` runtime modes. Demo mode is for local development, CI smoke checks, and controlled demos only; production builds must reject it.

## Non-Negotiables

- Keep V1 scope disciplined. If a V2 or out-of-scope item has a strong product, security, or architectural argument, pause implementation and ask the human owner for permission with the rationale, tradeoffs, and impact.
- Implement approved scope expansions only after the human owner gives explicit permission and the relevant docs are updated in the same change.
- Public APIs must never return private content.
- Officer access must be scoped by chorągiew.
- Silent prayer exposes aggregate counters only, never participant lists.
- Business entities are archived/deactivated instead of destructively deleted unless explicitly approved.
- Do not duplicate security-sensitive logic such as roles, visibility, permissions, DTOs, error shapes, API clients, or content status workflows.
- Do not hardcode brand colors, spacing, typography, radius, or status styling in screens. Use shared design tokens and platform adapters.

## Coding Workflow

1. Identify the phase and requirement IDs.
2. Read existing code/tests/docs for the same module.
3. Make the smallest cohesive change that satisfies the requirement.
4. Update API DTOs/OpenAPI, generated clients, migrations, seeds, tests, docs, and traceability in the same change when affected.
5. Update demo fixtures when DTOs, screens, roles, visibility, or workflows change.
6. Update design tokens/component variants when styling or branding changes.
7. Add or update tests that would fail without the change.
8. Run quality gates before completing the task.

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
