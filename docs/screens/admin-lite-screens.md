# Admin Lite Screens

| Screen | Route | Purpose | Primary actions | Empty/loading/error | Permission restrictions |
| --- | --- | --- | --- | --- | --- |
| Admin Login | `/admin/login` | Admin authentication | log in | auth errors | Officer/Super Admin only |
| Admin Dashboard | `/admin` | Scoped overview | open tasks | required states | Officer sees own scope |
| Chorągiew List | `/admin/choragiew` | Manage/view units | create/open/filter | empty list | Super Admin write; officer own view |
| Chorągiew Detail | `/admin/choragiew/:id` | Unit detail | edit/archive/assign officer | not found/forbidden | Scope enforced |
| Brother List | `/admin/brothers` | Registry | create/filter/open | empty | Officer own chorągiew |
| Brother Detail | `/admin/brothers/:id` | Brother admin | edit status/degree/scope | validation | Critical fields audited |
| Candidate Request List | `/admin/candidate-requests` | Incoming interests | filter/open | empty | Scoped/unassigned policy |
| Candidate Request Detail | `/admin/candidate-requests/:id` | Process interest | status, note, assign, convert/reject | conflict | Consent visible to admin |
| Candidate List | `/admin/candidates` | Manage authenticated candidates | filter/open | empty | Scoped |
| Candidate Detail | `/admin/candidates/:id` | Candidate management | edit status/contact/convert | forbidden | Scoped |
| Prayer List | `/admin/prayers` | Prayer content | create/filter/open | empty | Role policy |
| Prayer Editor | `/admin/prayers/:id` | Edit prayer | save/submit/approve/publish/archive | validation | Pastoral/content approval |
| Event List | `/admin/events` | Events | create/filter/open | empty | Scoped |
| Event Editor | `/admin/events/:id` | Edit event | save/publish/cancel/archive | validation | Visibility explicit |
| Announcement List | `/admin/announcements` | Messages | create/filter/open | empty | Scoped |
| Announcement Editor | `/admin/announcements/:id` | Edit message | save/publish/archive | validation | Audience-safe |
| Roadmap Definition List | `/admin/roadmap-definitions` | Roadmap configs | create/open | empty | Super Admin/permitted |
| Roadmap Definition Editor | `/admin/roadmap-definitions/:id` | Edit roadmap | stages/steps/status | validation | Requires approved content |
| Roadmap Request List | `/admin/roadmap-submissions` | Review queue | filter/open | empty | Scoped |
| Roadmap Request Detail | `/admin/roadmap-submissions/:id` | Review submission | approve/reject/comment | conflict | Audited |
| Silent Prayer Event List | `/admin/silent-prayer-events` | Prayer sessions | create/open | empty | Scoped |
| Silent Prayer Event Editor | `/admin/silent-prayer-events/:id` | Edit session | save/publish/cancel | validation | No participant list |
| Audit Log | `/admin/audit-logs` | Trace critical actions | filter/search | empty | Super Admin, limited officer if approved |

## Admin UX Rule

Admin screens should be functional and compact: tables, filters, detail panels, clear forms, and explicit visibility/status controls.

## Implementation Notes

- Phase 4 admin prayer/event workflow foundations are implemented in the admin app as tested API clients and list view models. Rendered Admin Lite pages still need to consume those models.
