# Figma Design Implementation Plan

Status: Approved V1 scope, in progress
Last updated: May 7, 2026

This document converts the design-update package and the inspected Figma file into a V1 implementation plan. It does not replace the canonical product, RBAC, visibility, or traceability docs.

Owner scope decision: On May 7, 2026, the human owner approved pulling this design-update/Figma alignment work into V1. The implementation slot is Phase 10A, before or alongside Formation Roadmap implementation.

Canonical references:

- [Traceability matrix](../traceability.md)
- [Roles and permissions](../product/roles-and-permissions.md)
- [Visibility model](../product/visibility-model.md)
- [Public vs authenticated mode](../product/public-vs-authenticated-mode.md)
- [Screen structure UX design](02-screen-structure-ux-design.md)
- [Screen-to-requirement mapping](05-screen-to-requirement-mapping.md)

## Figma Source

Figma file:
`figma.com/design/Byh7E8Yev3jEm0Zg9SgZoJ/jp-project`

Inspected metadata confirms these mobile frames:

| Figma node | Frame name | Implementation meaning |
| --- | --- | --- |
| `1:2` | `Sign In (Gold/Grey)` | Auth entry and Idle approval entry state |
| `1:47` | `Candidate Events (Gold/Grey)` | Candidate event list and participation state cards |
| `1:177` | `Brother Today (Gold/Grey)` | Brother dashboard landing |
| `1:1635` | `Candidate Requests (Gold/Grey)` | Officer/Admin candidate request management surface |

The richer Figma design-context/screenshot call is currently blocked by the Figma MCP Starter-plan tool-call limit, so exact fills, font names, shadows, and component properties still need extraction from direct frame context when access is available or a direct frame screenshot is provided. Until then, implementation must treat the Figma frame names and layer structure as the source for layout and role flow, but must not invent hardcoded gold/grey values.

## Current Design Gap

The existing code has strong API/RBAC foundations through Phase 9, but the V1 launch UI is still mostly model-driven and generic:

- Public and selected dashboard screens have React Native screen components.
- Candidate/brother private event and announcement screens are mounted in Expo, but several use `PrivateContentScreen`, a generic renderer.
- The Expo root component (`apps/mobile/src/App.tsx`) has now been split for Phase 10A: it reads runtime/auth launch state and delegates to public, candidate, or brother route surfaces. The remaining UI gap is that candidate/brother private event and announcement routes still render through the generic `PrivateContentScreen` until Figma-specific screens land.
- Figma targets a Gold/Grey visual system, while the current shared design tokens still expose the older blue action palette.
- Officer/admin workflows are implemented in Admin Lite web routes, not as a V1 mobile officer app.
- Candidate Contact, Candidate Roadmap, Brother Prayer Library, Silent Prayer, and several admin management screens must now be placed deliberately in V1 phases rather than left as open design debt. Roadmap remains Phase 10, Silent Prayer remains Phase 11, and final privacy/security/pilot hardening remains Phases 12-13.

## Implementation Principles

1. Keep RBAC and visibility server-side. UI tabs, hidden buttons, and local route checks are only presentation safeguards.
2. Use shared design tokens and platform adapters. Do not hardcode Figma colors, spacing, radius, or status styling in screens.
3. Implement mobile member experiences in Expo React Native. Implement officer/admin management as responsive Admin Lite web for V1.
4. Preserve V1 scope: no chat, payments, maps, analytics, social features, or hierarchy-derived permissions.
5. Match Figma screen structure only when it does not conflict with product docs. If Figma implies a feature outside V1, document it as deferred.

## Role And RBAC Implementation Update

The design docs must use these canonical role rules:

| Runtime/user state | Stored role? | Mobile mode | Admin Lite web | RBAC rule |
| --- | --- | --- | --- | --- |
| Guest/Public | No | Public | No | Public APIs only; no private data returned |
| Idle Firebase identity | No app role | Public with pending guidance | No | `/auth/me` may return approval state; private APIs fail with `IDLE_APPROVAL_REQUIRED` |
| Candidate | `CANDIDATE` | Candidate | No by default | Active candidate profile required; assigned-unit candidate visibility only |
| Brother | `BROTHER` | Brother | No by default | Active brother membership required; own memberships and own organization-unit content only |
| Officer | `OFFICER` | No member mobile mode unless also Candidate/Brother | Yes | Direct assigned organization-unit scope only in V1 |
| Super Admin | `SUPER_ADMIN` | No member mobile mode unless also Candidate/Brother | Yes | Global admin scope |
| Family member | None in V1 | Not implemented | Not implemented | V1 supports public/family-open content only; authenticated family accounts remain V2 |

Additional RBAC constraints:

- `GUEST` and `IDLE` are runtime states, not rows in `user_roles`.
- Mobile role precedence is `BROTHER` over `CANDIDATE`.
- Candidate-to-brother conversion must deactivate candidate-only access unless a future owner-approved dual-mode period is added.
- Officer scope is explicit assignment-based in V1. No hierarchy-derived inherited permissions or cross-unit rollups.
- `ORGANIZATION_UNIT` visibility requires both a target organization unit and an endpoint-specific audience rule.

## Design Token Implementation Plan

Current token source:
`libs/shared/design-tokens/src/index.ts`

In-progress update target:

| Token area | Current state | Required design update |
| --- | --- | --- |
| Brand palette | Blue primary action tokens | Add Figma-derived Gold/Grey semantic aliases after exact values are extracted |
| Status palette | Success/warning/danger tokens exist | Keep semantic status tokens; do not replace with decorative brand colors |
| Spacing | 4/8/12/16/24/32 scale exists | Reuse for Figma frame spacing; add only if Figma requires a repeated missing token |
| Radius | 4 and 8 exist | Keep cards/buttons at 8px or less unless Figma frame proves otherwise |
| Typography | Shared roles now exist for screen title, section title, body, secondary, label, and button text; current mobile shell screens consume them | Confirm exact Figma font family/weights from frames when access is available |
| Navigation | Mode-specific action arrays | Add tab/header component tokens for Figma bottom nav/top app bar parity |

Exact gold/grey values are pending Figma variable/frame extraction. Until then, docs and code should say "Figma Gold/Grey target" rather than guessing hex values. The current token update only centralizes documented legacy typography roles and does not claim visual parity with the Gold/Grey frames.

## Screen Implementation Matrix

Legend:

- Implemented: API/client/screen exists and is mounted.
- Partial: backend/model exists, but UI is generic or not Figma-specific.
- Pending: not implemented in V1 code yet.
- Deferred: outside current approved scope or later phase.

| Screen | Figma node | Requirement | Current implementation | Exact next implementation |
| --- | --- | --- | --- | --- |
| Sign In | `1:2` | FR-AUTH-001 | Public `Login` route now mounts a token-backed `SignInScreen.tsx` foundation with email/password fields and safe provider-flow pending copy; not Figma-matched yet | Apply exact Gold/Grey frame layout, password visibility toggle, forgot-password link as disabled/deferred if provider flow does not support it, and wire primary sign-in action to the selected native/provider session flow |
| Account Approval Pending | Pending direct frame | FR-AUTH-001 | Idle state returned by `/api/auth/me`; mobile maps Idle failures to guidance; public `IdleApproval` route now renders pending/rejected/expired approval state without private roles/scopes | Match the Sign In visual shell once exact Figma values are available; keep submitted/expiry/rejected copy public-only |
| Public Home | Pending direct frame | FR-PUBLIC-001 | Implemented and mounted | Create Figma-specific public home frame or map existing public screen to Gold/Grey tokens; keep no-auth public-only payload |
| About the Order | Pending direct frame | FR-PUBLIC-002 | Implemented and mounted | Apply shared Gold/Grey content typography and page header pattern |
| Public Prayer Library | Pending direct frame | FR-PRAYER-001 | Implemented list/detail | Add Figma-specific card/list variants when design exists |
| Public Events | Pending direct frame | FR-EVENT-001 | Implemented list/detail | Align event card typography/status badges with Candidate Events frame where public-safe |
| Candidate Request Form | Pending direct frame | FR-CANDIDATE-REQ-001 | Implemented mobile form/confirmation | Match multi-step form layout from design prompt; keep consent-required DTO and no account/membership promise in confirmation |
| Candidate Dashboard | Pending direct frame | FR-CANDIDATE-001 | Implemented dedicated RN screen | Replace generic card styling with Figma Gold/Grey header, welcome/assignment/officer/upcoming-events sections; keep no brother-only content |
| Candidate Events List | `1:47` | FR-CANDIDATE-002 | Mounted through generic private renderer | Build `CandidateEventsScreen.tsx` with Figma top app bar, event card variants for planning/pending/not attending, bottom nav, and filter control if backed by existing query state |
| Candidate Event Detail | Derived from `1:47` | FR-EVENT-003 | Mounted through generic private renderer | Build detail screen with event badge, time/location sections, own participation CTA, and no participant list |
| Candidate Announcements List | Pending direct frame | FR-CANDIDATE-003 | Mounted through generic private renderer | Build Figma-style announcement cards with pinned state, published date, body preview; no chat/comments/read receipts |
| Candidate Announcement Detail | Pending direct frame | FR-CANDIDATE-003 | List model only; detail route not yet implemented as separate API | Either implement from list item payload for V1 or add explicit detail contract if product requires it; keep candidate visibility filters server-side |
| Contact Officer | Pending direct frame | Candidate support surface | Not implemented | V1 implementation should be read-only responsible-officer contact fields plus email/phone deep-link actions if contact data exists; do not add chat or in-app messaging |
| Candidate Profile | Pending direct frame | Implied profile surface | Not implemented | Add V1 read/edit basics only after DTOs define allowed self-edit fields; critical membership/role data remains officer-managed |
| Candidate Roadmap | Pending direct frame | FR-ROADMAP-001 | Pending Phase 10 | Implement after roadmap data/contracts; screen must show assigned roadmap only |
| Brother Today | `1:177` | FR-BROTHER-001 | Mounted; model exists; UI not Figma-specific | Build `BrotherTodayScreen.tsx` matching Figma profile summary bento card, quick actions, upcoming events, organization-unit cards, and brother bottom nav |
| Brother Profile | Pending direct frame | FR-BROTHER-002 | Mounted through generic/private profile model | Build profile screen with read-only membership cards, degree, join date, contact basics, and edit only for allowed profile basics |
| My Choragiew | Pending direct frame | FR-ORG-001 | Dedicated RN screen exists | Align cards to Gold/Grey unit-card pattern; continue hiding brother roster/member list in V1 |
| Organization Unit Detail | Pending direct frame | FR-ORG-001 | Not implemented on mobile | Add V1 read-only detail; no roster unless separate permission work is approved |
| Brother Events List | Pending direct frame | FR-EVENT-002 | Mounted through generic private renderer | Build `BrotherEventsScreen.tsx` using Candidate Events card pattern plus brother-specific type/status details |
| Brother Event Detail | Pending direct frame | FR-EVENT-003 | Mounted through generic private renderer | Build detail screen with own plan/cancel CTA and no attendee list |
| Brother Announcements List | Pending direct frame | FR-ANN-001 | Mounted through generic private renderer | Build Figma-style announcement list with pinned badge and one-way message content only |
| Brother Announcement Detail | Pending direct frame | FR-ANN-001 | List model only; detail route not yet implemented | Same approach as candidate: list-payload detail or explicit read contract if product requires |
| Brother Prayer Library | Pending direct frame | FR-PRAYER-003 | API foundation exists; mobile route currently unsupported | Add V1 mobile model/screen in Phase 10A or immediately after Figma-critical screens |
| Silent Prayer | Pending direct frame | FR-PRAYER-004 | Pending Phase 11 | Implement only after Redis/socket aggregate counter backend; no participant list |
| Officer Dashboard | Pending direct frame | FR-ADMIN-002 | Admin Lite web implemented | V1 responsive Admin Lite web visual parity; no native Expo officer mode |
| Candidate Requests | `1:1635` | FR-ADMIN-001 | Admin Lite web list/detail implemented | Use the Figma frame to restyle Admin Lite candidate request list/detail and responsive mobile web layout; no native Expo officer mode |
| Create Event | Pending direct frame | FR-ADMIN-005 | Admin Lite web event workflow implemented | Restyle existing web editor/list with design tokens; keep officer scope and content status workflow |
| Event Management List | Pending direct frame | FR-ADMIN-005 | Admin Lite web implemented | Restyle existing route; continue archive/cancel instead of destructive delete |
| Create Announcement | Pending direct frame | FR-ADMIN-006 | Admin Lite web implemented | Restyle existing route; keep publish/archive audit and no push delivery state in UI |
| Announcement Management List | Pending direct frame | FR-ADMIN-006 | Admin Lite web implemented | Restyle existing route; no chat/comments/read receipts |
| Brother Registry | Pending direct frame | FR-ADMIN-003 | Pending | Implement only in later admin phase with officer scope and audited critical membership edits |
| Organization Management | Pending direct frame | FR-ORG-002 | Admin Lite web list/create/detail implemented for org units | Restyle existing web route; keep Super Admin writes and officer read-only scoped list |

## Route And Component Targets

Boundary contract: all Phase 10A screen and route work must follow
[docs/agent/component-boundary-contracts.md](../agent/component-boundary-contracts.md)
before adding logic to root, shell, or renderer files.

Mobile implementation targets:

- keep `apps/mobile/src/App.tsx` as a thin composition root only;
- keep plural `*-screens.ts` model files as barrels only; every concrete screen model/builder belongs in a dedicated `<screen-name>-screen.ts` file;
- extract public, candidate, and brother route orchestration before adding more Figma-specific screens;
- extract repeated API/demo loading and action handlers into screen/domain hooks or controllers;
- `apps/mobile/src/screens/SignInScreen.tsx`
- `apps/mobile/src/screens/CandidateEventsScreen.tsx`
- `apps/mobile/src/screens/CandidateEventDetailScreen.tsx`
- `apps/mobile/src/screens/CandidateAnnouncementsScreen.tsx`
- `apps/mobile/src/screens/BrotherTodayScreen.tsx`
- `apps/mobile/src/screens/BrotherProfileScreen.tsx`
- `apps/mobile/src/screens/BrotherEventsScreen.tsx`
- `apps/mobile/src/screens/BrotherEventDetailScreen.tsx`
- `apps/mobile/src/screens/BrotherAnnouncementsScreen.tsx`
- shared bottom navigation/top app bar components once two or more Figma-matched screens need the same structure.

Admin Lite implementation targets:

- `apps/admin/src/app/admin/candidate-requests/route.ts`
- `apps/admin/src/app/admin/candidate-requests/[id]/route.ts`
- `apps/admin/src/app/admin/events/route.ts`
- `apps/admin/src/app/admin/events/[id]/route.ts`
- `apps/admin/src/app/admin/announcements/route.ts`
- `apps/admin/src/app/admin/announcements/new/route.ts`
- `apps/admin/src/app/admin/announcements/[id]/route.ts`
- shared admin layout/style/token adapter for Gold/Grey responsive parity.

Shared implementation targets:

- `libs/shared/design-tokens/src/index.ts`
- mobile theme adapters that map screen model themes to shared tokens
- admin style helpers that consume shared tokens instead of hardcoded colors.

## Mobile Shell Refactor Plan

The current mobile app is not literally one file: API clients, screen-model builders, demo fixtures, tests, and several React Native screens are already separated. Phase 10A has resolved the main concentration problem by keeping `apps/mobile/src/App.tsx` as a composition root and moving route orchestration into `mobile-public-surface.tsx`, `mobile-candidate-surface.tsx`, and `mobile-brother-surface.tsx`.

Valid short-term reason for the current shape:

- earlier phases prioritized proving server-side visibility, DTO validation, API/demo mode separation, and launch routing before choosing a full navigation stack;
- the mobile package intentionally stayed dependency-light, with Expo, React, and React Native but no React Navigation or Expo Router dependency yet;
- screen models and API clients were split first so business behavior could be tested without blocking on polished native UI.

Why it must improve during Phase 10A:

- every Figma-matched private screen would otherwise add more `useState`, `useEffect`, and route-switch branches to the root component;
- shared top app bar, bottom navigation, demo chrome, loading, empty, forbidden, Idle approval, and offline states need one reusable shell instead of repeated per-screen wiring;
- role routing must remain explicit and testable while avoiding a root component that owns every screen's behavior.

Refactor sequence:

1. ✅ Keep `App.tsx` as a thin composition root that reads runtime config/auth config and chooses the public, candidate, or brother app surface.
2. ✅ Extract public, candidate, and brother route modules or hooks that own their route state, selected IDs, loaders, and action handlers.
3. Start extracting shared mobile chrome tokens for top app bar, bottom navigation, demo banner, and common state views. Typography roles are now centralized; nav/header color values still require Figma extraction.
4. Add Figma-specific screens on top of that split. Sign In/Idle approval now have token-backed foundations; exact visual parity and provider submission remain pending. Candidate Events and Brother Today are next private-screen targets.
5. Reassess React Navigation or Expo Router only after the route groups are clear. Add a navigation dependency if deep links, tab stacks, back behavior, or native navigation semantics become real requirements; do not add it just to hide a local organization problem.

Acceptance checks for the refactor:

- `App.tsx` no longer owns per-screen fetch effects or participation/join-request action logic;
- each new Phase 10A screen has a file/component contract entry or matches an existing entry in `docs/agent/component-boundary-contracts.md`;
- plural screen model files stay as re-export barrels with regression coverage; concrete screen builders live in per-screen files;
- public/candidate/brother route groups remain covered by tests for initial route, forbidden/Idle/offline/error states, demo mode, and role visibility;
- server-side RBAC and visibility remain unchanged; the refactor must not move filtering into the client;
- no new out-of-scope surfaces are introduced while splitting the shell.

## Acceptance Checks For Figma Parity

Each Figma-aligned screen must add or update tests for:

- correct role landing and route visibility;
- server-side forbidden/idle/offline/error state rendering;
- absence of forbidden fields in rendered output;
- primary and secondary action metadata;
- empty state copy;
- demo mode banner only in demo mode;
- token usage instead of hardcoded brand colors.

Visual QA should include screenshots for at least:

- iPhone-width mobile viewport around 390 px;
- small mobile viewport around 360 px;
- tablet or wide responsive view for Admin Lite pages;
- empty, loading, error/offline, and ready states where practical.

## Phase 10A Order Of Work

1. Extract exact Figma variables/screenshots for nodes `1:2`, `1:47`, `1:177`, and `1:1635` when Figma MCP access is available.
2. ✅ Split the current mobile shell so `App.tsx` becomes a thin composition root and public/candidate/brother route groups own their loaders/actions.
3. 🟡 Update shared design tokens with Figma Gold/Grey semantic palette and typography roles. Typography roles are in place from documented specs; Gold/Grey colors remain pending Figma extraction.
4. 🟡 Build Figma-matched Sign In and Idle approval screens because they define the auth shell. Public route foundations are in place; exact Figma styling and native/provider submission remain pending.
5. Replace generic private renderer usage for Candidate Events and Brother Today with dedicated Figma-matched RN screens.
6. Apply the same card/nav/header system to remaining candidate/brother event and announcement screens.
7. Restyle Admin Lite Candidate Requests from the Figma `1:1635` frame while preserving web-first admin scope.
8. Add Brother Prayer Library and Organization Unit Detail mobile surfaces so already implemented V1 contracts have launchable screens.
9. Update traceability, implementation status, and screenshot QA evidence after each screen lands.
