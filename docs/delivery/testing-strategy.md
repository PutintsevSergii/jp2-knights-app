# Testing Strategy

## Required Test Types

| Type | Required coverage |
| --- | --- |
| Unit | Visibility utilities, permission guards, validation schemas |
| Integration | API endpoints with role/scope fixtures |
| Contract | Request/response DTO compatibility between apps and API |
| Permission | Guest/candidate/brother/officer/super admin access paths |
| Visibility | Public API exclusion of private content |
| Mobile smoke | Public, candidate, brother core journeys |
| Admin E2E | Officer scope, content publishing, candidate request, roadmap review |
| Launch smoke | Mobile/admin/API launch commands; mobile/admin demo mode without backend |
| Realtime | Silent prayer duplicate prevention, heartbeat, disconnect timeout |
| Migration | Prisma migration applies cleanly and seed data loads |
| Privacy lifecycle | Archive, export, erasure/anonymization, audit redaction |
| Supportability | Error responses include request id and safe log context |

## Coverage Requirements

- Unit test coverage must be at least 80% for statements, branches, functions, and lines in every implemented app/library.
- Shared security-sensitive libraries must target higher practical coverage, especially auth, permission, visibility, validation, audit, and error handling.
- New or changed business logic must include focused unit tests even when global coverage is already above 80%.
- Coverage thresholds must be enforced by the test runner/CI, not checked manually.
- Coverage exclusions are allowed only for generated code, framework bootstrap files, type-only files, or platform glue with no meaningful logic. Exclusions must be explicit and narrow.
- Do not raise coverage by writing shallow tests that only execute code without asserting behavior.

## Integration Test Requirements

Add integration tests where behavior crosses module or infrastructure boundaries, including:

- API endpoints with database reads/writes;
- auth, role, scope, and visibility checks;
- migrations and seed data;
- notification dispatch audience filtering;
- Redis-backed silent prayer presence;
- file attachment metadata and privacy behavior if uploads are enabled;
- content publishing, approval, and audit side effects.
- app runtime mode selection and production rejection of demo mode.

## Pilot Validation Scenarios

Use the scenarios from the root roadmap: Guest, Candidate, Brother, Officer, Super Admin.

## Test Data

Tests must include content for every visibility value and at least two chorągwie to prove officer scoping. They must also include inactive users, converted candidates, revoked officer assignments, archived records, and private records addressed by direct id.
