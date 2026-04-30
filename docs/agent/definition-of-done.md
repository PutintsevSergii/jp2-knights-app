# Definition of Done

## Backend Feature

- DTOs validated.
- Role/scope/visibility enforced.
- Tests cover success, forbidden, validation, and edge cases.
- Unit tests cover new/changed business logic.
- Integration tests cover API/database/module boundaries where applicable.
- Critical mutations audited.
- Docs updated if contract changed.
- OpenAPI and generated client/types updated if the API changed.
- No duplicate enum/schema/guard/client introduced.

## Mobile Screen

- Loading, empty, error, forbidden/offline states handled.
- Uses correct mode endpoint.
- Does not hide unauthorized data locally.
- Basic accessibility labels and readable text.
- Uses shared design tokens/theme values; no hardcoded colors, spacing, typography, or status styling.
- Private cached data clears on logout/session failure.
- Uses generated API client and shared DTO types.
- Works in `api` mode and has fixture coverage in `demo` mode where applicable.

## Admin Screen

- Scoped data only.
- Forms validate fields.
- Visibility/status controls explicit.
- Critical actions confirm or clearly communicate effect.
- Uses shared design tokens/theme values; no hardcoded colors, spacing, typography, or status styling.
- Officer scope is tested with at least two chorągwie.
- No direct database access from admin app.
- Works in `api` mode and has fixture coverage in `demo` mode where applicable.

## App Shell

- Documented launch command exists.
- App launches in normal local mode.
- Mobile/admin launch in backend-free demo mode.
- Demo mode is clearly labeled and blocked from production builds.

## API Endpoint

- Method/path documented.
- Auth and role documented.
- Request/response validated.
- Common error contract used.
- Permission and visibility tests exist.
- Integration tests cover success, validation, auth/permission, visibility/scope, and critical side effects.
- Rate-limit category and idempotency behavior documented where applicable.
- Request id appears in errors and logs.

## Database Migration

- Names are snake_case.
- Constraints and indexes added for access paths.
- Archive/deactivate policy considered.
- Seed/test data updated if needed.
- Migration applies from a clean database and from the previous committed state.
- Destructive data changes include explicit approval or a safe migration plan.

## Permission Rule

- Covered by automated tests for all relevant roles.
- Officer scope tested with at least two chorągwie.

## Documentation Update

- Product, API, data, or screen docs updated when behavior changes.
- `docs/traceability.md` updated when a requirement/API/screen/table/test mapping changes.

## Final Completion Gate

- Lint, typecheck, tests, build, migration check, and contract generation are green for the changed workspace.
- Unit test coverage is at least 80% for statements, branches, functions, and lines in every implemented app/library.
- Integration tests are present and green where behavior crosses API, database, Redis, notification, storage, or module boundaries.
- Launch smoke checks pass for changed apps, including demo mode where applicable.
- Relevant permission, visibility, privacy lifecycle, and smoke tests are green.
- Known failures are fixed, not hidden or skipped, unless the human owner explicitly accepts the risk.
- Final report names commands run and any residual risk.
