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
| GET            | `/admin/candidate-requests/:id/export`     | Super Admin              | none                              | request export             | 403,404     | Legal subject export; export action audited                    |
| POST           | `/admin/candidate-requests/:id/erase`      | Super Admin              | none                              | erasure metadata           | 403,404     | Legal erasure; anonymizes and archives; action audited         |
| POST           | `/admin/candidate-requests/:id/convert`    | Officer/Super Admin      | invitation/account data           | candidate profile          | 403,409     | Does not create brother                                        |
| GET            | `/admin/candidates`                        | Officer/Super Admin      | filters/page                      | candidate profile list     | 403,400     | Officer scope; no brother profiles                             |
| GET/PATCH      | `/admin/candidates/:id`                    | Officer/Super Admin      | status/assignment/responsible officer payload | candidate profile detail   | 403,404,409 | Scoped candidate management                                    |
| GET            | `/admin/candidates/:id/export`             | Super Admin              | none                              | candidate profile export   | 403,404     | Legal subject export; export action audited                    |
| POST           | `/admin/candidates/:id/erase`              | Super Admin              | none                              | erasure metadata           | 403,404,409 | Legal erasure; candidate-only users only; action audited       |
| POST           | `/admin/candidates/:id/convert-to-brother` | Officer/Super Admin      | membership payload                | brother membership summary | 403,404,409 | Creates/activates membership and deactivates candidate access  |
| GET/POST       | `/admin/prayers`                           | Permitted admin          | filters/create payload            | list/detail                | 403,400     | Status/visibility required                                     |
| GET/PATCH      | `/admin/prayers/:id`                       | Permitted admin          | edit/status/visibility payload    | detail                     | 403,404,409 | Visibility changes audited                                     |
| GET/POST       | `/admin/events`                            | Officer/Super Admin      | filters/create payload            | list/detail                | 403,400     | Visibility explicit                                            |
| GET/PATCH      | `/admin/events/:id`                        | Officer/Super Admin      | edit/cancel/archive payload       | detail                     | 403,404,409 | Scope required                                                 |
| GET/POST       | `/admin/announcements`                     | Officer/Super Admin      | filters/create payload            | list/detail                | 403,400     | Push audience-safe                                             |
| GET/PATCH      | `/admin/announcements/:id`                 | Officer/Super Admin      | edit/publish/archive payload      | detail                     | 403,404,409 | Audience changes audited                                       |
| GET            | `/admin/roadmap-definitions`               | Super Admin              | none                              | definition list           | 403         | Read-only inspection                                           |
| GET            | `/admin/roadmap-definitions/:id`           | Super Admin              | none                              | definition detail         | 403,404     | Stages/steps only, no mutation                                 |
| GET/POST       | `/admin/roadmap-assignments`               | Super Admin              | create payload                    | assignment list/detail    | 403,400,409 | Inspect or create from published definitions                   |
| GET            | `/admin/roadmap-assignments/:id`           | Super Admin              | none                              | assignment detail         | 403,404     | Status metadata only, no submitted bodies                      |
| GET            | `/admin/roadmap-submissions`               | Officer/Super Admin      | filters/page                      | scoped review queue        | 403,400     | Officer scope                                                  |
| GET            | `/admin/roadmap-submissions/:id/export`    | Super Admin              | none                              | submission export          | 403,404     | Legal subject export; export action audited                    |
| POST           | `/admin/roadmap-submissions/:id/erase`     | Super Admin              | none                              | erasure metadata           | 403,404     | Legal erasure; anonymizes and archives; action audited         |
| GET/PATCH      | `/admin/roadmap-submissions/:id`           | Officer/Super Admin      | approve/reject/comment            | submission                 | 403,404,409 | Decision audited                                               |
| GET/POST       | `/admin/silent-prayer-events`              | Officer/Super Admin      | session payload                   | list/detail                | 403,400     | Participant lists hidden; audit summaries redact intention     |
| PATCH          | `/admin/silent-prayer-events/:id`          | Officer/Super Admin      | edit/lifecycle payload            | detail                     | 403,404     | Scope required; no participant/session identity                |
| GET            | `/admin/audit-logs`                        | Super Admin              | filters/pagination                | logs + pagination          | 403,400     | Server-side filters; redacted summaries only                    |

## Admin Validation Rules

- Every publishable record requires `status`, `visibility`, and language where applicable.
- `ORGANIZATION_UNIT` visibility requires `target_organization_unit_id`.
- Officer writes must use assigned organization units unless super admin.
- Mutations that create records accept an optional `idempotencyKey`.
- Critical mutations record before/after summaries with sensitive fields redacted.

## Implemented Audit Log Rules

- `GET /admin/audit-logs` requires Super Admin access. Officers and Idle users
  are denied before audit rows load.
- Supported query filters are `limit`, `offset`, `action`, `entityType`,
  `actorUserId`, `entityId`, `scopeOrganizationUnitId`, `createdFrom`, and
  `createdTo`. Date bounds must be chronological.
- Responses include redacted before/after summaries, actor display name, entity,
  scope, request id, timestamp, and pagination metadata with the exact filtered
  total. Raw IP addresses, actor email, nested JSON, and unredacted source
  payloads are not returned.
- Audit summary mapping also strips sensitive primitive summary keys such as
  email, phone, message, officer note, body/body preview, review comment,
  provider subject, token/hash/last-four values, attachment metadata,
  file/storage metadata, URLs, personal/name fields, descriptions, and
  intentions while preserving safe lifecycle metadata such as status flags and
  counts.
- Mounted Admin Lite audit-log web and Next routes preserve only the supported
  audit-log query keys before forwarding requests to the API client.
- The mounted Admin Lite audit-log screen renders the supported query fields as
  a GET filter form and retains active values across ready, empty, and error
  states.
- The action filter renders presets from shared `ADMIN_AUDIT_ACTIONS`, covering
  high-risk export/erasure actions, identity access decisions, roadmap
  approval/rejection, content create/lifecycle changes, announcement
  push-dispatch audits, and silent-prayer lifecycle actions. Custom or legacy
  action query values remain selected and are forwarded exactly to the backend
  `action` filter.
- The same screen renders Previous/Next pagination links from response
  pagination metadata, uses the server total to decide whether a next page
  exists, and preserves active filter parameters in page links.

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
- `GET /admin/candidate-requests/:id/export` is Super Admin-only and returns the candidate request personal-data export, including archived requests, for legal/privacy subject-access handling. The response includes `retentionBucket: "sensitive_review"`. The export action is audited with redacted metadata only; the audit summary does not copy the candidate email, message, phone, or officer note.
- `POST /admin/candidate-requests/:id/erase` is Super Admin-only and performs the candidate request legal-erasure path. It anonymizes name, email, country, and city; clears phone, message, preferred language, officer note, and idempotency key; archives the request instead of deleting it; returns id/erasure/archive metadata plus `retentionBucket: "sensitive_review"`; and writes audit summaries without copying erased values.
- Admin Lite has typed API client helpers for candidate request export and
  erasure response validation. The mounted candidate request screens do not add
  officer-facing erasure controls; the backend remains the Super Admin
  enforcement boundary.
- Officer assignment changes must stay within assigned organization units and cannot clear assignment. Super Admin may assign or clear assignment.
- Candidate request updates record audit log before/after summaries with the full message and email redacted.
- Candidate request conversion records an audit log with redacted request before-summary and candidate profile after-summary.

## Implemented Candidate Profile Rules

- `GET /admin/candidates` and `GET /admin/candidates/:id` require Admin Lite access.
- Super Admin sees all non-archived candidate profiles. Officers see only candidate profiles assigned to one of their officer organization units.
- `PATCH /admin/candidates/:id` updates candidate profile status (`active`, `paused`, or `archived`), assigned organization unit, or responsible officer. It does not currently mutate linked user contact fields such as email/display name; those remain identity data handled by dedicated privacy or future account-management flows.
- `GET /admin/candidates/:id/export` is Super Admin-only and returns the candidate profile personal-data export, including archived profiles, local role lifecycle rows, identity access review history, membership history, officer assignment history, roadmap assignment lifecycle metadata, own event participation intent lifecycle metadata, provider account mirrors, safe device-token lifecycle metadata, and notification preference settings, for legal/privacy subject-access handling. Roadmap assignment export excludes submitted body text and attachment metadata; event participation export excludes attendee/participant lists, counts, and other user ids; device-token export excludes raw tokens, token hashes, and token last-four values. The response includes `retentionBucket: "sensitive_review"`. The export action is audited with redacted metadata only; the audit summary does not copy the candidate email, display name, provider, access-review, membership, officer assignment, roadmap assignment, event participation, token, or preference values.
- `POST /admin/candidates/:id/erase` is Super Admin-only and performs the candidate profile legal-erasure path for candidate-only users. It rejects converted profiles and users with active brother/officer/Super Admin access, anonymizes the linked user identity, revokes candidate-only roles/provider links/device tokens, deletes notification preferences, archives the profile instead of deleting it, returns id/user/erasure/archive metadata plus `retentionBucket: "sensitive_review"`, and writes audit summaries without copying erased email, display name, phone, provider, token, or preference values.
- `POST /admin/candidates/:id/convert-to-brother` is allowed for scoped officers and Super Admins on assigned active/paused candidate profiles. It revokes active `CANDIDATE` roles, creates or reuses an active `BROTHER` role, creates or reactivates the brother membership in the candidate profile's assigned organization unit, marks the candidate profile `converted_to_brother`, and writes a redacted audit summary. The optional payload may set membership `joinedAt` and `currentDegree`; conversion does not auto-award roadmap progress or expose brother roster data.
- Officer assignment changes must stay within assigned organization units. Officers can only assign themselves as responsible officer. Super Admin may update assignment and responsible officer globally.
- Candidate profile updates record audit log before/after summaries with email redacted.

## Implemented Announcement Management Rules

- `GET /admin/announcements`, `POST /admin/announcements`, and `PATCH /admin/announcements/:id` require Admin Lite access.
- Super Admin can list and manage all announcement records.
- Officers can list public/family-open announcements and announcements assigned to their officer organization-unit scope.
- Officer announcement writes must target one of their assigned organization units. Super Admin can create global or scoped announcements.
- `ORGANIZATION_UNIT` visibility requires `targetOrganizationUnitId` in shared create/update DTO validation.
- Publishing and archiving set lifecycle timestamps when status changes to `PUBLISHED` or `ARCHIVED`.
- Announcement mutations record audit log summaries with title, visibility,
  target scope, pinned state, status, lifecycle timestamps, and explicit
  approve/publish/archive action names. Full announcement body text is redacted
  from audit summaries.
- First publication resolves candidate/brother push recipients server-side from
  announcement approval metadata, visibility, active profile/membership scope,
  active non-revoked device tokens, and announcement notification preferences.
  Published-but-unapproved rows do not resolve push recipients. Dispatch uses
  generic copy and deep links by announcement id, then records operational
  attempted/accepted/failed counts without exposing delivery state in Admin
  Lite.
- Admin Lite mounts `/admin/announcements`, `/admin/announcements/new`, and
  `/admin/announcements/:id` through the Next App Router. The list and editor
  surfaces use shared DTO validation, API/demo loading, scoped action metadata,
  and render no chat, comments, read receipts, or push delivery state. Detail
  editor rendering resolves the scoped announcement from the list contract until
  a dedicated admin detail read contract is introduced.

## Implemented Silent Prayer Management Rules

- `GET /admin/silent-prayer-events` requires Admin Lite access. Super Admin sees all sessions; officers see public/family-open sessions plus sessions targeted to their assigned organization units.
- `POST /admin/silent-prayer-events` and `PATCH /admin/silent-prayer-events/:id` require Admin Lite access, explicit visibility/status, valid timing, and scoped officer target organization units.
- Silent-prayer updates that would leave a `PUBLISHED` record without
  `approvedAt` metadata fail before persistence and audit side effects.
- Silent-prayer create/update/approve/publish/archive audit summaries include
  title, visibility, target organization unit, status, timing, lifecycle
  timestamps, and explicit lifecycle action names only. They do not include
  intention text, participant lists, anonymous session ids, user ids, rosters,
  or prayer history.
- `GET /admin/roadmap-definitions` and
  `GET /admin/roadmap-definitions/:id` require Super Admin access and support
  read-only roadmap definition inspection through shared DTO validation and
  mounted Admin Lite list/detail routes. Create, edit, status, and assignment
  mutation workflows remain deferred until owner-confirmed formation wording is
  available; these routes do not auto-award degrees.
- `GET /admin/roadmap-assignments` and
  `GET /admin/roadmap-assignments/:id` require Super Admin access and support
  read-only roadmap assignment inspection through shared DTO validation and
  mounted Admin Lite list/detail routes. Assignment detail exposes submission
  status metadata and counts only, not submitted body text.
- `POST /admin/roadmap-assignments` requires Super Admin access and supports
  assignment creation from already-published roadmap definitions to eligible
  candidate or brother users in matching scope. Admin Lite mounts
  `/admin/roadmap-assignments/new` with fields for `assigneeUserId`,
  `roadmapDefinitionId`, and optional `organizationUnitId`; update/archive
  mutations remain deferred.
- `GET /admin/roadmap-submissions/:id/export` is Super Admin-only and returns
  roadmap submission personal data, including archived submissions, for
  subject-access handling. The response includes
  `retentionBucket: "sensitive_review"`. The export action is audited without
  copying submitted body text, review comments, or submitter email into audit
  logs.
- `POST /admin/roadmap-submissions/:id/erase` is Super Admin-only and performs
  legal erasure for roadmap submission personal data. It clears submitted body
  text, attachment metadata, and review comments, archives instead of deleting,
  returns id/erasure/archive metadata plus
  `retentionBucket: "sensitive_review"`, and audits redacted before/after
  summaries.

## Canonical Admin Route Names

- Roadmap configuration routes use `/admin/roadmap-definitions`; admin UI routes must use the same path.
- Audit routes use `/admin/audit-logs`; `/admin/audit` is not a canonical V1 route.
- Candidate request conversion creates an authenticated candidate profile only. Candidate-to-brother conversion is a separate audited operation on `/admin/candidates/:id/convert-to-brother`.
