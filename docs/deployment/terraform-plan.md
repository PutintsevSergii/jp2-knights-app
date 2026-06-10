# Terraform Plan

Terraform should manage infrastructure resources, not application code logic or
secret plaintext. This file is the target plan for the future
`infra/terraform` implementation.

## Terraform Roots

Recommended layout:

```text
infra/terraform/
  README.md
  versions.tf
  providers.tf
  variables.tf
  outputs.tf
  main.tf
  terraform.tfvars.example
  modules/
    artifact-registry/
    cloud-run-service/
    cloud-run-job/
    cloud-sql-postgres/
    firebase-realtime-database/
    secret-manager/
    service-accounts/
```

## Resources To Manage

| Resource group | Purpose |
| --- | --- |
| Project services | Enable Cloud Run, Cloud SQL, Secret Manager, Artifact Registry, Cloud Build, and Firebase/RTDB APIs |
| Service accounts | Separate identities for API, Admin, migration job, and CI/deploy |
| Artifact Registry | Store API and Admin container images |
| Cloud SQL PostgreSQL | Production database |
| Firebase Realtime Database | Required live silent-prayer aggregate-count provider; Redis/Memorystore is excluded from pilot and production infrastructure by owner decision on June 3, 2026 |
| Secret Manager | Secret shells and IAM access to deployed services |
| Cloud Run API service | NestJS REST/Socket.IO API |
| Cloud Run Admin service | Next.js Admin Lite |
| Cloud Run migration job | Prisma migration execution before service rollout |
| IAM bindings | Least-privilege access to secrets, Cloud SQL, Artifact Registry, logs |
| Domain mapping/DNS | Optional; depends on DNS provider and project policy |

## Variables

Minimum variables:

```hcl
project_id       = "jp2-pilot"
region           = "europe-west4"
environment      = "pilot"
api_image        = "REGION-docker.pkg.dev/PROJECT/jp2/api:TAG"
admin_image      = "REGION-docker.pkg.dev/PROJECT/jp2/admin:TAG"
api_public_url   = "https://api.example.org"
admin_public_url = "https://admin.example.org"
firebase_project_id = "firebase-project-id"
firebase_database_url = "https://firebase-project-id-default-rtdb.region.firebasedatabase.app"
silent_prayer_realtime_provider = "firebase-rtdb"
prisma_connection_limit = 5
prisma_pool_timeout_seconds = 10
prisma_startup_retry_attempts = 5
prisma_startup_retry_delay_ms = 1000
```

## State And Secrets Rules

- Terraform state must not contain plaintext application secrets.
- Terraform may create Secret Manager resources and IAM bindings.
- Secret versions should be added outside Terraform or through a secured CI
  process that does not commit values.
- Use remote state only after project policy is agreed. For the first pilot,
  local state may be acceptable if access is controlled and backed up.

## Deployment Order

1. Build API/Admin images.
2. Push images to Artifact Registry.
3. `terraform plan`.
4. `terraform apply`.
5. Add/update secret versions.
6. Run Cloud Run migration job.
7. Deploy new Cloud Run revisions if image tags changed after apply.
8. Run smoke checks.

## Cloud Run And Cloud SQL Runtime Rules

- API Cloud Run services set `PRISMA_CONNECT_ON_BOOT=true` so bad database
  credentials fail the revision before it receives traffic.
- Prisma uses low default pool settings for the lean pilot:
  `PRISMA_CONNECTION_LIMIT=5` and `PRISMA_POOL_TIMEOUT_SECONDS=10`, unless the
  Cloud SQL URL already carries explicit `connection_limit` or `pool_timeout`
  values.
- The migration job should use an even smaller pool, usually
  `PRISMA_CONNECTION_LIMIT=1` or `2`, because it is a one-off deploy step.
- `/api/health` remains a shallow process/readiness probe and does not query
  Cloud SQL, RTDB, Firebase Auth, Secret Manager, or push providers.
- Production migrations run only in the Cloud Run migration job before service
  traffic moves to the new revision.

## Rollback Model

Default rollback should be application-artifact rollback:

- keep previous Cloud Run revision available;
- route traffic back to previous revision when schema remains compatible;
- use forward-fix migration when schema cannot safely roll back;
- archive/unpublish content for content/configuration incidents.

## First Terraform Milestone

The first implementation milestone should create:

- provider and variable files;
- API enablement;
- Artifact Registry;
- service accounts;
- Secret Manager secret shells;
- placeholder Cloud Run services that reference already-built images.

Cloud SQL, Firebase RTDB wiring, migration job, and domain mapping can follow in
the second Terraform milestone if we want smaller, easier-to-review commits.

Do not implement a Memorystore module for live pilot infrastructure. Implement
and verify the Firebase RTDB silent-prayer migration plan in
[realtime-db-silent-prayer-migration-plan.md](realtime-db-silent-prayer-migration-plan.md),
then keep `silent_prayer_realtime_provider = "firebase-rtdb"` for pilot and
production.
