# Announcements API

| Method | Path | Auth | Role | Purpose | Visibility |
| --- | --- | --- | --- | --- | --- |
| GET | `/candidate/announcements` | Yes | Candidate | Candidate announcement list | candidate/public/own scoped |
| GET | `/brother/announcements` | Yes | Brother | Brother announcement list | brother/public/own scoped |
| GET | `/admin/announcements` | Yes | Admin | Admin list | scoped/all |
| POST | `/admin/announcements` | Yes | Admin | Create announcement | scoped/all |
| PATCH | `/admin/announcements/:id` | Yes | Admin | Edit/publish/archive | scoped/all |

## Rules

- Announcements are one-way messages, not chat.
- Pinned announcements sort before normal announcements.
- Push dispatch must use the same audience rules as read visibility.

## Implemented Phase 9 Announcement Reads

- `GET /candidate/announcements` requires an active candidate profile and returns
  paginated approved published announcements visible to candidates: `PUBLIC`,
  `FAMILY_OPEN`, `CANDIDATE`, or the candidate's assigned `ORGANIZATION_UNIT`.
- `GET /brother/announcements` requires an active brother profile and returns
  paginated approved published announcements visible to brothers: `PUBLIC`,
  `FAMILY_OPEN`, `BROTHER`, or the brother's own active organization units.
- Both read endpoints hide archived, unapproved, unpublished, future-published,
  role-private, and unrelated organization-unit announcements server-side.
- Responses include announcement text, visibility, target scope, pinned state,
  and published timestamp only. They do not expose read receipts, comments,
  participant lists, or push delivery details.

## Implemented Admin Rules

- `GET /admin/announcements`, `POST /admin/announcements`, and
  `PATCH /admin/announcements/:id` require Admin Lite access, with officer
  writes scoped to assigned organization units.
- Announcement publish transitions require prior approval. Direct publish
  creates or updates from unapproved records fail before audit or push side
  effects.
- Admin create/update/approve/publish/archive mutations append audit log entries
  with actor, entity, scope, explicit lifecycle action names, and redacted
  before/after summaries. Full announcement bodies are not copied into audit
  summaries.
- First publish resolves audience-safe push recipients server-side only after
  approval metadata exists, then dispatches generic notification copy without
  exposing push delivery state in Admin Lite. Published rows without approval
  metadata do not resolve push recipients.
