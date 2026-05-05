# Brother API

| Method | Path                                         | Auth | Role    | Request                            | Response                                                                      | Errors      | Acceptance                                              |
| ------ | -------------------------------------------- | ---- | ------- | ---------------------------------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| GET    | `/brother/today`                             | Yes  | Brother | none                               | profile summary, action cards, next visible events, active organization units | 401,403,404 | Personalized dashboard; no candidate/admin-only content |
| GET    | `/brother/profile`                           | Yes  | Brother | none                               | own profile, roles, active membership summaries                               | 401,403,404 | Critical data read-only                                 |
| GET    | `/brother/my-organization-units`             | Yes  | Brother | none                               | active organization unit summaries                                            | 404         | Own scope only                                          |
| GET    | `/brother/events`                            | Yes  | Brother | filters/pagination                 | visible events                                                                | 400         | Visibility enforced                                     |
| POST   | `/brother/events/:id/participation`          | Yes  | Brother | `intentStatus=planning_to_attend`  | participation record                                                          | 404,409     | Event must be visible                                   |
| DELETE | `/brother/events/:id/participation`          | Yes  | Brother | none                               | cancelled participation                                                       | 404         | Cancels own intent only                                 |
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
- Missing active brother membership resolves as `404`; non-brother access
  resolves as `403`.
