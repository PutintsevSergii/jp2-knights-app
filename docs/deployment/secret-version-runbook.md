# Secret Version Runbook

Use this runbook after Terraform creates Secret Manager secret shells and before
Cloud Run revisions receive pilot traffic. It documents how to add, verify, and
rotate secret versions without committing secret values or storing plaintext in
Terraform state.

## Scope

This runbook covers these Secret Manager entries from the environment matrix:

- `jp2-database-url`
- `jp2-session-secret`
- `jp2-csrf-secret`
- `jp2-firebase-service-account-json`
- `jp2-silent-prayer-presence-hash-secret`
- `jp2-push-provider-credentials`
- `jp2-admin-bootstrap-token`

Only secrets required for the selected pilot configuration need active versions.
Push credentials and bootstrap tokens remain optional unless the owner enables
those flows.

## Rules

- Do not commit `.env.production`, service-account JSON, copied secret values,
  local shell history, or screenshots that show secret contents.
- Do not put secret values in Terraform variables, `terraform.tfvars`, output
  values, deployment docs, launch approval records, or chat.
- Prefer adding versions from files stored outside the repository or from a
  secured CI secret store.
- Disable or destroy obsolete versions only after the new service revision has
  passed smoke checks.
- Redact values in logs and incident notes. Record secret names, version
  numbers, timestamps, and operator names only.

## Add Secret Versions

Set the active project first:

```bash
gcloud config set project <project-id>
```

Add a version from stdin for short generated values:

```bash
printf '<redacted-value>' | gcloud secrets versions add jp2-session-secret --data-file=-
printf '<redacted-value>' | gcloud secrets versions add jp2-csrf-secret --data-file=-
printf '<redacted-value>' | gcloud secrets versions add jp2-silent-prayer-presence-hash-secret --data-file=-
```

Add a version from a file outside the repository for structured credentials:

```bash
gcloud secrets versions add jp2-firebase-service-account-json \
  --data-file=/secure/path/firebase-service-account.json
```

Add the Cloud SQL database URL without echoing it into terminal output:

```bash
gcloud secrets versions add jp2-database-url --data-file=/secure/path/database-url.txt
```

Keep `/secure/path/*` outside this repository and remove local files when the
owner confirms the versions are active.

## Verify Metadata Only

List versions without reading payloads:

```bash
gcloud secrets versions list jp2-database-url
gcloud secrets versions list jp2-firebase-service-account-json
gcloud secrets versions list jp2-silent-prayer-presence-hash-secret
```

Describe a version without accessing its payload:

```bash
gcloud secrets versions describe <version-number> --secret=jp2-database-url
```

Do not run `gcloud secrets versions access` in shared terminals, screen shares,
or logs. If access is necessary for break-glass debugging, do it in a private
owner-controlled shell and do not paste the value into notes.

## Redeploy After Secret Changes

Cloud Run services should receive a new revision after secret versions change.
Use the dry-run-first deploy helper:

```bash
GCP_PROJECT_ID=<project-id> \
GCP_REGION=<region> \
IMAGE_TAG=<immutable-tag> \
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
pnpm deploy:cloud-run:plan
```

After reviewing the plan:

```bash
GCP_PROJECT_ID=<project-id> \
GCP_REGION=<region> \
IMAGE_TAG=<immutable-tag> \
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
pnpm deploy:cloud-run deploy --execute
```

Run smoke checks after the new revision starts:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
GCP_PROJECT_ID=<project-id> \
pnpm deploy:cloud-run smoke
```

## Rotation Procedure

1. Add a new version for the secret.
2. Deploy a new API/Admin revision when the service reads that secret.
3. Run launch smoke checks for affected surfaces.
4. Confirm no authentication, Cloud SQL, Firebase Admin, RTDB, or push failures
   appear in Cloud Run logs.
5. Disable the prior version only after the new revision is healthy:

```bash
gcloud secrets versions disable <old-version-number> --secret=<secret-name>
```

6. Destroy obsolete versions only after the retention window approved by the
   owner:

```bash
gcloud secrets versions destroy <old-version-number> --secret=<secret-name>
```

Do not rotate database credentials and service revisions independently. Update
the database password, add the new `jp2-database-url` version, deploy, smoke,
and only then revoke the old credential.

## Incident Handling

If a secret is suspected to be exposed:

1. Stop sharing the channel or screen where exposure occurred.
2. Rotate the affected secret immediately.
3. Deploy a new service revision.
4. Disable the exposed secret version after the replacement passes smoke checks.
5. Record only the secret name, exposed version number, timestamp, operator, and
   mitigation status in the incident record.
6. Review whether private candidate, brother, audit, roadmap, Firebase, or
   database data may have been accessed.

## Launch Gate

Do not approve pilot launch until:

- required pilot secrets have active versions;
- no secret payloads are committed or stored in Terraform state;
- API/Admin/migration identities have least-privilege access to only the
  secrets they need;
- service revisions were redeployed after secret-version changes;
- smoke checks pass after the final secret update;
- the pilot launch approval record references metadata only.
