# Environment And Secrets Matrix

This document defines the deployment configuration needed for Google Cloud.
Secret values must never be committed. Terraform should create secret shells;
secret versions should be set through a secure manual or CI-controlled process.
See [secret-version-runbook.md](secret-version-runbook.md) for safe version
creation, metadata-only verification, redeploy, rotation, and incident handling.

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
| `PRISMA_CONNECT_ON_BOOT` | API | `true` | Optional override; defaults to `true` in production and `false` outside production so local health smoke checks stay shallow |
| `PRISMA_CONNECTION_LIMIT` | API, migration job | `5` | Low-cost Cloud Run/Cloud SQL pool limit appended to `DATABASE_URL` when the URL does not already set `connection_limit` |
| `PRISMA_POOL_TIMEOUT_SECONDS` | API, migration job | `10` | Prisma `pool_timeout` appended to `DATABASE_URL` when the URL does not already set it |
| `PRISMA_STARTUP_RETRY_ATTEMPTS` | API | `5` | Production API boot DB connection retry attempts before Cloud Run marks the revision failed |
| `PRISMA_STARTUP_RETRY_DELAY_MS` | API | `1000` | Delay between boot DB connection retries |
| `LITURGICAL_CALENDAR_PROVIDER` | API | `fallback` | `fallback` uses the built-in civil-date provider; `http` calls a configured normalized provider endpoint server-side |
| `LITURGICAL_CALENDAR_URL` | API | `https://calendar.example.org/today` | Required only when `LITURGICAL_CALENDAR_PROVIDER=http`; endpoint must return the shared `today` DTO |
| `LITURGICAL_CALENDAR_TIMEOUT_MS` | API | `1500` | Bounded remote calendar call timeout, accepted range 100-10000 |
| `LITURGICAL_CALENDAR_RETRY_ATTEMPTS` | API | `1` | Extra HTTP retry attempts before falling back, accepted range 0-3 |
| `LITURGICAL_CALENDAR_CACHE_TTL_MS` | API | `21600000` | In-memory successful-response cache TTL, accepted range 0-86400000 |
| `SILENT_PRAYER_REALTIME_PROVIDER` | API | `firebase-rtdb` | Required for live pilot/production. `redis-socket` is not allowed in live infrastructure unless a future owner-approved scope change reverses the June 3, 2026 no-Redis decision. `in-memory` remains non-production only. |
| `EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER` | Mobile | `firebase-rtdb` | Selects the mobile aggregate-count listener provider. Defaults to current Socket.IO compatibility when unset. |
| `FIREBASE_PROJECT_ID` | API | `jp2-auth` | Firebase project id |
| `FIREBASE_DATABASE_URL` | API | `https://project-id-default-rtdb.region.firebasedatabase.app` | Required when `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Mobile | Firebase value | Public client config, still environment-specific |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Mobile | Firebase value | Must match authorized domains |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Mobile | Firebase value | Usually same as Firebase project id |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Mobile | Firebase value | Firebase app id |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL` | Mobile | `https://project-id-default-rtdb.region.firebasedatabase.app` | Required when `EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb`; mobile uses it only for aggregate-count listeners |
| `EXPO_PUBLIC_API_BASE_URL` | Mobile | `https://api.example.org/api` | Required for native RTDB validation; use a device-reachable HTTPS URL, not localhost |
| `EXPO_PUBLIC_APP_SCHEME` | Mobile | `jp2` | Required for native Google/Firebase auth redirects |
| `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER` | Mobile | `org.jp2.pilot` | Required for native iOS validation; must match the Firebase iOS app registration |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Mobile | `org.jp2.pilot` | Required for native Android validation; must match the Firebase Android app registration |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Mobile | OAuth client id | Required for Google sign-in |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Mobile | OAuth client id | Required for native iOS validation |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Mobile | OAuth client id | Required for native Android validation |

## Secret Manager Secrets

| Secret name | Used by | Required for pilot | Notes |
| --- | --- | --- | --- |
| `jp2-database-url` | API, migration job | Yes | PostgreSQL connection string for Cloud SQL |
| `jp2-session-secret` | API | Yes | Cookie/session signing secret if configured by auth layer |
| `jp2-csrf-secret` | API/Admin auth flow | Yes | Required if CSRF secret is introduced or configured |
| `jp2-firebase-service-account-json` | API | Yes | Firebase Admin SDK credentials |
| `jp2-silent-prayer-presence-hash-secret` | API | Yes when `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` | HMAC/hash secret used to derive RTDB presence participant keys without storing local user ids or anonymous session ids |
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
| `FIREBASE_DATABASE_URL` | Terraform-managed Firebase RTDB database URL when `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` |
| `PRISMA_CONNECT_ON_BOOT=true` | Terraform variable |
| `PRISMA_CONNECTION_LIMIT=5` | Terraform variable |
| `PRISMA_POOL_TIMEOUT_SECONDS=10` | Terraform variable |
| `PRISMA_STARTUP_RETRY_ATTEMPTS=5` | Terraform variable |
| `PRISMA_STARTUP_RETRY_DELAY_MS=1000` | Terraform variable |
| `LITURGICAL_CALENDAR_PROVIDER=fallback` or `http` | Terraform variable |
| `LITURGICAL_CALENDAR_URL` | Terraform variable or secret, required only for `http` provider |
| `LITURGICAL_CALENDAR_TIMEOUT_MS=1500` | Terraform variable |
| `LITURGICAL_CALENDAR_RETRY_ATTEMPTS=1` | Terraform variable |
| `LITURGICAL_CALENDAR_CACHE_TTL_MS=21600000` | Terraform variable |
| `SILENT_PRAYER_PRESENCE_HASH_SECRET` | `jp2-silent-prayer-presence-hash-secret` secret when `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` |
| `DATABASE_URL` | `jp2-database-url` secret |
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
| `PRISMA_CONNECTION_LIMIT=1` or `2` | Terraform variable for one-off migration execution |
| `PRISMA_POOL_TIMEOUT_SECONDS=10` | Terraform variable |

## Validation Checklist

- API refuses `APP_RUNTIME_MODE=demo` when `NODE_ENV=production`.
- Admin refuses `APP_RUNTIME_MODE=demo` when `NODE_ENV=production`.
- API starts with `AUTH_PROVIDER_MODE=firebase`.
- API production startup uses `PRISMA_CONNECT_ON_BOOT=true` or the production
  default, retries the initial Prisma connection, and uses low Cloud SQL pool
  settings through `connection_limit` and `pool_timeout`.
- `/api/health` stays a shallow process/runtime readiness endpoint; it must not
  query Cloud SQL, Firebase, RTDB, or any external provider.
- Liturgical calendar lookup stays server-side. If
  `LITURGICAL_CALENDAR_PROVIDER=http` is selected, runtime HTTP failures,
  invalid normalized DTOs, and exhausted retries fall back to the local
  civil-date provider instead of leaking provider errors to mobile clients.
- Production Prisma migrations run from the Cloud Run migration job, not during
  API or Admin request-serving startup.
- API starts with `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb`;
  `firebase-rtdb` requires `FIREBASE_DATABASE_URL`,
  `SILENT_PRAYER_PRESENCE_HASH_SECRET`, and Firebase Admin credentials;
  `redis-socket` and `in-memory` must not be allowed in live pilot/production.
- RTDB Security Rules are deny-by-default before
  `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` is used in pilot. The
  committed baseline is
  [`infra/firebase/database.rules.json`](../../infra/firebase/database.rules.json).
- Firebase authorized domains include Admin and API domains where applicable.
- Mobile native sign-in has matching iOS/Android app identifiers and OAuth
  clients. `apps/mobile/app.config.js` maps `EXPO_PUBLIC_APP_SCHEME`,
  `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER`, and `EXPO_PUBLIC_ANDROID_PACKAGE` into
  the Expo native config without committing owner-specific values.
- `pnpm validate:mobile-rtdb-native -- --platform ios` or
  `pnpm validate:mobile-rtdb-native -- --platform android` passes before the
  native RTDB silent-prayer validation run.
- After the native run, sanitized evidence based on
  `docs/deployment/native-rtdb-validation-evidence.example.json` passes
  `pnpm validate:mobile-rtdb-evidence -- --file <local-evidence-file>` before
  it is attached to the pilot launch ticket.
- Secrets are stored only in Secret Manager or the secure CI secret store.
