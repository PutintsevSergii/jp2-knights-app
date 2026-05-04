# Admin Lite Screens

| Screen                     | Route                             | Purpose                         | Primary actions                      | Empty/loading/error | Permission restrictions                  |
| -------------------------- | --------------------------------- | ------------------------------- | ------------------------------------ | ------------------- | ---------------------------------------- |
| Admin Login                | `/admin/login`                    | Admin authentication            | log in                               | auth errors         | Officer/Super Admin only                 |
| Admin Dashboard            | `/admin/dashboard`                | Scoped overview                 | open tasks                           | required states     | Officer sees own scope                   |
| Chorągiew List             | `/admin/organization-units`       | Manage/view units               | create/open/filter                   | empty list          | Super Admin write; officer own view      |
| Chorągiew Detail           | `/admin/organization-units/:id`   | Unit detail                     | edit/archive/assign officer          | not found/forbidden | Scope enforced                           |
| Brother List               | `/admin/brothers`                 | Registry                        | create/filter/open                   | empty               | Officer own chorągiew                    |
| Brother Detail             | `/admin/brothers/:id`             | Brother admin                   | edit status/degree/scope             | validation          | Critical fields audited                  |
| Candidate Request List     | `/admin/candidate-requests`       | Incoming interests              | filter/open                          | empty               | Scoped/unassigned policy                 |
| Candidate Request Detail   | `/admin/candidate-requests/:id`   | Process interest                | status, note, assign, convert/reject | conflict            | Consent visible to admin                 |
| Candidate List             | `/admin/candidates`               | Manage authenticated candidates | filter/open                          | empty               | Scoped                                   |
| Candidate Detail           | `/admin/candidates/:id`           | Candidate management            | edit status/contact/convert          | forbidden           | Scoped                                   |
| Prayer List                | `/admin/prayers`                  | Prayer content                  | create/filter/open                   | empty               | Role policy                              |
| Prayer Editor              | `/admin/prayers/:id`              | Edit prayer                     | save/submit/approve/publish/archive  | validation          | Pastoral/content approval                |
| Event List                 | `/admin/events`                   | Events                          | create/filter/open                   | empty               | Scoped                                   |
| Event Editor               | `/admin/events/:id`               | Edit event                      | save/publish/cancel/archive          | validation          | Visibility explicit                      |
| Announcement List          | `/admin/announcements`            | Messages                        | create/filter/open                   | empty               | Scoped                                   |
| Announcement Editor        | `/admin/announcements/:id`        | Edit message                    | save/publish/archive                 | validation          | Audience-safe                            |
| Roadmap Definition List    | `/admin/roadmap-definitions`      | Roadmap configs                 | create/open                          | empty               | Super Admin/permitted                    |
| Roadmap Definition Editor  | `/admin/roadmap-definitions/:id`  | Edit roadmap                    | stages/steps/status                  | validation          | Requires approved content                |
| Roadmap Request List       | `/admin/roadmap-submissions`      | Review queue                    | filter/open                          | empty               | Scoped                                   |
| Roadmap Request Detail     | `/admin/roadmap-submissions/:id`  | Review submission               | approve/reject/comment               | conflict            | Audited                                  |
| Silent Prayer Event List   | `/admin/silent-prayer-events`     | Prayer sessions                 | create/open                          | empty               | Scoped                                   |
| Silent Prayer Event Editor | `/admin/silent-prayer-events/:id` | Edit session                    | save/publish/cancel                  | validation          | No participant list                      |
| Audit Log                  | `/admin/audit-logs`               | Trace critical actions          | filter/search                        | empty               | Super Admin, limited officer if approved |

## Admin UX Rule

Admin screens should be functional and compact: tables, filters, detail panels, clear forms, and explicit visibility/status controls.

## Implementation Notes

- Phase 4 admin prayer/event workflow foundations are implemented in the admin app as tested API clients and list view models.
- Phase 4 admin prayer/event list renderers produce framework-neutral HTML templates from those models with action metadata for create/edit/publish/cancel/archive workflows.
- Phase 4 admin shell routes now expose `/admin/prayers` and `/admin/events`, resolving API/demo data into rendered documents.
- Phase 6 admin dashboard foundations now expose `/admin/dashboard` route metadata, a typed dashboard API client, demo fixture, scoped navigation, and a framework-neutral rendered dashboard document.
- Phase 6 also includes a dependency-free HTTP web shell that mounts `/admin`, `/admin/dashboard`, `/admin/prayers`, and `/admin/events`. Full Next.js/App Router UI mounting remains a later Phase 6 task if the owner wants that framework specifically.
