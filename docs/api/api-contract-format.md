# API Contract Format

Every endpoint document must use this contract shape before implementation starts. Short endpoint tables are acceptable only as summaries; the detailed contract below is canonical for coding.

## Endpoint Template

| Field | Required content |
| --- | --- |
| Method and path | HTTP method, route, path params |
| Purpose | User/business outcome, not only CRUD wording |
| Auth policy | public, authenticated, role, active status, scope |
| Visibility policy | allowed visibility values, target chorągiew rule, hidden-field behavior |
| Request schema | body/query/path schema with required fields, limits, enum values |
| Response schema | success shape, nullable fields, redacted/private fields |
| Errors | expected error codes and when 404 is used instead of 403 |
| Audit | whether action is logged and which sensitive fields are redacted |
| Idempotency | required/optional key for retryable create/update |
| Rate limit | public and authenticated throttling category |
| Tests | permission, visibility, validation, state transition, audit tests |

## Contract Hardening Rules

- Summary endpoint tables are planning aids. Before implementation, each touched endpoint must have an OpenAPI/Zod contract that covers every template field above.
- Route names in endpoint docs are canonical for screens, traceability, tests, generated clients, and demo fixtures. If a screen prefers a shorter label, keep the URL canonical and change only the display text.
- Public and authenticated user-facing DTOs use camelCase field names. Database tables and columns remain snake_case.
- Public enum strings use the casing documented in `/docs/data/database-design.md`; generated clients must expose those exact strings.
- List responses must document pagination style, sort order, filters, and hidden-field behavior.
- Mutation contracts must document whether the request is idempotent and which state transitions are legal.
- Admin mutation contracts must document audit behavior, including redacted fields.

## DTO Rules

- Schemas are defined once in shared validation/types libraries.
- API runtime validation uses the same schema semantics as generated TypeScript types.
- DTOs must not expose database internals such as raw audit summaries, token hashes, storage keys, or private notes.
- Date/time values are ISO 8601 strings in UTC unless a local display timezone is explicitly documented.
- Enum values are stable public contract strings. Renaming an enum value is a breaking change.
- Response additions are backward-compatible only when fields are optional or nullable.

## Pagination and Filtering

- Public/user-facing lists default to cursor pagination ordered by a stable tuple such as `(published_at desc, id desc)` or `(start_at asc, id asc)`.
- Small admin lists may use `page`, `pageSize`, `sort`, and documented filters.
- `pageSize` has a default of 20 and maximum of 100 unless the endpoint documents a smaller maximum.
- Search fields must be explicit. Do not search private notes or sensitive message bodies from public endpoints.

## Rate Limiting

| Category | Applies to | Requirement |
| --- | --- | --- |
| Public read | Public content reads | Conservative IP/device throttling without blocking normal browsing |
| Public write | Candidate request and anonymous silent prayer join | Stronger throttling, bot protection hook, idempotency where applicable |
| Authenticated read | Candidate/brother/admin reads | Per-user throttling and abuse logging |
| Authenticated write | Admin mutations, submissions, device tokens | Per-user throttling, audit where critical |

Exact numeric limits are deployment configuration, but the categories must exist before pilot.
