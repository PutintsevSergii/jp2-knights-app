# Technology Stack

This stack is selected for long-term maintainability, typed contracts, strong privacy boundaries, and straightforward phased delivery. See [technical-decisions.md](technical-decisions.md) for architectural rationale and revisit triggers.

## Workspace

| Concern | Decision |
| --- | --- |
| Language | TypeScript strict mode |
| Package manager | pnpm workspaces |
| Monorepo | Nx integrated workspace |
| Shared contracts | `libs/shared/types` and `libs/shared/validation` |
| Shared design system | `libs/shared/design-tokens` for tokens, plus platform-specific `ui/mobile` and `ui/admin` components |
| Demo fixtures | Dedicated fixture package or app-local fixture modules that conform to shared DTO schemas |
| Task orchestration | Nx targets for build, lint, typecheck, test, e2e, affected |
| Formatting/linting | Prettier plus ESLint, enforced in CI |

## Mobile

| Concern | Decision |
| --- | --- |
| Framework | Expo-managed React Native with development builds |
| Navigation | React Navigation with public/authenticated stacks |
| Styling | Typed theme object generated/adapted from shared design tokens |
| State | TanStack Query for server state; lightweight local store for mode/session/UI state |
| Auth | Firebase client SDK obtains ID tokens; app sends them to API through the provider-agnostic auth client |
| API client | Generated typed REST client from OpenAPI plus shared DTO types |
| Demo mode | Mock service/fixture adapter behind the same repository interface as the API client |
| Push | Expo Notifications for V1; token storage remains provider-agnostic |
| Offline/cache | TanStack Query persistence for safe reads; local cache only for approved opened prayers and non-sensitive public metadata |
| Localization | i18n library with language-ready UI strings and content language field |
| Testing | Unit tests for utilities and mobile smoke tests for public/candidate/brother core journeys |

## Admin

| Concern | Decision |
| --- | --- |
| Framework | Next.js with App Router |
| UI structure | Route groups by domain, shared admin layout, table/detail/editor patterns |
| Styling | CSS variables/Tailwind theme generated/adapted from shared design tokens |
| Forms | React Hook Form with Zod schemas from shared validation |
| Boundaries | Server components for protected data fetch where practical; client components for forms |
| Auth | Firebase sign-in with backend-verified ID token or secure API session cookie; Admin access still guarded by backend role checks |
| API integration | Generated typed REST client; no direct database access |
| Demo mode | Fixture-backed data provider for local UI work without backend |
| Testing | Component tests for forms and Playwright E2E tests for scoped admin flows |

## Backend

| Concern | Decision |
| --- | --- |
| Framework | NestJS |
| API style | REST for V1 because resources and role boundaries are straightforward |
| Runtime | Node.js active LTS |
| HTTP adapter | NestJS default Express adapter for compatibility; keep adapter-specific code isolated |
| Contract | OpenAPI 3.1 generated in CI and used for typed clients |
| Validation | Shared Zod schemas for runtime validation and TypeScript inference |
| Auth | Provider adapter verifies Firebase ID tokens/session cookies; local inactive-user, role, and scope guards enforce app authorization |
| Authorization | Central RBAC and scope guards |
| Database access | Prisma ORM with explicit, committed migrations |
| Jobs | Nest-compatible worker process for notifications, cleanup, and scheduled maintenance |
| WebSocket | Socket.IO gateway for silent prayer rooms |

## Database and Real-Time

| Concern | Decision |
| --- | --- |
| Database | PostgreSQL |
| Naming | snake_case tables and columns |
| Migrations | Prisma migrations committed to source; deploy-only in staging/production |
| Indexes | Role/scope/status/visibility/date indexes on all main list paths |
| Database security | Service-layer authorization first; PostgreSQL RLS for high-risk tables when transaction claims are implemented safely |
| Redis | Socket.IO adapter, presence keys, heartbeat TTL, lightweight job coordination |
| Storage | No binary uploads in early V1 unless approved; if enabled, use private object storage behind signed, short-lived access URLs |

## Testing Strategy

Required test categories:

- unit tests;
- integration tests;
- API contract tests;
- permission tests;
- visibility tests;
- mobile smoke tests;
- admin E2E tests;
- pilot validation scenarios.

## Version Policy

- Pin major versions in `package.json`; use lockfiles.
- Upgrade dependencies intentionally at phase boundaries, not mid-feature.
- Security patches may be applied immediately if tests pass.
- Generated clients and OpenAPI artifacts must be regenerated in the same change as API DTO changes.
- Avoid framework-specific shortcuts that bypass shared auth, validation, visibility, or audit utilities.
