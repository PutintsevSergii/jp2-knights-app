# Events API

## Public and Authenticated Reads

| Method | Path | Auth | Role | Response | Visibility |
| --- | --- | --- | --- | --- | --- |
| GET | `/public/events` | No | Guest | public/family list | `PUBLIC`, `FAMILY_OPEN` |
| GET | `/candidate/events` | Yes | Candidate | candidate-visible list | public/family/candidate/own scoped |
| POST | `/candidate/events/:id/participation` | Yes | Candidate | participation intent | visible candidate event only |
| DELETE | `/candidate/events/:id/participation` | Yes | Candidate | cancelled intent | own intent only |
| GET | `/brother/events` | Yes | Brother | brother-visible list | public/family/brother/own scoped |
| POST | `/brother/events/:id/participation` | Yes | Brother | participation intent | visible brother event only |
| DELETE | `/brother/events/:id/participation` | Yes | Brother | cancelled intent | own intent only |
| GET | `/admin/events` | Yes | Officer/Super Admin | scoped admin list | officer scope/all |

## Event Entity Contract

Fields: `id`, `title`, `description`, `type`, `startAt`, `endAt`, `locationLabel`, `visibility`, `targetChoragiewId`, `status`, `publishedAt`, `cancelledAt`.

## Business Rules

- Event location must not expose private addresses by default.
- Participation intent is not attendance tracking.
- Candidate participation is allowed only for events visible through candidate endpoints. Candidates cannot act on brother-only or brother chorągiew-private events.
- Cancelled events remain visible to users who could previously see them when useful, marked cancelled.
