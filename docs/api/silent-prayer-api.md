# Silent Prayer API

## REST Endpoints

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/public/silent-prayer-events` | No | Guest | List public sessions |
| POST | `/public/silent-prayer-events/:id/join` | No | Guest | Prepare anonymous join |
| GET | `/brother/silent-prayer-events` | Yes | Brother | List brother sessions |
| POST | `/brother/silent-prayer-events/:id/join` | Yes | Brother | Prepare authenticated join |
| GET/POST/PATCH | `/admin/silent-prayer-events` | Yes | Admin | Manage sessions |

## Socket Events

| Event | Direction | Payload | Result |
| --- | --- | --- | --- |
| `silent_prayer.join` | client -> server | event id, join token/session | validates and joins room |
| `silent_prayer.heartbeat` | client -> server | event id | refreshes presence TTL |
| `silent_prayer.leave` | client -> server | event id | removes presence |
| `silent_prayer.count` | server -> client | event id, aggregate count | updates counter |

## Rules

- Public anonymous participants are counted by anonymous session key.
- Authenticated participants are counted once per user.
- No participant list is exposed in V1.

