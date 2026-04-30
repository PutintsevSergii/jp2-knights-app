# Support and Maintenance

V1 must be operable by a small team without direct database edits or tribal knowledge.

## Support Requirements

- Every backend request has a request id returned in errors and written to structured logs.
- User-facing errors avoid sensitive details but include enough support context to correlate logs.
- Admin critical actions are auditable with redacted before/after summaries.
- Common support actions must be available through Admin Lite or documented scripts, not ad hoc SQL.
- Support staff must be able to distinguish public content problems, role/scope problems, notification delivery problems, and real-time presence problems.

## Required Runbooks Before Pilot

| Runbook | Must cover |
| --- | --- |
| Local recovery | Restart API/admin/mobile dev server, DB, Redis |
| Failed login/session | Check user status, roles, revoked sessions |
| Wrong visibility | Verify content status, visibility, target chorągiew, user role/scope |
| Candidate request issue | Locate request by safe identifiers, review consent version, assign/archive |
| Notification issue | Check preferences, token revocation, provider delivery result |
| Silent prayer issue | Check event status, Redis presence TTL, socket room count |
| Backup restore | Restore database backup into non-production and verify smoke checks |
| Legal erasure/export | Export/anonymize personal data without copying sensitive values into audit summaries |

## Maintenance Policy

- Dependency upgrades happen at phase boundaries or as security patches with tests.
- Database migrations are reviewed for reversibility, data preservation, and privacy impact.
- OpenAPI/client generation is part of CI, so client drift is caught before merge.
- Production changes must include a rollback or mitigation note.
- Deprecated endpoints require a documented replacement and removal date.
