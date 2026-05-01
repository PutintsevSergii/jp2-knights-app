# Status Consolidation Guide — Single Source of Truth

**Date**: May 2, 2026  
**Purpose**: Ensure implementation progress is tracked in ONE canonical place, never out of sync.

---

## The Problem We Solved

Multiple status documents existed (or could exist):
- `docs/traceability.md` — had progress narrative
- `IMPLEMENTATION_STATUS.md` — created as a dashboard
- `JP2_APP_IMPLEMENTATION_ROADMAP.md` — historical document
- Other docs with status mentions

**Risk**: Documents drift apart. Stakeholders get conflicting answers about what's done.

---

## The Solution: ONE Canonical Source

### ⭐ **[docs/traceability.md](traceability.md)** — THE Source of Truth

This is the **definitive, authoritative, up-to-date** document for implementation progress.

**What makes it the perfect source**:
1. **Combines requirements + implementation** — each FR-* / NFR-* has its APIs, screens, data, tests listed
2. **Has clear update instructions** — agents know exactly what to update after each phase
3. **Referenced by all agent commands** — agents are trained to check traceability first
4. **Lives with the code** — updated in same commits that implement features
5. **One commit = one truth** — no async drift between code and docs

**What's in traceability.md**:
- Current phase (updated after each phase completion)
- Progress narrative (what's done in each phase)
- 42+ V1 requirements with full requirement-to-implementation mapping:
  - **APIs**: What endpoints implement each requirement
  - **Screens**: What mobile/admin screens implement each requirement
  - **Data**: What database tables support each requirement
  - **Tests**: What key tests validate each requirement

---

## How Status Flows Through the Documentation

```
Coding Agent completes Phase X
    ↓
Agent updates docs/traceability.md (ONE place)
    ↓
Agent commits with message "Phase X complete: [accomplishments]"
    ↓
docs/README.md → points to traceability.md
docs/IMPLEMENTATION_STATUS.md → links to traceability.md
AGENTS.md → instructs agents to update traceability.md
GETTING_STARTED_BY_ROLE.md → engineers check traceability.md
Stakeholder reports → reference IMPLEMENTATION_STATUS.md summary → which links to traceability.md
    ↓
Everyone has ONE source of truth
```

---

## Rules for Maintaining Status

### Rule 1: Update traceability.md, Never Other Status Docs

**When you complete work**:
- ✅ **DO**: Update [docs/traceability.md](traceability.md) with what's complete
- ✅ **DO**: Update the "Current Implementation Progress" section
- ❌ **DON'T**: Update IMPLEMENTATION_STATUS.md directly (it's auto-derived)
- ❌ **DON'T**: Update JP2_APP_IMPLEMENTATION_ROADMAP.md (it's historical)
- ❌ **DON'T**: Create a new status tracking doc

### Rule 2: Update traceability.md in the Same Commit

**In your commit that marks work done**:
```bash
git add <code changes>
git add docs/traceability.md  # Update status narrative + requirement rows
git commit -m "Phase X: Implement [feature]. Update traceability.md"
```

**Bad practice**:
```bash
# Bad: status update in separate commit weeks later
git commit -m "Implement Phase 2"
# (days pass)
git commit -m "Update status docs"  # ← now documentation is stale
```

### Rule 3: Keep the Update Simple

You don't need to update every row in the matrix. For each requirement you've worked on:
1. Update the "Current Implementation Progress" narrative at the top
2. Add a note about the requirement in its row if not just incremental progress

Example:
```markdown
## Current Implementation Progress

### Current Phase: Phase 3 (Public Discovery)

- Phase 1 repository/infrastructure baseline is in place.
- Phase 2 shared auth/visibility helpers, mobile-mode resolution... [existing narrative]
- **Phase 3 NEW** (added May 2, 2026):
  - Public prayer endpoints implemented with full visibility filtering
  - Mobile screens for public prayer reading implemented
  - Migration tests added for prayer tables
  - (see rows below for requirement details)
```

---

## For Different Roles

### Coding Agents

**Before starting work**:
```
1. Open docs/traceability.md
2. Read "Current Implementation Progress" section
3. See what phase we're in
4. See what's been done
5. Identify your task within that phase
```

**After completing work**:
```
1. Update docs/traceability.md narrative with what you accomplished
2. Commit with traceability.md changes
3. Done—status is now up-to-date for everyone
```

### Product Owners / Stakeholders

**To check progress**:
```
1. Read docs/delivery/IMPLEMENTATION_STATUS.md for a quick summary
2. It will link you to docs/traceability.md for details
3. Never get out-of-sync information
```

### QA / Test Engineers

**To understand what to test**:
```
1. Check docs/traceability.md
2. Find the requirement (FR-*, NFR-*)
3. See expected APIs, screens, data, tests
4. Design tests based on that row
```

### DevOps / Infrastructure

**To understand infrastructure needs**:
```
1. Check docs/traceability.md
2. See what APIs/data/services each phase needs
3. Prepare infrastructure for the current phase
```

---

## What Happened to Other Status Documents

| Document | Status | Purpose |
|----------|--------|---------|
| **docs/traceability.md** | ⭐ **CANONICAL** | Source of truth for all status, requirements, and implementation mapping |
| **docs/delivery/IMPLEMENTATION_STATUS.md** | Summary | Quick dashboard that links to traceability.md. Never edit directly. |
| **JP2_APP_IMPLEMENTATION_ROADMAP.md** | Historical | Original roadmap from project start. Reference only. Not updated. |
| **docs/delivery/implementation-roadmap.md** | Planned phases | Describes what each of the 13 phases *will* deliver. Updated only if scope changes. |
| **docs/delivery/phase-breakdown.md** | Phase criteria | Defines what "Phase X exit criteria" means. Rarely changes. |

---

## Common Questions

### Q: Can I update IMPLEMENTATION_STATUS.md directly?

**No.** IMPLEMENTATION_STATUS.md is a convenience summary that points to traceability.md. Updating it directly would create duplication and drift. 

If you need to update status, update `docs/traceability.md` instead.

### Q: What if I find a status conflict between traceability.md and another doc?

**Traceability.md wins.** Follow traceability.md and update the other document to point to it or remove the conflicting statement.

**Report it** if you see this, so we can clean up.

### Q: Do I need to update all 42 requirement rows after each phase?

**No.** Just update:
1. The "Current Implementation Progress" narrative section (what's done in this phase)
2. Add notes to the specific requirement rows you worked on
3. Leave other rows unchanged

### Q: Can we have multiple status documents in the future?

**Only if they explicitly link to traceability.md as the source of truth.** Examples:
- A metrics dashboard that pulls data from traceability.md ✅
- An email report that links to traceability.md ✅
- A separate "offline copy" document that's synced from traceability.md ✅
- A new status document that doesn't reference traceability.md ❌

---

## Implementation Checklist

- ✅ **docs/traceability.md** enhanced with clear update instructions
- ✅ **docs/README.md** marks traceability.md as canonical
- ✅ **AGENTS.md** instructs agents to update traceability.md
- ✅ **docs/agent/coding-agent-instructions.md** references traceability.md
- ✅ **docs/GETTING_STARTED_BY_ROLE.md** points engineers to traceability.md
- ✅ **docs/delivery/IMPLEMENTATION_STATUS.md** converted to summary that links to traceability.md
- ✅ **This guide (STATUS_CONSOLIDATION_GUIDE.md)** explains the consolidation

---

## Going Forward

**Every team member should know**:
- ⭐ **docs/traceability.md is where status lives**
- Updates happen in the same commit as code changes
- Other docs point to traceability.md
- Conflicts are resolved in favor of traceability.md

**This ensures**: No drifting docs, no conflicting information, one source of truth.

---

**Status Consolidation Date**: May 2, 2026  
**Owner**: Technical Leadership  
**Last Updated**: May 2, 2026
