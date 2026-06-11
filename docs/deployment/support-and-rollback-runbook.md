# Support And Rollback Runbook

Use this runbook during pilot launch support, production incident triage, and
Cloud Run revision rollback. It assumes Terraform, secret versions, Firebase
RTDB rules, the Cloud Run migration job, and launch smoke checks were already
handled through the deployment docs in this folder.

## Incident Intake

Record every launch incident with:

- UTC timestamp and reporter.
- Environment: `pilot`, `staging`, or `production`.
- Affected surface: API, Admin Lite, mobile public, mobile candidate, mobile
  brother, Firebase RTDB, Google/Firebase auth, or Cloud SQL.
- User role and organization scope when relevant.
- Exact URL, screen, route, or API path.
- Whether private data, participant identity, or Super Admin privacy workflows
  may be exposed.
- Whether a deploy, migration, secret change, DNS change, Firebase auth-domain
  change, or RTDB rules deployment happened in the last hour.

Do not ask users for passwords, provider tokens, Firebase id tokens, service
account JSON, raw database URLs, or screenshots containing private candidate,
brother, audit, roadmap submission, or legal/privacy data.

## Severity

Treat these as immediate rollback or launch-stop conditions:

- Public APIs return private content.
- Officer access crosses the assigned organization scope.
- Silent-prayer RTDB exposes participant lists, user IDs, session IDs, socket
  IDs, or writable aggregate paths.
- Super Admin privacy workflows are visible or callable by ordinary officers.
- Google/Firebase auth accepts the wrong redirect domain or signs users into
  the wrong environment.
- The API cannot boot or repeatedly fails `/api/health` because database,
  secret, or Cloud SQL connectivity is broken.

Treat these as forward-fix candidates when privacy and auth boundaries remain
intact:

- Public copy, content, or seed data is wrong but can be unpublished, archived,
  or edited safely.
- A noncritical Admin Lite table, filter, or empty state renders incorrectly.
- A mobile screen has a visual defect that does not expose private data or block
  the pilot flow.
- A Cloud Run revision is healthy but a later config-only change needs
  correction.

## First Response Checklist

1. Confirm the affected URL uses the expected custom domain and HTTPS.
2. Run `pnpm deploy:domains check --execute` with the pilot domain values when
   DNS, certs, cookies, or Firebase authorized domains are suspected.
3. Run API and Admin smoke checks through `pnpm deploy:cloud-run smoke`.
4. Check the latest Cloud Run revisions and traffic split.
5. Check the migration job result before changing service traffic.
6. Check Firebase RTDB rules deployment status for silent-prayer incidents.
7. Check whether a secret version changed and whether the service revision was
   redeployed after the secret change.

## Cloud Run Inspection Commands

List service revisions:

```bash
gcloud run revisions list \
  --project=<project-id> \
  --region=<region> \
  --service=jp-api-pilot
```

Show current traffic:

```bash
gcloud run services describe jp-api-pilot \
  --project=<project-id> \
  --region=<region> \
  --format='value(status.traffic)'
```

Check recent service logs:

```bash
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="jp-api-pilot"' \
  --project=<project-id> \
  --limit=50 \
  --format=json
```

Use the corresponding Admin Lite service name for Admin incidents.

## Rollback Procedure

Rollback means moving Cloud Run traffic to the last known-good revision. It does
not mean destructively rolling back the database.

1. Identify the last known-good API and Admin revisions from the previous smoke
   record or `gcloud run revisions list`.
2. Confirm the migration job state. If the latest migration applied a backward
   incompatible schema change, prefer a forward fix unless the owner and lead
   engineer explicitly approve a data-safe rollback plan.
3. Move API traffic to the known-good revision:

```bash
gcloud run services update-traffic jp-api-pilot \
  --project=<project-id> \
  --region=<region> \
  --to-revisions=<known-good-api-revision>=100
```

4. Move Admin Lite traffic to the known-good revision when Admin is affected:

```bash
gcloud run services update-traffic jp-admin-pilot \
  --project=<project-id> \
  --region=<region> \
  --to-revisions=<known-good-admin-revision>=100
```

5. Re-run deployed smoke checks:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
GCP_PROJECT_ID=<project-id> \
pnpm deploy:cloud-run smoke
```

6. Re-run domain validation when the incident involved DNS, certs, cookies, or
   Firebase auth domains:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain> \
pnpm deploy:domains check --execute
```

7. Record the revision names, commands, timestamps, smoke results, and remaining
   corrective action in the incident notes.

## Database And Data Safety

- Do not run destructive database rollback commands during launch response.
- Do not restore over pilot or production Cloud SQL instances.
- Use the backup/restore runbook only for non-production restore tests unless
  the owner explicitly approves a production restore.
- If bad content or seed data caused the incident, archive, unpublish, or update
  the record through the supported admin workflow.
- If a privacy export/erasure action was triggered incorrectly, pause related
  Super Admin privacy workflows and escalate before attempting data repair.

## Privacy-Specific Checks

After rollback or forward fix, verify:

- Public endpoints still return approved public data only.
- Candidate APIs do not expose brother content.
- Brother APIs do not expose participant lists or rosters.
- Officer APIs remain scoped by assigned organization unit.
- Super Admin privacy workflows stay hidden from ordinary officers.
- Audit summaries remain redacted and do not expose raw sensitive values.
- Silent-prayer responses and RTDB paths expose aggregate counts only.

## Closeout

Close the incident only after:

- The rollback or forward fix is deployed.
- API/Admin smoke checks pass.
- Domain validation passes when relevant.
- Privacy-specific checks pass for the affected role.
- The owner knows whether the pilot can continue, pause, or relaunch.
- Follow-up tasks are filed for root cause, missing tests, and runbook updates.
