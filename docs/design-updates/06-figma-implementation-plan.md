# Figma Design Implementation Plan

Status: Approved V1 scope, in progress
Last updated: June 11, 2026

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

| Figma node | Frame name                       | Implementation meaning                             |
| ---------- | -------------------------------- | -------------------------------------------------- |
| `1:2`      | `Sign In (Gold/Grey)`            | Auth entry and Idle approval entry state           |
| `1:47`     | `Candidate Events (Gold/Grey)`   | Candidate event list and participation state cards |
| `1:177`    | `Brother Today (Gold/Grey)`      | Brother dashboard landing                          |
| `1:1635`   | `Candidate Requests (Gold/Grey)` | Officer/Admin candidate request management surface |

Phase 10A Figma extraction was refreshed on May 8, 2026 after Figma access was
upgraded. Local implementation cache:
[docs/design-updates/figma-cache](figma-cache/). The Figma file does not define
local variables or local styles, so the implementation source is the cached
frame screenshots plus frame-derived colors, typography, spacing, radius, and
shadow values.

## Current Design Gap

The existing code has strong API/RBAC foundations through Phase 9, and Phase
10A has replaced the highest-priority generic member renderers with dedicated
Gold/Grey and Google Stitch React Native screens. The remaining launch UI work
is concentrated in visual QA, remaining public/admin responsive parity, and
backend DTO gaps for provider-backed daily context:

- Public and selected dashboard screens have React Native screen components.
- The latest Google Stitch role-aware home screens are applied for anonymous
  guests, candidates, brothers, and Idle approval users. The exported Stitch
  officer mobile handoff remains a documented V1 web handoff because current
  launch routing intentionally has no native officer/admin mobile mode.
- Candidate event list/detail, candidate announcement list/detail, Contact Officer, Brother Today, Brother Events, Brother Event Detail, Brother Announcements list/detail, and Brother Profile now use dedicated Phase 10A React Native renderers.
- The Expo root component (`apps/mobile/src/App.tsx`) has now been split for Phase 10A: it reads runtime/auth launch state and delegates to public, candidate, or brother route surfaces. Brother announcement/detail and profile routes now render through dedicated Figma-aligned components instead of the generic private renderer.
- Figma targets a Gold/Grey visual system, and public mobile now uses the Google
  Stitch `JP2 Knights Companion` public screens as the active visual reference.
  Shared design tokens now include the Stitch Ecclesia parchment/gold/stone
  semantic palette, radius, shadow, and Inter mobile typography roles. Remaining
  screen work should continue consuming those tokens instead of local visual
  constants.
- Officer/admin workflows are implemented in Admin Lite web routes, not as a V1 mobile officer app.
- Candidate Contact, Candidate Roadmap, Silent Prayer, and several admin
  management screens must now be placed deliberately in V1 phases rather than
  left as open design debt. Brother Prayer Library now has a launchable
  Gold/Grey mobile surface over the existing guarded contract, though a direct
  Figma frame and native visual QA are still pending. Roadmap remains Phase 10,
  Silent Prayer remains Phase 11, and final privacy/security/pilot hardening
  remains Phases 12-13.

## Latest Stitch Redesign: Role-Aware Main Screen

The latest Google Stitch pass for the first screen after launch is now applied
in mobile code. It is role-aware rather than a single overloaded dashboard:

- Anonymous guests need a public conversion and orientation screen: learn what
  the Order is, see today's civil and liturgical day, pray immediately, see the
  next public/family-open Order event they may attend, request to join, or sign
  in. It must never imply access to private content.
- Candidates need a formation-oriented home: next roadmap/dashboard step,
  today's liturgical context, assignment, responsible officer contact,
  candidate-visible events, and one-way announcements. This should answer "what
  should I do next?" within the first viewport.
- Brothers need a daily command center: current degree/unit, today's most useful
  action, today's liturgical context, roadmap progress, prayer, active
  silent-prayer aggregate, next event, latest announcement, and quick access to
  prayers/events/profile.
- Idle signed-in users need public-only approval guidance.
- Officers/Super Admins without a member mobile role need an Admin Lite web
  handoff, not a native mobile admin dashboard in V1.

Use [07-google-stitch-main-screen-redesign-prompt.md](07-google-stitch-main-screen-redesign-prompt.md)
as the active prompt for this design task. Designs generated from it are
implementation inputs only after they are checked against V1 scope, RBAC,
server-side visibility, API/DTO support, demo fixtures, tests, and the
traceability/status docs.

Functional API gap remaining after the UI pass: add API-side liturgical calendar
fetching through a provider adapter and expose a normalized `today` module
through `/public/home` and the authenticated dashboard models. Mobile must not
call the external liturgical calendar source directly. Candidate providers
identified for evaluation are Parish Companion Ordo and the open-source
LiturgicalCalendarAPI.

## Implementation Principles

1. Keep RBAC and visibility server-side. UI tabs, hidden buttons, and local route checks are only presentation safeguards.
2. Use shared design tokens and platform adapters. Do not hardcode Figma colors, spacing, radius, or status styling in screens.
3. Implement mobile member experiences in Expo React Native. Implement officer/admin management as responsive Admin Lite web for V1.
4. Preserve V1 scope: no chat, payments, maps, analytics, social features, or hierarchy-derived permissions.
5. Match Figma screen structure only when it does not conflict with product docs. If Figma implies a feature outside V1, document it as deferred.
6. Treat approved Figma frames as functional requirements, not visual references only. When a frame requires missing fields, counts, filters, action states, navigation, or workflows, document the API/DTO gap and implement it through the backend/shared contracts before or with the UI.
7. Do not fake Figma-required behavior client-side. V1-valid behavior must flow through server-side scoped APIs, shared validation schemas, OpenAPI, generated clients, demo fixtures, screen models, tests, and traceability/status updates.
8. Sign In is the explicit exception to Figma's email/password field structure:
   V1 uses Google/Gmail through Firebase only. Use the Figma frame as the
   Gold/Grey auth-shell baseline, but render and implement a Google/Firebase
   provider action instead of email/password credentials.

## Figma-Driven API Gap Workflow

For each Figma-aligned screen:

1. Compare the frame against existing API endpoints, shared DTOs/Zod schemas,
   OpenAPI output, mobile/admin API clients, demo fixtures, screen models, route
   surfaces, and tests.
2. Record any missing functional requirement in this implementation plan before
   coding the screen. Examples include status badge state, filter counts, current
   user's RSVP/participation state, contact/review actions, detail metadata, or
   empty/error/forbidden state requirements.
3. If the gap is V1-valid and compatible with canonical RBAC/privacy rules,
   implement it end to end: persistence/migration if needed, repository/service
   logic, DTO/schema/OpenAPI, client/demo fixture, screen model, renderer, tests,
   and docs.
4. If the gap implies out-of-scope behavior such as chat, payments, maps,
   analytics, social features, authenticated family accounts, private rosters,
   participant lists, or hierarchy-derived permissions, pause that part and seek
   owner approval before implementation.
5. Keep officer/admin management web-first for V1 even when Figma uses
   mobile-sized frames for responsive Admin Lite references.

## Role And RBAC Implementation Update

The design docs must use these canonical role rules:

| Runtime/user state     | Stored role?  | Mobile mode                                         | Admin Lite web  | RBAC rule                                                                                  |
| ---------------------- | ------------- | --------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| Guest/Public           | No            | Public                                              | No              | Public APIs only; no private data returned                                                 |
| Idle Firebase identity | No app role   | Public with pending guidance                        | No              | `/auth/me` may return approval state; private APIs fail with `IDLE_APPROVAL_REQUIRED`      |
| Candidate              | `CANDIDATE`   | Candidate                                           | No by default   | Active candidate profile required; assigned-unit candidate visibility only                 |
| Brother                | `BROTHER`     | Brother                                             | No by default   | Active brother membership required; own memberships and own organization-unit content only |
| Officer                | `OFFICER`     | No member mobile mode unless also Candidate/Brother | Yes             | Direct assigned organization-unit scope only in V1                                         |
| Super Admin            | `SUPER_ADMIN` | No member mobile mode unless also Candidate/Brother | Yes             | Global admin scope                                                                         |
| Family member          | None in V1    | Not implemented                                     | Not implemented | V1 supports public/family-open content only; authenticated family accounts remain V2       |

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

| Token area     | Current state                                                                                                          | Required design update                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Brand palette  | Stitch Ecclesia parchment/gold/stone semantic aliases are now in shared tokens                                        | Continue migrating screen themes away from legacy blue assumptions                    |
| Status palette | Success/warning/danger tokens exist                                                                                    | Keep semantic status tokens; do not replace with decorative brand colors              |
| Spacing        | 4/8/12/16/24/32 scale exists                                                                                           | Reuse for Figma frame spacing; add only if Figma requires a repeated missing token    |
| Radius         | 4 and 8 exist                                                                                                          | Keep cards/buttons at 8px or less unless Figma frame proves otherwise                 |
| Typography     | Shared roles now use Inter for mobile functional text; letter-spacing is normalized to `0` by the app UI rule          | Add bundled fonts only if pilot devices require exact Stitch font rendering           |
| Navigation     | Mode-specific action arrays                                                                                            | Add tab/header component tokens for Figma bottom nav/top app bar parity               |

Exact Stitch public-screen values are now added to
`libs/shared/design-tokens/src/index.ts`. Screens should consume those semantic
tokens instead of repeating hex values.

## Screen Implementation Matrix

Legend:

- Implemented: API/client/screen exists and is mounted.
- Partial: backend/model exists, but UI is generic or not Figma-specific.
- Pending: not implemented in V1 code yet.
- Deferred: outside current approved scope or later phase.

| Screen                        | Figma node           | Requirement               | Current implementation                                                                                                                                                                                                                                                                            | Exact next implementation                                                                                                                                                             |
| ----------------------------- | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign In                       | `1:2`                | FR-AUTH-001               | Public `Login` route uses the extracted Gold/Grey auth shell with a Google/Firebase provider action instead of email/password fields. Mobile now has a provider sign-in adapter seam, concrete Expo/Firebase Google provider implementation, shared-schema `/api/auth/session` exchange, and Candidate/Brother/Idle Approval routing from the returned current user. | Add pilot Firebase/Google client environment values and validate the flow on a native Expo target. |
| Account Approval Pending      | Google Stitch `Idle Approval Home` | FR-AUTH-001               | Idle state returned by `/api/auth/me`; mobile maps Idle failures to guidance; public `IdleApproval` now uses the latest Stitch status-panel/public-action layout without private roles/scopes.                                                                                                     | Keep submitted/expiry/rejected copy public-only and update once approval-expiry/rejection copy is contract-backed.                                                                    |
| Public Home                   | Google Stitch `Anonymous Guest Home` | FR-PUBLIC-001             | Implemented and mounted with the latest Stitch role-aware anonymous guest home: top app bar, civil/liturgical-day strip, conversion hero, bento public actions, prayer/silent-prayer/event modules, membership-path panel, fixed Home/About/Prayers/Events bottom tabs, and Join shown only on anonymous guest Home. | Replace placeholder liturgical-day copy with backend provider data once the planned normalized `today` module exists.                                                                 |
| About the Order               | Pending direct frame | FR-PUBLIC-002             | Implemented and mounted with shared Gold/Grey content typography, approved content title in the page header, public-formation article panel, and journey footer actions over the existing approved public content-page DTO.                                                                         | Add visual QA against a running Expo/native target                                                                                                                                    |
| Public Prayer Library         | Pending direct frame | FR-PRAYER-001             | Implemented list/detail                                                                                                                                                                                                                                                                           | Add Figma-specific card/list variants when design exists                                                                                                                              |
| Public Events                 | Pending direct frame | FR-EVENT-001              | Implemented list/detail. The public list now uses public-safe event card view-models and Candidate Events-aligned Gold/Grey card typography, status badges, date/location icon rows, and details actions without RSVP, attendee, participant, or roster UI.                                      | Add visual QA against a running Expo/native target                                                                                                                                    |
| Candidate Request Form        | Pending direct frame | FR-CANDIDATE-REQ-001      | Implemented mobile form/confirmation with a Gold/Grey multi-step layout for identity, contact, local context, personal note, and consent/submission over the existing consent-required DTO. Confirmation and form copy continue to state that the request does not create an account or promise membership. | Add visual QA against a running Expo/native target; keep consent-required DTO and no account/membership promise in confirmation                                                        |
| Candidate Dashboard           | Google Stitch `Candidate Home` | FR-CANDIDATE-001          | Implemented dedicated RN screen using the latest Stitch candidate home: greeting/status, liturgical context card, next formation step, candidate-visible event cards, assignment, responsible-officer card, announcements, quick actions, and bottom tabs over existing guarded contracts.            | Replace placeholder liturgical-day copy with backend provider data; add profile route only when V1 DTOs support allowed self-edit fields.                                             |
| Candidate Events List         | `1:47`               | FR-CANDIDATE-002          | Dedicated RN `CandidateEventsScreen.tsx` renders the Gold/Grey top app bar, event card RSVP states, bottom nav, and list-level RSVP actions. `/api/candidate/events` list items now include only the signed-in candidate's own `currentUserParticipation` intent and expose no participant lists. | Add visual QA against a running Expo/native target and continue detail-screen parity after Brother Today                                                                              |
| Candidate Event Detail        | Derived from `1:47`  | FR-EVENT-003              | Dedicated RN `CandidateEventDetailScreen.tsx` renders the event badge, own RSVP state, date/time/location sections, safe description, bottom nav, and own participation CTA over the existing guarded detail contract with no participant list.                                                     | Add visual QA against a running Expo/native target and continue announcement-screen parity                                                                                            |
| Candidate Announcements List  | Pending direct frame | FR-CANDIDATE-003          | Dedicated RN `CandidateAnnouncementsScreen.tsx` renders one-way announcement cards with pinned state, published date, body copy, detail actions, top app bar, and bottom nav over the existing guarded list contract. No chat, comments, read receipts, delivery state, or participant lists are exposed.            | Add visual QA against a running Expo/native target                                                                                                                                    |
| Candidate Announcement Detail | Pending direct frame | FR-CANDIDATE-003          | Dedicated RN `CandidateAnnouncementDetailScreen.tsx` resolves from the already-scoped candidate announcement list payload, shows pinned/published metadata and one-way body copy, and fails closed to empty state when the selected id is not in the authorized payload. No separate detail API, comments, read receipts, delivery state, or participant data are added. | Add visual QA against a running Expo/native target; add explicit detail API only if product later requires fields missing from the list payload                                        |
| Contact Officer               | Pending direct frame | Candidate support surface | Dedicated RN `CandidateContactScreen.tsx` reuses the existing guarded `/api/candidate/dashboard` responsible-officer payload and renders read-only officer name, email, optional phone, and assignment context. Email/phone actions are external `mailto:`/`tel:` deep links only. No chat, comments, threads, in-app messaging, officer roster, or new endpoint is exposed. | Add visual QA against a running Expo/native target; add a separate endpoint only if future product requirements need contact data missing from the dashboard DTO                       |
| Candidate Profile             | Pending direct frame | Implied profile surface   | Not implemented                                                                                                                                                                                                                                                                                   | Add V1 read/edit basics only after DTOs define allowed self-edit fields; critical membership/role data remains officer-managed                                                        |
| Candidate Roadmap             | Pending direct frame | FR-ROADMAP-001            | Phase 10B read slice implemented: guarded `GET /candidate/roadmap`, typed mobile client, demo fixture, and mounted screen model show only the current candidate's assigned published roadmap.                                                                                                    | Add dedicated Gold/Grey renderer if a direct frame is approved; keep candidate roadmap read-only and assigned-only                                                                     |
| Brother Today                 | Google Stitch `Brother Home` | FR-BROTHER-001            | Dedicated RN `BrotherTodayScreen.tsx` uses the latest Stitch brother home: greeting/badges, liturgical card, today's focus, roadmap/prayer panels, silent-prayer aggregate banner, community board, quick actions, and icon bottom tabs over the existing guarded `/api/brother/today` contract.      | Replace placeholder liturgical-day/roadmap-progress copy with backend provider/API data as those DTO gaps are resolved; no rosters or participant lists.                            |
| Brother Profile               | Pending direct frame | FR-BROTHER-002            | Dedicated RN `BrotherProfileScreen.tsx` renders the existing guarded `/api/brother/profile` self-profile contract as contact basics, read-only membership cards, current degree, join date, and organization-unit summary fields. No profile edit controls, roster/member lists, participant lists, chat/comments, or client-side scope filtering is exposed. | Add visual QA against a running Expo/native target; add edit only after allowed self-edit DTO fields and owner-approved profile-edit scope exist                                      |
| Formation Roadmap             | Pending direct frame | FR-ROADMAP-002/003        | Phase 10B read and submission slices are implemented: guarded `GET /brother/roadmap`, guarded `POST /brother/roadmap/steps/:stepId/submissions`, typed mobile clients, demo fixture, mounted screen model, and dedicated brother roadmap renderer show only the current brother's assigned published roadmap plus latest own submission state and allow reflection submission only for submit-required unsubmitted/rejected steps. | Add dedicated Gold/Grey renderer refinements if a direct frame is approved; never auto-award degree or expose other brothers' submissions                                             |
| My Choragiew                  | Pending direct frame | FR-ORG-001                | Dedicated RN `MyOrganizationUnitsScreen.tsx` uses the Gold/Grey top bar, unit cards, bottom navigation, API/demo states, and detail actions over the existing guarded `/api/brother/my-organization-units` response. No brother roster or member list is exposed.                                  | Add visual QA against a running Expo/native target                                                                                                                                    |
| Organization Unit Detail      | Pending direct frame | FR-ORG-001                | Dedicated RN `OrganizationUnitDetailScreen.tsx` reuses the existing server-filtered My Chorągiew response and renders read-only type/status/location/parish/description fields with Gold/Grey cards and bottom navigation. No roster, member list, participant list, or scope expansion is exposed. | Add visual QA against a running Expo/native target                                                                                                                                    |
| Brother Events List           | Pending direct frame | FR-EVENT-002              | Dedicated RN `BrotherEventsScreen.tsx` renders the Gold/Grey top app bar, brother-visible event cards, type/date/time/location/visibility metadata, bottom nav, and detail actions over the existing guarded list contract. No attendee list or roster is exposed.                                  | Add visual QA against a running Expo/native target and continue brother detail/announcement parity                                                                                    |
| Brother Event Detail          | Pending direct frame | FR-EVENT-003              | Dedicated RN `BrotherEventDetailScreen.tsx` renders type, date, time, location, safe description, own RSVP state, own plan/cancel CTA, and bottom nav over the existing guarded detail/participation contracts. No attendee list is exposed.                                                       | Add visual QA against a running Expo/native target                                                                                                                                    |
| Brother Announcements List    | Pending direct frame | FR-ANN-001                | Dedicated RN `BrotherAnnouncementsScreen.tsx` renders one-way announcement cards with pinned state, published dates, body copy, detail actions, top app bar, and bottom nav over the existing guarded list contract. No chat, comments, read receipts, delivery state, candidate-only content, rosters, or participant data are exposed. | Add visual QA against a running Expo/native target                                                                                                                                    |
| Brother Announcement Detail   | Pending direct frame | FR-ANN-001                | Dedicated RN `BrotherAnnouncementDetailScreen.tsx` resolves from the already-scoped brother announcement list payload, shows pinned/published metadata and one-way body copy, and fails closed to empty state when the selected id is not in the authorized payload. No separate detail API, comments, read receipts, delivery state, candidate-only data, rosters, or participant data are added. | Add visual QA against a running Expo/native target; add explicit detail API only if product later requires fields missing from the list payload                                        |
| Brother Prayer Library        | Pending direct frame | FR-PRAYER-003             | Dedicated RN `BrotherPrayersScreen.tsx` renders server-filtered prayer categories, prayer cards, language/visibility badges, and brother bottom navigation over the existing guarded `/api/brother/prayers` contract. No tracking, participant lists, chat/comments, or client-side filtering is exposed. | Add visual QA against a running Expo/native target; add detail only if a V1 product requirement and contract are approved                                                             |
| Silent Prayer                 | Pending direct frame | FR-PRAYER-004             | Pending Phase 11                                                                                                                                                                                                                                                                                  | Implement only after Redis/socket aggregate counter backend; no participant list                                                                                                      |
| Officer Dashboard             | Pending direct frame | FR-ADMIN-002              | Admin Lite web implemented                                                                                                                                                                                                                                                                        | V1 responsive Admin Lite web visual parity; no native Expo officer mode                                                                                                               |
| Candidate Requests            | `1:1635`             | FR-ADMIN-001              | Admin Lite web list/detail now uses responsive Gold/Grey metric cards, candidate cards, bounded server-side message previews, status badges, and detail follow-up forms over the existing scoped admin API; no native Expo officer mode                                                            | Continue visual QA and extend the responsive Admin Lite pattern to remaining Figma-covered admin routes                                                                               |
| Create Event                  | Pending direct frame | FR-ADMIN-005              | Admin Lite web event workflow implemented                                                                                                                                                                                                                                                         | Restyle existing web editor/list with design tokens; keep officer scope and content status workflow                                                                                   |
| Event Management List         | Pending direct frame | FR-ADMIN-005              | Admin Lite web implemented                                                                                                                                                                                                                                                                        | Restyle existing route; continue archive/cancel instead of destructive delete                                                                                                         |
| Create Announcement           | Pending direct frame | FR-ADMIN-006              | Admin Lite web implemented                                                                                                                                                                                                                                                                        | Restyle existing route; keep publish/archive audit and no push delivery state in UI                                                                                                   |
| Announcement Management List  | Pending direct frame | FR-ADMIN-006              | Admin Lite web implemented                                                                                                                                                                                                                                                                        | Restyle existing route; no chat/comments/read receipts                                                                                                                                |
| Brother Registry              | Pending direct frame | FR-ADMIN-003              | Pending                                                                                                                                                                                                                                                                                           | Implement only in later admin phase with officer scope and audited critical membership edits                                                                                          |
| Organization Management       | Pending direct frame | FR-ORG-002                | Admin Lite web list/create/detail implemented for org units                                                                                                                                                                                                                                       | Restyle existing web route; keep Super Admin writes and officer read-only scoped list                                                                                                 |

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
- shared mobile components in `apps/mobile/src/screens/shared`, with one
  exported React Native component per file and the inventory maintained in
  `apps/mobile/src/screens/shared/README.md`.

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
3. ✅ Shared mobile chrome for top app bar, bottom navigation, demo banner, and
   common state views now lives under `apps/mobile/src/screens/shared`, backed
   by extracted Gold/Grey token roles.
4. Add Figma-specific screens on top of that split. Sign In/Idle approval now
   have token-backed foundations, provider-only submission, `/api/auth/session`
   exchange, and a concrete Expo/Firebase Google adapter. Real pilot client IDs
   and native-device validation remain pending. Candidate Events list/detail,
   Candidate Announcements list/detail, Brother Today, Brother Events
   list/detail, Brother Announcements list/detail, Brother Profile, Brother Prayer Library, and Organization Unit Detail
   now have dedicated private renderers.
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

1. ✅ Extract exact Figma frame screenshots and frame-derived values for nodes `1:2`, `1:47`, `1:177`, and `1:1635`; cache them under `docs/design-updates/figma-cache`.
2. ✅ Split the current mobile shell so `App.tsx` becomes a thin composition root and public/candidate/brother route groups own their loaders/actions.
3. ✅ Update shared design tokens with Figma Gold/Grey semantic palette, radius, shadow, and Work Sans typography roles.
4. 🟡 Build Figma-matched Sign In and Idle approval screens because they define the auth shell. Gold/Grey shell styling, provider-only Sign In, `/api/auth/session` exchange, and the Expo/Firebase Google adapter are in place; real client IDs and native-device validation remain pending.
5. ✅ Replace generic private renderer usage for Candidate Events list/detail, Candidate Announcements list, and Brother Today with dedicated Figma-matched RN screens.
6. ✅ Apply the same card/nav/header system to remaining brother event and announcement screens. Brother Events list/detail and Brother Announcements list/detail are complete.
7. ✅ Restyle Admin Lite Candidate Requests from the Figma `1:1635` frame while preserving web-first admin scope.
8. ✅ Add Brother Prayer Library and Organization Unit Detail mobile surfaces so already implemented V1 contracts have launchable screens.
   - ✅ Brother Prayer Library mobile surface is implemented over `/api/brother/prayers`.
   - ✅ Organization Unit Detail mobile surface is implemented over `/api/brother/my-organization-units` without brother roster exposure.
9. Update traceability, implementation status, and screenshot QA evidence after each screen lands.
