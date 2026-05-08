# Coding Agent Instructions (Generic)

## How to Start

1. Check **progress tracking doc** — THE source of truth for what phase we're in and what's done
2. Read your project's README and glossary/terminology
3. Read product scope, roles, requirements relevant to your phase
4. Read the current phase in your implementation roadmap
5. Read API/data/visual spec docs relevant to that phase
6. Search the repo for existing helpers, DTOs, schemas, enums, UI patterns, guards, and tests before adding new code
7. Implement only that phase's scope

**After completing a phase**: Update progress tracking doc with progress and mark the phase complete

## Recommended Implementation Order

Follow your project's `implementation-roadmap.md` or equivalent.

## Task Creation

Break work into small stories with:
- Clear acceptance criteria (given/when/then format)
- Permission and visibility expectations
- Tests required (unit/integration/E2E)
- Out-of-scope notes
- Quality gates that must pass

## Validation

Run the quality gates for your project. Keep the workspace runnable. Do not mark work complete while lint, typecheck, tests, coverage, build, contract generation, migrations, or relevant smoke checks are failing.

## Decision Documentation

If implementation changes a documented contract, update the corresponding doc in the same change and explain why.

## Duplicate Prevention

- Reuse shared enums, DTOs, schemas, auth helpers, visibility utilities, API clients, design tokens, and UI components
- Do not create a second implementation of roles, visibility rules, error shapes, API clients, or other critical patterns
- If a new abstraction is needed, place it in the correct shared library
- Before adding a new dependency, prove that existing stack choices cannot reasonably solve the problem

## Avoid Overengineering

Do not silently add features outside approved scope (check [docs/scope.md](docs/scope.md)). If a feature becomes strongly justified, stop and ask the human owner for permission with:
- Product/user value and why current approved scope is insufficient
- Privacy, security, operational, and maintenance impact
- Docs, requirements, APIs, data, screens, tests, and progress tracking that would change

## Scope Change Process

When a feature outside approved scope appears necessary:

1. Check [docs/scope.md](docs/scope.md) to confirm it's actually out of scope
2. Explain the user/product value and why current approved scope is insufficient
3. Explain privacy, security, operational, and maintenance impact
4. Identify docs, requirements, APIs, data, screens, tests, and progress tracking that would change
5. Ask the human owner for explicit permission before coding
6. If approved, update scope/backlog docs and reference approval decision in same change

## Testing Requirements

- Write tests for new behavior
- Coverage minimum: 80% (statements, branches, functions, lines)
- Permission/visibility/role tests for security-sensitive features
- Integration tests where behavior crosses API/database/service boundaries
- Smoke tests for critical workflows

## Code Organization

### Shared Code (Single Source of Truth)
These should NEVER be duplicated:
- Role and permission definitions
- Visibility and access control rules
- Error handling and response shapes
- Data validation schemas
- API clients and generated types
- Authentication and authorization helpers
- Design tokens and styling constants

### Code Organization Pattern
```
your-project/
├── apps/                          # Separate apps (web, mobile, etc.)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── api/              # API routes/controllers
│   │   │   ├── services/         # Business logic
│   │   │   ├── repositories/     # Data access
│   │   │   └── models/           # Data models
│   │   └── tests/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── screens/          # Page components
│   │   │   ├── components/       # Shared components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   └── api/              # API integration
│   │   └── tests/
├── libs/
│   └── shared/                    # Shared across apps
│       ├── auth/                 # Auth, permissions, roles
│       ├── types/                # Shared types, DTOs, enums
│       ├── validators/           # Shared validation schemas
│       ├── components/           # Shared UI components
│       ├── design-tokens/        # Styling constants
│       └── utils/                # Shared utilities
├── docs/
│   ├── architecture/
│   │   ├── decisions.md          # Tech decision log
│   │   └── overview.md           # System architecture
│   ├── api/                      # API documentation
│   ├── product/                  # Product/scope docs
│   └── agent/                    # Agent governance
└── tests/
    ├── integration/              # Cross-system tests
    └── e2e/                      # End-to-end tests
```

## Documentation Best Practices

- Update docs when behavior changes
- Keep API documentation in sync with actual endpoints
- Document permission/visibility rules clearly
- Maintain a glossary for domain terms
- Record architectural decisions and tradeoffs
- Keep progress tracking doc current

