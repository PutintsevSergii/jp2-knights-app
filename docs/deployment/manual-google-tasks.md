# Manual Google Cloud And Firebase Tasks

The coding agent can write Terraform and scripts, but these actions require the
human owner because they involve billing, organization access, DNS ownership, or
secret values.

## Before Terraform

1. Create or select the Google Cloud project.
2. Confirm billing is enabled.
3. Confirm the deployment region.
4. Confirm whether staging and pilot production use separate projects.
5. Install and authenticate local tools:
   - `gcloud auth login`
   - `gcloud auth application-default login`
   - `gcloud config set project <project-id>`
6. Confirm Terraform can access the project.

## Firebase Setup

1. Create or select a Firebase project.
2. Enable Firebase Authentication.
3. Enable Google sign-in provider only for V1.
4. Create Firebase app registrations:
   - web app for Admin/sign-in config;
   - iOS app if native iOS pilot is planned;
   - Android app if native Android pilot is planned.
5. Confirm the Firebase RTDB region and instance id, or provide the existing
   database import target before Terraform apply.
6. Record non-secret Firebase public config values for the mobile build.
7. Create or obtain Firebase Admin SDK service-account credentials.
8. Add authorized domains:
   - generated Cloud Run Admin URL during staging;
   - generated Cloud Run API URL if needed for redirects;
   - final `admin.<domain>`;
   - final `api.<domain>` if required by auth/session topology.

## DNS And Domains

1. Choose final hostnames:
   - API hostname;
   - Admin hostname.
2. Decide DNS provider.
3. If Google manages DNS, grant Terraform permission to manage the zone.
4. If another provider manages DNS, apply the records manually when the agent
   provides them.
5. Wait for TLS/domain provisioning and run HTTPS smoke checks.

## Secret Values

Set real values only after Terraform creates Secret Manager secret shells.

Required values:

- database connection URL;
- Firebase service-account JSON;
- session/cookie secret values if configured;
- push provider credentials if push is enabled for pilot.

Rules:

- Do not paste secret values into chat unless explicitly necessary for a
  throwaway test environment.
- Do not commit `.env.production` or service-account JSON files.
- Prefer `gcloud secrets versions add` or CI secret injection.

## Pilot Launch Approval

Before pilot traffic is allowed:

1. Confirm privacy/legal review.
2. Confirm public content wording approval.
3. Confirm prayer/formation wording approval.
4. Confirm pilot chorągiew seed data.
5. Run backup restore test in non-production.
6. Run Guest, Idle, Candidate, Brother, Officer, and Super Admin smoke flows.
7. Confirm rollback procedure.
8. Approve launch in writing.
