# Privacy Data Lifecycle

This document defines minimum lifecycle behavior for V1. Legal wording, exact retention periods, and policy text require human legal review before pilot production.

## Data Classification

| Class | Examples | Default protection |
| --- | --- | --- |
| Public content | Published public prayers, public events, approved About text | Public read, admin write |
| Internal content | Brother/candidate/chorągiew events, announcements, prayers | Authenticated role/scope filtering |
| Personal data | User identity, contact details, candidate requests, device tokens | Least privilege, no public exposure |
| Sensitive community data | Membership status, degree, roadmap submissions, officer notes | Self/scoped admin only, audit critical changes |
| Presence data | Silent prayer join/heartbeat counters | Aggregate only, retention-limited |
| Audit data | Critical admin action log | Super Admin only by default, append-only |

## Lifecycle Requirements

- Candidate requests store consent timestamp, consent text/version, source, and preferred language.
- Candidate requests can be archived/deactivated for normal operations; hard deletion is reserved for legal erasure workflows.
- Roadmap submissions and officer notes are never public and are excluded from analytics-style reporting in V1.
- Device tokens store token hashes where possible and are revoked on explicit
  token disable, ownership change, or approved account/candidate erasure.
  Logout currently clears local session state only; logout-wide device-token
  revocation requires a separate product/security decision.
- Silent prayer anonymous participation uses random session identifiers or hashes, not names or contact data.
- Authenticated silent prayer participation may temporarily reference `user_id` only for duplicate prevention, reconnect behavior, and aggregate counter correctness. It is not a spiritual history record.
- Audit summaries redact prayer text, candidate private messages, token values, storage keys, and unnecessary PII.

## Retention Policy

Exact durations are configured per deployment after legal review. The implementation must support these buckets:

| Bucket | Typical records | Required capability |
| --- | --- | --- |
| Short-lived | Anonymous silent prayer presence, transient rate-limit state | Automatic expiry through RTDB `expiresAt` cleanup or a cleanup job |
| Short-lived technical | Authenticated silent prayer participation identifiers | Automatic purge or anonymization after the configured reconnect/operational window |
| Operational | Device tokens, notification preferences, session records | Revoke/delete when obsolete |
| Community record | Membership, officer assignments, published content | Archive instead of hard delete |
| Sensitive review | Candidate requests, roadmap submissions, officer notes | Archive, export for subject request, legal erasure path |
| Audit | Critical action logs | Append-only with redaction support |

These buckets are also represented in the shared runtime contract as
`RETENTION_BUCKETS`, `RETENTION_BUCKET_METADATA`, and `retentionBucketSchema`.
The shared contract intentionally records bucket capability and duration policy
only; exact durations remain deployment/legal configured and are not hardcoded.

## Erasure and Export

- Personal data export must be possible for candidate request/profile subject
  records and roadmap submission subject records in V1. Broader whole-user
  export requires legal/product review before production.
- Legal erasure must remove or anonymize personal identifiers while preserving
  required audit event existence. Roadmap submission erasure clears submitted
  body text, attachment metadata, and review comments, then archives the row
  instead of deleting it.
- Silent prayer export must not produce participant lists. If retained technical rows still reference a user, export only the minimum legally required technical record and never frame it as prayer activity history.
- Hard-deleted binary files must also remove provider objects, thumbnails, and derived metadata.
- Erasure operations are themselves audited without copying erased sensitive values into the audit summary.

## Backups and Restore

- PostgreSQL backups are required before pilot production.
- A restore test must run before pilot launch and after any infrastructure migration.
- Backup access is restricted to operational administrators, not normal officers.
- Backup retention must not silently defeat approved erasure policies; document the legal approach before production.
