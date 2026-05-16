# Roadmap API

## Candidate/Brother

| Method | Path                                         | Role      | Purpose                      |
| ------ | -------------------------------------------- | --------- | ---------------------------- |
| GET    | `/candidate/roadmap`                         | Candidate | Candidate onboarding roadmap |
| GET    | `/brother/roadmap`                           | Brother   | Brother formation roadmap    |
| POST   | `/brother/roadmap/steps/:stepId/submissions` | Brother   | Submit formation step        |

## Shared Contract Foundation

Phase 10B now defines the roadmap data and DTO contract foundation before route
implementation:

- `roadmap_definitions` hold published candidate or brother roadmap roots with
  `target_role`, `language`, content status, and publish/approval metadata.
- `roadmap_stages` and `roadmap_steps` preserve ordered roadmap structure.
- `roadmap_assignments` attach one active roadmap definition to one user and
  optional organization-unit scope.
- `roadmap_submissions` store sensitive user-authored step review text,
  optional attachment metadata, review status, reviewer, comment, and timestamps.

Assigned roadmap read responses use `assignedRoadmapResponseSchema` from
`@jp2/shared-validation`:

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

Officer review payloads use `reviewRoadmapSubmissionRequestSchema`.
Rejected submissions require `reviewComment`.

## Admin

| Method | Path                             | Role                | Purpose                   |
| ------ | -------------------------------- | ------------------- | ------------------------- |
| GET    | `/admin/roadmap-definitions`     | Admin               | List roadmap definitions  |
| POST   | `/admin/roadmap-definitions`     | Admin               | Create roadmap definition |
| PATCH  | `/admin/roadmap-definitions/:id` | Admin               | Edit status/content       |
| GET    | `/admin/roadmap-submissions`     | Officer/Super Admin | Review queue              |
| PATCH  | `/admin/roadmap-submissions/:id` | Officer/Super Admin | Approve/reject            |

## Rules

- Candidate and brother roadmaps may be separate definitions.
- Candidate roadmaps are read-only in default V1. Candidate-authored roadmap submissions are not implemented unless the human owner approves a scope expansion and this API contract is updated.
- App never auto-awards degrees.
- Officer decisions require comment for rejection and create audit logs.
- Roadmap responses must not expose unrelated user ids, participant lists,
  brother rosters, or cross-unit operational rollups.
