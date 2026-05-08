# Generic Agent Framework - Complete Guide

This comprehensive guide explains how the generic agent framework files work together and how to adapt them for your project.

## Framework Overview

The generic agent framework provides a complete governance system for managing code quality, scope control, and documentation synchronization. It was designed based on real-world experience managing complex multi-app systems with strict security and privacy requirements.

### Core Problem It Solves

- **Scope creep**: Without clear scope boundaries, features expand beyond planned
- **Documentation drift**: Docs get out of sync with code, becoming unreliable
- **Code duplication**: Security-sensitive logic gets duplicated, creating vulnerabilities
- **Quality inconsistency**: Different agents follow different standards
- **Untracked progress**: No single source of truth for what's been done

### How It Solves It

1. **Single source of truth** for progress (one status doc, not scattered notes)
2. **Mandatory quality gates** that prevent incomplete work from merging
3. **Clear component boundaries** that prevent architectural chaos
4. **Strict scope control** with explicit approval for changes
5. **Documentation synchronization** keeping code and docs together

---

## File Structure and Relationships

```
generic-agent-framework/
├── README.md                                    # Start here
├── FRAMEWORK_GUIDE.md                           # This file
├── AGENTS-generic.md                            # Operating contract & quick checklist
├── coding-agent-instructions-generic.md         # Detailed workflow
├── quality-gates-generic.md                     # Pipeline checks & coverage
├── component-boundary-contracts-generic.md      # Architecture patterns
├── definition-of-done-generic.md                # Completion checklists
├── no-duplicate-policy-generic.md               # Code reuse rules
├── working-agreement-generic.md                 # Team rules & non-negotiables
├── backlog-format-generic.md                    # Story structure
└── documentation-sync-generic.md                # Keeping docs current
```

### File Dependencies

```
AGENTS-generic.md
    ↓
    ├─→ coding-agent-instructions-generic.md
    ├─→ quality-gates-generic.md
    ├─→ component-boundary-contracts-generic.md
    ├─→ definition-of-done-generic.md
    ├─→ no-duplicate-policy-generic.md
    └─→ working-agreement-generic.md

Documentation-sync-generic.md
    ↓
    └─→ (integrates with all files)

backlog-format-generic.md
    ↓
    └─→ (used when creating stories)
```

---

## How to Use This Framework

### Phase 1: Choose Your Framework
- Read [README.md](README.md) to understand the core concepts
- Review this guide to see how files relate

### Phase 2: Customize for Your Project
1. Copy `generic-agent-framework/` to your project's `docs/agent/`
2. Remove the `-generic` suffix from all filenames
3. Update placeholder sections marked with `[YOUR_...]`

### Phase 3: Create Your Project-Specific Documents
- Create `docs/progress-tracking.md` (single source of truth)
- Create `docs/architecture/technical-decisions.md`
- Create `docs/product/v1-scope.md`
- Create `docs/product/out-of-scope.md`

### Phase 4: Train Your Team
- Share the main AGENTS.md with all engineers
- Have agents read AGENTS.md before starting work
- Review coding-agent-instructions.md as onboarding
- Reference definition-of-done.md during code reviews

### Phase 5: Iterate and Improve
- Collect feedback from agents
- Update rules based on what works/doesn't work
- Keep improving as you learn

---

## File Purposes and When to Use

### [AGENTS-generic.md](AGENTS-generic.md)
**Purpose**: Operating contract and quick checklist
**When to use**: 
- Daily reference by agents
- Starting point for new engineers
- Quick checklist before work (√ these boxes)
**Customize**:
- Your progress tracking file path
- Your architecture defaults
- Your quality gate commands
- Examples for your domain

### [coding-agent-instructions-generic.md](coding-agent-instructions-generic.md)
**Purpose**: Detailed agent workflow and starting point
**When to use**:
- Onboarding new engineers
- Need detailed explanation of workflow
- Understanding code organization patterns
**Customize**:
- Your implementation roadmap file path
- Your code structure and patterns
- Your tech stack defaults

### [quality-gates-generic.md](quality-gates-generic.md)
**Purpose**: Pipeline checks and coverage requirements
**When to use**:
- Setting up CI/CD pipeline
- Defining what "done" means
- Making coverage decisions
**Customize**:
- Your test commands (npm/pnpm/pytest/etc)
- Your coverage threshold (80% is suggested)
- Your CI system (GitHub Actions/GitLab/Jenkins/etc)
- Your build/lint/typecheck commands

### [component-boundary-contracts-generic.md](component-boundary-contracts-generic.md)
**Purpose**: Architecture patterns and file ownership
**When to use**:
- Planning new features
- Reviewing large changes
- Preventing architectural drift
- Deciding where code should live
**Customize**:
- Your actual file structure (replace generic example)
- Your naming conventions
- Your framework(s) (React/Vue/Angular/etc)
- Your responsibility patterns

### [definition-of-done-generic.md](definition-of-done-generic.md)
**Purpose**: Completion checklists for different artifact types
**When to use**:
- Code review (checklist for reviewers)
- Verifying task completion
- Preventing incomplete work
**Customize**:
- Add/remove categories for your tech stack
- Add project-specific requirements
- Adjust for your architecture
- Add accessibility requirements

### [no-duplicate-policy-generic.md](no-duplicate-policy-generic.md)
**Purpose**: Code reuse rules and single sources of truth
**When to use**:
- Starting new feature (search for existing patterns)
- Code review (flag duplicated logic)
- Planning refactoring
**Customize**:
- Your actual high-risk areas
- Your shared library structure
- Your critical code patterns

### [working-agreement-generic.md](working-agreement-generic.md)
**Purpose**: Team rules and non-negotiables
**When to use**:
- Team discussions about standards
- Handling disagreements
- Training new engineers
**Customize**:
- Your non-negotiables
- Your approval process
- Your team culture

### [backlog-format-generic.md](backlog-format-generic.md)
**Purpose**: Story/feature/epic structure
**When to use**:
- Creating new tasks
- Planning sprints
- Breaking down work
**Customize**:
- Your story format (some teams use different structure)
- Your test categories
- Your quality gates checklist

### [documentation-sync-generic.md](documentation-sync-generic.md)
**Purpose**: Keeping docs in sync with code
**When to use**:
- Before committing code
- During code review
- Maintaining documentation
**Customize**:
- Your doc files and paths
- Your commit message format
- Your documentation review process

---

## Customization Checklist

Before using the framework, customize these sections:

### In AGENTS-generic.md
- [ ] Progress tracking file path (e.g., docs/progress.md)
- [ ] Scope file path (e.g., docs/scope.md)
- [ ] Implementation roadmap path
- [ ] Architecture defaults (languages, frameworks, databases)
- [ ] Phase/iteration names (replace "Phase" terminology if needed)
- [ ] Quality gate commands
- [ ] Decision maker title (Product Owner/Tech Lead/CTO/etc.)

### In coding-agent-instructions-generic.md
- [ ] Project README and glossary paths
- [ ] Implementation roadmap path
- [ ] Code organization structure
- [ ] Shared library locations
- [ ] Tech stack details

### In quality-gates-generic.md
- [ ] Lint command
- [ ] Typecheck command
- [ ] Test command
- [ ] Coverage command
- [ ] Build command
- [ ] Contract validation command
- [ ] Migration command
- [ ] Coverage threshold (80% is default)

### In component-boundary-contracts-generic.md
- [ ] Your actual file structure (replace generic example)
- [ ] Your naming conventions
- [ ] Your framework details (React/Vue/Django/etc)
- [ ] Your responsibility patterns
- [ ] Your shared library path
- [ ] Your test patterns

### In definition-of-done-generic.md
- [ ] Add artifact types specific to your project
- [ ] Remove irrelevant categories
- [ ] Customize for your frameworks
- [ ] Add accessibility requirements
- [ ] Add your critical concerns

### In no-duplicate-policy-generic.md
- [ ] Your actual high-risk areas
- [ ] Your shared library structure
- [ ] Your critical patterns
- [ ] Your single sources of truth

### In working-agreement-generic.md
- [ ] Your approval process
- [ ] Your non-negotiables
- [ ] Your team expectations
- [ ] Your escalation path

### In backlog-format-generic.md
- [ ] Your quality gates checklist
- [ ] Your test categories
- [ ] Example from your domain
- [ ] Your dependencies tracking

### In documentation-sync-generic.md
- [ ] Your documentation file paths
- [ ] Your commit message format
- [ ] Your documentation structure
- [ ] Your review process

---

## Implementation Roadmap

### Week 1: Setup
- [ ] Copy framework to `docs/agent/` directory
- [ ] Remove `-generic` suffix from filenames
- [ ] Create progress tracking document
- [ ] Create architecture decision log
- [ ] Create product scope document

### Week 2: Customize
- [ ] Update all placeholder sections
- [ ] Adjust for your tech stack
- [ ] Add your file structure examples
- [ ] Adjust coverage thresholds
- [ ] Add your accessibility requirements

### Week 3: Train
- [ ] Share AGENTS.md with team
- [ ] Review with agents in standup
- [ ] Collect initial feedback
- [ ] Answer questions
- [ ] Make first refinements

### Week 4: Iterate
- [ ] Refine based on feedback
- [ ] Add more specific examples
- [ ] Document edge cases
- [ ] Keep iterating with team

---

## Key Metrics to Track

Once implemented, monitor these metrics:

| Metric | Target | How to Track |
|--------|--------|--------------|
| Test coverage | 80%+ | CI reports |
| Pipeline success rate | >95% | CI history |
| Time to review | <24h | PR timestamps |
| Scope change requests | <3 per phase | Issue history |
| Documentation drift | 0 | Manual review |
| Duplicate code | Decreasing | Code analysis |

---

## Success Indicators

You're using the framework successfully when:

✅ **Code Quality**
- Failing tests are caught in CI, not production
- Coverage stays above threshold
- Code duplication decreases over time

✅ **Organization**
- New engineers understand expectations immediately
- Scope stays controlled without constant battles
- Progress tracking is reliable

✅ **Documentation**
- Docs stay in sync with code
- Engineers reference docs frequently
- Onboarding new people is faster

✅ **Team Efficiency**
- Fewer code review rounds
- Fewer regressions
- Faster task completion

---

## Common Pitfalls to Avoid

❌ **Don't:**
- Customize too much on day 1 (use defaults first)
- Skip the progress tracking file (it's critical)
- Ignore quality gates to ship faster
- Let documentation drift from code
- Forget to update docs when code changes

✅ **Do:**
- Start with the defaults
- Create progress tracking immediately
- Make quality gates mandatory
- Update docs in same commit as code
- Review and refine after 1-2 months

---

## Getting Help with This Framework

If you have questions:

1. **Understanding the framework**: Read README.md and this guide
2. **Agent workflow**: See coding-agent-instructions-generic.md
3. **Quality standards**: See definition-of-done-generic.md and quality-gates-generic.md
4. **Architecture**: See component-boundary-contracts-generic.md
5. **Scope decisions**: See AGENTS-generic.md and working-agreement-generic.md

---

## Framework Evolution

This framework is not static. You should:

- Update rules based on what works in your context
- Add project-specific guidance
- Remove rules that don't fit
- Share improvements with your team
- Document why rules exist (so they're not arbitrarily changed)

Keep the spirit of the framework:
- **Single source of truth** for progress
- **Mandatory quality gates**
- **Clear component boundaries**
- **Strict scope control**
- **Documentation synchronization**

The specific rules and examples should evolve with your project.

