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

