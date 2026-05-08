# Definition of Done (Generic)

Use these checklists to verify completion of different artifact types.

## Backend Service or API Endpoint

- [ ] Method/path/protocol documented
- [ ] Authentication and authorization documented
- [ ] Request/response shapes validated
- [ ] Uses common error contract
- [ ] Success, validation error, permission error, and edge case tests
- [ ] Unit tests for business logic
- [ ] Integration tests for API/database boundaries
- [ ] Permission tests for all relevant roles/scopes
- [ ] No duplicate logic (reuses shared auth/permission helpers)
- [ ] API contract/OpenAPI updated if endpoint changed
- [ ] Generated client/types updated
- [ ] Critical mutations have audit/logging where applicable

## Database Migration

- [ ] Names are clear and follow naming conventions
- [ ] Constraints and indexes added for access paths
- [ ] Archive/deactivate policy considered (not destructive delete)
- [ ] Applies from clean database
- [ ] Applies from previous committed state
- [ ] Rollback path documented if needed
- [ ] Seed data updated if needed
- [ ] Destructive changes include explicit approval

## Permission or Access Control Rule

- [ ] Tested for all relevant roles
- [ ] Tested for all relevant scopes (if multi-tenant/multi-unit)
- [ ] Enforced server-side (not client-side only)
- [ ] Uses shared auth helpers (no duplication)
- [ ] Not bypassed by any code path

## Frontend Page or Screen

- [ ] Uses correct API endpoint/client
- [ ] Handles loading state
- [ ] Handles empty state
- [ ] Handles error state
- [ ] Handles offline state (if applicable)
- [ ] Handles forbidden/unauthorized state
- [ ] Uses shared components (no duplication)
- [ ] Uses shared design tokens (no hardcoded colors/spacing)
- [ ] Accessible (labels, text contrast, keyboard navigation where applicable)
- [ ] Tested for visible states and user interactions
- [ ] Works in all applicable runtime modes (API, demo, etc.)
- [ ] Private data clears on logout/session failure

## Frontend Component

- [ ] Single responsibility (does one thing well)
- [ ] Accepts all state as props (not fetching data)
- [ ] Uses shared design tokens (no hardcoded styling)
- [ ] Handles loading/error/empty states if needed
- [ ] Accessible (alt text, labels, readable text)
- [ ] Tested for rendered output and callbacks
- [ ] Component inventory updated if shared (file/purpose/props/reuse guidance)

## Shared Utility or Helper

- [ ] Single source of truth for its concept
- [ ] Does not duplicate elsewhere in codebase
- [ ] Well-documented with examples
- [ ] Tested with unit tests
- [ ] Used by multiple features/apps

## Test Suite

- [ ] Tests are meaningful (would fail without the change)
- [ ] Tests cover success path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] Permission/visibility tests where applicable
- [ ] Integration tests for behavior crossing boundaries
- [ ] Coverage at minimum threshold (80% typical)

## Documentation Update

- [ ] Product/feature documentation updated if behavior changed
- [ ] API documentation updated if endpoint changed
- [ ] Technical documentation updated if architecture changed
- [ ] Code comments added where "why" is non-obvious (not "what")
- [ ] Progress tracking document updated
- [ ] Decision log updated if major decision made

## Quality Gates

- [ ] Lint passes
- [ ] Type checking passes
- [ ] All tests pass
- [ ] Coverage meets minimum threshold
- [ ] Build succeeds
- [ ] Contract/schema validation passes
- [ ] Database migration checks pass (if applicable)
- [ ] Smoke tests pass for critical workflows
- [ ] No temporary hacks or TODO comments (unless documented)

## Code Review Readiness

- [ ] Changes are logically grouped
- [ ] Commit messages are clear
- [ ] No merge commits or rebase issues
- [ ] Only changed files included
- [ ] Dependencies only added if necessary
- [ ] Documentation updated in same commit

## Final Checklist

Before marking work complete:

- [ ] All quality gates pass
- [ ] All required tests pass
- [ ] Coverage meets minimum
- [ ] No red pipeline
- [ ] Documentation updated
- [ ] Progress tracking updated
- [ ] Code follows project patterns
- [ ] No duplicated logic
- [ ] Ready for peer review

