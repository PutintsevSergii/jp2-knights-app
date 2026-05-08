# Scope Setup - Quick Reference

Set up scope tracking for your project in 10 minutes.

## What You Need to Create

### 1. Create `docs/scope.md`
**What's approved for THIS phase/iteration**

```markdown
# Current Scope - [Phase Name]

## Approved Features

### Authentication
- [ ] User sign-up with email
- [ ] User login with email/password
- [ ] Logout
- [ ] Session management

### User Profile
- [ ] View profile
- [ ] Edit profile
- [ ] Change password

### Content Management
- [ ] Create content
- [ ] Read/view content
- [ ] Update content
- [ ] Delete/archive content

## Explicitly Excluded

### Features (Defer to Next Phase)
- Two-factor authentication → Phase 2
- OAuth/social sign-in → Phase 2
- Advanced permissions → Phase 3

### Scope Boundaries (Out of Scope)
- Mobile native app (web only for MVP)
- Real-time collaboration (not needed for MVP)
- Analytics dashboard (Phase 2)
- Admin backend (Phase 2)
```

### 2. Create `docs/backlog.md`
**What's approved BUT deferred to future phases**

```markdown
# Future Backlog

## Phase [N+1]

### Two-Factor Authentication
- TOTP code generation
- SMS code delivery
- Recovery codes
- Device trust

### Advanced Permissions
- Role-based access control
- Custom permission groups
- Permission inheritance

## Phase [N+2]

### Analytics
- User activity tracking
- Usage reports
- Engagement metrics

### Mobile Application
- iOS native app
- Android native app
- Offline sync
```

### 3. Create `docs/decisions.md`
**Why scope decisions were made**

```markdown
# Scope and Technical Decisions

## Decision: Current Scope for Phase 1

**Status**: Approved  
**Date**: [DATE]  
**Approver**: [Product Lead / CTO / etc.]

### What's Included
- User authentication
- Basic CRUD operations
- REST API

### What's Excluded
- Two-factor authentication
- Admin dashboard
- Mobile app

### Why This Scope
- Can deliver in 6 weeks
- Covers core user workflows
- Allows room for polish/testing

### When to Reconsider
- User feedback on Phase 1
- Technical challenges discovered
- Stakeholder request with rationale
```

## File Paths to Reference in Scope Files

When updating scope documents, agents should reference:

| File | Purpose |
|------|---------|
| `docs/scope.md` | Current approved features |
| `docs/backlog.md` | Future/deferred features |
| `docs/decisions.md` | Scope decision log |
| `docs/progress.md` | What's been completed |

## How Agents Use These Files

### Before Starting Work
```bash
# Check if feature is in approved scope
grep -i "my-feature" docs/scope.md

# If NOT found, check backlog
grep -i "my-feature" docs/backlog.md

# If in backlog, follow approval process:
# 1. Document case (why it's needed now)
# 2. Get approval from decision maker
# 3. Update docs/scope.md (move from backlog)
# 4. Update docs/decisions.md (record approval)
```

### Before Committing
```bash
# Update progress tracking
vim docs/progress.md

# Commit scope changes together
git add docs/scope.md docs/decisions.md docs/progress.md
git commit -m "Feature X approved and moved to current scope"
```

## Template for Out-of-Scope Approval

When a feature needs approval:

```markdown
## Proposal: [Feature Name]

**Requester**: [Who is asking]  
**Date**: [When requested]

### What
[What feature/capability]

### Why
[User value / Product need / Problem solved]

### Why Now
[Why can't we defer to next phase]

### Impact
- Engineer days: [estimate]
- Files affected: [which systems]
- Risk level: [low/medium/high]

### Decision
[ ] Approved → Add to current scope
[ ] Deferred → Add to Phase [N] backlog  
[ ] Rejected → Not aligned with product direction

**Approver**: [Decision maker]  
**Date Approved**: [When decision made]
```

Save this in a task/issue and reference in the commit.

## Common Scenarios

### Scenario 1: Feature in Backlog, Someone Wants It Now
1. Check `docs/backlog.md` — yes, it's listed for Phase 3
2. Fill approval template (why needed now?)
3. Get decision maker approval
4. Move from backlog to scope:
   ```bash
   vim docs/scope.md    # Add feature
   vim docs/backlog.md  # Remove from Phase 3
   vim docs/decisions.md # Record decision + date
   ```
5. Commit together

### Scenario 2: Completely New Feature Proposed
1. Check `docs/scope.md` — not found
2. Check `docs/backlog.md` — not found
3. It's new! Fill approval template
4. Get decision maker approval
5. Add to `docs/scope.md` under "New Additions"
6. Update `docs/decisions.md` with approval
7. Commit together

### Scenario 3: Scope Change Needed Mid-Phase
1. Document in existing task/PR
2. Explain impact: timeline, files, risk
3. Get explicit approval
4. Update all three docs (scope/backlog/decisions)
5. Commit together with code changes

## Reference These Files in Your Agent Docs

Update path references in these framework files:

- **AGENTS-generic.md** → Update `[docs/scope.md]` path
- **coding-agent-instructions-generic.md** → Reference scope check
- **working-agreement-generic.md** → Reference approval process

## Checklist for Setup

- [ ] Create `docs/scope.md` with current features
- [ ] Create `docs/backlog.md` with future features
- [ ] Create `docs/decisions.md` with scope rationale
- [ ] Share with team
- [ ] Update AGENTS.md path references
- [ ] Add scope check to PR template or checklist
- [ ] Train team on approval process

Done! Now scope is explicit and traceable.

