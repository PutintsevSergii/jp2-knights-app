# JP2 Google Cloud Terraform

This is the Phase 13 Terraform foundation for the JP2 Google Cloud pilot. It
creates deploy-time infrastructure shells, Firebase RTDB, Cloud SQL, and Cloud
Run services/jobs that reference already-built images. It does not store secret
values in Terraform state.

Canonical deployment planning docs:

- [Google Cloud Launch Plan](../../docs/deployment/google-cloud-launch-plan.md)
- [Environment And Secrets Matrix](../../docs/deployment/environment-and-secrets.md)
- [Manual Google Cloud And Firebase Tasks](../../docs/deployment/manual-google-tasks.md)
- [Terraform Plan](../../docs/deployment/terraform-plan.md)

## Intended Workflow

```bash
terraform init
terraform plan -var-file=pilot.tfvars
terraform apply -var-file=pilot.tfvars
```

Do not add plaintext secrets to `.tfvars` files. Terraform should create Secret
Manager secret shells and IAM bindings; secret values should be added through
`gcloud secrets versions add` or a secured CI process.

If the human owner already created the Firebase project or Realtime Database,
import those resources before the first apply:

```bash
terraform import google_firebase_project.default projects/<firebase-project-id>
terraform import google_firebase_database_instance.silent_prayer projects/<firebase-project-id>/locations/<rtdb-region>/instances/<rtdb-instance-id>
```

Terraform provisions the database instance, but Firebase RTDB Security Rules are
deployed with the Firebase CLI after review:

```bash
pnpm exec firebase deploy --only database --project <firebase-project-id>
```

## Current Scope

Implemented:

- provider and version files;
- variables and outputs;
- required Google API enablement;
- API, Admin Lite, migration, and deploy service accounts;
- Artifact Registry Docker repository;
- Firebase project enablement and Realtime Database instance for silent-prayer
  aggregate counts;
- Secret Manager secret shells without secret versions;
- placeholder Cloud Run API and Admin Lite services that reference prebuilt
  images;
- optional public Cloud Run invoker bindings, disabled by default;
- Cloud SQL PostgreSQL instance and application database;
- Cloud SQL client IAM for API and migration service accounts;
- Cloud Run Prisma migration job using the prebuilt API image and reduced
  migration pool settings.

Follow-up milestones:

- build/push/deploy scripts;
- backup/restore procedure and launch smoke checklist;
- custom domains and DNS validation.

Do not add Memorystore Redis for live pilot or production infrastructure unless
a future owner-approved scope change reverses the June 3, 2026 no-Redis
decision.
