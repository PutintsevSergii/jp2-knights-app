# Cloud SQL Runtime Checklist

Use this checklist after Terraform apply, secret-version setup, migration job
execution, and API/Admin Cloud Run revision deployment. It verifies Cloud SQL
connectivity and Prisma pool settings through migration results, Cloud Run
revision status, and redacted logs while keeping `/api/health` shallow.

## Preconditions

- Terraform has created the Cloud SQL PostgreSQL instance, application database,
  Cloud SQL client IAM bindings, API service, Admin service, and migration job.
- `jp2-database-url` has an active Secret Manager version.
- The API service has `PRISMA_CONNECT_ON_BOOT=true` in production.
- API runtime uses low Cloud SQL pool settings, typically
  `PRISMA_CONNECTION_LIMIT=5` and `PRISMA_POOL_TIMEOUT_SECONDS=10`.
- Migration job runtime uses a smaller pool, typically
  `PRISMA_CONNECTION_LIMIT=1` or `2` and `PRISMA_POOL_TIMEOUT_SECONDS=10`.
- `/api/health` remains a process/readiness check and must not query Cloud SQL.

## Migration Job Verification

Run the migration job through the dry-run-first deploy helper:

```bash
GCP_PROJECT_ID=<project-id> \
GCP_REGION=<region> \
IMAGE_TAG=<immutable-tag> \
pnpm deploy:cloud-run migrate --execute
```

Inspect the latest migration job execution:

```bash
gcloud run jobs executions list \
  --job=<migration-job-name> \
  --region=<region> \
  --project=<project-id>
```

Read migration job logs without printing secret values:

```bash
gcloud logging read \
  'resource.type="cloud_run_job" AND resource.labels.job_name="<migration-job-name>"' \
  --project=<project-id> \
  --limit=50 \
  --format=json
```

Pass criteria:

- Latest migration execution succeeded.
- Logs show Prisma migration completion or no pending migrations.
- Logs do not contain database URLs, passwords, service-account JSON, raw
  provider tokens, or private candidate/brother data.
- No Cloud SQL connection timeout, authentication, or permission errors remain.

## API Revision Startup Verification

Deploy a new API revision after secret or image changes:

```bash
GCP_PROJECT_ID=<project-id> \
GCP_REGION=<region> \
IMAGE_TAG=<immutable-tag> \
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
pnpm deploy:cloud-run deploy --execute
```

Inspect the API service and latest revisions:

```bash
gcloud run services describe <api-service-name> \
  --region=<region> \
  --project=<project-id>

gcloud run revisions list \
  --service=<api-service-name> \
  --region=<region> \
  --project=<project-id>
```

Read recent API revision logs:

```bash
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="<api-service-name>"' \
  --project=<project-id> \
  --limit=100 \
  --format=json
```

Pass criteria:

- New API revision becomes ready before receiving pilot traffic.
- Startup DB connection succeeds with bounded retry.
- No repeated Prisma pool timeout, Cloud SQL auth, or Cloud SQL connector errors
  appear after the revision is ready.
- API logs do not print the full `DATABASE_URL` or any secret payload.
- Previous known-good revision remains available for rollback.

## Health And Smoke Checks

Run deployed smoke checks:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
GCP_PROJECT_ID=<project-id> \
pnpm deploy:cloud-run smoke
```

Verify `/api/health` separately:

```bash
curl -i https://api.example.org/api/health
```

Pass criteria:

- `/api/health` returns success without querying Cloud SQL.
- Private API smoke checks exercise authenticated read paths separately from
  `/api/health`.
- Admin Lite loads through the deployed Admin service and forwards auth to API
  as expected.

## Pool And Cost Review

After smoke checks, review Cloud SQL and Cloud Run metrics:

- Active Cloud SQL connections remain compatible with the configured minimum and
  maximum Cloud Run instance counts.
- CPU and memory usage do not indicate Prisma pool starvation.
- Cloud SQL connection count is not inflated by migration jobs after they exit.
- No Redis/Memorystore resource is introduced for live pilot or production.

If connection pressure appears, prefer lowering Cloud Run concurrency or
instance counts before raising Prisma pool size. Raising
`PRISMA_CONNECTION_LIMIT` should be deliberate and recorded in the launch
approval evidence.

## Failure Handling

- If migration fails, stop deployment before moving service traffic.
- If API startup DB retry fails, do not send traffic to the revision.
- If `/api/health` is healthy but private API paths fail due to Cloud SQL,
  treat `/api/health` as insufficient and follow the support/rollback runbook.
- If logs expose secrets or private data, rotate affected secrets and create a
  redacted incident record.
- Use application revision rollback for compatible schema incidents and forward
  fix when schema changes cannot safely roll back.

## Launch Gate

Do not approve pilot launch until:

- migration job success is recorded;
- API revision startup DB connectivity is verified from logs;
- Cloud SQL pool settings are recorded;
- `/api/health` is confirmed shallow;
- deployed smoke checks pass;
- rollback revision is recorded in the pilot launch approval record.
