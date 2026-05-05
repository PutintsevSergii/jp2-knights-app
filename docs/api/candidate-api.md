# Candidate API

| Method | Path                                  | Auth | Role      | Request                           | Response                                                         | Errors            | Visibility                         | Acceptance                  |
| ------ | ------------------------------------- | ---- | --------- | --------------------------------- | ---------------------------------------------------------------- | ----------------- | ---------------------------------- | --------------------------- |
| GET    | `/candidate/dashboard`                | Yes  | Candidate | none                              | next step, contact, events, announcements                        | 401,403           | candidate/public filtered          | No brother content          |
| GET    | `/candidate/roadmap`                  | Yes  | Candidate | none                              | assigned roadmap stages/steps/submissions                        | 404 if none       | own assignment                     | Candidate sees guided path  |
| GET    | `/candidate/events`                   | Yes  | Candidate | filters/pagination                | visible event list                                               | 400               | public/family/candidate/own scoped | Brother-only hidden         |
| POST   | `/candidate/events/:id/participation` | Yes  | Candidate | `intentStatus=planning_to_attend` | participation record                                             | 404,409           | visible candidate event only       | Intent only, not attendance |
| DELETE | `/candidate/events/:id/participation` | Yes  | Candidate | none                              | cancelled participation                                          | 404               | own visible event only             | Cancels own intent only     |
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
