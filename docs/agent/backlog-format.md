# Backlog Format

Use this structure for future implementation tasks.

```md
## Epic

Name of larger product area.

## Feature

Specific V1 capability.

## Story

As a [role], I want [action], so that [outcome].

## Acceptance Criteria

- Given/when/then criteria.
- Permission expectations.
- Visibility expectations.
- Empty/error states where applicable.

## Technical Notes

- Relevant docs.
- Entities/endpoints/screens.
- Migration notes if needed.
- Shared enums, schemas, guards, utilities, and components to reuse.
- OpenAPI/client generation impact.

## Out of Scope

- Explicitly list nearby V2 or excluded work.
- If proposing a scope expansion, include the human-owner approval reference and docs to update.

## Tests Required

- Unit/integration/E2E/visibility/permission tests.
- Contract, migration, privacy lifecycle, supportability, or smoke tests when relevant.

## Quality Gates

- Commands that must pass before the story is complete.
- Any known failing command must be fixed or explicitly accepted by the human owner.

## Dependencies

- Prior phases, data, approvals, or infrastructure.
```
