# API Contract Overview

See [api-contract-format.md](api-contract-format.md) for the required endpoint documentation template.

## Groups

The NestJS API currently serves these route groups under the global `/api` prefix
in generated OpenAPI and local runtime URLs. Canonical endpoint tables below omit
that deployment prefix for readability unless they are explicitly describing the
generated contract.

| Group            | Base path                                                             | Auth           | Users                       |
| ---------------- | --------------------------------------------------------------------- | -------------- | --------------------------- |
| Public           | `/public/*`                                                           | No             | Guests and all app users    |
| Auth             | `/auth/*`                                                             | Mixed          | Authenticated account flows |
| Candidate        | `/candidate/*`                                                        | Yes            | Candidate                   |
| Brother          | `/brother/*`                                                          | Yes            | Brother                     |
| Admin            | `/admin/*`                                                            | Yes            | Officer/Super Admin         |
| Domain subgroups | `/events`, `/prayers`, `/announcements`, `/roadmap`, `/silent-prayer` | Mixed by route | Shared resource contracts   |

## Common List Response

Small admin lists may use page pagination:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

High-growth or user-facing lists should use cursor pagination:

```json
{
  "items": [],
  "nextCursor": null,
  "pageSize": 20
}
```

## Shared DTO Profiles

These profiles are the minimum field groups expected before endpoint-specific schemas are generated. They do not replace Zod/OpenAPI schemas.

| DTO profile               | Minimum public/client fields                                                                                                        | Fields never exposed outside admin/system                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `PublicContentSummary`    | `id`, `title`, `language`, `visibility`, `publishedAt`                                                                              | draft body, approval notes, private admin notes                    |
| `EventSummary`            | `id`, `title`, `type`, `startAt`, `endAt`, `locationLabel`, `visibility`, `targetOrganizationUnitId`, `status`                      | private address, internal planning notes                           |
| `ParticipationIntent`     | `eventId`, `userId` only for self/admin-scoped responses, `intentStatus`, `createdAt`, `cancelledAt`                                | unrelated participants, attendance verification                    |
| `CandidateProfileSummary` | `id`, `status`, `assignedOrganizationUnitId`, `responsibleOfficerId`, `createdAt`                                                   | candidate request private message unless admin-scoped              |
| `CandidateDashboard`      | active profile summary, assigned choragiew/contact fields, next step, candidate-visible upcoming events, announcements array        | brother-only events, memberships, degrees, admin notes             |
| `BrotherProfileSummary`   | `id`, `displayName`, `membershipStatus`, `currentDegree`, `organizationUnitIds`, `joinedAt`                                         | unrelated brother records, audit summaries                         |
| `AssignedRoadmap`         | `assignmentId`, assignment status/timestamps, target role, definition summary, ordered stages/steps, current user's own submissions | unrelated user ids, cross-unit rollups, automatic degree decisions |
| `SilentPrayerSession`     | `id`, `title`, `intention`, `linkedPrayerId`, `startAt`, `endAt`, `visibility`, `counter`                                           | participant list, personal join history                            |
| `AuditLogSummary`         | `id`, `actorUserId`, `action`, `entityType`, `entityId`, `scopeOrganizationUnitId`, `requestId`, `createdAt`                        | unredacted sensitive before/after values                           |

## Route Canonicalization

- Roadmap definition routes are `/admin/roadmap-definitions` and `/admin/roadmap-definitions/:id`.
- Roadmap review routes are `/admin/roadmap-submissions` and `/admin/roadmap-submissions/:id`.
- Audit log routes are `/admin/audit-logs`.
- Candidate request routes manage public interest requests; `/admin/candidates` routes manage authenticated candidate profiles.
- Candidate-to-brother conversion is separate from request-to-candidate conversion.

## Common Acceptance Criteria

- Every endpoint has permission tests.
- Every content endpoint has visibility tests.
- Admin write endpoints audit critical actions.
- Public endpoints never return private fields or private content.
- Generated API types compile in mobile and admin apps.
- OpenAPI output is committed or generated in CI and checked for breaking changes.
