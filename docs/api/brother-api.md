# Brother API

| Method | Path                                         | Auth | Role    | Request                            | Response                                                                      | Errors      | Acceptance                                              |
| ------ | -------------------------------------------- | ---- | ------- | ---------------------------------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| GET    | `/brother/today`                             | Yes  | Brother | none                               | profile summary, action cards, next visible events, active organization units | 401 invalid token, 403 missing/forbidden/idle, 404 | Personalized dashboard; no candidate/admin-only content |
| GET    | `/brother/profile`                           | Yes  | Brother | none                               | own profile, roles, active membership summaries                               | 401 invalid token, 403 missing/forbidden/idle, 404 | Critical data read-only                                 |
| GET    | `/brother/my-organization-units`             | Yes  | Brother | none                               | active organization unit summaries                                            | 404         | Own scope only                                          |
| GET    | `/brother/events`                            | Yes  | Brother | filters/pagination                 | visible events                                                                | 400         | Visibility enforced                                     |
| GET    | `/brother/events/:id`                        | Yes  | Brother | none                               | event detail with own participation intent                                    | 403,404     | Visible event only; no participant list                 |
| POST   | `/brother/events/:id/participation`          | Yes  | Brother | none                               | participation intent                                                          | 403,404     | Event must be visible; duplicate updates existing       |
| DELETE | `/brother/events/:id/participation`          | Yes  | Brother | none                               | cancelled participation                                                       | 403,404     | Cancels own intent only                                 |
| GET    | `/brother/announcements`                     | Yes  | Brother | pagination                         | announcements                                                                 | 400         | Relevant only                                           |
| GET    | `/brother/prayers`                           | Yes  | Brother | filters/pagination                 | prayers                                                                       | 400         | Public/brother/own organization units                   |
| GET    | `/brother/roadmap`                           | Yes  | Brother | none                               | roadmap assignment                                                            | 404         | Own formation only                                      |
| POST   | `/brother/roadmap/steps/:stepId/submissions` | Yes  | Brother | body, optional attachment metadata | submission                                                                    | 400,409     | Pending review created                                  |
| GET    | `/brother/silent-prayer-events`              | Yes  | Brother | activeOnly?                        | sessions                                                                      | 400         | Relevant only                                           |
| POST   | `/brother/silent-prayer-events/:id/join`     | Yes  | Brother | none                               | room info, counter                                                            | 404,422     | Counts once per user                                    |

## Implemented Phase 8 Brother Companion Core

- `GET /brother/profile` requires an active authenticated brother and returns only
  the current user's profile and active memberships. It does not expose brother
  lists or editable critical fields.
- `GET /brother/today` requires the same active brother profile, returns daily
  action cards, active organization-unit summaries, and upcoming events filtered
  to `PUBLIC`, `FAMILY_OPEN`, `BROTHER`, or the brother's own organization units.
- `GET /brother/events` requires the same active brother profile, supports
  `from`, `type`, `limit`, and `offset`, and returns only currently published
  non-cancelled events visible to brothers: `PUBLIC`, `FAMILY_OPEN`, `BROTHER`,
  or the brother's own organization units. Cancelled, archived,
  future-published, candidate/officer/admin-only, and unrelated
  organization-unit events are hidden.
- `GET /brother/prayers` requires the same active brother profile, supports
  `categoryId`, `q`, `language`, `limit`, and `offset`, and returns only
  currently published `PUBLIC`, `FAMILY_OPEN`, `BROTHER`, or own
  organization-unit prayers. `CANDIDATE`, `OFFICER`, `ADMIN`, unpublished,
  archived, future-published, and unrelated organization-unit prayers are hidden.
- Missing active brother membership resolves as `404`; non-brother access
  resolves as `403`.

## Implemented Phase 9 Event Participation

- `GET /brother/events/:id` requires the same active brother profile and returns
  a visible event detail with description plus only the current user's own active
  participation intent. It does not expose participant lists or other user ids.
- Brother participation mutations require an active brother profile with at least
  one active organization-unit membership.
- Creation verifies the event is currently published, non-cancelled,
  non-archived, open, and visible to the brother before writing.
- Duplicate active participation intent returns the existing planning intent.
- Cancellation touches only the current brother user's active intent and never
  exposes participant lists.
