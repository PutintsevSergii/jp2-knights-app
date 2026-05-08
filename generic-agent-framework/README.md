# Generic Agent Framework

This folder contains reusable agent governance files, quality standards, and workflow patterns that can be adapted for any software project.

## Overview

The framework provides:
- **Workflow patterns** for phase-based implementation with scope control
- **Quality gate standards** for code quality, testing, and coverage
- **Component boundary contracts** for maintaining clean architecture
- **Documentation rules** for keeping docs in sync with code
- **Definition of Done** checklists for different artifact types
- **Testing matrices** for coverage requirements

## Files in This Framework

1. **[AGENTS-generic.md](AGENTS-generic.md)** — Operating contract and quick checklist for coding agents
2. **[coding-agent-instructions-generic.md](coding-agent-instructions-generic.md)** — Detailed agent workflow and starting point
3. **[quality-gates-generic.md](quality-gates-generic.md)** — Mandatory pipeline checks and coverage requirements
4. **[component-boundary-contracts-generic.md](component-boundary-contracts-generic.md)** — Architecture patterns and file ownership
5. **[definition-of-done-generic.md](definition-of-done-generic.md)** — Done checklists for different artifact types
6. **[no-duplicate-policy-generic.md](no-duplicate-policy-generic.md)** — Security-critical code reuse rules
7. **[working-agreement-generic.md](working-agreement-generic.md)** — Rules and non-negotiables for agents
8. **[backlog-format-generic.md](backlog-format-generic.md)** — Story/epic/feature structure
9. **[documentation-sync-generic.md](documentation-sync-generic.md)** — How to keep docs in sync with code
10. **[scope-management-generic.md](scope-management-generic.md)** — How to define and maintain scope boundaries

## Quick Setup (5 minutes)

Before adapting the framework:

1. **Create `docs/scope.md`** — List your approved features
   - See [SCOPE_SETUP.md](SCOPE_SETUP.md) for template
2. **Create `docs/backlog.md`** — List future/deferred features
3. **Create `docs/decisions.md`** — Record why scope decisions were made

Then adapt the framework files to reference your actual scope docs.

## How to Adapt This Framework

### Step 1: Create Project-Specific Versions
Copy the generic files to your project's `docs/agent/` folder and rename/customize:

```bash
cp -r generic-agent-framework/* your-project/docs/agent/
# Then edit to match your project
```

### Step 2: Customize Key Sections

**In AGENTS-generic.md:**
- Replace `[docs/traceability.md](docs/traceability.md)` with your project's progress tracking file
- Update architecture defaults to match your tech stack (frameworks, databases, etc.)
- Customize phase names and scope examples
- Update quality gate command examples

**In quality-gates-generic.md:**
- Update standard completion commands to match your build system
- Customize coverage requirements (80% is a good default, adjust if needed)
- Add/remove extra gates for your tech stack

**In component-boundary-contracts-generic.md:**
- Replace mobile/admin/shared patterns with your actual project structure
- Update file path conventions and naming patterns
- Customize component ownership rules for your architecture

**In definition-of-done-generic.md:**
- Add/remove categories for your project (e.g., GraphQL instead of REST API)
- Customize accessibility requirements
- Update database-specific rules (e.g., MongoDB vs PostgreSQL)

### Step 3: Create Your Project-Specific Documents

**docs/traceability.md:**
- Phase matrix with requirements
- Current implementation progress narrative
- Mapping of requirements to APIs/screens/data/tests

**docs/delivery/IMPLEMENTATION_STATUS.md:**
- Executive Summary table (phases and progress)
- Phase Status Details (completed/in-progress items)
- Quality Gate Status (test coverage, lint, typecheck)

**docs/architecture/technical-decisions.md:**
- Record major architectural decisions
- Document why certain tech choices were made

**docs/product/v1-scope.md:**
- Approved V1 features and requirements
- Clear boundaries of what's included

---

## Core Framework Concepts

### 1. Single Source of Truth
Keep one document as the canonical source for progress. This prevents drift between:
- What's been implemented
- What tests were added
- What docs were updated

### 2. Phase-Based Scope Control
- Divide work into phases with clear boundaries
- Track which requirements are in V1 vs V2
- Require explicit approval for scope changes
- Update all affected docs in the same commit as code

### 3. Mandatory Quality Gates
- Define which commands must pass before task completion
- Coverage requirements (80% minimum is recommended)
- No tests skipped to make gates pass
- Generated artifacts produced by build system, not local state

### 4. No Duplicate Policy
For security-sensitive code (roles, permissions, visibility filters), enforce:
- One implementation of each concept
- Shared libraries for common concerns
- Regular searches before creating new code
- Move repeated patterns to shared code during phase work

### 5. Component Boundary Contracts
Document the ownership and responsibilities of major files:
- What each file is responsible for
- What it must NOT do
- What shared patterns it uses
- Which tests cover it

### 6. Documentation Synchronization
- Code changes, tests, and docs in the same commit
- Progress tracking file updated with completion
- Architecture docs updated when decisions change
- No orphaned or stale documentation

---

## Usage Examples

### Adapting for a Web-Only Project
1. Remove mobile-specific patterns from component boundaries
2. Update quality gates to remove app shell/notification checks
3. Keep REST/GraphQL API patterns, adjust to your choice
4. Use the same phase-based scope control approach

### Adapting for a Monorepo
1. Keep the phase-based scope control
2. Update component boundaries to match your monorepo structure
3. Customize quality gates for your build system (Nx, Turbo, etc.)
4. Same definition of done patterns apply

### Adapting for a Data/ML Project
1. Phase-based scope still applies (e.g., data pipeline phases)
2. Definition of Done includes data quality checks, not UI rendering
3. Component boundaries apply to model/training/serving separation
4. Quality gates focus on model accuracy, data validation, not coverage%

---

## Recommendations

✅ **Always keep:**
- Phase-based scope control
- Single source of truth for progress
- Mandatory quality gates
- Documentation sync with code
- No duplicate policy for critical code

⚠️ **Customize freely:**
- Phase names and scope boundaries
- Specific tech stack commands
- Coverage percentage minimums
- File naming conventions
- Organizational terminology

📋 **Review checklist before using:**
- [ ] Read AGENTS-generic.md to understand the framework
- [ ] Identify your project's phases and scope
- [ ] List your quality gate commands
- [ ] Map your file structure to component boundaries
- [ ] Define what "Definition of Done" means for your artifacts
- [ ] Create your project's progress tracking document
- [ ] Customize all generic files for your context
- [ ] Share with your team and iterate

---

## Framework Origin

This framework is adapted from the JP Project's agent governance approach, which successfully managed:
- Multi-role permission systems (Guest, Candidate, Brother, Officer, Admin)
- Privacy-sensitive data (prayer groups, event participation)
- Mobile (React Native/Expo) and Web (Next.js) applications
- Complex visibility filters (organizational units, roles)
- Phase-based feature rollout with strict scope control

The principles have been generalized to apply to any software project.

