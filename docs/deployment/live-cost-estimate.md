# Live Cost Estimate

Last updated: June 3, 2026

This estimate is for the planned Google Cloud live pilot architecture:

- Cloud Run API and Admin services with minimum instances set to `0`;
- Cloud SQL for PostgreSQL;
- Firebase Authentication with Google/Gmail sign-in;
- Firebase Realtime Database for silent-prayer aggregate counts;
- Firebase Cloud Messaging for push;
- Secret Manager, Artifact Registry, Cloud Build, Cloud Logging, and optional
  Cloud DNS.

Owner decision: live pilot and production must not provision Redis/Memorystore.
Redis is therefore not included in the estimate below. Reintroducing Redis for
live infrastructure requires a future owner-approved scope change and a docs
update in the same change.

## Monthly Estimate

| Scenario | Estimated monthly cost | Cost per active user |
| --- | ---: | ---: |
| 1 active user, lean pilot | `$11-$15` | `$11-$15` |
| 3,000 active users, lean pilot | `$45-$80` | `$0.015-$0.027` |
| 3,000 active users, safer DB sizing | `$70-$115` | `$0.023-$0.038` |

## Spend Items

| Item | 1 active user | 3,000 active users | Notes |
| --- | ---: | ---: | --- |
| Cloud Run API and Admin | `$0` | `$2-$10` | Request-based Cloud Run with min instances `0`; normal pilot traffic should mostly fit inside or near the free tier. |
| Cloud SQL PostgreSQL | `$10-$12` | `$31-$55` | Main fixed cost. Use the smallest viable pilot shape first, then resize after observing CPU, memory, connections, storage, and backup growth. |
| Firebase Authentication | `$0` | `$0` | Google/Gmail authentication is expected to stay inside no-cost monthly-active-user limits for 3,000 active users. |
| Firebase Realtime Database | `$0` | `$0-$15` | Silent prayer must store only aggregate counts and short-lived presence/grant records with narrow listeners. |
| Firebase Cloud Messaging | `$0` | `$0` | Push delivery provider for V1 notification surfaces. |
| Network egress | `$0` | `$4-$12` | Depends on JSON volume, admin usage, and region/client geography. |
| Secret Manager | `$0-$1` | `$0-$1` | Small number of active secrets and access operations. |
| Artifact Registry | `$0-$1` | `$0-$2` | Container image storage for API/Admin builds. |
| Cloud Build | `$0` | `$0` | Normal pilot deploy frequency should stay inside free build minutes. |
| Cloud Logging and Monitoring | `$0` | `$0-$5` | Keep log volume controlled; do not log sensitive payloads. |
| Cloud DNS | `$0-$1` | `$0-$1` | Optional if Google Cloud manages DNS. Domain registration is separate. |
| Redis/Memorystore | `$0` | `$0` | Explicitly excluded from live pilot and production. |

## Cost Controls

- Keep Cloud Run minimum instances at `0` unless launch monitoring proves cold
  starts are unacceptable.
- Keep silent-prayer RTDB data aggregate-only and listener paths narrow.
- Start with the smallest acceptable Cloud SQL instance and resize from metrics.
- Set billing alerts before pilot at low thresholds such as `$25`, `$50`, and
  `$100`.
- Review Cloud Logging volume after the first smoke run and again after the
  first pilot week.

## Pricing References

- [Cloud Run pricing](https://cloud.google.com/run/pricing)
- [Cloud SQL pricing](https://cloud.google.com/sql/pricing)
- [Firebase pricing](https://firebase.google.com/pricing)
- [Secret Manager pricing](https://cloud.google.com/secret-manager/pricing)
- [Artifact Registry pricing](https://cloud.google.com/artifact-registry/pricing)
- [Cloud Build pricing](https://cloud.google.com/build/pricing)
- [Google Cloud Observability pricing](https://cloud.google.com/products/observability/pricing)
