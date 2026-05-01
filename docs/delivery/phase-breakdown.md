# Phase Breakdown

## Phase Exit Requirements

| Phase | Must be true before moving on |
| --- | --- |
| 0 | Scope, roles, visibility, and out-of-scope are documented |
| 1 | Apps start independently; mobile/admin can launch in backend-free demo mode; CI validates lint/type/test/build; OpenAPI generation target exists |
| 2 | Core RBAC/visibility utilities have tests; database constraints and migration policy are in place |
| 3 | Fresh install opens public home without login |
| 4 | Public prayer/event content works and private content is hidden |
| 5 | Firebase-backed provider adapter verifies tokens/session cookies; local provider-account linking, logout/session handling, inactive-user blocking, and mode switching work; fake-provider tests prove replacement path |
| 6 | Officer/Super Admin can enter Admin Lite with scoped navigation |
| 7 | Join request to candidate account flow works |
| 8 | Brother Today/profile/assigned organization-unit work |
| 9 | Event intent, announcements, preferences work |
| 10 | Roadmap submission and officer review work |
| 11 | Silent prayer counters work across reconnects |
| 12 | Audit/privacy/content approval checks pass; retention/export/erasure support exists for sensitive V1 records |
| 13 | Pilot scenarios pass with seed data; launch-readiness wrap-up, restore test, and support runbook are complete |

## Files Expected per Phase

Implementation agents should touch only relevant app/domain/test/docs files for each phase. Broad unrelated refactors require approval.

Every phase that changes an API must update OpenAPI/DTO contracts and the traceability matrix. Every phase that changes persistence must include a migration, seed impact note, and rollback/restore consideration.

## Launchability Rule

Every phase must leave the relevant apps launchable. Before a phase is complete:

- `api` mode works for implemented backend features;
- mobile and admin demo mode still launch without the backend;
- documented launch commands are current;
- demo fixtures are updated when DTOs, screens, roles, visibility, or workflows change.
