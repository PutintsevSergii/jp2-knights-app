# Prayers API

## Endpoints

| Method | Path                  | Auth | Role    | Purpose                     |
| ------ | --------------------- | ---- | ------- | --------------------------- |
| GET    | `/public/prayers`     | No   | Guest   | Public prayer list          |
| GET    | `/public/prayers/:id` | No   | Guest   | Public prayer detail        |
| GET    | `/brother/prayers`    | Yes  | Brother | Brother-visible prayer list |
| GET    | `/admin/prayers`      | Yes  | Admin   | Manage prayer list          |
| POST   | `/admin/prayers`      | Yes  | Admin   | Create prayer               |
| PATCH  | `/admin/prayers/:id`  | Yes  | Admin   | Edit/status/visibility      |

## Validation

- `title`, `body`, `language`, `visibility`, and `status` are required.
- `categoryId` is optional; when provided it must reference an existing category.
- `ORGANIZATION_UNIT` visibility requires `targetOrganizationUnitId`.
- Production publishing requires pastoral/content approval.

## Implemented Public Read Rules

- `GET /public/prayers` supports `categoryId`, `q`, `language`, `limit`, and `offset`.
- Public prayer reads return only currently published `PUBLIC` prayers.
- Private, archived, draft, review, approved-but-unpublished, and future-published prayers are hidden from guests.
- `GET /public/prayers/:id` returns 404 for any prayer that is missing or not publicly visible.

## Implemented Admin Rules

- `GET /admin/prayers` requires Admin Lite access.
- Super Admin sees all prayer records.
- Officers see public/family-open prayers and prayers scoped to assigned organization units.
- `POST /admin/prayers` and `PATCH /admin/prayers/:id` are guarded and Super Admin-only in the current Phase 4 slice.
- Admin create/update payloads use shared validation; `ORGANIZATION_UNIT` visibility requires `targetOrganizationUnitId`.
- Archiving is represented by `status: "ARCHIVED"` and sets archive metadata instead of hard deletion.
