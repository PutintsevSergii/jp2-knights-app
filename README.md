# JP2 App

This workspace contains the JP2 App product and technical documentation package plus the
current Nx/pnpm monorepo implementation.

## Quick Mobile Launch

To see the current mobile app without running the API:

```sh
pnpm dev:mobile:expo -- --offline --port 8090
```

Then open the printed `exp://...:8090` URL in Expo Go on your phone, or scan
the QR code shown by Expo. The current screen is `PublicHome`.

If port `8090` is busy, change it to another free port:

```sh
pnpm dev:mobile:expo -- --offline --port 8091
```

Mobile runtime mode is configured in code: local development defaults to `demo`,
production builds default to `api`.

Start here:

- [Documentation map](docs/README.md)
- [V1 scope](docs/product/v1-scope.md)
- [Technical decisions](docs/architecture/technical-decisions.md)
- [App runtime modes](docs/architecture/app-runtime-modes.md)
- [Design system and theming](docs/architecture/design-system-and-theming.md)
- [Implementation roadmap](docs/delivery/implementation-roadmap.md)
- [Traceability matrix](docs/traceability.md)
- [Support and maintenance](docs/delivery/support-and-maintenance.md)
- [Agent operating contract](AGENTS.md)

## Current Implementation Status

Phases 0-5 are complete and Phase 6 is in progress. The API includes
public discovery/content routes, public prayer/event routes, auth session
routes, organization-unit routes, admin prayer/event routes with audit side
effects, and the Phase 6 `/api/admin/dashboard` scoped count/task contract.
Implemented routes have request/response schemas and shared Zod validation
where applicable.

The mobile app has an Expo entry point and React Native public screens backed by
shared DTO validation, with API and demo runtime modes. Admin Lite is currently
a launchable TypeScript web shell with framework-neutral rendered routes for the
dashboard, prayers, and events. The shell can serve these routes over HTTP now;
Next.js/App Router mounting remains the documented target if the owner wants
that framework specifically.

## Prerequisites

- Node.js `20.20.0` or newer
- Corepack enabled for pnpm
- Docker for local PostgreSQL and Redis

## Install

```sh
corepack enable
pnpm install
```

## Local Infrastructure

```sh
docker compose -f infra/docker/docker-compose.yml up -d
```

Copy `.env.example` to `.env` when local app configuration is needed.

## Launch Commands

```sh
pnpm dev:api
pnpm dev:admin
pnpm dev:mobile
pnpm dev:admin:demo
pnpm dev:mobile:demo
pnpm dev:mobile:expo
pnpm dev:mobile:expo:demo
```

`APP_RUNTIME_MODE` supports `api`, `demo`, and `test`. API, admin, and mobile
shell helpers reject `APP_RUNTIME_MODE=demo` when `NODE_ENV=production`. The
Expo commands start the interactive mobile development server; the plain
`dev:mobile` commands remain fast smoke checks for CI/local validation.

The API health endpoint is available at:

```text
GET /api/health
GET /api/public/home
GET /api/admin/dashboard
```

## Database Commands

```sh
pnpm prisma:validate
pnpm prisma:generate
pnpm db:migrate:check
pnpm db:seed
```

The current Prisma schema covers the Phase 2 identity and organization
foundation, Phase 3 content pages, Phase 4 prayers/events, and Phase 5
identity-provider account links. Local seed data includes a super admin, a
scoped officer, public/private content fixtures, and provider account links for
auth replacement tests. Run PostgreSQL through Docker Compose before applying
migrations or seeds.

## Quality Gates

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm contract:generate
pnpm contract:check
pnpm db:migrate:check
```

Run all configured gates:

```sh
pnpm quality
```
