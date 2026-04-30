# Traceability Matrix

This matrix links product requirements to the expected implementation surface. Update it whenever requirements, APIs, screens, or data tables change.

| Requirement | APIs | Screens | Data | Key tests |
| --- | --- | --- | --- | --- |
| FR-PUBLIC-001 Public Home | `GET /public/home` | `PublicHome` | prayers, events, content pages | public no-auth, no private content, empty state |
| FR-PUBLIC-002 About the Order | public content endpoint or `/public/home` section | `AboutOrder` | content pages | approved content only, fallback state |
| FR-PRAYER-001 Public Prayer Library | `GET /public/prayers`, `GET /public/prayers/:id` | public prayer category/list/detail | prayer_categories, prayers | published public only, private id returns 404 |
| FR-EVENT-001 Public Events | `GET /public/events`, `GET /public/events/:id` | public event list/detail | events | public/family only, date filters |
| FR-PRAYER-002 Public Silent Prayer | `GET/POST /public/silent-prayer-events` | public silent prayer | silent_prayer_events, silent_prayer_participation, Redis presence | anonymous aggregate only, duplicate join |
| FR-CANDIDATE-REQ-001 Join Interest Request | `POST /public/candidate-requests` | join request form | candidate_requests | consent required, validation, idempotency, rate limit |
| FR-ADMIN-001 Candidate Request Management | `GET /admin/candidate-requests`, `GET/PATCH /admin/candidate-requests/:id`, `POST /admin/candidate-requests/:id/convert` | candidate request list/detail | candidate_requests, audit_logs | officer scope, status transitions, audit |
| FR-ADMIN-008 Candidate Profile Management | `GET /admin/candidates`, `GET/PATCH /admin/candidates/:id`, `POST /admin/candidates/:id/convert-to-brother` | candidate list/detail | candidate_profiles, users, user_roles, memberships, audit_logs | officer scope, conversion audit, no duplicate active membership |
| FR-CANDIDATE-001 Candidate Dashboard | `GET /candidate/dashboard` | candidate dashboard | candidate_profiles, roadmap_assignments, events, announcements | active profile required, no brother content |
| FR-ROADMAP-001 Candidate Roadmap | `GET /candidate/roadmap` | candidate roadmap | roadmap_definitions, assignments | assigned candidate only |
| FR-CANDIDATE-002 Candidate Events | `GET /candidate/events` | candidate events | events | candidate visibility, chorągiew candidate rule |
| FR-CANDIDATE-003 Candidate Announcements | `GET /candidate/announcements` | candidate announcements | announcements | pinned sort, no brother announcements |
| FR-BROTHER-001 Brother Today | `GET /brother/today` | brother today | memberships, prayers, events, announcements, roadmap | personalized filters, empty cards |
| FR-BROTHER-002 Brother Profile | `GET /brother/profile` | brother profile | users, memberships | self only, critical data read-only |
| FR-ORG-001 My Chorągiew | `GET /brother/my-choragiew` | my chorągiew | choragiew, officer_assignments, events | own scope, no brother list |
| FR-PRAYER-003 Brother Prayer Library | `GET /brother/prayers` | brother prayer screens | prayers | brother/own chorągiew filtering |
| FR-EVENT-002 Brother Events | `GET /brother/events` | brother event screens | events | relevant only, cancelled behavior |
| FR-EVENT-003 Event Participation Intent | `POST/DELETE /candidate/events/:id/participation`, `POST/DELETE /brother/events/:id/participation` | event detail | event_participation | visible event only, duplicate update |
| FR-ANN-001 Brother Announcements | `GET /brother/announcements` | announcement list/detail | announcements | no chat/comments, relevant only |
| FR-ROADMAP-002 Formation Roadmap | `GET /brother/roadmap` | formation roadmap | roadmap_* | own roadmap, no auto degree |
| FR-ROADMAP-003 Roadmap Step Submission | `POST /brother/roadmap/steps/:stepId/submissions` | step detail | roadmap_submissions, file_attachments optional | pending duplicate, attachment policy |
| FR-ROADMAP-004 Roadmap Approval | `GET/PATCH /admin/roadmap-submissions/:id` | roadmap request detail | roadmap_submissions, audit_logs | officer scope, rejection comment, audit |
| FR-PRAYER-004 Silent Brother Prayer | brother silent prayer routes and socket events | brother silent prayer | silent_prayer_events, Redis presence | once per user, reconnect |
| FR-NOTIF-001 Notification Preferences | `PUT /auth/notification-preferences`, `POST /auth/device-tokens` | settings | notification_preferences, device_tokens | self only, duplicate token ownership |
| FR-ADMIN-002 Admin Dashboard | `GET /admin/dashboard` | admin dashboard | scoped aggregates | no unrelated scope |
| FR-ADMIN-003 Brother Registry | `/admin/brothers` routes | brother list/detail/editor | users, user_roles, memberships, audit_logs | officer scope, critical audit |
| FR-ORG-002 Chorągiew Management | `/admin/choragiew` routes | chorągiew list/detail | choragiew, officer_assignments | super admin write, archive |
| FR-ADMIN-004 Prayer Management | `/admin/prayers` routes | prayer list/editor | prayers, audit_logs | approval, visibility required |
| FR-ADMIN-005 Event Management | `/admin/events` routes | event list/editor | events, audit_logs | public/private explicit, scope |
| FR-ADMIN-006 Announcement Management | `/admin/announcements` routes | announcement list/editor | announcements, audit_logs | audience-safe push |
| FR-ADMIN-007 Silent Prayer Management | `/admin/silent-prayer-events` routes | silent prayer editor | silent_prayer_events, audit_logs | no participant list |
| FR-AUDIT-001 Audit Logging | mutation side effects, `/admin/audit-logs` | audit log | audit_logs | before/after redaction, access control |
| FR-CONTENT-001 Content Approval | admin content routes | content editors | publishable content tables | unapproved publish blocked |
| FR-PRIV-001 Privacy Controls | all APIs | all screens | all private tables | permission, visibility, leak tests |
