# Silent Prayer API

## REST Endpoints

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/public/silent-prayer-events` | No | Guest | List active public/family-open sessions with aggregate counters only |
| POST | `/public/silent-prayer-events/:id/join` | No | Guest | Join an active public/family-open session using an anonymous session id |
| GET | `/brother/silent-prayer-events` | Yes | Brother | List active public/family/brother/own-organization-unit sessions with aggregate counters only |
| POST | `/brother/silent-prayer-events/:id/join` | Yes | Brother | Join an active brother-visible session; counts once per authenticated user |
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
- REST join/list endpoints validate status, publish time, active window, cancellation/archive state, and server-side visibility before touching presence.
- REST responses return `activeCount`, `expiresAt`, and a socket room name only. They do not return anonymous session ids, user ids, rosters, participant lists, or prayer history.
- Socket.IO gateway and real Redis adapter wiring remain the next Phase 11 step; the current API module uses the Redis-shaped presence store boundary.
