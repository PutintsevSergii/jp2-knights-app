# Domain And DNS Runbook

This runbook covers custom-domain readiness for the Phase 13 pilot. It does not
assume a specific DNS provider and does not commit domain names or DNS tokens.

## Ownership Rules

- The human owner chooses final hostnames and controls DNS.
- The agent can provide commands, validation scripts, and expected checks.
- Do not commit DNS provider API tokens, certificate private keys, or Firebase
  console credentials.
- API and Admin public URLs must use HTTPS before pilot traffic is allowed.

## Required Hostnames

Choose and record:

- API hostname, for example `api.example.org`;
- Admin Lite hostname, for example `admin.example.org`;
- Firebase authorized domains needed for Admin/mobile sign-in redirects.

Set deployment variables with full HTTPS origins:

```bash
API_PUBLIC_URL=https://api.example.org
ADMIN_PUBLIC_URL=https://admin.example.org
EXPO_PUBLIC_API_BASE_URL=https://api.example.org/api
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
```

## Cloud Run Mapping

For each custom domain, create or verify the Cloud Run domain mapping in the
selected Google Cloud project and region. If Terraform/domain resources are not
approved for the DNS provider, apply domain mappings manually with `gcloud`:

```bash
gcloud run domain-mappings create \
  --service <api-service-name> \
  --domain api.example.org \
  --region <region> \
  --project <project-id>

gcloud run domain-mappings create \
  --service <admin-service-name> \
  --domain admin.example.org \
  --region <region> \
  --project <project-id>
```

Describe mappings to obtain the DNS records expected by Cloud Run:

```bash
gcloud run domain-mappings describe \
  --domain api.example.org \
  --region <region> \
  --project <project-id>

gcloud run domain-mappings describe \
  --domain admin.example.org \
  --region <region> \
  --project <project-id>
```

## DNS Provider Tasks

Apply the records returned by Cloud Run in the DNS provider:

- `CNAME` records for subdomains when Cloud Run returns a CNAME target;
- `A` and `AAAA` records when Cloud Run returns apex-compatible records;
- no wildcard record should point unaudited hostnames at JP2 services.

Wait for DNS propagation and Google-managed certificate provisioning before
launch smoke checks.

## Firebase Authorized Domains

In Firebase Authentication, add:

- generated Cloud Run Admin URL for staging smoke if used;
- final Admin hostname;
- API hostname only if the auth/session flow requires redirects to API.

Mobile public Firebase values remain environment-specific and must not be
committed as secrets.

## Validation Commands

Print the non-mutating validation plan:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
pnpm deploy:domains:plan
```

Run DNS and HTTPS checks after records and certificates are ready:

```bash
API_PUBLIC_URL=https://api.example.org \
ADMIN_PUBLIC_URL=https://admin.example.org \
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain> \
pnpm deploy:domains check --execute
```

The validation helper checks:

- both public URLs use HTTPS;
- DNS resolves for API and Admin hosts;
- `GET /api/health` succeeds through the API custom domain;
- `GET /admin/dashboard` succeeds through the Admin custom domain;
- Firebase auth-domain configuration is present and hostname-shaped when set.

## Launch Gate

Do not approve pilot launch until:

- API and Admin custom domains serve HTTPS;
- Firebase sign-in works from the final Admin domain;
- auth cookie, CORS, and redirect-domain checks pass through
  [auth-cookie-cors-checklist.md](auth-cookie-cors-checklist.md);
- mobile native sign-in is validated with the final public API URL;
- public and private smoke flows pass through the final domains;
- rollback to previous Cloud Run revision is documented for both services.
