# SOLID, Clean Code, and Clean Architecture Rules

These rules are mandatory for new code and refactors. They complement the no-duplicate policy and component boundary contracts.

## Required Rules

- Keep each module focused on one reason to change. Split large shared barrels, screen models, services, and clients before adding unrelated behavior.
- Depend on stable interfaces or adapters at app, persistence, provider, notification, and network boundaries. Feature services may depend on repository or provider abstractions, not concrete infrastructure clients.
- Keep aggregation explicit and shallow. Root modules, route surfaces, and barrels may compose dependencies, but must not own business rules, visibility filters, DTO mapping, persistence queries, network effects, or screen-specific workflows.
- Reuse centralized policy helpers for roles, admin scope, visibility, content status, runtime mode, API errors, and API request plumbing. Do not restate those rules in feature modules.
- Treat security-sensitive duplication as a defect. If a second copy of a role, visibility, status transition, request header, API error parser, DTO schema, or audit summary rule is needed, extract a shared helper first.
- Keep domain/use-case rules independent from transport and persistence details where practical. Controllers validate and delegate; repositories translate already-decided scopes and filters to Prisma.
- Keep OpenAPI, Zod DTOs, API clients, demo fixtures, and screen models in contract parity. If contract generation is not yet fully automated for a surface, add tests or a TODO-linked migration note before expanding the manual surface.
- Prefer small domain-specific helpers over generic frameworks. Extraction should reduce current duplication or protect a known boundary.

## Current Shared Seams

| Concern | Required shared seam |
| --- | --- |
| Stored enums and DTO validation | `@jp2/shared-types`, `@jp2/shared-validation` |
| Runtime mode parsing | `parseRuntimeMode` from `@jp2/shared-validation` |
| Public/private visibility decisions | `@jp2/shared-auth` and backend content visibility helpers |
| Admin Lite access and officer scope | `apps/api/src/admin/admin-access.policy.ts` |
| Admin API HTTP requests | `apps/admin/src/admin-api-client.ts` |
| Mobile API HTTP requests | `apps/mobile/src/mobile-api-client.ts` |
| Design tokens | `@jp2/shared-design-tokens` |

## Review Checklist

- Does the change add a repeated conditional around role, scope, visibility, status, or runtime mode? If yes, extract or reuse a policy helper.
- Does the change add a new `fetch` wrapper, URL normalizer, bearer header builder, or HTTP error parser? If yes, use the app-level API client primitive.
- Does a shared file grow with another unrelated domain? If yes, split it into a focused module and keep the aggregate file as a barrel.
- Does a repository decide who may see or mutate data? If yes, move the decision to a policy/use-case helper and leave Prisma translation in the repository.
- Does a controller or renderer contain business rules? If yes, move the rules into a service, screen model, or shared helper.
