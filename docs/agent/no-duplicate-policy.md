# No Duplicate Policy

Duplication in this project is a product risk because roles, visibility, content status, and API contracts are security boundaries.

## Single Sources

| Concern              | Single source                                                           |
| -------------------- | ----------------------------------------------------------------------- |
| Stored roles         | shared role enum generated from canonical schema                        |
| Visibility values    | shared visibility enum and `@jp2/shared-auth` visibility filter utility |
| Content statuses     | shared content status enum/workflow helper                              |
| API error shape      | common error contract and exception/response mapper                     |
| DTO validation       | shared Zod schemas                                                      |
| API client           | generated OpenAPI client                                                |
| Permission checks    | `@jp2/shared-auth` helpers plus backend guards/services                 |
| Date/time formatting | shared UI/domain formatter                                              |
| Design tokens        | shared design-token package and platform adapters                       |
| Component variants   | shared token-backed variant definitions; platform-specific renderers    |
| Audit actions        | shared audit action constants/helper                                    |

## Required Agent Behavior

- Search before creating anything reusable.
- Prefer moving a repeated pattern into a shared library over copying it into a second app.
- Keep shared utilities boring and domain-specific; do not create speculative frameworks.
- If duplication is temporary during a migration, add a cleanup note and keep it inside the same phase scope.
- Duplicated security logic is not acceptable temporary debt.
