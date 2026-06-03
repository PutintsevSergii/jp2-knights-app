# Silent Prayer API

## REST Endpoints

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/public/silent-prayer-events` | No | Guest | List active public/family-open sessions with aggregate counters only |
| POST | `/public/silent-prayer-events/:id/join` | No | Guest | Join an active public/family-open session using an anonymous session id |
| GET | `/brother/silent-prayer-events` | Yes | Brother | List active public/family/brother/own-organization-unit sessions with aggregate counters only |
| POST | `/brother/silent-prayer-events/:id/join` | Yes | Brother | Join an active brother-visible session; counts once per authenticated user |
| GET/POST | `/admin/silent-prayer-events` | Yes | Officer/Super Admin | List/create silent-prayer sessions within admin scope |
| PATCH | `/admin/silent-prayer-events/:id` | Yes | Officer/Super Admin | Update lifecycle, visibility, and timing metadata within admin scope |

Planned Firebase RTDB migration endpoints:

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/public/silent-prayer-events/:id/heartbeat` | No | Guest | Refresh API-owned public presence for an anonymous session id |
| POST | `/public/silent-prayer-events/:id/leave` | No | Guest | Remove API-owned public presence for an anonymous session id |
| POST | `/brother/silent-prayer-events/:id/heartbeat` | Yes | Brother | Refresh API-owned brother presence after server-side scope validation |
| POST | `/brother/silent-prayer-events/:id/leave` | Yes | Brother | Remove API-owned brother presence and private RTDB read grant |

## Socket Events

| Event | Direction | Payload | Result |
| --- | --- | --- | --- |
| `silent-prayer:public:join` | client -> server | event id, anonymous session id | validates public visibility and joins room |
| `silent-prayer:brother:join` | client -> server | event id, auth session token | validates brother visibility/scope and joins room |
| `silent-prayer:heartbeat` | client -> server | event id | refreshes presence TTL |
| `silent-prayer:leave` | client -> server | event id | removes presence |
| `silent-prayer:joined` | server -> client | event id, aggregate count, expiry, socket room | confirms current participant join |
| `silent-prayer:presence` | server -> client | event id, aggregate count, expiry, socket room | updates counter |
| `silent-prayer:error` | server -> client | code, message | reports validation/auth/not-found errors without identity details |

## Rules

- Public anonymous participants are counted by anonymous session key.
- Authenticated participants are counted once per user.
- No participant list is exposed in V1.
- REST join/list endpoints validate status, publish time, active window, cancellation/archive state, and server-side visibility before touching presence.
- REST responses return `activeCount`, `expiresAt`, and a socket room name only. They do not return anonymous session ids, user ids, rosters, participant lists, or prayer history.
- Socket.IO gateway and Redis adapter wiring are enabled in Phase 11; production requires `REDIS_URL`, while local/test environments may use the deterministic in-memory store.
- Mobile public and brother silent-prayer screens join through REST first, then connect to the `/silent-prayer` Socket.IO namespace to replay the matching socket join, send heartbeat events, receive aggregate presence updates, and emit leave when the user exits the route.
- The planned RTDB migration keeps REST list/join authorization server-side,
  adds REST heartbeat/leave so mobile clients do not write presence directly,
  and uses RTDB only for aggregate-count listeners.
- RTDB private count reads require API-issued per-user/event grants because
  Firebase rules must not replace Postgres-backed brother membership and
  organization-unit scope checks.
- Admin create/update audit summaries include title, visibility, scope, status, timing, and lifecycle timestamps only. They do not copy intention text or participant/session identity into `audit_logs`.
- Admin Lite mounts `/admin/silent-prayer-events` over the admin list contract with shared DTO validation, demo fixtures, approval-before-publish action metadata, and no participant-list/session-id/user-id/roster actions.
