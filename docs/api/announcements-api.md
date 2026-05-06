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
  paginated published announcements visible to candidates: `PUBLIC`,
  `FAMILY_OPEN`, `CANDIDATE`, or the candidate's assigned `ORGANIZATION_UNIT`.
- `GET /brother/announcements` requires an active brother profile and returns
  paginated published announcements visible to brothers: `PUBLIC`,
  `FAMILY_OPEN`, `BROTHER`, or the brother's own active organization units.
- Both read endpoints hide archived, unpublished, future-published,
  role-private, and unrelated organization-unit announcements server-side.
- Responses include announcement text, visibility, target scope, pinned state,
  and published timestamp only. They do not expose read receipts, comments,
  participant lists, or push delivery details.
