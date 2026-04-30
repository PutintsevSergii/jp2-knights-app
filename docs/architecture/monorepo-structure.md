# Monorepo Structure

Recommended structure:

```text
apps/
  mobile/
  admin/
  api/

libs/
  shared/types/
  shared/validation/
  shared/auth/
  shared/design-tokens/
  domain/identity/
  domain/organization/
  domain/content/
  domain/events/
  domain/roadmap/
  domain/prayer/
  ui/mobile/
  ui/admin/
```

## Rules

- Shared DTOs and enums live in shared libraries.
- Shared design tokens live in `libs/shared/design-tokens`.
- Apps must not duplicate role, visibility, status, or error enums.
- Apps must not duplicate color, spacing, typography, radius, status, or component-variant constants.
- Domain libraries should expose clear service contracts and avoid UI dependencies.
- Admin and mobile must call API contracts, not database code.
- Platform UI libraries may differ, but they must consume the shared token source.
- Nx affected builds should be used in CI after the workspace exists.

## V1 Apps

| App | Purpose |
| --- | --- |
| `apps/mobile` | React Native public/candidate/brother app |
| `apps/admin` | Next.js Admin Lite |
| `apps/api` | NestJS API, REST endpoints, WebSocket gateway |
