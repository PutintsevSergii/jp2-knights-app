# Backup And Restore Runbook

This runbook is for Phase 13 pilot readiness. It documents how to prove Cloud
SQL backup recovery without committing database credentials or restoring over a
live pilot/production database.

## Rules

- Run the restore drill only against a staging or disposable restore instance.
- Do not restore over pilot or production.
- Do not export, paste, or commit `DATABASE_URL`, SQL passwords, service account
  JSON, or user data.
- Keep `/api/health` shallow; database readiness is verified through the
  migration job result, Cloud SQL backup metadata, and smoke flows.
- Record only timestamps, instance names, command success/failure, and redacted
  row-count summaries in launch notes.

## Preconditions

- Terraform has applied the Cloud SQL instance with automated backups enabled.
- The deploy operator is authenticated with `gcloud`.
- The operator has Cloud SQL admin permission for the restore drill project.
- Secret Manager contains a database URL for the restore target, not a committed
  plaintext value.

## Backup Inventory

List available backups:

```bash
gcloud sql backups list \
  --instance <cloud-sql-instance-name> \
  --project <gcp-project-id>
```

Describe the selected backup before restoring:

```bash
gcloud sql backups describe <backup-id> \
  --instance <cloud-sql-instance-name> \
  --project <gcp-project-id>
```

Record:

- backup id;
- backup start/end time;
- source instance;
- restore target instance;
- operator;
- reason for the drill.

## Non-Production Restore Test

Create or select a restore-only Cloud SQL instance. Then restore the selected
backup into that target:

```bash
gcloud sql backups restore <backup-id> \
  --backup-instance <source-cloud-sql-instance-name> \
  --restore-instance <restore-target-instance-name> \
  --project <gcp-project-id>
```

After the restore completes:

1. Set a restore-target `DATABASE_URL` in Secret Manager or local shell only.
2. Run `pnpm db:migrate:check` against the restored database if network access
   and credentials are available.
3. Run bounded read-only SQL checks for expected table presence and approximate
   row counts.
4. Confirm no migration is attempted from an API request-serving container.
5. Destroy the restore-only instance when the drill is complete and retention
   needs allow it.

## Validation Checklist

- Backup is recent enough for the pilot recovery-point objective.
- Restore target is not pilot or production.
- Restore command completed successfully.
- Core tables exist after restore.
- Migration baseline check passes or the exact failure is documented.
- API launch smoke can run against a restore/staging target without exposing
  private data.
- Cleanup completed for temporary restore resources.

## Failure Handling

- If no recent backup exists, stop launch and fix Cloud SQL backup settings.
- If restore fails, stop launch and capture redacted Cloud SQL operation logs.
- If the restored schema is behind the app, run the Cloud Run migration job
  against the restore target only, then repeat validation.
- If private data appears in logs or notes, delete the notes and recreate a
  redacted incident record.
