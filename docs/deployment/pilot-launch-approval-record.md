# Pilot Launch Approval Record

Use this template for the final Phase 13 pilot launch decision. It records the
evidence required by the release plan without storing secrets, raw session
cookies, provider tokens, service-account JSON, private candidate/brother data,
or screenshots containing legal/privacy data.

Copy this file into the launch ticket or release notes for the target
environment, fill it there, and keep the committed template generic.

## Launch Metadata

| Field | Value |
| --- | --- |
| Environment | `<pilot | staging | production>` |
| Google Cloud project id | `<project-id>` |
| Region | `<region>` |
| API hostname | `https://api.example.org` |
| Admin hostname | `https://admin.example.org` |
| Image tag | `<immutable-tag>` |
| API revision | `<cloud-run-api-revision>` |
| Admin revision | `<cloud-run-admin-revision>` |
| Migration job execution | `<job execution id and status>` |
| Firebase project id | `<firebase-project-id>` |
| Firebase RTDB instance | `<database name or URL>` |
| Launch decision timestamp | `<UTC timestamp>` |

## Evidence Checklist

| Gate | Evidence | Result | Owner |
| --- | --- | --- | --- |
| `pnpm quality` | CI/job link or local run summary | `<pass/fail>` | `<name>` |
| `pnpm contract:generate` + `pnpm contract:check` | CI/job link or local run summary | `<pass/fail>` | `<name>` |
| `pnpm db:migrate:check` | CI/job link or local run summary | `<pass/fail>` | `<name>` |
| Terraform plan reviewed | Plan artifact or reviewer note | `<pass/fail>` | `<name>` |
| Migration job completed | Cloud Run Job execution id | `<pass/fail>` | `<name>` |
| Cloud SQL runtime checks | Migration result, API revision logs, pool settings, shallow health check | `<pass/fail>` | `<name>` |
| Domain validation | `pnpm deploy:domains check --execute` summary | `<pass/fail>` | `<name>` |
| Auth cookie/CORS/redirect checks | Checklist summary | `<pass/fail>` | `<name>` |
| Backup restore test | Non-production restore-test evidence | `<pass/fail>` | `<name>` |
| Launch smoke checklist | Guest, Idle, Candidate, Brother, Admin, RTDB summaries | `<pass/fail>` | `<name>` |
| Rollback procedure reviewed | Known-good API/Admin revisions recorded | `<pass/fail>` | `<name>` |
| Support runbook reviewed | On-call/support contact path confirmed | `<pass/fail>` | `<name>` |

## Product And Privacy Approvals

| Approval | Required Evidence | Approver | Timestamp |
| --- | --- | --- | --- |
| Privacy/legal review | Privacy wording, export/erasure scope, audit redaction review | `<name>` | `<UTC timestamp>` |
| Public content approval | About, Prayer Library, Public Events, Join Request wording | `<name>` | `<UTC timestamp>` |
| Prayer/formation wording approval | Prayer, roadmap, and formation copy review | `<name>` | `<UTC timestamp>` |
| Pilot seed data approval | Chorągiew, officer, candidate, brother, roadmap, content seed review | `<name>` | `<UTC timestamp>` |
| Security review | Public/private visibility, officer scope, RTDB rules, auth session review | `<name>` | `<UTC timestamp>` |
| Launch owner approval | Final go/no-go decision | `<name>` | `<UTC timestamp>` |

## Smoke Results

Record summaries only. Do not paste private API payloads or raw identifiers.

### Guest/Public

- Public home and `today` module:
- Public About/Prayer Library/Public Events/Join Request:
- Public content approval filter:
- Join request:

### Idle Approval

- First-time verified user stays public-only:
- Private APIs reject Idle user:
- Admin identity review path:

### Candidate

- Candidate dashboard and `today` module:
- Candidate events/announcements scope:
- Candidate roadmap:

### Brother

- Brother Today and `today` module:
- Brother events/announcements/prayers/org units/roadmap:
- Brother event and silent-prayer aggregate-only behavior:

### Silent Prayer RTDB

- RTDB rules deployed:
- Public aggregate count read:
- Private aggregate count grant:
- Expired/missing private grant denial:
- Client write denial:
- REST heartbeat/leave aggregate-only response:

### Admin Lite

- Admin dashboard:
- Officer organization-unit scope:
- Super Admin privacy workflow visibility:
- Export/erasure access:
- Content approval-before-publish:
- Audit-log filtering and redaction:

## Rollback Record

| Item | Value |
| --- | --- |
| Last known-good API revision | `<revision>` |
| Last known-good Admin revision | `<revision>` |
| Rollback command reviewed | `gcloud run services update-traffic ... --to-revisions=<revision>=100` |
| Database rollback needed? | `No destructive rollback. Use forward fix unless explicitly approved.` |
| Content/config mitigation path | `archive/unpublish/edit through supported admin workflow` |
| Rollback owner | `<name>` |

## Go/No-Go Decision

Select one:

- `GO`: all required gates passed, owner approved launch.
- `NO-GO`: at least one required gate failed or owner withheld approval.
- `GO WITH EXCEPTION`: only with written owner approval and a linked exception
  record that states user impact, privacy/security impact, rollback path, and
  expiry.

Decision:

Rationale:

Open follow-up tasks:

## Explicit Non-Approvals

This record does not approve:

- chat, payments, maps, analytics, social features, or extended hierarchy;
- Redis/Memorystore live infrastructure;
- participant lists, private rosters, or silent-prayer participant identity;
- destructive production database rollback;
- committing secrets, service-account JSON, raw cookies, or provider tokens.
