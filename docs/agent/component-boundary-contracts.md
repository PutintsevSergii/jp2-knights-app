# Component Boundary Contracts

This document is the working checklist for keeping feature code out of oversized root files. Use it before adding or changing screens, route groups, API clients, demo fixtures, or shared UI components.

## Required Flow

Before implementation:

1. Identify the requirement ID, phase, role surface, and runtime mode affected.
2. Search for existing screen models, API clients, demo fixtures, route surfaces, render components, and tests.
3. Write or update the feature contract in this document when the change adds a new screen, route group, reusable component, or cross-file orchestration path.
4. Keep root files as composition points only. Do not add feature loaders, form workflows, role-specific actions, or repeated UI blocks to a root file.
5. Add tests at the same boundary where behavior lives: pure model tests for model builders, route/surface tests for navigation and state transitions, API tests for DTO/visibility behavior, and renderer tests for visible states.

During implementation:

- Split by responsibility first, not by file length after the fact.
- Prefer the existing package/module pattern over inventing a new framework.
- Keep server-side filtering on the backend. Client components may hide unavailable routes, but they must not become the privacy boundary.
- For React and React Native, keep exported components one-per-file. If a new
  component needs to be exported, create a dedicated component file for it
  instead of adding another export to an existing component file.
- Do not keep reusable helper components inside screen files. If a header,
  bottom nav item, icon, state panel, badge, card shell, action row, or form
  field appears in more than one screen or is expected to be reused by the next
  screen in the same workflow, move it into the shared component folder first.
- Before adding any shared component, inspect and update the shared component
  inventory so future agents can reuse it instead of creating duplicates. The
  inventory must be a Markdown lookup table near the components, not just a
  filename list. Each row must include file/component, purpose, key props or
  variants, and reuse guidance.
- Keep each screen model/builder in its own file. Plural `*-screens.ts` files are allowed only as tiny barrels that re-export per-screen files.
- Update traceability and implementation status when the boundary change affects phase progress.

## Split Triggers

Create or extract a separate module when any of these are true:

- A root, shell, or screen model file would exceed roughly 150-200 lines with feature-specific code.
- A route surface would exceed roughly 250-300 lines, own more than one role group, or repeat `useEffect`, loader, selection, or action patterns.
- A renderer needs network access, persistence, DTO parsing, role filtering, or runtime config. Those belong outside render components.
- A file named `*-screens.ts` starts gaining concrete screen interfaces, builders, state copy, or formatter logic. Move that logic to `<screen-name>-screen.ts` instead and keep the plural file as a barrel.
- Two screens need the same header, bottom navigation, empty/error/offline state, card shape, action row, or form field pattern.
- A new implementation would add a second copy of role, visibility, status, DTO, error, or design-token logic.
- A React/React Native screen file starts accumulating local component
  functions. Components belong in dedicated files; shared/reusable ones belong
  in the shared component folder with the inventory updated.

## Feature Contract Template

Use this shape when adding a new boundary entry:

```markdown
### <Feature Or Screen Name>

| Field                      | Contract                                                       |
| -------------------------- | -------------------------------------------------------------- |
| Requirement/phase          | FR-..., Phase ...                                              |
| Data/API source            | Backend endpoint/API client/demo fixture                       |
| Screen model               | Pure builder/types file, no React/network                      |
| Route/surface owner        | File that owns route state, loaders, selected IDs, actions     |
| Renderer components        | React Native or web components that receive model/action props |
| Shared components/tokens   | Existing or new shared UI pieces and design-token roles        |
| Tests                      | Model, route/surface, renderer, API, contract, or smoke tests  |
| Forbidden responsibilities | What must not be added to this feature's files                 |
| Scope guard                | V1/V2 boundary and explicit excluded behaviors                 |
```

## Current Mobile Contracts

### Mobile App Root

| File                               | Contract                                                                                                                                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/App.tsx`          | Thin composition root. Reads runtime config, auth config, launch/auth state, and chooses public, candidate, or brother surface. It must not own per-screen fetch effects, join-request workflow, event participation actions, or candidate/brother screen rendering. |
| `apps/mobile/src/mobile-routes.ts` | Route unions and route-group guards only. No React, network access, persistence, or screen-specific actions.                                                                                                                                                         |

### Mobile Route Surfaces

| File                                           | Contract                                                                                                                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/mobile-public-surface.tsx`    | Owns public route state, public data loading, join-request form state, token-backed sign-in form state, and public navigation. It must not grant private roles/scopes or perform backend visibility filtering. |
| `apps/mobile/src/mobile-candidate-surface.tsx` | Owns candidate route state, candidate loaders, selected content/event IDs, and candidate event participation actions. It must not include public discovery, brother-only, officer, or admin workflows.         |
| `apps/mobile/src/mobile-brother-surface.tsx`   | Owns brother route state, brother loaders, selected content/event/unit IDs, and brother event participation actions. It must not include public discovery, candidate-only, officer, or admin workflows.        |

### Mobile Screen Models

| File pattern                            | Contract                                                                                                                                                                |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/public-screens.ts`     | Barrel only. Re-exports per-screen public model files; no concrete screen interfaces, builders, state copy, or formatter logic.                                         |
| `apps/mobile/src/candidate-screens.ts`  | Barrel only. Re-exports per-screen candidate model files; no concrete screen interfaces, builders, state copy, or formatter logic.                                      |
| `apps/mobile/src/brother-screens.ts`    | Barrel only. Re-exports per-screen brother model files; no concrete screen interfaces, builders, state copy, or formatter logic.                                        |
| `apps/mobile/src/*-screen.ts`           | One screen model/builder per file. Pure builder/types only; no React, network, persistence, direct DTO parsing beyond the owned response DTO, or server-side filtering. |
| `apps/mobile/src/*-screen-contracts.ts` | Shared route/action/theme primitives and cross-screen helpers only. Do not add concrete screen builders here.                                                           |

### Mobile API And Demo Sources

| File pattern                    | Contract                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/*-api.ts`      | Typed API calls, DTO validation, endpoint state mapping, and error normalization. No React route state or visual formatting. |
| `apps/mobile/src/*-fixtures.ts` | Backend-free demo payloads only. Demo data must keep the same role and visibility semantics as API mode.                     |

### Mobile Renderers

| File pattern                               | Contract                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/screens/*.tsx`            | React Native rendering for a provided screen model, callbacks, and theme tokens. Screen files should compose components, not define reusable local component functions. No direct fetch calls, direct storage, role filtering, DTO parsing, or duplicated design-token constants. |
| `apps/mobile/src/screens/shared/*.tsx`     | Shared React Native components. One exported component per file. Update `apps/mobile/src/screens/shared/README.md` in the same change whenever a shared component is added, renamed, or removed.                                                                                  |
| `apps/mobile/src/screens/shared/README.md` | Required inventory of all shared mobile screen components. Check this before adding screen chrome, nav, icon, state, badge, card, action-row, or form-field components. Each shared component row must document file/component, purpose, key props/variants, and reuse guidance.  |
| `apps/mobile/src/screens/*.test.tsx`       | Visible-state and callback coverage for render components. Prefer model/surface tests for non-visual behavior.                                                                                                                                                                    |

## Admin Lite Contracts

| File pattern                                                          | Contract                                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin/src/app/**/route.ts`                                      | Next App Router HTTP boundary. It should authenticate, call backend/admin clients or service helpers, and render/return the route response. It must not duplicate permission or visibility logic owned by backend/shared auth helpers. |
| `apps/admin/src/**/*-api.ts`                                          | Admin API client/DTO mapping only. No UI composition or role policy duplication.                                                                                                                                                       |
| `apps/admin/src/**/*-screen.ts`                                       | One Admin Lite screen model/builder per file, unless the file is a compatibility barrel. Pure screen document/model builders for Admin Lite web responses. No direct database access or permission decisions.                          |
| `apps/admin/src/**/*-screens.ts` and multi-screen compatibility files | Barrel only. Re-export per-screen Admin Lite files; no concrete screen interfaces, builders, state copy, or formatter logic.                                                                                                           |
| `apps/admin/src/**/*-shell.ts`                                        | HTTP shell compatibility rendering only when still required by the phase. Do not add new product behavior here that is missing from the canonical App Router surface.                                                                  |

## Shared UI And Token Contracts

| File pattern                             | Contract                                                                                                                                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/shared/design-tokens/src/index.ts` | Canonical token values and semantic roles. Screens may consume tokens but must not hardcode brand colors, typography roles, radii, spacing, or state colors.                                                                                    |
| Shared component modules                 | Add when two real call sites need the same behavior or visual structure, or when the next screen in the same approved workflow would otherwise copy it. Components should accept model/action props and avoid owning role-specific data access. |
| Shared component inventories             | Every shared component folder must include a nearby Markdown inventory document listing available components, concise purpose, key props/variants, and reuse rules. New shared components must update that inventory in the same change.        |

## Phase 10A Active Boundary Entries

### Sign In And Idle Approval

| Field                      | Contract                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement/phase          | FR-AUTH-001, Phase 10A                                                                                                                       |
| Data/API source            | Runtime auth state from `/api/auth/me`; V1 provider/native sign-in flow is Google/Gmail through Firebase only                                |
| Screen model               | `apps/mobile/src/sign-in-screen.ts` and `apps/mobile/src/idle-approval-screen.ts`; `apps/mobile/src/public-screens.ts` remains a barrel only |
| Route/surface owner        | `apps/mobile/src/mobile-public-surface.tsx`                                                                                                  |
| Renderer components        | `apps/mobile/src/screens/SignInScreen.tsx`, `apps/mobile/src/screens/IdleApprovalScreen.tsx`                                                 |
| Shared components/tokens   | Shared typography roles and existing mobile token-backed theme preview                                                                       |
| Tests                      | `public-screens.test.ts`, `main.test.ts`, `SignInScreen.test.tsx`, `IdleApprovalScreen.test.tsx`                                             |
| Forbidden responsibilities | No private role granting, no officer/admin scope, no guessed Figma Gold/Grey values, no email/password credential flow in V1                 |
| Scope guard                | Public auth-entry only; chat, payments, maps, analytics, and native officer/admin mode remain out of scope                                   |

### Candidate Events

| Field                      | Contract                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement/phase          | FR-CANDIDATE-002, Phase 10A                                                                                                                                |
| Data/API source            | Candidate events API client and demo fixtures                                                                                                              |
| Screen model               | `apps/mobile/src/candidate-events-screen.ts`; `apps/mobile/src/candidate-screens.ts` remains a barrel only                                                 |
| Route/surface owner        | `apps/mobile/src/mobile-candidate-surface.tsx`; extract candidate event controller/hook if loader/action logic grows past the surface boundary             |
| Renderer components        | New `apps/mobile/src/screens/CandidateEventsScreen.tsx` and detail renderer when replacing the generic private renderer                                    |
| Shared components/tokens   | Uses `apps/mobile/src/screens/shared` for top app bar, bottom navigation, demo banner, state panel, metadata icons, filter icon, and status dot components |
| Tests                      | Model tests, candidate surface route/action tests, renderer tests, and existing API visibility/participation tests                                         |
| Forbidden responsibilities | No brother-only content, officer workflows, client-side visibility filtering, or chat/comments/read receipts                                               |
| Scope guard                | Candidate event discovery and participation only; broader social or messaging behavior is V2/out of scope                                                  |

### Brother Today

| Field                      | Contract                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement/phase          | FR-BROTHER-001, Phase 10A                                                                                                                                 |
| Data/API source            | Brother dashboard/companion API client and demo fixtures                                                                                                  |
| Screen model               | `apps/mobile/src/brother-today-screen.ts`; `apps/mobile/src/brother-screens.ts` remains a barrel only                                                     |
| Route/surface owner        | `apps/mobile/src/mobile-brother-surface.tsx`; extract brother dashboard controller/hook if repeated loaders/actions appear                                |
| Renderer components        | New `apps/mobile/src/screens/BrotherTodayScreen.tsx` when replacing the generic dashboard renderer                                                        |
| Shared components/tokens   | Uses `apps/mobile/src/screens/shared` for top app bar, bottom navigation, demo banner, state panel, profile/action icons, metadata icons, and badge icons |
| Tests                      | Model tests, brother surface route/action tests, renderer tests, and existing brother API visibility tests                                                |
| Forbidden responsibilities | No candidate-only onboarding, officer/admin management, brother rosters, private participant lists for prayer, or client-side permission filtering        |
| Scope guard                | Brother companion summary only; extended hierarchy, analytics, and social features remain out of scope                                                    |

### Admin Lite Candidate Requests

| Field                      | Contract                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Requirement/phase          | FR-ADMIN-001, Phase 10A                                                                                          |
| Data/API source            | Existing Admin Lite candidate request endpoints and scoped officer permissions                                   |
| Screen model               | Existing Admin Lite screen document/model builders, extracted further if list/detail style logic repeats         |
| Route/surface owner        | `apps/admin/src/app/admin/candidate-requests/**/route.ts`                                                        |
| Renderer components        | Responsive web route output/components; no native Expo officer mode                                              |
| Shared components/tokens   | Shared design tokens plus admin style helpers for Gold/Grey parity after exact Figma values are available        |
| Tests                      | Admin route tests, scoped officer permission tests, visual/smoke checks for responsive web route output          |
| Forbidden responsibilities | No direct database access in UI route files, no cross-unit officer leaks, no native mobile admin surface         |
| Scope guard                | Candidate request review only; full ERP, extended hierarchy, and destructive member deletion remain out of scope |
