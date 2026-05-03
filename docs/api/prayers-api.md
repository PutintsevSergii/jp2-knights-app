# Prayers API

## Endpoints

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/public/prayers` | No | Guest | Public prayer list |
| GET | `/public/prayers/:id` | No | Guest | Public prayer detail |
| GET | `/brother/prayers` | Yes | Brother | Brother-visible prayer list |
| GET | `/admin/prayers` | Yes | Admin | Manage prayer list |
| POST | `/admin/prayers` | Yes | Admin | Create prayer |
| PATCH | `/admin/prayers/:id` | Yes | Admin | Edit/status/visibility |

## Validation

- `title`, `body`, `language`, `visibility`, and `status` are required.
- `categoryId` must exist.
- `CHORAGIEW` visibility requires target chorągiew.
- Production publishing requires pastoral/content approval.

## Implemented Public Read Rules

- `GET /public/prayers` supports `categoryId`, `q`, `language`, `limit`, and `offset`.
- Public prayer reads return only currently published `PUBLIC` prayers.
- Private, archived, draft, review, approved-but-unpublished, and future-published prayers are hidden from guests.
- `GET /public/prayers/:id` returns 404 for any prayer that is missing or not publicly visible.
