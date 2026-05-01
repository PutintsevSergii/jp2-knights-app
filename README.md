# JP2 App

This workspace contains the JP2 App product and technical documentation package plus the
Phase 1 monorepo baseline.

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
auth. The mobile placeholder resolves a no-session launch to `PublicHome` using
the same public-home DTO shape and visibly marks demo mode. Admin Lite and mobile
are launchable TypeScript placeholders; Next.js and Expo scaffolding come next
inside the same app folders.

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
```

`APP_RUNTIME_MODE` supports `api`, `demo`, and `test`. API, admin, and mobile shell
helpers reject `APP_RUNTIME_MODE=demo` when `NODE_ENV=production`.

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
