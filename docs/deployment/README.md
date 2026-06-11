# Deployment Documentation

This folder tracks the Google Cloud deployment path for JP2 V1.

Start here:

1. [Google Cloud Launch Plan](google-cloud-launch-plan.md)
2. [Environment And Secrets Matrix](environment-and-secrets.md)
3. [Manual Google Cloud And Firebase Tasks](manual-google-tasks.md)
4. [Terraform Plan](terraform-plan.md)
5. [Live Cost Estimate](live-cost-estimate.md)
6. [Deployment Operator Handoff](deployment-operator-handoff.md)
7. [Secret Version Runbook](secret-version-runbook.md)
8. [Cloud SQL Runtime Checklist](cloud-sql-runtime-checklist.md)
9. [Backup And Restore Runbook](backup-restore-runbook.md)
10. [Launch Smoke Checklist](launch-smoke-checklist.md)
11. [Domain And DNS Runbook](domain-and-dns-runbook.md)
12. [Auth Cookie, CORS, And Redirect Checklist](auth-cookie-cors-checklist.md)
13. [Support And Rollback Runbook](support-and-rollback-runbook.md)
14. [Pilot Launch Approval Record](pilot-launch-approval-record.md)
15. [Native RTDB Validation Evidence Template](native-rtdb-validation-evidence.example.json)

The repo now includes production Dockerfiles, Terraform foundations, dry-run
Cloud Run deployment scripts, secret-version guidance, backup/restore guidance,
Cloud SQL runtime checks, domain validation, auth cookie/CORS/redirect checks,
support/rollback guidance, launch smoke gates, an operator handoff sequence,
native RTDB evidence validation, and a generic pilot launch approval evidence
template. A live Cloud Run deployment still requires owner-provided project,
domain, Firebase, and secret values.
