# Environment And Secrets Matrix

This document defines the deployment configuration needed for Google Cloud.
Secret values must never be committed. Terraform should create secret shells;
secret versions should be set through a secure manual or CI-controlled process.

## Environments

| Environment | Purpose | Suggested project model |
| --- | --- | --- |
| `staging` | Integrated deployment and smoke tests | Separate project preferred |
| `pilot` | First approved chorągiew pilot | Separate project strongly preferred |
| `production` | Wider rollout after pilot | Separate project required before broad launch |

## Common Non-Secret Variables

| Name | Used by | Example | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | API, Admin | `production` | Must be `production` for deployed services |
| `APP_RUNTIME_MODE` | API, Admin, Mobile | `api` | `demo` is rejected in production |
| `GCP_PROJECT_ID` | deploy scripts | `jp2-pilot` | Human-selected project |
| `GCP_REGION` | Terraform/deploy | `europe-west4` | Pick once per environment |
| `API_PUBLIC_URL` | Admin, Mobile | `https://api.example.org` | Public API base URL |
| `ADMIN_PUBLIC_URL` | Admin/API auth settings | `https://admin.example.org` | Admin origin |
| `AUTH_PROVIDER_MODE` | API | `firebase` | `fake` is forbidden in production |
| `SILENT_PRAYER_REALTIME_PROVIDER` | API, Mobile | `firebase-rtdb` | Planned pilot cost-reduction target; valid values should be `redis-socket`, `firebase-rtdb`, or non-production `in-memory` after the RTDB slice is implemented |
| `FIREBASE_PROJECT_ID` | API, Mobile | `jp2-auth` | Firebase project id |
| `FIREBASE_DATABASE_URL` | API, Mobile | `https://project-id-default-rtdb.region.firebasedatabase.app` | Required when `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb`; mobile uses it only for aggregate-count listeners |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Mobile | Firebase value | Public client config, still environment-specific |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Mobile | Firebase value | Must match authorized domains |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Mobile | Firebase value | Usually same as Firebase project id |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Mobile | Firebase value | Firebase app id |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Mobile | OAuth client id | Required for Google sign-in |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Mobile | OAuth client id | Required for native iOS validation |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Mobile | OAuth client id | Required for native Android validation |

## Secret Manager Secrets

| Secret name | Used by | Required for pilot | Notes |
| --- | --- | --- | --- |
| `jp2-database-url` | API, migration job | Yes | PostgreSQL connection string for Cloud SQL |
| `jp2-redis-url` | API | Required only for `redis-socket` provider | Memorystore Redis URL; current production startup fails without `REDIS_URL` until the RTDB provider slice is implemented |
| `jp2-session-secret` | API | Yes | Cookie/session signing secret if configured by auth layer |
| `jp2-csrf-secret` | API/Admin auth flow | Yes | Required if CSRF secret is introduced or configured |
| `jp2-firebase-service-account-json` | API | Yes | Firebase Admin SDK credentials |
| `jp2-push-provider-credentials` | API | If push enabled | FCM/Expo push credentials as selected by implementation |
| `jp2-admin-bootstrap-token` | migration/seed tooling | Optional | Use only if a controlled bootstrap script requires it |

## Cloud Run Environment Mapping

### API Service

| Runtime env | Source |
| --- | --- |
| `NODE_ENV=production` | Terraform variable |
| `APP_RUNTIME_MODE=api` | Terraform variable |
| `AUTH_PROVIDER_MODE=firebase` | Terraform variable |
| `FIREBASE_PROJECT_ID` | Terraform variable |
| `FIREBASE_DATABASE_URL` | Terraform variable when `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` |
| `DATABASE_URL` | `jp2-database-url` secret |
| `REDIS_URL` | `jp2-redis-url` secret only when `SILENT_PRAYER_REALTIME_PROVIDER=redis-socket` |
| Firebase Admin credentials | `jp2-firebase-service-account-json` secret |

### Admin Service

| Runtime env | Source |
| --- | --- |
| `NODE_ENV=production` | Terraform variable |
| `APP_RUNTIME_MODE=api` | Terraform variable |
| `API_PUBLIC_URL` | Terraform variable |

### Migration Job

| Runtime env | Source |
| --- | --- |
| `NODE_ENV=production` | Terraform variable |
| `DATABASE_URL` | `jp2-database-url` secret |

## Validation Checklist

- API refuses `APP_RUNTIME_MODE=demo` when `NODE_ENV=production`.
- Admin refuses `APP_RUNTIME_MODE=demo` when `NODE_ENV=production`.
- API starts with `AUTH_PROVIDER_MODE=firebase`.
- API starts with a production-valid silent-prayer realtime provider:
  `redis-socket` requires `REDIS_URL`; `firebase-rtdb` requires
  `FIREBASE_DATABASE_URL` plus Firebase Admin credentials; `in-memory` must not
  be allowed in production.
- RTDB Security Rules are deny-by-default before
  `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` is used in pilot.
- Firebase authorized domains include Admin and API domains where applicable.
- Mobile native sign-in has matching iOS/Android OAuth clients.
- Secrets are stored only in Secret Manager or the secure CI secret store.
