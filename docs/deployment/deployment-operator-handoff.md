# Deployment Operator Handoff

This runbook gives the launch operator one ordered path through the Phase 13
deployment artifacts. It does not replace the linked runbooks; it sequences
them, defines stop conditions, and lists evidence that is safe to record.

## Preconditions

- The human owner has selected the Google Cloud project, pilot domains, Firebase
  project, and production secret values.
- The operator is authenticated with `gcloud`, has the required project IAM, and
  can run Terraform from `infra/terraform`.
- The current branch contains no uncommitted secret values, plaintext
  Terraform state, generated credential files, raw cookies, provider tokens, or
  private participant/candidate/brother data.
- `docs/deployment/environment-and-secrets.md`,
  `docs/deployment/manual-google-tasks.md`, and
  `docs/deployment/terraform-plan.md` have been reviewed for the pilot
  environment.
- The pilot launch ticket or release note has a copy of
  `docs/deployment/pilot-launch-approval-record.md` ready for evidence.

## Operator Sequence

1. Validate local quality and deployment artifacts.
   - Run `pnpm quality`.
   - Run `pnpm vitest run tools/scripts/deployment-artifacts.test.ts tools/scripts/container-artifacts.test.ts tools/scripts/terraform-artifacts.test.ts`.
   - Run `git diff --check`.
   - Record pass/fail summaries only.

2. Review the dry-run deployment plan.
   - Run `pnpm deploy:cloud-run:plan`.
   - Confirm image names, regions, service names, and smoke URLs match the pilot
     environment.
   - Do not execute mutable actions until Terraform and secret preconditions are
     satisfied.

3. Build and push API/Admin images.
   - Run `pnpm deploy:cloud-run build --execute`.
   - Run `pnpm deploy:cloud-run push --execute`.
   - Record image tags or digests only.

4. Apply Terraform.
   - In `infra/terraform`, run `terraform init`, `terraform plan`, and
     `terraform apply` after owner approval.
   - Confirm API/Admin placeholder services, the migration job, Cloud SQL, Secret
     Manager secret shells, Artifact Registry, and Firebase RTDB resources or
     imports match `docs/deployment/terraform-plan.md`.
   - Do not commit `.tfstate`, `.tfvars`, generated Firebase credentials, or
     secret values.

5. Create or rotate Secret Manager versions.
   - Follow `docs/deployment/secret-version-runbook.md`.
   - Verify metadata with `gcloud secrets versions list`.
   - Do not run `gcloud secrets versions access`.
   - Do not record secret values.

6. Deploy Firebase Realtime Database rules.
   - Deploy `infra/firebase/database.rules.json` through the Firebase CLI.
   - Confirm aggregate public/private count reads and denied client writes using
     the emulator tests or the owner-approved Firebase project validation path.

7. Run native RTDB validation and evidence checks.
   - Run `pnpm validate:mobile-rtdb-native -- --platform ios` or
     `pnpm validate:mobile-rtdb-native -- --platform android` with the same
     environment used by the native target.
   - Complete the guest public count, brother private count, privacy-denial,
     and leave/cleanup checks from
     `docs/delivery/pilot-validation-plan.md`.
   - Copy `docs/deployment/native-rtdb-validation-evidence.example.json` to a
     local uncommitted evidence file, fill sanitized metadata only, and run
     `pnpm validate:mobile-rtdb-evidence -- --file <local-evidence-file>`.
   - Record only route names, HTTP status codes, aggregate count transitions,
     and pass/fail summaries.

8. Run the Cloud Run migration job.
   - Run `pnpm deploy:cloud-run migrate --execute`.
   - Follow `docs/deployment/cloud-sql-runtime-checklist.md` for execution
   evidence, logs, Prisma pool settings, and `/api/health`.
   - Record execution IDs and success/failure status only.

9. Deploy API/Admin revisions and HTTP smoke checks.
   - Run `pnpm deploy:cloud-run deploy --execute`.
   - Run `pnpm deploy:cloud-run smoke --execute`.
   - Confirm API `/api/health` and Admin `/admin/dashboard` without recording
   cookies or tokens.

10. Validate custom domains, DNS, cookies, CORS, and redirects.
   - Follow `docs/deployment/domain-and-dns-runbook.md`.
   - Run `pnpm deploy:domains check --execute`.
   - Follow `docs/deployment/auth-cookie-cors-checklist.md`.
   - Confirm Firebase authorized domains, `jp2_session` cookie attributes,
   Admin Lite server-side cookie forwarding, logout clearing, and no wildcard
   credentialed REST CORS.

11. Run the launch smoke checklist.
    - Follow `docs/deployment/launch-smoke-checklist.md`.
    - Cover Guest/Public, Idle approval, Candidate, Brother, silent-prayer RTDB,
      Admin Lite, production demo rejection, and rollback-decision checks.
    - Record only aggregate counts, route names, HTTP status codes, and sanitized
      screenshots or notes.

12. Prepare support and rollback handoff.
    - Follow `docs/deployment/support-and-rollback-runbook.md`.
    - Record known-good API/Admin revision names, rollback commands, incident
      channels, owner contacts, and privacy/security escalation rules.

13. Complete the pilot approval record.
    - Fill the launch ticket or release note copy of
      `docs/deployment/pilot-launch-approval-record.md`.
    - The owner must explicitly choose `GO`, `GO WITH EXCEPTION`, or `NO-GO`.
    - Do not treat this handoff as product, privacy, legal, or final launch
      approval.

## Stop Conditions

Stop the launch and move to rollback or owner review when any of these occur:

- `pnpm quality`, contract generation/check, migration check, or launch smoke
  fails for a reason other than the known local sandbox bind restriction.
- Terraform plans destructive or out-of-scope resources, including
  Redis/Memorystore, chat, payments, maps, analytics, hierarchy-derived
  permissions, or Terraform-managed secret versions.
- Secret values, raw cookies, provider tokens, private participant identifiers,
  candidate/brother private data, or database URLs appear in logs, tickets, or
  committed files.
- The Cloud Run migration job fails, hangs, or requires a destructive production
  database rollback.
- API/Admin revisions fail readiness, health, or session smoke checks.
- Domain, DNS, Firebase authorized-domain, cookie, CORS, or redirect validation
  fails.
- Silent-prayer validation exposes participant lists or user/session/socket-room
  identifiers instead of aggregate counts only.
- Native RTDB evidence validation fails or the evidence requires recording raw
  cookies, tokens, secret values, private identifiers, rosters, or raw logs.
- Officer access leaks outside the scoped chorągiew or Super Admin privacy
  workflows become visible to non-Super Admin users.

## Evidence Rules

Safe evidence:

- Command names, timestamps, revision names, image digests, job execution IDs,
  HTTP status codes, sanitized route names, aggregate count transitions, native
  platform labels, Firebase project ids, and owner approval decisions.

Unsafe evidence:

- Secret values, `DATABASE_URL`, Firebase service account JSON, raw
  `jp2_session` cookies, OAuth/Firebase tokens, provider refresh tokens, private
  participant/session/user identifiers, attendee lists, candidate private
  responses, brother private details, Terraform state, and unredacted logs.

## Ownership

Repo-owned before handoff:

- Scripts, Dockerfiles, Terraform templates, RTDB rules, static artifact tests,
  runbooks, and status documentation.

Owner/operator-owned during live launch:

- Google Cloud and Firebase project values, DNS changes, secret values,
  Terraform apply approval, live command execution, restore test evidence,
  product/privacy/security approvals, and the final go/no-go decision.
