# Backlog Format (Generic)

Use this structure for creating implementation tasks/stories.

## Epic

Name of larger product area or domain.

Example: "User Authentication", "Payment Processing", "Search & Discovery"

## Feature

Specific capability or user-facing functionality.

Example: "Email sign-in", "Invoice generation", "Advanced filters"

## Story

As a [role], I want [action], so that [outcome].

### Example
- As a **user**, I want to **sign in with my email**, so that **I can access my account without a phone**
- As an **admin**, I want to **view a report of pending approvals**, so that **I can track what needs review**
- As a **developer**, I want to **reuse the auth component**, so that **I don't duplicate login logic**

## Acceptance Criteria

Use Given/When/Then format for behavioral criteria:

- Given [initial state], when [action], then [expected result]
- Given [role], when [accessing endpoint], then [permission result]
- Given [data state], when [operation], then [visibility result]
- Permission expectations (who can do what)
- Visibility expectations (what data is visible to whom)
- Empty/error states where applicable

### Example
- Given a new user, when they provide email, then they receive verification link
- Given an admin from unit A, when they request reports, then they see data only from unit A
- Given offline mode, when user navigates, then cached data displays
- Given invalid input, when form submits, then error message shows

## Technical Notes

- Relevant architecture or design docs
- Entities, endpoints, screens, or services affected
- Database migrations needed (if any)
- Shared enums, schemas, guards, utilities, and components to reuse
- API contract changes (OpenAPI, DTOs)
- Generated code impact
- Integration points with other systems

### Example
- Uses shared role enum from `libs/shared/auth/roles.ts`
- Updates `/api/auth/signin` endpoint (OpenAPI update needed)
- Mobile screen: `apps/mobile/src/screens/SignIn.tsx`
- Backend: `apps/backend/src/services/auth.service.ts`
- Migration: `apps/backend/migrations/add_email_signin_table.sql`

## Out of Scope

Explicitly list nearby V2 or excluded work:

- What's explicitly NOT included in this story
- What's deferred to a future phase
- What's a known limitation

### Example
- Social sign-in (V2)
- Two-factor authentication (Phase 2)
- Password reset email templates (design team)

## Tests Required

- Unit tests (business logic)
- Integration tests (API/database boundaries)
- E2E tests (user workflows)
- Permission/visibility tests
- Contract tests
- Migration tests (if DB changes)
- Privacy lifecycle tests (if data handling)
- Smoke tests (critical paths)

### Example
- Unit: Auth service password hashing and validation
- Integration: `/api/auth/signin` with valid/invalid/missing email
- Integration: Permission matrix for 3 roles
- E2E: Complete sign-in workflow (navigate → enter email → verify → success)
- Smoke: App loads with demo auth

## Quality Gates

- Commands that must pass before the story is complete
- Any known failing command must be fixed or explicitly accepted by human owner

### Example
```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run db:migrate:check
```

## Dependencies

- Prior stories or phases
- Data or infrastructure requirements
- Approvals needed
- Blocked by other work

### Example
- Depends on Phase 1 (infrastructure setup)
- Depends on shared auth types (libs/shared/auth)
- Requires database schema approval from DBA
- Blocks Payment feature (needs auth working first)

## Success Metrics

How do we know this is done well?

- [ ] Tests pass
- [ ] Coverage at minimum threshold
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Deployed successfully
- [ ] No regressions in related features

## Example Story

```markdown
## Epic
User Management

## Feature
Email Authentication

## Story
As a new user, I want to sign in with my email address, so that I can access my account using a familiar method.

## Acceptance Criteria
- Given the login page, when I enter valid email, then I receive verification email
- Given the login page, when I enter invalid email format, then I see error message
- Given I'm an unauthenticated user, when I click verify link, then I'm signed in
- Given I'm signed in, when I sign out, then I return to login page
- Given I'm offline, when I try to sign in, then I see offline message

## Technical Notes
- Updates `/api/auth/signin` endpoint (new DTO, OpenAPI update needed)
- Backend: `auth.service.ts` (hash password, generate token)
- Mobile: `SignInScreen.tsx` (form, validation, nav)
- Uses shared permission helpers from `libs/shared/auth`
- Migration: add email column to users table
- Generated clients must be regenerated

## Out of Scope
- Social login (V2)
- Two-factor authentication (Phase 2)
- Email template customization (design)
- Remember me feature (Phase 2)

## Tests Required
- Unit: password hashing, validation logic
- Integration: POST /api/auth/signin with valid/invalid email
- Integration: verify link generation and email sending
- E2E: complete sign-in flow
- Permission: tests for anonymous user can sign in
- Coverage: 80%+ for auth module

## Quality Gates
- npm run lint ✅
- npm run typecheck ✅
- npm run test ✅
- npm run test:coverage ✅
- npm run build ✅
- npm run db:migrate:check ✅

## Dependencies
- Phase 1 (infrastructure) ✅
- Shared auth types ✅
- Email service setup (needed before)
```

