# Quick Start: Adapting the Framework for Your Project

This guide walks you through adapting the generic agent framework in 30 minutes.

## Step 1: Copy the Files (2 min)

```bash
# In your project root
mkdir -p docs/agent
cp -r generic-agent-framework/* docs/agent/
cd docs/agent

# Rename files (remove -generic suffix)
for file in *-generic.md; do mv "$file" "${file%-generic.md}.md"; done

# Check the result
ls -la docs/agent/
```

## Step 2: Quick Edit AGENTS.md (5 min)

Open `docs/agent/AGENTS.md` and find/replace:

| Find | Replace With |
|------|--------------|
| `[docs/traceability.md]` | `[docs/progress.md]` (or your file) |
| `[YOUR_COMMAND]` | `npm run quality` or equivalent |
| `TypeScript strict mode, pnpm, Nx` | Your stack (e.g., Python, Django, PostgreSQL) |

Example:
```markdown
# Before
Run quality gates: `[YOUR_COMMAND]` (e.g., `pnpm quality`, `npm test`, etc.)
Architecture Defaults: TypeScript strict mode, pnpm, Nx, Expo React Native...

# After
Run quality gates: `npm run test:all` 
Architecture Defaults: Python 3.11, Django, PostgreSQL, React 18...
```

## Step 3: Quick Edit quality-gates-generic.md (5 min)

Find the "Standard Completion Commands" section and update:

```bash
# Find this
[YOUR_LINT_COMMAND]
[YOUR_TYPECHECK_COMMAND]
[YOUR_TEST_COMMAND]

# Replace with your actual commands
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
```

## Step 4: Quick Edit component-boundary-contracts-generic.md (8 min)

Find the "Common Architecture Pattern" section and replace with YOUR structure.

### Example: Python/Django Project

Replace:
```
backend/
├── src/
│   ├── api/
│   │   └── [feature]/routes.ts
```

With:
```
backend/
├── app/
│   ├── [feature]/
│   │   ├── views.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── tests.py
```

### Example: Node/Express Project

Replace frontend patterns with:
```
frontend/
├── src/
│   ├── pages/
│   │   └── [feature].tsx
│   ├── api/
│   │   └── [feature].ts
│   └── components/
```

## Step 5: Create Your Scope Doc (5 min)

Create `docs/scope.md`:

```markdown
# Approved Scope - [Your Phase/Iteration]

## What's Included
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## What's Excluded
- Feature X (deferred to Phase 2)
- Feature Y (out of scope)
```

Reference this in AGENTS.md when you update the paths.

## Step 5b: Create Your Progress Doc (5 min)

Create `docs/progress.md`:

```markdown
# Project Progress Tracking

## Current Phase: Phase 1 - Foundation

### Completed
- ✅ Project setup (git, package managers, CI/CD)
- ✅ Database schema design
- ✅ API structure and routing

### In Progress
- 🟡 Authentication service
- 🟡 Basic CRUD endpoints

### Not Started
- ⚪ Frontend UI
- ⚪ Advanced features

## Requirement Tracking

| Requirement | Status | Tests | Notes |
|-------------|--------|-------|-------|
| User auth | 🟡 In Progress | ✅ 8/12 | Service done, API 50% |
| User profile | ⚪ Not Started | ❌ 0/6 | Depends on auth |
| Data export | ⚪ Not Started | ❌ 0/4 | Phase 2 |
```

## Step 6: Verify Quality Gates (3 min)

List your actual quality gate commands:

```bash
# Check what works in your project
npm run lint --help     # or your linter
npm run test --help     # or your test runner
npm run build --help    # or your build tool

# Update quality-gates-generic.md with actual commands
```

## Step 7: Test It Out (2 min)

Create a sample story using `backlog-format-generic.md`:

```markdown
## Story
As a developer, I want to implement the user auth API endpoint, so that the mobile app can authenticate users.

## Acceptance Criteria
- Given valid credentials, when I call POST /api/auth/login, then I receive a JWT token
- Given invalid credentials, when I call POST /api/auth/login, then I receive 401 error

## Tests Required
- Unit: password hashing and validation
- Integration: API endpoint with valid/invalid credentials
- Permission: unauthenticated users can call endpoint

## Quality Gates
- npm run lint ✅
- npm run typecheck ✅
- npm run test ✅
- npm run test:coverage ✅ (80% minimum)
- npm run build ✅
```

## Done! 

You now have a customized agent framework for your project. Share AGENTS.md with your team.

---

## Common Customizations

### For Python/Django Projects

**In quality-gates-generic.md:**
```bash
# Replace with:
pylint app/
mypy app/
pytest
pytest --cov=app
python manage.py check
```

**In component-boundary-contracts-generic.md:**
```
app/
├── [feature]/
│   ├── views.py
│   ├── models.py
│   ├── serializers.py
│   └── tests.py
```

### For Go Projects

**In quality-gates-generic.md:**
```bash
# Replace with:
golangci-lint run
go test ./...
go test ./... -cover
go build
```

### For Monorepo (Nx)

**In AGENTS.md:**
```markdown
pnpm nx affected -t lint,typecheck,test,build
```

### For GraphQL (instead of REST)

**In quality-gates-generic.md:**
```bash
graphql-schema validate
graphql-codegen
```

### For Mobile (React Native)

**In quality-gates-generic.md:**
```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build:ios
npm run build:android
npm run e2e
```

---

## Next Steps

1. Share the customized AGENTS.md with your team
2. Set up CI/CD to enforce quality gates
3. Create your progress tracking document
4. Have agents read the docs before starting work
5. Collect feedback and iterate

That's it! You're ready to use the framework.

