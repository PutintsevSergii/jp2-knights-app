# Documentation Synchronization (Generic)

Documentation must stay in sync with implementation to remain a source of truth.

## Files That Must Stay in Sync (Same Commit)

When you change code, update these in the same commit:

1. **Progress/Status tracking** — narrative of what's implemented
2. **API documentation** — endpoint changes, contract updates
3. **Architecture documentation** — decisions that changed
4. **Decision log** — why choices were made
5. **Scope/backlog** — if scope changed
6. **Component inventory** — if new shared components
7. **Tests/migrations** — always in same commit as code

## Documentation by Change Type

### API Endpoint Change
Update:
- [ ] API documentation (path, method, auth, params)
- [ ] DTO/schema documentation
- [ ] OpenAPI/contract definition
- [ ] Generated client (regenerate, then commit)
- [ ] Example requests/responses in docs

### Backend Service Change
Update:
- [ ] Service documentation (what it does)
- [ ] Error handling documentation
- [ ] Integration points documentation
- [ ] Architecture diagram if affected

### Frontend Component Change
Update:
- [ ] Component documentation (props, variants)
- [ ] Component inventory (if shared component)
- [ ] Usage examples if public API changed
- [ ] Screenshot or visual reference if UI changed

### Permission/Access Control Change
Update:
- [ ] Permission matrix or table
- [ ] Role documentation
- [ ] Access control rules
- [ ] Security test documentation

### Database Migration
Update:
- [ ] Entity/table documentation
- [ ] Migration notes for deployment
- [ ] Data archival/deletion policy if applicable
- [ ] Rollback procedure if needed

### Architecture Decision
Update:
- [ ] Decision log with why/when/impact
- [ ] Architecture diagram if affected
- [ ] Technical trade-offs explanation
- [ ] Migration plan if changing existing pattern

## Progress Tracking Synchronization

When completing work, update your progress document:

### Narrative Update Pattern
```markdown
## Current Implementation Progress

### Current Phase: [Phase Name]

Implementation now includes:

- Previous phases narrative... [existing]
- **Phase N NEW** (added [DATE]):
  - ✅ Completed feature 1: [what it does]
  - ✅ Completed feature 2: [what it does]
  - ✅ Tests added: [number of tests, what they cover]
  - (see requirement details below for full mapping)
```

### Status Table Update Pattern
```markdown
| Phase | Status | Progress | Work | Blockers |
|-------|--------|----------|------|----------|
| 1 | ✅ Complete | 100% | Foundation | None |
| 2 | 🟡 In Progress | 45% | Auth service, Sign-in UI | Waiting for email config |
| 3 | ⚪ Not Started | 0% | Payment integration | Depends on Phase 2 |
```

### Quality Gate Status Update Pattern
```markdown
| Gate | Phase 1 | Phase 2 | Notes |
|------|---------|---------|-------|
| Lint | ✅ | ✅ | No issues |
| TypeCheck | ✅ | ✅ | Strict mode |
| Unit Tests (80%) | ✅ 85% | 🟡 78% | Growing with Phase 2 |
| Coverage | ✅ 85% | 🟡 78% | Auth service gaps |
| Build | ✅ | ✅ | No warnings |
```

## Commit Message Guidelines

Structure commits to be searchable and understandable:

```
[Type] Brief description of what changed

Longer description explaining:
- What changed and why
- How it affects other parts
- Tests added
- Docs updated

Closes #123
```

### Example Commits
```
[Auth] Implement email sign-in API endpoint

- Add POST /api/auth/signin endpoint
- Hash passwords with bcrypt
- Generate JWT tokens
- Add permission tests for unauthenticated users
- Update API documentation with new endpoint
- Add 12 unit tests for auth service
- Update progress tracking (Phase 2: 45%)

Tests: npm run test ✅ (coverage 78%)
```

```
[Mobile] Add SignIn screen

- Implement form with email input validation
- Call auth API endpoint
- Handle loading/error/success states
- Use shared design tokens
- Update component inventory
- Add 8 tests for screen rendering and callbacks

Tests: npm run test ✅ (coverage 82%)
```

```
[Docs] Update architecture decision log

- Record decision to use JWT for auth (not sessions)
- Document trade-offs and reasoning
- Link to implementation PR

No code changes.
```

## Documentation Checklist

Before marking work complete:

- [ ] All code changes documented in relevant doc
- [ ] Progress tracking updated with phase progress
- [ ] API endpoints documented if changed
- [ ] Architecture decisions documented
- [ ] Component inventory updated if shared components added
- [ ] Decision log updated if major decision made
- [ ] Examples or screenshots added if UI changed
- [ ] Permission matrix updated if access control changed
- [ ] All changes in same commit as code

## Common Mistakes to Avoid

❌ **Don't:**
- Write code and forget to update progress doc
- Update docs in a separate commit
- Leave stale code comments or TODOs
- Document decisions months after implementation
- Copy-paste docs instead of updating existing ones
- Let API docs drift from actual endpoints

✅ **Do:**
- Update docs in the same commit as code
- Write progress updates as you go
- Keep docs single source of truth
- Review docs as part of code review
- Link docs from code where helpful
- Keep examples up-to-date with API

## Document Maintenance

Regular reviews (monthly/quarterly):

- [ ] Verify progress doc still matches code
- [ ] Check for outdated examples
- [ ] Update completion dates
- [ ] Remove completed TODOs and notes
- [ ] Update any decision log entries with lessons learned
- [ ] Archive or remove deprecated features from docs

