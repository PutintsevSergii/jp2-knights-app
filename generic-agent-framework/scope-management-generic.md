# Scope Management (Generic)

This document explains how to set up and maintain scope boundaries for your project.

## What is Scope?

**Scope** is the set of features, behaviors, and functionality that are approved for implementation in the current phase/iteration.

Everything else is either:
- **Future scope** — approved but deferred to later phases
- **Out of scope** — explicitly excluded or not yet approved
- **Under evaluation** — proposed but not yet decided

## Why Scope Matters

- **Prevents scope creep** — without clear boundaries, work expands indefinitely
- **Protects timeline** — clear scope means realistic deadlines
- **Enables focus** — teams know what to prioritize
- **Creates accountability** — decisions are documented and traceable
- **Facilitates decisions** — easier to evaluate "add X feature?" when scope is clear

## Setting Up Your Scope Documents

Create these files in your project:

### 1. **docs/scope.md** (or docs/product/scope.md)

Current approved scope for this phase/iteration.

```markdown
# Approved Scope - [Phase/Iteration Name]

## What's Included

### Authentication
- [ ] Email/password sign-in
- [ ] Session management
- [ ] Account recovery via email
- [ ] Logout

### User Profile
- [ ] View profile information
- [ ] Update profile details
- [ ] Upload profile picture
- [ ] Change password

### Core Feature
- [ ] Create/read/update/delete operations
- [ ] Search and filtering
- [ ] Bulk operations (if applicable)
- [ ] Audit logging

## What's Explicitly Excluded

### Social Features (Out of Scope)
- No user-to-user messaging
- No social followers/following
- No activity feeds
- No comments or reactions

### Advanced Features (Deferred to Future)
- Two-factor authentication
- OAuth/social sign-in
- Advanced analytics
- Real-time collaboration

### Infrastructure (Out of Scope)
- Mobile native app (web only)
- Desktop application
- API documentation portal
- Self-hosted option

## Scope Decision Log

| Date | Feature | Decision | Approver | Reason |
|------|---------|----------|----------|--------|
| 2026-05-01 | Email login | Approved | Product Lead | Core requirement |
| 2026-05-02 | 2FA | Deferred | CTO | Phase 2 |
| 2026-05-03 | Chat | Rejected | Product Lead | Not aligned with MVP |
```

### 2. **docs/backlog.md** (or docs/product/backlog.md)

Features approved for future phases but not current scope.

```markdown
# Future Backlog

## Phase [N+1]

### Two-Factor Authentication
- User can enable 2FA
- Login requires TOTP or SMS code
- Recovery codes for account recovery
- Device trust/remember this device

### Advanced Search
- Full-text search across all content
- Saved searches
- Search filters and facets
- Search history

## Phase [N+2]

### Mobile Application
- iOS native app
- Android native app
- Push notifications
- Offline-first sync

### Integrations
- Slack integration
- Webhook support
- Third-party API access
```

### 3. **docs/decisions.md** (or docs/architecture/decisions.md)

Record major scope decisions and their rationale.

```markdown
# Scope Decisions

## ADR-001: Approved Scope Boundaries

**Status**: Approved
**Date**: 2026-05-01
**Approver**: Product Lead

### Decision
Current phase scope includes authentication, user profile, and core CRUD operations. Does NOT include messaging, social features, or advanced analytics.

### Rationale
- MVP must launch with core functionality working reliably
- Team has 6 weeks; messaging would add 4 weeks
- Messaging is common request but not blocking any user workflow

### Alternatives Considered
1. Include messaging (rejected: too much scope for 6 weeks)
2. Include 2FA (rejected: can add in Phase 2 without API changes)
3. Native mobile app (rejected: web covers initial user base)

### Consequences
- Limited initial feature set (messaging requested by users)
- Need to design API that allows messaging to be added later
- Must communicate scope clearly in launch messaging

### Reference
Approved in Product Planning meeting 2026-05-01
```

## Managing Scope Changes

### When Someone Proposes an Out-of-Scope Feature

**1. Check the scope doc first**
```bash
# Is it already in scope?
grep -i "feature-name" docs/scope.md

# Is it in future backlog?
grep -i "feature-name" docs/backlog.md
```

**2. If it's not in scope, follow approval process:**

```markdown
## Proposal: [Feature Name]

### User/Product Value
Why users need this and what problem it solves

### Why Current Scope is Insufficient
Why we can't defer this to next phase

### Impact Analysis
- Timeline impact: How many engineer days?
- Code impact: How many files/systems?
- Risk impact: Any security/privacy concerns?
- Maintenance impact: Ongoing cost?

### Approver
Product Lead / Tech Lead / Decision Maker

### Decision
[ ] Approved - Add to current scope
[ ] Deferred - Add to Phase [N] backlog
[ ] Rejected - Not aligned with product direction
```

**3. Update docs if approved**
```bash
# Add to scope.md
vim docs/scope.md

# Update decisions log
vim docs/decisions.md

# Update progress tracking
vim docs/progress.md

# Commit all together
git add docs/scope.md docs/decisions.md docs/progress.md
git commit -m "Approve and add feature X to scope"
```

## Scope Templates by Project Type

### Web Application Scope Example
```markdown
# Scope - Web App MVP

## Included
- Landing page (public)
- User authentication (email)
- Dashboard (authenticated)
- Settings page
- REST API v1

## Not Included
- Mobile app
- Admin panel
- Analytics
- Real-time features
- Payment processing
```

### Backend API Scope Example
```markdown
# Scope - API v1

## Included
- User management endpoints
- Content CRUD endpoints
- Permission system
- Rate limiting
- Error handling
- OpenAPI documentation

## Not Included
- GraphQL
- Advanced caching
- Webhook support
- Analytics events
- Admin dashboard
```

### Data Pipeline Scope Example
```markdown
# Scope - Data Pipeline v1

## Included
- Daily data ingestion
- Data validation
- Deduplication
- Basic transformations
- CSV output reports

## Not Included
- Real-time streaming
- ML pipelines
- Advanced visualizations
- Data warehouse
- BI tool integration
```

## Scope Management Checklist

### Before Phase Starts
- [ ] Create docs/scope.md with approved features
- [ ] Create docs/backlog.md with future features
- [ ] Create docs/decisions.md with scope rationale
- [ ] Share with team
- [ ] Get approval from decision makers

### During Phase
- [ ] Check scope.md before starting new features
- [ ] When out-of-scope requested: follow approval process
- [ ] Update decisions.md when scope changes
- [ ] Track decisions in git history

### End of Phase
- [ ] Update docs/progress.md with what was completed
- [ ] Move completed items from scope.md to progress
- [ ] Move next phase items from backlog to scope
- [ ] Archive old decisions.md entries

## Common Scope Mistakes

❌ **Don't:**
- Add features without documenting scope impact
- Let scope creep silently happen
- Make scope decisions verbally (no record)
- Forget to update scope docs when plans change
- Treat scope as flexible/negotiable
- Add "just one more feature" without approval

✅ **Do:**
- Check scope.md before starting work
- Document all scope decisions
- Get explicit approval for changes
- Update docs when scope changes
- Use scope.md as team reference
- Enforce boundaries consistently

## Tools and Processes

### Simple Approach
- Maintain docs/scope.md in git
- Update in same commit as code
- Use issue templates to enforce scope review

### Advanced Approach
- Track in project management tool (Linear, Jira, Trello)
- Link to docs/scope.md for source of truth
- Use automation to flag out-of-scope PRs
- Generate reports of scope vs actual

## References

- **Scope Decision Template** — See docs/decisions.md ADR format
- **Scope Change Approval** — See coding-agent-instructions-generic.md
- **Scope Management** — This file
- **Progress Tracking** — docs/progress.md

