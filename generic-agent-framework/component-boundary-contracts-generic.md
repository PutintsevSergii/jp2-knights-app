# Component Boundary Contracts (Generic)

This document is the working checklist for keeping feature code organized and responsibilities clear. Use it before adding or changing major components, services, routes, API clients, or shared code.

## Required Flow

Before implementation:

1. Identify the requirement ID, phase, and context
2. Search for existing implementations, patterns, and reusable code
3. Write or update the feature contract in this document when the change adds a new major component, service, or cross-system orchestration
4. Keep root/shell files as composition points only. Do not add feature-specific logic, repeated patterns, or role-specific behavior to them
5. Add tests at the same boundary where behavior lives

During implementation:

- Split by responsibility first, not by file length
- Prefer the existing package/module pattern over inventing new frameworks
- Keep critical logic where it belongs (e.g., permissions on backend, not frontend)
- For frontend: keep exported components one-per-file
- Do not keep reusable helper components inside feature files. Move shared components to shared folder
- Before adding any shared component, inspect and update the shared component inventory
- Update progress tracking when boundary changes affect phase progress

## Split Triggers

Create a separate module/component when any of these are true:

- A root or shell file would exceed 150-200 lines with feature-specific code
- A route/page would exceed 250-300 lines, own multiple responsibilities, or repeat patterns
- A file needs network access, persistence, permission checks, or DTO parsing. Those belong outside render components
- A feature file starts gaining concrete builders, state logic, or formatter functions
- Two or more screens/pages need the same header, nav item, state panel, card, or form field
- A new implementation would add a second copy of role, visibility, error, or design-token logic
- A component file starts accumulating local component functions. Components belong in dedicated files

## Feature Contract Template

Use this shape when adding a new boundary entry:

```markdown
### <Feature Or Component Name>

| Field                      | Contract |
| -------------------------- | -------- |
| Requirement/phase          | ID and phase, e.g., FR-001, Phase 1 |
| Data/API source            | Where data comes from (API endpoint, DB query, external service) |
| Business logic             | File that owns core logic, calculations, state transitions |
| Route/page owner           | File that owns routing state, data loading, navigation |
| Renderer components        | React/Vue/etc components that receive data and callbacks |
| Shared components/tokens   | Which shared UI pieces and token roles are used |
| Tests                      | Unit, integration, E2E test coverage |
| Forbidden responsibilities | What must NOT be added here |
| Scope guard                | V1/V2 boundary and excluded behaviors |
```

## Common Architecture Pattern

### Backend Services
```
backend/
├── src/
│   ├── api/                      # HTTP/REST/GraphQL boundary
│   │   └── [feature]/routes.ts   # Routes, middleware, auth
│   ├── services/                 # Business logic
│   │   └── [feature].service.ts  # Core workflows, calculations
│   ├── repositories/             # Data access
│   │   └── [feature].repo.ts     # Queries, filters
│   ├── models/                   # Data models
│   │   └── [feature].ts          # Type definitions
│   ├── shared/
│   │   ├── auth/                 # Auth, permissions, roles
│   │   ├── types/                # DTOs, enums, validation
│   │   ├── utils/                # Shared helpers
│   │   └── errors/               # Error handling, logging
│   └── tests/
│       ├── [feature].service.test.ts
│       ├── [feature].routes.test.ts
│       └── [feature].repo.test.ts
```

### Frontend Application
```
frontend/
├── src/
│   ├── screens/ or pages/        # Top-level pages
│   │   ├── [feature]/
│   │   │   ├── index.tsx         # Page composition
│   │   │   ├── [feature].model.ts  # Data shape, business logic
│   │   │   └── hooks/            # Feature-specific hooks
│   ├── components/
│   │   ├── [feature]/            # Feature-specific components
│   │   └── shared/               # Reusable across features
│   │       └── README.md         # Component inventory
│   ├── api/                      # API integration
│   │   └── [feature].client.ts   # API calls, types
│   ├── hooks/                    # Shared custom hooks
│   └── tests/
│       ├── screens/
│       ├── components/
│       └── api/
```

### Shared Libraries
```
libs/shared/
├── auth/                         # Auth, permissions, roles
│   ├── useAuth.ts               # Auth hook
│   ├── permissions.ts           # Permission checks
│   └── roles.ts                 # Role definitions
├── types/                        # Shared DTOs, enums
│   └── index.ts
├── validators/                   # Data validation
├── components/                   # Shared UI components
│   └── README.md                # Component inventory
├── design-tokens/               # Styling constants
└── utils/                        # Shared utilities
```

## Component Responsibility Rules

### API Routes/Controllers
- ✅ Handle HTTP boundary (request/response)
- ✅ Authenticate and authorize
- ✅ Call service layer for business logic
- ✅ Return validated response
- ❌ Do not duplicate permission logic (use shared)
- ❌ Do not implement business rules

### Services/Business Logic
- ✅ Implement workflows and calculations
- ✅ Call repositories for data access
- ✅ Enforce business rules
- ✅ Handle transactions
- ❌ Do not access database directly (use repositories)
- ❌ Do not know about HTTP/REST details

### Repositories/Data Access
- ✅ Query and persist data
- ✅ Build database queries
- ✅ Apply filters and sorting
- ❌ Do not implement business logic
- ❌ Do not handle transactions (service layer)

### Frontend Pages/Screens
- ✅ Own route state and navigation
- ✅ Load data for the page
- ✅ Handle page-level state
- ✅ Compose feature components
- ❌ Do not duplicate business logic
- ❌ Do not implement permission checks (use shared)

### Frontend Components
- ✅ Render UI with provided data
- ✅ Call callbacks for actions
- ✅ Use shared design tokens
- ✅ Handle loading/error/empty states
- ❌ Do not fetch data (page owns that)
- ❌ Do not check permissions
- ❌ Do not hardcode styling

### Shared Code
- ✅ Reusable across multiple features/apps
- ✅ Single source of truth for critical logic
- ✅ Well-documented and tested
- ❌ Do not duplicate elsewhere
- ❌ Do not contain feature-specific logic

## Checklist for New Features

Before implementing, answer these:

- [ ] Where does the data come from?
- [ ] Who owns loading the data (page/service)?
- [ ] Who owns business logic (service)?
- [ ] Who owns permission checks (shared/service)?
- [ ] What components will be reused vs. new?
- [ ] Does a shared component inventory need updating?
- [ ] What tests are needed and at what level?
- [ ] Are there existing patterns to reuse?
- [ ] Will this cause any file to exceed size limits?
- [ ] Is any critical logic duplicated elsewhere?

