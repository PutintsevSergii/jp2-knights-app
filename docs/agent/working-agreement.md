# Working Agreement for Coding Agents

## Rules

- Keep V1 scope disciplined; propose expansion only when there is a strong product, security, or architectural argument.
- Implement phase by phase.
- Ask for human-owner permission before implementing any V2 or out-of-scope item, and include rationale, tradeoffs, implementation impact, and test/doc impact.
- Preserve public/private separation.
- Write tests for visibility and permissions.
- Maintain at least 80% unit test coverage for statements, branches, functions, and lines.
- Add integration tests where behavior crosses API, database, Redis, notification, storage, or module boundaries.
- Update docs when behavior changes.
- Implement approved V2 or out-of-scope work only after updating the relevant scope/backlog/docs in the same change.
- Keep the app runnable after each phase.
- Prefer privacy-preserving behavior when uncertain.
- Avoid destructive deletes for business entities unless explicitly approved.
- Keep the pipeline green before completing a task.
- Reuse existing shared contracts/utilities instead of duplicating logic.
- Update traceability, OpenAPI/DTOs, migrations, seeds, and tests together when behavior changes.

## Non-Negotiables

Public APIs must never return private content. Officer access must be scoped by chorągiew. Silent prayer must not expose participant lists in V1.

Never finish a coding task with failing lint, typecheck, tests, coverage, build, contract generation, or migration validation unless the human owner explicitly pauses the work and accepts the failing state.
