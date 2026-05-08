# Working Agreement for Coding Agents (Generic)

## Core Rules

- Keep approved scope (see [docs/scope.md](docs/scope.md)) disciplined; propose expansion only when there is strong product, security, or architectural argument
- Implement by phase/iteration from your roadmap
- Ask for human owner permission before implementing any out-of-scope feature
- Preserve and test data security and access control
- Write tests for visibility, permissions, and critical workflows
- Maintain minimum test coverage (80% typical for statements, branches, functions, lines)
- Add integration tests where behavior crosses API, database, service, or module boundaries
- Update documentation when behavior changes
- Implement approved scope changes only after updating scope/backlog docs with decision reference
- Keep the application runnable and fully functional after each phase
- Prefer secure/private behavior when uncertain
- Avoid destructive deletes for business entities unless explicitly approved
- Keep the pipeline green before completing work
- Reuse existing shared code instead of duplicating logic
- Update progress tracking, contracts, migrations, and tests together

## Non-Negotiables

### Security
- Access control is enforced server-side, never client-side only
- Critical business logic is not duplicated; use shared implementations
- Permission checks use shared helpers
- Data visibility filters are centralized

### Data & Privacy
- User data is treated with care from day one
- Business entities use soft-delete (archive/deactivate) not destructive delete
- Permission/role changes are tested across all affected code paths
- Audit trails are maintained for critical operations

### Quality
- No task completes with failing lint, typecheck, tests, coverage, build, or contract validation
- Tests are meaningful (would fail without the change)
- Coverage meets project minimum threshold
- Integration tests cover critical workflows

### Scope
- V1 scope is disciplined and non-negotiable
- V2 features require owner approval with rationale and impact analysis
- Scope expansion is documented in same commit as code

### Documentation
- Behavior changes update relevant docs
- Progress tracking is kept current
- Architecture decisions are recorded
- API documentation stays in sync

## Approval Process for Out-of-Scope Features

When proposing a feature outside approved scope (see [docs/scope.md](docs/scope.md)):

1. **Pause implementation** (don't code yet)
2. **Document** in issue/task with:
   - [ ] Product value and user need
   - [ ] Why current approved scope is insufficient
   - [ ] Privacy and security impact
   - [ ] Implementation effort (engineer days)
   - [ ] Files and systems affected
   - [ ] Test/documentation impact
   - [ ] Ongoing maintenance cost
3. **Request** explicit approval from human owner (product lead, tech lead, architect)
4. **Confirm** in writing (documented in issue/PR, saved for record)
5. **Update** scope and backlog docs if approved:
   - Add to approved scope list OR future backlog
   - Reference the approval decision
   - Update progress tracking
6. **Proceed** only after approval and scope docs are updated

## Team Expectations

- Communicate early when scope seems insufficient
- Report blockers and ask for help
- Suggest patterns and refactorings you see
- Update docs as you go, not at the end
- Test thoroughly before declaring done
- Review your own code first (self-review before team review)

