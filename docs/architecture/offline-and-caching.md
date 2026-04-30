# Offline and Caching

## Mobile Behavior

| Area | Offline behavior |
| --- | --- |
| Public home | Show cached safe data if available, otherwise retry state |
| Prayer detail | Cache previously opened prayers only when the record is public or user-authorized and not marked sensitive |
| Events | Show cached public lists with stale marker; cache authenticated event lists only with per-user cache keys and clear them on logout/role change |
| Roadmap | Prefer online for submission state |
| Submissions | Do not silently submit critical roadmap actions offline in V1 |
| Silent prayer | Requires network; show disconnected state |

## Backend Caching

Server-side caching may be used for public published content, but cache keys must include visibility and language. Private content must not be cached in a way that can leak across users. Logout, role changes, officer assignment removal, and visibility changes must invalidate or bypass relevant client/server caches.
