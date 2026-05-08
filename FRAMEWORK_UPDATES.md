# Framework Updates - Scope Generalization

## Summary

Updated the generic agent framework to use more neutral scope language instead of "V1/V2" versioning. Framework now references customizable scope documents instead of hard-coded version terminology.

## What Changed

### Language Updates

**Before:**
```
Keep V1 scope disciplined. If a V2 or out-of-scope item...
```

**After:**
```
Keep approved scope disciplined. If a feature outside scope...
```

### File References

**Before:**
```
See docs/v1-scope.md for V1 requirements
```

**After:**
```
See docs/scope.md for approved features
```

## New Files Added

### 1. **scope-management-generic.md**
Complete guide for defining and maintaining scope boundaries. Shows:
- What scope is and why it matters
- How to create scope documents
- Approval process for out-of-scope features
- Templates for different project types
- Scope management checklist

### 2. **SCOPE_SETUP.md**
Quick 10-minute setup guide. Includes:
- Exact file structure needed
- Templates for scope.md, backlog.md, decisions.md
- How agents use scope files
- Template for approval requests
- Common scenarios

## Files Updated

### AGENTS-generic.md
- Changed "V1 scope" → "approved scope"
- Updated scope approval process to reference docs/scope.md
- Made approval process more specific (product value, why current scope insufficient, impact, maintenance)

### coding-agent-instructions-generic.md
- Changed "V1 scope" → "approved scope"
- Updated to reference docs/scope.md
- Made scope check part of before-starting-work

### working-agreement-generic.md
- Changed "V1/V2" → "approved/out-of-scope"
- Expanded approval process with specific documentation requirements
- Added reference to scope docs

### README.md
- Added quick setup instructions (create docs/scope.md, etc.)
- Added link to SCOPE_SETUP.md

## Core Concept

Instead of:
```
V1: Authentication, CRUD, basic API
V2: Payments, analytics, social features
```

Now use:
```
docs/scope.md: Currently approved features
docs/backlog.md: Future/deferred features
docs/decisions.md: Why decisions were made
```

This is more flexible and works for:
- Any iteration/phase naming convention
- Any product type (web, API, data, etc.)
- Any approval process (product lead, CTO, team consensus, etc.)

## Approval Process (Updated)

When a feature is outside approved scope:

1. **Check docs/scope.md** — Is it approved?
2. **Check docs/backlog.md** — Is it in future features?
3. **If out of scope, document:**
   - Product/user value
   - Why current scope is insufficient
   - Privacy/security impact
   - Implementation effort (days)
   - Files/systems affected
   - Ongoing maintenance cost
4. **Get approval** from decision maker (title customizable)
5. **Update scope docs:**
   - Move from backlog → scope, OR
   - Add to backlog, OR
   - Reject and close
6. **Record decision** in docs/decisions.md with approval date/approver

## How Teams Use This

### Team A (Web App)
- docs/scope.md: Features for MVP release
- docs/backlog.md: Features for v1.1, v1.2
- docs/decisions.md: Why certain things deferred

### Team B (API Platform)
- docs/scope.md: API v1 endpoints
- docs/backlog.md: API v2 features
- docs/decisions.md: Architectural decisions

### Team C (Data Pipeline)
- docs/scope.md: Current pipeline features
- docs/backlog.md: Future data sources
- docs/decisions.md: Why certain sources excluded

## Files Now in Generic Framework

```
generic-agent-framework/
├── README.md
├── QUICKSTART.md
├── FRAMEWORK_GUIDE.md
├── AGENTS-generic.md (UPDATED)
├── coding-agent-instructions-generic.md (UPDATED)
├── working-agreement-generic.md (UPDATED)
├── quality-gates-generic.md
├── definition-of-done-generic.md
├── component-boundary-contracts-generic.md
├── no-duplicate-policy-generic.md
├── backlog-format-generic.md
├── documentation-sync-generic.md
├── scope-management-generic.md (NEW)
└── SCOPE_SETUP.md (NEW)
```

## Key Benefits

✅ **More Generic** — Works with any project type and phase naming
✅ **Self-Contained** — Scope tracking is part of framework
✅ **Explicit** — Decisions documented and traceable
✅ **Flexible** — Teams customize for their context
✅ **Scalable** — Works for startups to enterprises

## Usage

1. **Read**: [SCOPE_SETUP.md](generic-agent-framework/SCOPE_SETUP.md) (10 min)
2. **Create**: Your docs/scope.md, docs/backlog.md, docs/decisions.md
3. **Reference**: Update AGENTS.md to point to your scope doc
4. **Use**: Agents check scope before starting work

## Next Steps

1. Create your scope documents using SCOPE_SETUP.md template
2. Update path references in AGENTS.md (docs/scope.md)
3. Customize decision maker titles
4. Share SCOPE_SETUP.md with team for onboarding

---

All files are in `generic-agent-framework/` folder and ready to use.
