# Brother API

| Method | Path | Auth | Role | Request | Response | Errors | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/brother/today` | Yes | Brother | none | degree, next step, prayer, next event, announcement, silent prayer | 401,403 | Personalized dashboard |
| GET | `/brother/profile` | Yes | Brother | none | own profile/membership | 403,404 | Critical data read-only |
| GET | `/brother/my-choragiew` | Yes | Brother | none | chorągiew info, officer, upcoming events, announcements | 404 | Own scope only |
| GET | `/brother/events` | Yes | Brother | filters/pagination | visible events | 400 | Visibility enforced |
| POST | `/brother/events/:id/participation` | Yes | Brother | `intentStatus=planning_to_attend` | participation record | 404,409 | Event must be visible |
| DELETE | `/brother/events/:id/participation` | Yes | Brother | none | cancelled participation | 404 | Cancels own intent only |
| GET | `/brother/announcements` | Yes | Brother | pagination | announcements | 400 | Relevant only |
| GET | `/brother/prayers` | Yes | Brother | filters/pagination | prayers | 400 | Public/brother/own chorągiew |
| GET | `/brother/roadmap` | Yes | Brother | none | roadmap assignment | 404 | Own formation only |
| POST | `/brother/roadmap/steps/:stepId/submissions` | Yes | Brother | body, optional attachment metadata | submission | 400,409 | Pending review created |
| GET | `/brother/silent-prayer-events` | Yes | Brother | activeOnly? | sessions | 400 | Relevant only |
| POST | `/brother/silent-prayer-events/:id/join` | Yes | Brother | none | room info, counter | 404,422 | Counts once per user |

