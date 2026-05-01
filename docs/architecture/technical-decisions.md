# Technical Decisions

These are canonical V1 stack decisions. Changing one requires an explicit architecture decision update and a migration note.

| Area | Decision | Reason | Revisit trigger |
| --- | --- | --- | --- |
| Language | TypeScript strict mode across apps/libs | One type system across mobile, admin, API, and shared contracts | Only if a selected dependency cannot support strict TypeScript |
| Package manager | `pnpm` workspaces | Fast installs, strict dependency graph, good monorepo behavior | Team/tooling constraint |
| Monorepo | Nx integrated workspace | Build graph, affected tasks, cacheable CI, clear app/lib boundaries | Repo becomes too small to justify Nx |
| Mobile | Expo-managed React Native with development builds | Fast iteration, TypeScript default path, push-notification support, lower native maintenance | Native capability requires custom modules beyond Expo support |
| Admin | Next.js App Router | Mature React admin surface, route layouts, server/client component split | Admin becomes non-web or requires a different host platform |
| API | NestJS REST API on the default Express adapter | Stable TypeScript backend, modular architecture, strongest Nest ecosystem compatibility | Performance testing proves Express adapter is a bottleneck |
| API contract | OpenAPI 3.1 generated from Nest and checked in CI | Long-lived public contract, typed clients, compatibility checks | Internal-only API becomes unsuitable for generated clients |
| Validation | Zod schemas in shared validation library | TypeScript-first runtime validation shared by apps and API | Nest/OpenAPI integration cost exceeds benefit |
| Authentication provider | Firebase Authentication first, behind a reusable provider adapter | Managed sign-in and token issuance now, with provider replacement isolated to one adapter and provider-link migration | Firebase becomes unsuitable, an official Order identity provider appears, or a better OIDC/JWT provider is selected |
| Organization model | Generic `organization_units` with `type`, `parentUnitId`, memberships, and officer assignments | Avoids hardcoding current Order terminology into API/data contracts and supports future structural changes | UI can still label `CHORAGIEW` units for the V1 pilot |
| Design system | Shared typed design tokens with platform-specific adapters | Brand changes stay centralized while web/mobile keep native implementation quality | A mature cross-platform UI system is adopted intentionally |
| Database | PostgreSQL | Relational integrity, constraints, indexes, JSONB where useful, row-level security option | Data model becomes non-relational, unlikely for V1 |
| ORM/migrations | Prisma ORM with committed SQL migrations | Type-safe data access and explicit deployable migrations | Required SQL feature cannot be represented or safely used with Prisma |
| Real time | Socket.IO with Redis adapter and Redis TTL presence keys | Works across multiple API instances and supports heartbeat counters | Silent prayer requires lower-level protocol or external real-time provider |
| Push | Expo Notifications for V1, keeping token model provider-agnostic | Simplifies mobile credentials and can bridge to FCM/APNs paths later | Direct FCM/APNs features become required |
| Testing | Unit/integration/contract tests plus Playwright admin E2E and mobile smoke tests | Covers permission, visibility, and core workflows without overfitting | Pilot uncovers high-risk mobile regressions requiring deeper device automation |
| Observability | Structured JSON logs with request id; metrics/traces behind provider abstraction | Searchable support trail without locking into one vendor | Deployment platform provides a standard stack |

## Long-Term Architecture Principles

- Shared code is allowed only for stable contracts, validation, auth helpers, and UI primitives. Domain services stay backend-owned.
- Brand and styling decisions are shared through tokens; platform components remain free to use native web/mobile primitives.
- Public/private separation is enforced in API modules and service filters before data reaches clients.
- Database constraints protect invariants that must never depend on UI behavior.
- Background jobs are idempotent and retry-safe.
- Provider-specific code lives behind adapters for push, email, storage, logging, and metrics.
- Each phase leaves the system runnable with migrations, seeds, and tests updated together.
