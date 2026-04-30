# Release Plan

## Environments

| Environment | Purpose |
| --- | --- |
| Local | Development and agent work |
| Test/Staging | Integrated validation with seed data |
| Pilot Production | One approved chorągiew pilot |

## Release Gates

1. All phase acceptance criteria pass.
2. Privacy and visibility tests pass.
3. Admin scoping tests pass.
4. Pilot seed data approved.
5. Official/public content approved.
6. Backup and recovery plan documented.
7. Restore test completed in non-production.
8. Support runbooks completed.
9. OpenAPI/client contract generation passes in CI.
10. Mobile, admin, and API launch from documented commands.
11. Demo mode is disabled or impossible in pilot production builds.
12. Human owner approves pilot launch.

## Launch-Readiness Wrap-Up

Before pilot launch, perform a final wrap-up pass:

- start API with local/staging configuration;
- start mobile and admin in `api` mode against the target API;
- start mobile and admin in `demo` mode without backend to verify controlled demo capability;
- run smoke journeys for Guest, Candidate, Brother, Officer, and Super Admin;
- verify production configuration rejects `demo` mode;
- update root README run commands and support runbooks.

## Rollback

V1 should support disabling new content by archiving/unpublishing records. Infrastructure rollback strategy depends on deployment platform selected during implementation, but every release must document one of:

- rollback to previous application artifact with no database rollback needed;
- forward-fix migration if the schema change cannot be reversed safely;
- manual mitigation steps for content/configuration-only issues.
