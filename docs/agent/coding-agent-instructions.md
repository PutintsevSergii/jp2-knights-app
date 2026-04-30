# Coding Agent Instructions

## How to Start

1. Read `/docs/README.md`.
2. Read product scope, roles, visibility, and functional requirements.
3. Read the phase you are implementing.
4. Read API/data/screen docs relevant to that phase.
5. Read `/docs/architecture/app-runtime-modes.md` when touching app launch, API clients, screen data loading, fixtures, or environment config.
6. Read `/docs/architecture/design-system-and-theming.md` when touching mobile/admin UI, components, styling, branding, icons, layout primitives, or accessibility.
7. Search the repo for existing helpers, DTOs, schemas, enums, UI patterns, guards, and tests before adding new code.
8. Implement only that phase's scope.

## Recommended Implementation Order

Follow `/docs/delivery/implementation-roadmap.md`.

## Task Creation

Break work into small stories using `/docs/agent/backlog-format.md`. Each story must include acceptance criteria, tests required, and out-of-scope notes.

## Validation

Run the quality gates in `/docs/agent/quality-gates.md`. Keep the workspace runnable. Do not mark work complete while lint, typecheck, tests, coverage, build, contract generation, migrations, or relevant smoke checks are failing.

## Decision Documentation

If implementation changes a documented contract, update the corresponding doc in the same change and explain why.

## Duplicate Prevention

- Reuse shared enums, DTOs, Zod schemas, auth helpers, visibility utilities, API clients, design tokens, and UI components.
- Do not create a second role enum, visibility enum, error shape, API client, date formatter, permission checker, design-token set, or content-status workflow.
- If a new abstraction is needed, place it in the correct shared library and migrate nearby duplicated use in the same scope.
- Before adding a new dependency, prove that existing stack choices cannot reasonably solve the problem.

## Avoid Overengineering

Do not silently add chat, payments, maps, analytics, full hierarchy, social features, or advanced workflow engines in V1. If one of these becomes strongly justified, stop and ask the human owner for permission with the rationale, tradeoffs, implementation impact, and required doc/test updates.

## Scope Change Process

When a V2 or out-of-scope item appears necessary:

1. Explain the user/product value and why the V1 alternative is insufficient.
2. Explain privacy, security, operational, and maintenance impact.
3. Identify docs, requirements, APIs, data, screens, tests, and traceability that would change.
4. Ask the human owner for explicit permission before coding.
5. If approved, update scope/backlog/traceability and relevant implementation docs in the same change.
