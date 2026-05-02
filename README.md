# JP2 App

This workspace contains the JP2 App product and technical documentation package plus the
Phase 1 monorepo baseline.

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

Phase 1 is in place with a pnpm/Nx TypeScript workspace, shared contract libraries,
local infrastructure config, and quality-gate commands. Phase 2 is in place with
shared role/scope/visibility helpers, mobile-mode resolution, published-content
filtering, production rejection of demo runtime mode, matrix tests for officer
scoping and private visibility, and a Prisma identity/organization/audit
baseline. The API includes Phase 2 foundation routes for `/api/health`,
`/api/auth/me`, `/api/brother/my-organization-units`, and
`/api/admin/organization-units`, plus the first Phase 3 public discovery route
at `/api/public/home`. Implemented routes have request/response schemas, shared
Zod validation where applicable, and session abstractions ready for later real
auth. The mobile app has an Expo entry point and a React Native `PublicHome`
screen backed by the shared public-home DTO shape; it visibly marks demo mode
and covers ready/empty/loading/error/offline and forbidden states through a
token-backed screen model. Admin Lite remains a launchable TypeScript
placeholder; Next.js scaffolding comes next inside the same app folder.

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
```

## Database Commands

```sh
pnpm prisma:validate
pnpm prisma:generate
pnpm db:migrate:check
pnpm db:seed
```

The current Prisma baseline covers the Phase 2 identity and organization
foundation: users, roles, generic organization units, memberships, officer assignments, and audit
logs. Local seed data includes a super admin, a scoped officer, and two organization units
for scope checks. Run PostgreSQL through Docker Compose before applying migrations
or seeds.

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
