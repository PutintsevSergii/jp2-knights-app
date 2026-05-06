# Events API

## Public and Authenticated Reads

| Method | Path                                  | Auth | Role                | Response               | Visibility                         |
| ------ | ------------------------------------- | ---- | ------------------- | ---------------------- | ---------------------------------- |
| GET    | `/public/events`                      | No   | Guest               | public/family list     | `PUBLIC`, `FAMILY_OPEN`            |
| GET    | `/candidate/events`                   | Yes  | Candidate           | candidate-visible list | public/family/candidate/own scoped |
| GET    | `/candidate/events/:id`               | Yes  | Candidate           | candidate event detail | public/family/candidate/own scoped |
| POST   | `/candidate/events/:id/participation` | Yes  | Candidate           | participation intent   | visible candidate event only       |
| DELETE | `/candidate/events/:id/participation` | Yes  | Candidate           | cancelled intent       | own intent only                    |
| GET    | `/brother/events`                     | Yes  | Brother             | brother-visible list   | public/family/brother/own scoped   |
| GET    | `/brother/events/:id`                 | Yes  | Brother             | brother event detail   | public/family/brother/own scoped   |
| POST   | `/brother/events/:id/participation`   | Yes  | Brother             | participation intent   | visible brother event only         |
| DELETE | `/brother/events/:id/participation`   | Yes  | Brother             | cancelled intent       | own intent only                    |
| GET    | `/admin/events`                       | Yes  | Officer/Super Admin | scoped admin list      | officer scope/all                  |

## Event Entity Contract

Fields: `id`, `title`, `description`, `type`, `startAt`, `endAt`, `locationLabel`, `visibility`, `targetOrganizationUnitId`, `status`, `publishedAt`, `cancelledAt`, `archivedAt`.

## Business Rules

- Event location must not expose private addresses by default.
- Participation intent is not attendance tracking.
- Candidate participation is allowed only for events visible through candidate endpoints. Candidates cannot act on brother-only or brother chorągiew-private events.
- Cancelled events remain visible to users who could previously see them when useful, marked cancelled.

## Implemented Public Read Rules

- `GET /public/events` supports `from`, `type`, `limit`, and `offset`.
- Public event list reads default to upcoming events and return only currently published `PUBLIC` or `FAMILY_OPEN` events.
- Private, archived, draft, cancelled, future-published, and brother/candidate/scoped events are hidden from guests.
- `GET /public/events/:id` returns 404 for any event that is missing or not publicly visible.

## Implemented Authenticated Participation Rules

- `GET /candidate/events` supports `from`, `type`, `limit`, and `offset`
  filters, requires an active candidate profile, and returns currently
  published, non-cancelled, non-archived candidate-visible events only.
- `GET /candidate/events/:id` returns candidate-visible event detail with
  description and only the current user's own active participation intent. It
  never returns participant lists or other user ids.
- `GET /brother/events/:id` returns brother-visible event detail with
  description and only the current user's own active participation intent. It
  never returns participant lists or other user ids.
- `POST /candidate/events/:id/participation` and
  `POST /brother/events/:id/participation` require an active candidate profile or
  active brother membership before any write.
- Participation creation is allowed only for currently published, non-cancelled,
  non-archived, open events visible to that user: candidate events may be
  `PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, or assigned `ORGANIZATION_UNIT`;
  brother events may be `PUBLIC`, `FAMILY_OPEN`, `BROTHER`, or own
  `ORGANIZATION_UNIT`.
- Duplicate active participation intent returns the existing planning intent
  instead of creating another active row.
- `DELETE /candidate/events/:id/participation` and
  `DELETE /brother/events/:id/participation` cancel only the current user's
  active intent. The response does not expose participant lists.

## Implemented Admin Rules

- `GET /admin/events` requires Admin Lite access.
- Super Admin sees and writes all event records.
- Officers see public/family-open events and events scoped to assigned organization units.
- Officer create/update writes must stay within assigned organization units.
- Admin create/update/publish/cancel/archive mutations append audit log entries with actor, entity, scope, and redacted before/after summaries. Full event descriptions are not copied into audit summaries.
