# Roadmap API

## Candidate/Brother

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/candidate/roadmap` | Candidate | Candidate onboarding roadmap |
| GET | `/brother/roadmap` | Brother | Brother formation roadmap |
| POST | `/brother/roadmap/steps/:stepId/submissions` | Brother | Submit formation step |

## Admin

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/roadmap-definitions` | Admin | List roadmap definitions |
| POST | `/admin/roadmap-definitions` | Admin | Create roadmap definition |
| PATCH | `/admin/roadmap-definitions/:id` | Admin | Edit status/content |
| GET | `/admin/roadmap-submissions` | Officer/Super Admin | Review queue |
| PATCH | `/admin/roadmap-submissions/:id` | Officer/Super Admin | Approve/reject |

## Rules

- Candidate and brother roadmaps may be separate definitions.
- Candidate roadmaps are read-only in default V1. Candidate-authored roadmap submissions are not implemented unless the human owner approves a scope expansion and this API contract is updated.
- App never auto-awards degrees.
- Officer decisions require comment for rejection and create audit logs.
