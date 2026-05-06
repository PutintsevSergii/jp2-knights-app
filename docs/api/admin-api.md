# Admin API

Admin endpoints require `OFFICER` or `SUPER_ADMIN`. Officer endpoints are scoped to assigned organization units unless explicitly global and approved.

| Method         | Path                                       | Role                     | Request                           | Response                   | Errors      | Rules                                                          |
| -------------- | ------------------------------------------ | ------------------------ | --------------------------------- | -------------------------- | ----------- | -------------------------------------------------------------- |
| GET            | `/admin/dashboard`                         | Officer/Super Admin      | none                              | scoped counts/tasks        | 403         | No unrelated scope                                             |
| GET            | `/admin/identity-access-reviews`           | Approver/Super Admin     | none                              | scoped review list         | 403         | Pending Firebase sign-ins only within approver scope           |
| GET            | `/admin/identity-access-reviews/:id`       | Approver/Super Admin     | none                              | review detail              | 403,404     | Scoped server-side                                             |
| POST           | `/admin/identity-access-reviews/:id/confirm` | Approver/Super Admin   | role/scope/note                   | review detail              | 400,403,409 | Assigns explicit local role/scope; audited                     |
| POST           | `/admin/identity-access-reviews/:id/reject` | Approver/Super Admin    | note                              | review detail              | 400,403,409 | Keeps user public-only; audited                                |
| POST           | `/admin/identity-access-reviews/expire`    | Super Admin              | none                              | expired count              | 403         | Expires pending reviews past 30 days                           |
| GET/POST       | `/admin/organization-units`                | Super Admin for write    | list/create payload               | list/detail                | 403,400     | Officers read assigned units only                              |
| PATCH          | `/admin/organization-units/:id`            | Super Admin              | edit payload                      | detail                     | 403,404     | Archive not hard delete; detail read remains Phase 6 follow-up |
| GET/POST       | `/admin/brothers`                          | Officer/Super Admin      | create/list                       | records                    | 403,400,409 | Critical changes audited                                       |
| GET/PATCH      | `/admin/brothers/:id`                      | Officer/Super Admin      | updates                           | detail                     | 403,404     | Scope required                                                 |
| GET            | `/admin/candidate-requests`                | Officer/Super Admin      | filters/page                      | request list               | 403,400     | Scoped/unassigned policy                                       |
| GET/PATCH      | `/admin/candidate-requests/:id`            | Officer/Super Admin      | status/assignment/note            | request detail             | 403,404,409 | Pipeline audited                                               |
| POST           | `/admin/candidate-requests/:id/convert`    | Officer/Super Admin      | invitation/account data           | candidate profile          | 403,409     | Does not create brother                                        |
| GET            | `/admin/candidates`                        | Officer/Super Admin      | filters/page                      | candidate profile list     | 403,400     | Officer scope; no brother profiles                             |
| GET/PATCH      | `/admin/candidates/:id`                    | Officer/Super Admin      | status/contact/assignment payload | candidate profile detail   | 403,404,409 | Scoped candidate management                                    |
| POST           | `/admin/candidates/:id/convert-to-brother` | Officer/Super Admin      | membership payload                | brother membership summary | 403,404,409 | Creates/activates membership and deactivates candidate access  |
| GET/POST       | `/admin/prayers`                           | Permitted admin          | filters/create payload            | list/detail                | 403,400     | Status/visibility required                                     |
| GET/PATCH      | `/admin/prayers/:id`                       | Permitted admin          | edit/status/visibility payload    | detail                     | 403,404,409 | Visibility changes audited                                     |
| GET/POST       | `/admin/events`                            | Officer/Super Admin      | filters/create payload            | list/detail                | 403,400     | Visibility explicit                                            |
| GET/PATCH      | `/admin/events/:id`                        | Officer/Super Admin      | edit/cancel/archive payload       | detail                     | 403,404,409 | Scope required                                                 |
| GET/POST       | `/admin/announcements`                     | Officer/Super Admin      | filters/create payload            | list/detail                | 403,400     | Push audience-safe                                             |
| GET/PATCH      | `/admin/announcements/:id`                 | Officer/Super Admin      | edit/publish/archive payload      | detail                     | 403,404,409 | Audience changes audited                                       |
| GET/POST       | `/admin/roadmap-definitions`               | Super Admin or permitted | filters/create payload            | list/detail                | 403,400     | Requires content approval                                      |
| GET/PATCH      | `/admin/roadmap-definitions/:id`           | Super Admin or permitted | edit/status payload               | detail                     | 403,404,409 | No auto degree                                                 |
| GET            | `/admin/roadmap-submissions`               | Officer/Super Admin      | filters/page                      | scoped review queue        | 403,400     | Officer scope                                                  |
| GET/PATCH      | `/admin/roadmap-submissions/:id`           | Officer/Super Admin      | approve/reject/comment            | submission                 | 403,404,409 | Decision audited                                               |
| GET/POST/PATCH | `/admin/silent-prayer-events`              | Officer/Super Admin      | session payload                   | list/detail                | 403,400     | Participant lists hidden                                       |
| GET            | `/admin/audit-logs`                        | Super Admin              | filters/pagination                | logs                       | 403         | Limited officer view only if approved                          |

## Admin Validation Rules

- Every publishable record requires `status`, `visibility`, and language where applicable.
- `ORGANIZATION_UNIT` visibility requires `target_organization_unit_id`.
- Officer writes must use assigned organization units unless super admin.
- Mutations that create records accept an optional `idempotencyKey`.
- Critical mutations record before/after summaries with sensitive fields redacted.

## Implemented Dashboard Rules

- `GET /admin/dashboard` requires Admin Lite access.
- Super Admin receives global active organization-unit counts plus global prayer/event management counts.
- Officers receive active organization-unit counts for assigned units and prayer/event counts using the same server-side scope filters as the admin list endpoints.
- The response contains aggregate counts and task links only; it does not expose member lists, prayer bodies, event descriptions, or cross-unit record details.
- Pending identity access review count is scoped the same way as the review list.

## Implemented Identity Access Review Rules

- First Firebase sign-in creates or links a local identity in public-only Idle state and creates a pending `identity_access_reviews` row that expires after 30 days.
- `GET /admin/identity-access-reviews` requires Admin Lite access. Super Admin sees all reviews; officers see only reviews whose `scopeOrganizationUnitId` is in their officer scope.
- Officer confirmation/rejection also requires an active `identity_access_approver_assignments` row for the target organization unit. Super Admin can confirm or reject globally.
- Confirmation requires explicit `assignedRole` (`CANDIDATE`, `BROTHER`, or `OFFICER`) and `organizationUnitId`; it activates the local user, grants the role, creates or reuses the matching scoped candidate profile, membership, or officer assignment, and marks the review `confirmed`.
- Rejection and expiry keep the user public-only. Decisions record audit log summaries without provider tokens or private profile content.

## Implemented Organization-Unit Rules

- `GET /admin/organization-units` requires Admin Lite access and returns active units scoped server-side: Super Admin sees all active units, officers see assigned active units only.
- `POST /admin/organization-units` and `PATCH /admin/organization-units/:id` require Super Admin.
- Organization-unit archive is represented as status/metadata update, not destructive delete.
- Organization-unit create/update/archive mutations record audit log summaries with actor, entity, and organization-unit scope.

## Implemented Candidate Request Rules

- `GET /admin/candidate-requests` and `GET /admin/candidate-requests/:id` require Admin Lite access.
- Super Admin sees all non-archived candidate requests. Officers see only requests assigned to one of their officer organization units; unassigned requests remain Super Admin-only until assigned.
- `PATCH /admin/candidate-requests/:id` updates status, assigned organization unit, or officer note. Direct `converted_to_candidate` status is not accepted here; conversion uses `POST /admin/candidate-requests/:id/convert`.
- Candidate request status transitions are server-enforced: `new -> contacted/rejected`, `contacted -> invited/rejected`, and `invited -> rejected`. Rejected and converted requests are terminal. Rejection requires an officer note.
- `POST /admin/candidate-requests/:id/convert` is allowed only from `invited`; it creates or reuses the local invited user, grants the `CANDIDATE` role, creates an active `candidate_profiles` row, and marks the request `converted_to_candidate`. It does not create a brother membership.
- Officer assignment changes must stay within assigned organization units and cannot clear assignment. Super Admin may assign or clear assignment.
- Candidate request updates record audit log before/after summaries with the full message and email redacted.
- Candidate request conversion records an audit log with redacted request before-summary and candidate profile after-summary.

## Implemented Candidate Profile Rules

- `GET /admin/candidates` and `GET /admin/candidates/:id` require Admin Lite access.
- Super Admin sees all non-archived candidate profiles. Officers see only candidate profiles assigned to one of their officer organization units.
- `PATCH /admin/candidates/:id` updates candidate profile status (`active`, `paused`, or `archived`), assigned organization unit, or responsible officer.
- Officer assignment changes must stay within assigned organization units. Officers can only assign themselves as responsible officer. Super Admin may update assignment and responsible officer globally.
- Candidate profile updates record audit log before/after summaries with email redacted.
- Candidate-to-brother conversion remains a separate audited operation on `/admin/candidates/:id/convert-to-brother`.

## Canonical Admin Route Names

- Roadmap configuration routes use `/admin/roadmap-definitions`; admin UI routes must use the same path.
- Audit routes use `/admin/audit-logs`; `/admin/audit` is not a canonical V1 route.
- Candidate request conversion creates an authenticated candidate profile only. Candidate-to-brother conversion is a separate audited operation on `/admin/candidates/:id/convert-to-brother`.
