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

Phase 1 has started with a pnpm/Nx TypeScript workspace, placeholder app shells,
shared contract libraries, local infrastructure config, and quality-gate commands.
The API, Admin Lite, and mobile apps are launchable placeholders; NestJS, Next.js,
and Expo scaffolding come next inside the same app folders.

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

`APP_RUNTIME_MODE` supports `api`, `demo`, and `test`. Production builds must reject
`demo` mode once real app builds are added.

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
