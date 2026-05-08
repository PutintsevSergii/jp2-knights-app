# Candidate API

| Method | Path                                  | Auth | Role      | Request                           | Response                                                         | Errors            | Visibility                         | Acceptance                  |
| ------ | ------------------------------------- | ---- | --------- | --------------------------------- | ---------------------------------------------------------------- | ----------------- | ---------------------------------- | --------------------------- |
| GET    | `/candidate/dashboard`                | Yes  | Candidate | none                              | next step, contact, events, announcements                        | 401 invalid token, 403 missing/forbidden/idle | candidate/public filtered          | No brother content          |
| GET    | `/candidate/roadmap`                  | Yes  | Candidate | none                              | assigned roadmap stages/steps/submissions                        | 404 if none       | own assignment                     | Candidate sees guided path  |
| GET    | `/candidate/events`                   | Yes  | Candidate | filters/pagination                | visible event list with own RSVP intent                          | 400               | public/family/candidate/own scoped | Brother-only hidden; no participant list |
| GET    | `/candidate/events/:id`               | Yes  | Candidate | none                              | event detail with own participation intent                       | 403,404           | public/family/candidate/own scoped | No participant list         |
| POST   | `/candidate/events/:id/participation` | Yes  | Candidate | none                              | participation intent                                             | 403,404           | visible candidate event only       | Intent only, duplicate updates existing |
| DELETE | `/candidate/events/:id/participation` | Yes  | Candidate | none                              | cancelled participation                                          | 403,404           | own intent only                    | Cancels own intent only     |
| GET    | `/candidate/announcements`            | Yes  | Candidate | pagination                        | announcements                                                    | 400               | candidate/public/own scoped        | Private brother hidden      |
| GET    | `/candidate/contact`                  | Yes  | Candidate | none                              | assigned chorągiew and responsible officer public contact fields | 404 if unassigned | own assignment                     | Missing assignment handled  |

## Candidate Restrictions

Candidate endpoints must reject users without an active candidate profile even if they have a login.

`GET /candidate/dashboard` returns the active candidate profile summary, assigned
choragiew/contact fields when present, up to three upcoming candidate-visible
events (`PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, or own `ORGANIZATION_UNIT`), and an
announcements array reserved for Phase 9. It must never return brother-only
events, memberships, degrees, brother profiles, or admin notes.

Candidate roadmap screens are read-only in default V1. A candidate response may include administrative step status or officer-provided notes when scoped to the candidate, but candidate-authored roadmap submissions are out of scope unless explicitly approved and documented.

## Implemented Phase 9 Candidate Announcements

- `GET /candidate/announcements` requires an active candidate profile and
  supports `limit` and `offset` pagination.
- Candidate announcement reads return only currently published, non-archived
  `PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, or assigned `ORGANIZATION_UNIT`
  announcements. Brother-only, officer/admin-only, unpublished,
  future-published, and unrelated organization-unit announcements are hidden
  server-side.
- Pinned announcements sort first, followed by newest published announcements.

## Implemented Phase 9 Candidate Events and Participation

- `GET /candidate/events` requires an active candidate profile and supports
  `from`, `type`, `limit`, and `offset` filters.
- Candidate event reads return only currently published, non-cancelled,
  non-archived `PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, or assigned
  `ORGANIZATION_UNIT` events. Brother-only and unrelated organization-unit
  events are hidden server-side.
- `GET /candidate/events` list items include only the current user's own
  `currentUserParticipation` intent for RSVP list state. They never return
  participant lists or unrelated user ids.
- `GET /candidate/events/:id` returns candidate-visible event detail with
  description and only the current user's own active participation intent. It
  never returns participant lists or unrelated user ids.

- Candidate participation mutations require an active candidate profile.
- Creation verifies the event is currently published, non-cancelled,
  non-archived, open, and visible to the candidate before writing.
- Duplicate active participation intent returns the existing planning intent.
- Cancellation touches only the current candidate user's active intent and never
  exposes participant lists.
