# Launch Smoke Checklist

Use this checklist after Terraform apply, secret version setup, Firebase RTDB
rules deployment, migration job success, and Cloud Run API/Admin revision
deployment.

## Command Gates

Print the deploy command plan:

```bash
GCP_PROJECT_ID=<project-id> \
GCP_REGION=<region> \
IMAGE_TAG=<immutable-tag> \
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
pnpm deploy:cloud-run:plan
```

Run the deploy sequence only after reviewing the plan:

```bash
GCP_PROJECT_ID=<project-id> \
GCP_REGION=<region> \
IMAGE_TAG=<immutable-tag> \
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
pnpm deploy:cloud-run all --execute
```

Run smoke checks without rebuilding or redeploying:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
GCP_PROJECT_ID=<project-id> \
pnpm deploy:cloud-run smoke
```

## Guest/Public Smoke

- `GET /api/health` returns success from the deployed API.
- Public home loads with the normalized `today` module.
- Public About, Prayer Library, Public Events, and Join Request screens load.
- Public content shows only approved/published public data.
- Join request submission works with consent and returns no private data.

## Idle Approval Smoke

- Google/Firebase sign-in creates or resolves a verified provider identity.
- A first-time user remains public-only with Idle approval guidance.
- Private candidate, brother, and Admin Lite APIs reject Idle access.
- Admin Lite identity review flow can approve or reject using an authorized
  officer/Super Admin account.

## Candidate Smoke

- Approved candidate sign-in routes to Candidate Dashboard.
- Candidate Dashboard includes the API-owned `today` module.
- Candidate events and announcements are scoped and expose no brother content.
- Candidate roadmap read path shows only the current user's assignment or empty
  state.

## Brother Smoke

- Approved brother sign-in routes to Brother Today.
- Brother Today includes the API-owned `today` module.
- Brother events, announcements, prayers, organization units, and roadmap are
  scoped to the current brother.
- Brother event and silent-prayer flows expose aggregate/own-state data only,
  never participant lists or rosters.

## Silent Prayer RTDB Smoke

- Native-device RTDB preflight passes for the selected platform.
- Firebase RTDB rules are deployed before enabling live RTDB use.
- Guest public aggregate count can be read from the allowed public count path.
- Brother private aggregate count requires an API-issued Firebase UID grant.
- Expired or missing private grants deny reads.
- Client writes to public counts, private counts, presence rows, and read grants
  are denied.
- REST heartbeat/leave keeps participant identity out of responses.
- Sanitized native RTDB evidence passes
  `pnpm validate:mobile-rtdb-evidence -- --file <local-evidence-file>` before it
  is attached to the launch ticket.

## Admin Lite Smoke

- Admin dashboard loads over HTTPS.
- Officer scope is limited to assigned organization units.
- Super Admin-only privacy workflows stay hidden from ordinary officers.
- Candidate request/profile export/erasure routes are Super Admin-only.
- Content approval-before-publish controls remain enforced.
- Audit-log filters and pagination work without exposing sensitive summaries.

## Rollback Decision

Rollback to the previous Cloud Run revision when:

- migration job fails before services are updated;
- API boot retry fails because database credentials or connectivity are wrong;
- auth/session smoke fails for approved users;
- RTDB rules permit unauthorized private count reads or client writes;
- public APIs expose private content;
- Admin Lite exposes Super Admin privacy actions to officers.

Prefer forward-fix migrations when database schema changes are not backward
compatible. For content or configuration incidents, archive/unpublish the bad
record and keep service rollback as the second step.
