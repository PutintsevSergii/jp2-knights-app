# AGENTS Operating Contract (Generic)

This file is the operating contract for coding agents working on your project.

## 📋 Quick Checklist for Coding Agents

**Before starting work**:
- ✅ Check progress tracking doc — what phase are we in?
- ✅ Read phase scope in implementation roadmap
- ✅ Search repo for existing patterns and shared code
- ✅ Run quality gates: `[YOUR_COMMAND]` (e.g., `pnpm quality`, `npm test`, etc.)

**While implementing**:
- ✅ Keep critical logic server-side (never client-side only)
- ✅ Update contracts/DTOs/OpenAPI if changing APIs
- ✅ Add tests for new logic (minimum coverage requirement)
- ✅ Update progress tracking doc as you complete requirements

**Before submitting work**:
- ✅ All quality gates pass
- ✅ Progress tracking doc updated with what's done
- ✅ Implementation status doc updated to reflect progress
- ✅ Relevant doc updates in same commit
- ✅ Final response includes test results and coverage

---

## Start Here — Full Setup

**⭐ CANONICAL SOURCE FOR PROGRESS**: [docs/progress-tracking.md] (customize this path)

1. Read your project's README and glossary/terminology docs
2. **Check progress tracking doc** — the ONE source of truth for:
   - What phase we're in right now
   - What's already implemented
   - What requirements are mapped to code/tests/docs
3. Read getting-started guide for engineers
4. Read the canonical docs for the current task: scope, requirements, API, data, and visual specs
5. Check decision log to understand why key choices were made
6. Search the repository before creating new code. Reuse existing contracts, utilities, tests, and patterns.

**After completing a task or phase**: Update progress tracking doc with what you accomplished

## Architecture Defaults

- **Language**: [Your primary language, e.g., TypeScript]
- **Package manager**: [npm/pnpm/yarn]
- **Framework**: [Backend framework, e.g., NestJS, Django, Spring]
- **Frontend**: [Frontend framework, e.g., React, Vue, Next.js]
- **Database**: [Primary database, e.g., PostgreSQL, MongoDB]
- **Testing**: [Test framework, e.g., Jest, Vitest, Pytest]
- **API format**: [REST, GraphQL, gRPC]
- **Validation**: [Zod, Joi, Yup, or language equivalent]

## ⛔ Non-Negotiables (Hard Rules)

### Scope
- Keep **current scope** (see [docs/scope.md](docs/scope.md)) disciplined. If a feature is outside the approved scope and has a strong product, security, or architectural argument, pause implementation and ask the human owner for permission with the rationale, tradeoffs, and impact.
- Implement approved scope changes only after the human owner gives explicit permission and the relevant scope/backlog docs are updated in the same change.
- **Never silently add** features outside approved scope without explicit permission

### Security & Privacy
- **Server-side enforcement**: Critical logic is never enforced client-side only
- **Duplication prevention**: Security-sensitive logic has a single source of truth (shared library)
- **Data protection**: Implement privacy controls correctly from the start; do not add them as an afterthought
- **Scope guarantees**: If data access implies different scoping than documented, pause and ask for clarification

### Data Handling
- Entities are archived/deactivated instead of destructively deleted unless explicitly approved
- Mitigate identified risks per [docs/risk-and-mitigation.md] (customize path)

### UI & Styling
- No hardcoded styling values in components. Use shared design tokens
- During design-to-code implementation, do not fake missing functionality in the UI. Missing behavior must be implemented in correct layer first

### Status Tracking
- **Update progress doc in the same commit as your code changes.** This is THE source of truth for progress
- Never leave status docs out of sync with implementation

## Coding Workflow

1. Identify the phase and requirement IDs
2. Read existing code/tests/docs for the same module
3. Make the smallest cohesive change that satisfies the requirement
4. Update contracts/DTOs/OpenAPI/schemas, generated clients, migrations, seeds, tests, docs, and progress tracking in the same change when affected
5. Update demo fixtures when data shapes, roles, visibility, or workflows change
6. Update design tokens/component variants when styling changes
7. Add or update tests that would fail without the change
8. Run quality gates before completing the task

## Quality Gates

Run your project's configured quality checks. Mandatory gates typically include:
- Lint
- Type checking
- Tests
- Test coverage (minimum 80% recommended for statements, branches, functions, and lines)
- Build
- Contract generation/validation
- Database migration validation
- Relevant smoke/integration tests

Never mark a task complete with a red pipeline. Do not skip, weaken, or delete tests to make the pipeline green.

## Documentation Rules

- Behavior changes update docs in the same change
- Requirement/API/data mapping changes update progress tracking doc
- Technical decision changes update architecture decision log
- Approved scope changes update scope docs and backlog

## Final Response Requirements

Every completed coding task must report:

- short summary of exactly what was done
- what changed
- which requirement/phase it satisfies
- quality gates run and results
- coverage result after the change (statement, branch, function, line)
- how many tests were added or changed, which tests were run, and what behavior those tests cover
- whether TDD was used (failing test first, then implementation) or why not
- migrations/contracts/docs updated
- any residual risk or explicit owner-approved exception

## Approval Process for Out-of-Scope Changes

When a feature outside approved scope is proposed:

1. **Pause implementation** — do not code anything yet
2. **Document the case** in your scope/backlog tracking with:
   - **Product/User Value**: Why do users need this? What problem does it solve?
   - **Why Current Scope is Insufficient**: Why can't we defer this to future phases?
   - **Technical Impact**: How many files change? How many engineer days?
   - **Risk Impact**: Does this introduce new risks to security, privacy, or operations?
   - **Maintenance Impact**: What ongoing cost does this create?
3. **Request explicit approval** from the human owner (Product Owner, Lead Architect, or decision maker)
4. **Get written confirmation** (documented in task/PR/issue; saved for record)
5. **Update scope docs** before or with the implementation:
   - Update approved scope list (or current phase scope)
   - Update backlog/future features list if deferring
   - Reference the approval in decision log
6. **Proceed with implementation** only after approval and docs are updated
