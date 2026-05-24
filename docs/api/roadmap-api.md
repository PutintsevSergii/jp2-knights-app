# Roadmap API

## Candidate/Brother

| Method | Path                                         | Role      | Purpose                      |
| ------ | -------------------------------------------- | --------- | ---------------------------- |
| GET    | `/candidate/roadmap`                         | Candidate | Candidate onboarding roadmap |
| GET    | `/brother/roadmap`                           | Brother   | Brother formation roadmap    |
| POST   | `/brother/roadmap/steps/:stepId/submissions` | Brother   | Submit formation step        |

## Shared Contract Foundation

Phase 10B now defines the roadmap data and DTO contract foundation, the first
candidate/brother read routes, and the brother submission write route:

- `roadmap_definitions` hold published candidate or brother roadmap roots with
  `target_role`, `language`, content status, and publish/approval metadata.
- `roadmap_stages` and `roadmap_steps` preserve ordered roadmap structure.
- `roadmap_assignments` attach one active roadmap definition to one user and
  optional organization-unit scope.
- `roadmap_submissions` store sensitive user-authored step review text,
  optional attachment metadata, review status, reviewer, comment, and timestamps.

Assigned roadmap read responses use `assignedRoadmapResponseSchema` from
`@jp2/shared-validation`. The `roadmap` value is nullable so mobile can render a
safe no-roadmap state without treating the absence of an assignment as a private
data error:

```json
{
  "roadmap": {
    "assignmentId": "uuid",
    "status": "active",
    "assignedAt": "2026-05-09T09:00:00.000Z",
    "completedAt": null,
    "organizationUnitId": "uuid",
    "definition": {
      "id": "uuid",
      "title": "Formation Roadmap",
      "targetRole": "BROTHER",
      "language": "en",
      "status": "PUBLISHED",
      "publishedAt": "2026-05-09T09:00:00.000Z"
    },
    "stages": []
  }
}
```

Submission create payloads use `createRoadmapSubmissionRequestSchema`:

```json
{
  "stepId": "uuid",
  "body": "A short formation reflection.",
  "attachmentMetadata": []
}
```

The route `stepId` must match the body `stepId`. Submissions can only be created
for the authenticated brother's own active assigned published brother roadmap,
within their active organization-unit membership scope, and only for published
steps marked `requiresSubmission`. Duplicate pending submissions return `409`.
Approved or rejected historical submissions remain preserved.

Officer review payloads use `reviewRoadmapSubmissionRequestSchema`.
Rejected submissions require `reviewComment`.

## Admin

| Method | Path                             | Role                | Purpose                   |
| ------ | -------------------------------- | ------------------- | ------------------------- |
| GET    | `/admin/roadmap-definitions`     | Admin               | List roadmap definitions  |
| POST   | `/admin/roadmap-definitions`     | Admin               | Create roadmap definition |
| PATCH  | `/admin/roadmap-definitions/:id` | Admin               | Edit status/content       |
| GET    | `/admin/roadmap-submissions`     | Officer/Super Admin | Review queue              |
| GET    | `/admin/roadmap-submissions/:id` | Officer/Super Admin | Review detail             |
| PATCH  | `/admin/roadmap-submissions/:id` | Officer/Super Admin | Approve/reject            |

## Rules

- Candidate and brother roadmaps may be separate definitions.
- `GET /candidate/roadmap` requires an active candidate profile and returns only
  the current user's assigned published candidate roadmap. Scoped assignments are
  limited to the candidate's assigned organization unit.
- `GET /brother/roadmap` requires active brother membership and returns only the
  current user's assigned published brother roadmap. Scoped assignments are
  limited to the brother's active organization-unit memberships.
- `POST /brother/roadmap/steps/:stepId/submissions` requires active brother
  membership, validates the shared create-submission DTO, stores bounded
  attachment metadata only, returns the created pending submission, and never
  exposes other users' submissions or participant lists.
- `GET /admin/roadmap-submissions` and
  `GET /admin/roadmap-submissions/:id` require Admin Lite access. Super Admins
  can review all non-archived submissions; officers see only submissions whose
  roadmap assignment is scoped to their assigned organization units. List
  responses expose body previews, while detail responses expose full submission
  body only inside the scoped admin boundary.
- `PATCH /admin/roadmap-submissions/:id` accepts only `approved` or `rejected`
  review decisions for pending submissions. Rejections require a
  `reviewComment`; all decisions write audit summaries that redact the full
  submission body.
- Candidate roadmaps are read-only in default V1. Candidate-authored roadmap submissions are not implemented unless the human owner approves a scope expansion and this API contract is updated.
- App never auto-awards degrees.
- Officer decisions require comment for rejection and create audit logs.
- Roadmap responses must not expose unrelated user ids, participant lists,
  brother rosters, or cross-unit operational rollups.
