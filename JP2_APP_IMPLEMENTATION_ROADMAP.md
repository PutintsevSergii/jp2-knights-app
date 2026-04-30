# JP2 App — Implementation Roadmap for Coding Agent

## Purpose

This document is the implementation roadmap for the **JP2 App digital ecosystem**.

This file is the original source brief. The focused documentation under `docs/` is now the canonical implementation contract. If this roadmap conflicts with the canonical docs, follow `docs/README.md` and update this roadmap only as a summary.

The product is not only a closed internal app for brothers. It must support:

1. **Public Discovery Mode** — available without authentication.
2. **Authenticated Candidate Mode** — for people interested in joining the Order.
3. **Authenticated Brother Mode** — for members of the Order.
4. **Admin Lite** — simplified administration for officers and super admins.

The first production-grade version must focus on a realistic MVP:

> Public discovery + candidate funnel + brother companion + simple admin operations.

This is **not** a full ERP for the whole Order.

---

## Product North Star

The app should help a person move through this funnel:

```text
Guest / Wife / Interested Person
        ↓
Interested Candidate
        ↓
Authenticated Candidate
        ↓
Brother
        ↓
Officer
```

The app must also help a brother answer these questions quickly:

1. Who am I in the Order?
2. What is my chorągiew?
3. What is important today?
4. How should I pray?
5. What is the next event?
6. What is my next formation step?
7. Are brothers praying together right now?

---

## Scope Principles

### In V1

Build:

- public app mode;
- authentication;
- candidate funnel;
- brother profile;
- my chorągiew;
- prayer library;
- public and private events;
- announcements;
- brother/candidate roadmap;
- silent online prayer;
- admin lite;
- basic visibility/audience model;
- basic audit metadata;
- privacy-first data model.

### Explicitly out of scope for V1

Do not implement:

- payments or membership fees;
- full chat;
- social feed;
- comments;
- likes;
- map of brothers;
- church/mass map;
- mass time integrations;
- geocheck-ins;
- complex analytics;
- exports for church authorities;
- full Generalate → Province → Commandery → Chorągiew hierarchy;
- real electronic signature;
- advanced gamification;
- streaks;
- public ranking;
- photo reports;
- donation flows.

---

## Core Roles

### Guest

Unauthenticated user.

Can:

- open the app without login;
- read public prayers;
- view public/family-open events;
- read about the Order;
- submit interest request;
- join public silent prayer anonymously.

Cannot:

- see brother-only content;
- see private events;
- see brother profiles;
- see roadmap;
- receive authenticated push notifications.

---

### Candidate

Authenticated user who is interested in joining the Order.

Can:

- see candidate dashboard;
- see candidate roadmap;
- view public + candidate events;
- read public + candidate prayers;
- receive candidate announcements;
- see assigned contact/chorągiew if assigned.

Cannot:

- see brother-only content;
- see brother roadmap;
- see private brother events;
- access admin functions.

---

### Brother

Authenticated member of the Order.

Can:

- see brother dashboard;
- see own profile;
- see own chorągiew;
- view public + brother + chorągiew events;
- use prayer library;
- use formation roadmap;
- submit roadmap step requests;
- join brother silent prayer;
- receive announcements and push notifications.

Cannot:

- edit critical membership data directly;
- manage other users;
- approve roadmap requests unless also Officer.

---

### Officer

Admin user for one chorągiew.

Can:

- manage candidates assigned to own chorągiew;
- manage brothers in own chorągiew;
- create events;
- create announcements;
- create silent prayer events;
- approve/reject roadmap step submissions;
- see basic operational information for own chorągiew.

Cannot:

- manage other chorągwie;
- access global admin settings;
- see unrelated private data.

---

### Super Admin

Global administrative user.

Can:

- manage all chorągwie;
- manage all users;
- manage global content;
- manage visibility;
- assign officers;
- override data when necessary.

---

## Visibility Model

Every publishable content entity must support audience/visibility.

### Required visibility values

```text
PUBLIC
FAMILY_OPEN
CANDIDATE
BROTHER
CHORAGIEW
OFFICER
ADMIN
```

### Visibility rules

- `PUBLIC`: visible without authentication.
- `FAMILY_OPEN`: visible without authentication, marked as suitable for families.
- `CANDIDATE`: visible only to authenticated candidates and admins/officers where applicable.
- `BROTHER`: visible only to authenticated brothers.
- `CHORAGIEW`: visible to assigned brothers, and to assigned candidates only when the content type explicitly allows candidate access.
- `OFFICER`: visible only to officer/admin roles.
- `ADMIN`: visible only in admin panel.

Private content must never leak into unauthenticated APIs.

---

## Data Safety Rules

The app is religious/community software and must not become a system of spiritual surveillance.

Implement these rules from the beginning:

- no public list of brothers;
- no exact home addresses;
- no public personal prayer logs;
- no public roadmap history;
- no geocheck-ins in V1;
- no shame-based progress UI;
- no red failure states for prayer;
- no public leaderboard;
- no ranking of brothers;
- no aggressive streaks;
- silent prayer must show counters, not personal lists;
- officer access must be scoped to own chorągiew;
- audit critical admin actions.

---

## Suggested Repository Structure

The agent may adjust names if the existing repository already has conventions, but the architecture should preserve these boundaries.

```text
apps/
  mobile/                 # React Native app
  admin/                  # Next.js admin panel
  api/                    # NestJS API

libs/
  shared/types/           # Shared DTOs, enums, API contracts
  shared/validation/      # Shared Zod validation schemas
  shared/auth/            # Auth helpers, permissions
  shared/design-tokens/   # Shared brand/theme tokens for mobile and admin
  domain/identity/        # Users, roles, sessions
  domain/organization/    # Chorągwie, membership
  domain/content/         # Prayers, materials, approval
  domain/events/          # Events and participation
  domain/roadmap/         # Candidate and brother roadmap
  domain/prayer/          # Silent prayer sessions
  ui/mobile/              # Reusable mobile UI components
  ui/admin/               # Reusable admin UI components
```

---

## Implementation Policy for Agent

Follow this execution policy:

1. Implement phases in order unless blocked.
2. Keep V1 scope disciplined. If a V2 or out-of-scope item has a strong product, security, or architectural argument, ask for explicit human-owner approval and update scope/backlog/docs before implementation.
3. Keep public and private APIs clearly separated or strongly filtered.
4. Add tests for permission and visibility rules early.
5. Every phase must leave the app runnable.
6. Mobile and Admin Lite must support an explicit backend-free demo mode for local development and controlled demos.
7. Mobile and Admin Lite must consume shared design tokens so branding can change without rewriting screens.
8. Every completed phase must update this document or a separate progress log.
9. Prefer simple, stable flows over clever abstractions.
10. Do not silently implement chat, payments, maps, geocheck-ins, analytics, or social features in V1.
11. When unsure, choose privacy-preserving behavior.
12. Critical data changes should be auditable.

---

# Phase 0 — Product and Technical Baseline

## Goal

Establish the non-negotiable product boundaries, user roles, data model direction, and implementation guardrails.

## 0.1 Define V1 Capability Contract

### Build

A documented list of all V1 features and all excluded features.

### Tasks

- [ ] Create `docs/product/v1-scope.md`.
- [ ] Define public app mode.
- [ ] Define authenticated candidate mode.
- [ ] Define authenticated brother mode.
- [ ] Define admin lite.
- [ ] Define out-of-scope features.
- [ ] Define launch target: one pilot chorągiew first.

### Acceptance Criteria

- V1 scope is explicit.
- Out-of-scope list exists.
- Agent does not implement excluded features.

---

## 0.2 Define Role and Permission Matrix

### Build

Initial RBAC matrix.

### Tasks

- [ ] Define stored role enum: `CANDIDATE`, `BROTHER`, `OFFICER`, `SUPER_ADMIN`; treat `GUEST` as an unauthenticated runtime state.
- [ ] Define permission rules for each app area.
- [ ] Define officer scope by chorągiew.
- [ ] Define super admin global scope.
- [ ] Document which screens require authentication.

### Acceptance Criteria

- There is a clear access matrix.
- Every screen and API can be classified as public or protected.

---

## 0.3 Define Visibility Model

### Build

Reusable visibility model for events, prayers, announcements, materials, and silent prayer events.

### Tasks

- [ ] Define visibility enum.
- [ ] Add audience model.
- [ ] Define filtering rules.
- [ ] Define API-level protection rules.
- [ ] Add tests for private content not appearing in public queries.

### Acceptance Criteria

- Public API never returns brother-only content.
- Authenticated users receive content according to role and chorągiew.

---

# Phase 1 — Repository and Infrastructure Baseline

## Goal

Create a runnable monorepo baseline for API, admin, and mobile.

## 1.1 Monorepo Bootstrap

### Build

Basic Nx workspace with apps, shared libraries, launch commands, and backend-free demo mode.

### Tasks

- [ ] Create Nx workspace or align existing workspace.
- [ ] Add `apps/api`.
- [ ] Add `apps/admin`.
- [ ] Add `apps/mobile`.
- [ ] Add `libs/shared/types`.
- [ ] Add `libs/shared/validation`.
- [ ] Add `libs/shared/design-tokens`.
- [ ] Add basic lint/typecheck/test commands.
- [ ] Add root README with local development instructions.
- [ ] Add documented launch commands for API, mobile, and admin.
- [ ] Add `APP_RUNTIME_MODE=api|demo|test` config convention.
- [ ] Add backend-free demo mode for mobile and admin using non-production fixtures.
- [ ] Ensure production builds reject demo mode.

### Acceptance Criteria

- `build`, `lint`, `typecheck`, and `test` commands exist.
- Each app can start independently.
- Shared types can be imported by apps.
- Shared design tokens can be consumed by mobile and admin.
- Mobile and admin can launch without the backend in demo mode.
- Demo mode is visibly labeled and cannot be enabled in production builds.

---

## 1.2 Local Development Environment

### Build

Local environment for API dependencies.

### Tasks

- [ ] Add Docker Compose for PostgreSQL.
- [ ] Add Docker Compose for Redis.
- [ ] Add environment variable templates.
- [ ] Add database migration setup.
- [ ] Add seed command.
- [ ] Add local reset command.

### Acceptance Criteria

- A developer can start local DB and Redis.
- API can connect to local DB.
- Initial seed creates at least one super admin and one sample chorągiew.

---

## 1.3 CI Baseline

### Build

Basic CI validation.

### Tasks

- [ ] Add CI job for install.
- [ ] Add CI job for lint.
- [ ] Add CI job for typecheck.
- [ ] Add CI job for tests.
- [ ] Add CI job for build.
- [ ] Cache dependencies if reasonable.

### Acceptance Criteria

- Pull request/build pipeline verifies code quality.
- Broken typecheck or tests fail CI.

---

# Phase 2 — Core Domain Model and API Foundation

## Goal

Implement the minimum backend domain needed to support public mode, candidate mode, brother mode, and admin lite.

## 2.1 Identity Domain

### Build

Users, roles, authentication identity, and status.

### Entities

- User
- UserRole
- UserStatus
- Session/AuthAccount if needed

### Tasks

- [ ] Create user model.
- [ ] Add roles.
- [ ] Add status.
- [ ] Add email/phone fields as required.
- [ ] Add passwordless or invitation-ready auth abstraction.
- [ ] Add current user endpoint.
- [ ] Add authorization guards.
- [ ] Add tests for role checks.

### Acceptance Criteria

- API can identify current user.
- Role-based access checks work.
- Inactive users cannot access private mode.

---

## 2.2 Organization Domain

### Build

Simple V1 organization structure.

V1 structure is intentionally simplified:

```text
Country / City / Chorągiew
```

Do not implement full Generalate/Province/Commandery hierarchy in V1.

### Entities

- Choragiew
- Membership
- OfficerAssignment

### Tasks

- [ ] Create chorągiew model.
- [ ] Create membership model.
- [ ] Link user to chorągiew.
- [ ] Add officer assignment.
- [ ] Add API for user's own chorągiew.
- [ ] Add admin API for chorągiew management.

### Acceptance Criteria

- Brother belongs to one chorągiew.
- Officer is scoped to own chorągiew.
- Super Admin can manage all chorągwie.

---

## 2.3 Content Base Model

### Build

Common publishing model.

### Applies to

- prayers;
- events;
- announcements;
- approved content pages / informational material;
- silent prayer events.

### Fields

- title;
- body/content;
- status;
- visibility;
- language;
- createdBy;
- updatedBy;
- publishedAt;
- approvedAt;
- archivedAt.

### Tasks

- [ ] Define content status enum: `DRAFT`, `REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`.
- [ ] Define visibility enum.
- [ ] Add audit metadata fields.
- [ ] Implement reusable filtering utility.
- [ ] Add tests for filtering.

### Acceptance Criteria

- Only published content is visible to app users.
- Private content is filtered according to role and chorągiew.

---

# Phase 3 — Public Discovery Mode

## Goal

Allow users to open the app without login and receive real value.

## 3.1 Public Mobile Shell

### Build

Unauthenticated app experience.

### Screens

- Public Home
- About the Order
- Public Events
- Public Event Details
- Public Prayer Library
- Public Prayer Details
- Join the Order
- Login entry point

### Tasks

- [ ] Mobile app opens without authentication.
- [ ] Add public navigation.
- [ ] Add public home screen.
- [ ] Add login button.
- [ ] Add stable empty/loading/error states.
- [ ] Add visual distinction between public and authenticated mode.

### Acceptance Criteria

- Fresh install opens public home.
- User is not forced to log in.
- Private sections are not accessible.

---

## 3.2 Public Home

### Build

First screen for guests, wives, interested people, and candidates.

### Content

- short explanation of the Order;
- prayer of the day;
- nearest public/family-open event;
- call to action: "Learn about the Order";
- call to action: "I want to join";
- login entry point.

### Tasks

- [ ] Fetch public prayer of the day.
- [ ] Fetch next public event.
- [ ] Show short Order intro.
- [ ] Add "I want to join" CTA.
- [ ] Add "Login" CTA.

### Acceptance Criteria

- Guest understands what the app is.
- Guest can access prayers and public events immediately.
- Guest can start candidate interest flow.

---

## 3.3 About the Order

### Build

Public educational section.

### Content

- mission;
- spirituality;
- who can join;
- what is a chorągiew;
- candidate path;
- FAQ.

### Tasks

- [ ] Add static or CMS-backed content.
- [ ] Add sections for mission and values.
- [ ] Add candidate path explanation.
- [ ] Add FAQ.
- [ ] Add CTA to join request.

### Acceptance Criteria

- Interested user understands the basic identity of the Order.
- Candidate has a clear next step.

---

# Phase 4 — Public Content: Prayers and Events

## Goal

Make the app useful before authentication through public prayers and events.

## 4.1 Prayer Library API and Admin

### Build

Prayer content management.

### Tasks

- [ ] Create prayer entity.
- [ ] Add prayer categories.
- [ ] Add language.
- [ ] Add visibility.
- [ ] Add content status.
- [ ] Add admin CRUD.
- [ ] Add publish/archive actions.
- [ ] Add public prayer query.
- [ ] Add authenticated prayer query.
- [ ] Add tests for visibility.

### Acceptance Criteria

- Public users see only public published prayers.
- Candidate users see public + candidate prayers.
- Brothers see public + brother/chorągiew prayers.
- Admin can manage prayer content without mobile release.

---

## 4.2 Mobile Prayer Library

### Build

Prayer reading experience.

### Screens

- Prayer categories
- Prayer list
- Prayer detail
- Search
- Favorites if simple enough

### Tasks

- [ ] Show public prayer categories.
- [ ] Show prayer list.
- [ ] Show prayer detail.
- [ ] Add search.
- [ ] Add local favorite support if low-cost.
- [ ] Add offline cache for previously opened prayers if reasonable.

### Acceptance Criteria

- Guest can use the app as a prayer book.
- Reading experience is calm and accessible.
- Brother-only prayers remain hidden until login.

---

## 4.3 Event API and Admin

### Build

Unified event engine with audience control.

### Event Types

- meeting;
- prayer;
- retreat;
- pilgrimage;
- charity_action;
- formation;
- family;
- other.

### Tasks

- [ ] Create event entity.
- [ ] Add type.
- [ ] Add start/end time.
- [ ] Add location.
- [ ] Add visibility/audience.
- [ ] Add target chorągiew when applicable.
- [ ] Add status: draft/published/cancelled/archived.
- [ ] Add admin CRUD.
- [ ] Add public event query.
- [ ] Add authenticated event query.
- [ ] Add tests for visibility.

### Acceptance Criteria

- Public users see only public/family-open events.
- Candidate users see public + candidate events.
- Brothers see public + brother/chorągiew events.
- Officer can manage own chorągiew events.

---

## 4.4 Mobile Public Events

### Build

Public events section.

### Tasks

- [ ] Show public/family-open events.
- [ ] Show event details.
- [ ] Add "add to calendar" only when supported by the selected mobile shell; do not block V1.
- [ ] Add share action only when supported by the selected mobile shell; do not block V1.
- [ ] Add event interest for public events only if connected to candidate request flow.

### Acceptance Criteria

- Guest can discover real open events.
- Closed brother events are not visible.

---

# Phase 5 — Authentication and Account Modes

## Goal

Add login and switch the app from public mode to candidate or brother mode.

## 5.1 Authentication Flow

### Build

Login and session handling.

### Tasks

- [ ] Implement login.
- [ ] Implement logout.
- [ ] Implement session refresh.
- [ ] Implement current user endpoint.
- [ ] Implement authenticated app routing.
- [ ] Add forbidden/unauthorized handling.
- [ ] Add inactive user handling.

### Acceptance Criteria

- User can log in and log out.
- App changes mode based on user role.
- Unauthorized access is blocked.

---

## 5.2 Mode Resolution

### Build

Frontend logic that decides which experience to show.

### Modes

- Public Mode
- Candidate Mode
- Brother Mode
- Officer/Admin Web Mode

### Tasks

- [ ] Detect unauthenticated state.
- [ ] Detect candidate role.
- [ ] Detect brother role.
- [ ] Detect officer role.
- [ ] Load role-specific home screen.
- [ ] Prevent access to incompatible screens.

### Acceptance Criteria

- Guest sees public home.
- Candidate sees candidate dashboard.
- Brother sees brother today screen.
- Officer uses admin panel for admin functions.

---

# Phase 6 — Admin Lite Foundation

## Goal

Create minimal admin panel to operate V1 without direct database editing.

## 6.1 Admin Shell

### Build

Admin app baseline.

### Screens

- Login
- Dashboard
- Chorągwie
- Brothers
- Candidates
- Candidate Requests
- Events
- Prayers
- Announcements
- Roadmap Requests
- Silent Prayer Events

### Tasks

- [ ] Create admin layout.
- [ ] Add role-protected admin routing.
- [ ] Add dashboard.
- [ ] Add navigation.
- [ ] Add loading/error/empty states.
- [ ] Add access denied page.

### Acceptance Criteria

- Officer can enter admin panel.
- Officer sees only allowed sections.
- Super Admin sees global sections.

---

## 6.2 Chorągiew Management

### Build

Create and manage chorągwie.

### Tasks

- [ ] Super Admin creates chorągiew.
- [ ] Super Admin edits chorągiew.
- [ ] Super Admin archives chorągiew.
- [ ] Super Admin assigns Officer.
- [ ] Officer views own chorągiew.
- [ ] Officer cannot edit unrelated chorągwie.

### Acceptance Criteria

- Basic organization can be managed from admin.
- Scope restrictions work.

---

## 6.3 Brother Registry

### Build

Manage brothers.

### Tasks

- [ ] Officer creates brother in own chorągiew.
- [ ] Officer edits brother in own chorągiew.
- [ ] Officer changes status.
- [ ] Officer assigns current degree.
- [ ] Officer deactivates brother.
- [ ] Super Admin manages all brothers.
- [ ] Critical changes are audited.

### Acceptance Criteria

- Brother account can be created without developer intervention.
- Brother data is scoped by chorągiew.
- Brother cannot edit critical fields directly.

---

# Phase 7 — Candidate Funnel

## Goal

Turn public interest into structured candidate onboarding.

## 7.1 Join Interest Request

### Build

Public candidate interest form.

### Fields

- first name;
- last name;
- email;
- phone optional;
- country;
- city;
- preferred language;
- message;
- data processing consent.

### Tasks

- [ ] Add public join form.
- [ ] Add consent checkbox.
- [ ] Validate required fields.
- [ ] Create candidate request.
- [ ] Show confirmation screen.
- [ ] Notify admin/officer if notification infrastructure exists.

### Acceptance Criteria

- Guest can submit interest.
- Request appears in admin panel.
- Consent is stored.

---

## 7.2 Candidate Request Management

### Build

Admin pipeline for incoming interest.

### Statuses

- new;
- contacted;
- invited;
- rejected;
- converted_to_candidate.

### Tasks

- [ ] Show candidate request list.
- [ ] Show request details.
- [ ] Filter by status.
- [ ] Change status.
- [ ] Assign chorągiew.
- [ ] Add officer note.
- [ ] Create candidate account from request.
- [ ] Send or generate invitation.

### Acceptance Criteria

- Officer can manage candidate interest.
- Candidate is not automatically made a brother.
- Candidate pipeline is traceable.

---

## 7.3 Authenticated Candidate Mode

### Build

Candidate app experience after invitation/login.

### Screens

- Candidate Dashboard
- Candidate Roadmap
- Candidate Events
- Candidate Announcements
- Contact / Assigned Chorągiew

### Tasks

- [ ] Create candidate dashboard.
- [ ] Show candidate roadmap.
- [ ] Show candidate-visible events.
- [ ] Show candidate-visible prayers.
- [ ] Show assigned chorągiew/contact if available.
- [ ] Prevent brother-only content access.

### Acceptance Criteria

- Candidate has a guided onboarding experience.
- Candidate cannot access brother-only features.

---

# Phase 8 — Brother Companion Core

## Goal

Build the authenticated brother experience.

## 8.1 Brother Today

### Build

Personal brother dashboard.

### Cards

- current degree;
- next formation step;
- prayer of the day;
- next chorągiew event;
- latest announcement;
- active silent prayer.

### Tasks

- [ ] Add brother today API.
- [ ] Add mobile today screen.
- [ ] Show current degree.
- [ ] Show next roadmap step.
- [ ] Show next relevant event.
- [ ] Show latest relevant announcement.
- [ ] Show active silent prayer.
- [ ] Add empty states.

### Acceptance Criteria

- Brother can open app and understand what matters today.
- Today screen uses personalized filtering.

---

## 8.2 Brother Profile

### Build

Read-only brother profile.

### Fields

- name;
- photo optional;
- role;
- status;
- current degree;
- chorągiew;
- joining date optional;
- basic formation history optional.

### Tasks

- [ ] Add profile endpoint.
- [ ] Add mobile profile screen.
- [ ] Show membership data.
- [ ] Show current degree.
- [ ] Show role/status.
- [ ] Add logout entry.

### Acceptance Criteria

- Brother sees own identity in the Order.
- Critical data is read-only.

---

## 8.3 My Chorągiew

### Build

Local community screen.

### Content

- chorągiew name;
- city/parish;
- officer;
- chaplain optional;
- upcoming events;
- latest announcements;
- brother list only if enabled.

### Tasks

- [ ] Add own chorągiew endpoint.
- [ ] Add mobile screen.
- [ ] Show basic chorągiew data.
- [ ] Show upcoming events.
- [ ] Show latest announcements.
- [ ] Add privacy-controlled brother list if approved.

### Acceptance Criteria

- Brother sees local community context.
- Privacy-sensitive data is not exposed by default.

---

# Phase 9 — Events, Participation, Announcements, Push

## Goal

Support practical community coordination.

## 9.1 Authenticated Event Participation

### Build

Participation intent for events.

### Tasks

- [ ] Add event participation entity.
- [ ] Brother can mark "planning to attend".
- [ ] Brother can cancel participation intent.
- [ ] Candidate can mark interest for candidate/open events.
- [ ] Officer can see interested participants for own events.
- [ ] Add tests for visibility and permissions.

### Acceptance Criteria

- Event participation is simple and not attendance tracking.
- Officer can estimate participation.

---

## 9.2 Announcements

### Build

Audience-based announcements.

### Tasks

- [ ] Create announcement entity.
- [ ] Add title/body.
- [ ] Add visibility/audience.
- [ ] Add pinned flag.
- [ ] Add status.
- [ ] Add admin CRUD.
- [ ] Add mobile announcement list.
- [ ] Add details screen.
- [ ] Add unread state only if the phase includes a read-tracking table; otherwise defer without blocking V1.

### Acceptance Criteria

- Public announcements can be public.
- Candidate announcements are candidate-only.
- Brother/chorągiew announcements are private.
- Announcements do not become chat.

---

## 9.3 Push Notifications

### Build

Basic push support for authenticated users.

### Notification Categories

- events;
- announcements;
- roadmap updates;
- prayer reminders.

### Tasks

- [ ] Add device token registration.
- [ ] Add notification preferences.
- [ ] Add event notification trigger.
- [ ] Add announcement notification trigger.
- [ ] Add roadmap update notification trigger.
- [ ] Respect user preferences.
- [ ] Do not send push to unauthenticated guests.

### Acceptance Criteria

- Brother/Candidate can receive relevant notifications.
- User can disable optional categories.
- Push is audience-safe.

---

# Phase 10 — Formation Roadmap

## Goal

Support candidate onboarding and brother formation without over-automation.

## 10.1 Roadmap Configuration

### Build

Configurable roadmap model.

### Entities

- Roadmap
- RoadmapStage
- RoadmapStep
- RoadmapAssignment
- RoadmapSubmission

### Tasks

- [ ] Add roadmap model.
- [ ] Add roadmap stage model.
- [ ] Add roadmap step model.
- [ ] Add target role/type: candidate or brother.
- [ ] Add visibility/status.
- [ ] Add admin configuration UI.
- [ ] Add publish/archive behavior.

### Acceptance Criteria

- Candidate and brother roadmaps can be configured without release.
- Roadmap content is not hardcoded in mobile app.

---

## 10.2 Candidate Roadmap

### Build

Candidate onboarding path.

### Example steps

- learn about the Order;
- contact local chorągiew;
- attend open meeting;
- speak with officer;
- preparation period;
- decision/invitation.

### Tasks

- [ ] Candidate sees roadmap.
- [ ] Candidate sees next step.
- [ ] Candidate can submit simple progress/interest.
- [ ] Officer can review candidate progress.
- [ ] Officer can convert candidate to brother.

### Acceptance Criteria

- Candidate does not get lost after submitting interest.
- Officer has a manageable onboarding pipeline.

---

## 10.3 Brother Formation Roadmap

### Build

Brother formation tracking.

### Tasks

- [ ] Brother sees current degree.
- [ ] Brother sees requirements for next degree.
- [ ] Brother sees steps.
- [ ] Brother submits step for review.
- [ ] Officer confirms/rejects step.
- [ ] Officer adds comment.
- [ ] Brother sees review result.
- [ ] Officer can manually update degree if permitted.
- [ ] Changes are audited.

### Acceptance Criteria

- Roadmap supports human discernment.
- App does not automatically award degrees.
- Brother receives clarity without spiritual pressure.

---

# Phase 11 — Silent Online Prayer

## Goal

Implement a unique prayer experience with no chat, no audio, no video, and no social noise.

## 11.1 Silent Prayer Event Management

### Build

Admin creation of prayer sessions.

### Fields

- title;
- intention;
- linked prayer optional;
- start time;
- end time;
- visibility/audience;
- target chorągiew optional;
- status.

### Tasks

- [ ] Add silent prayer event entity.
- [ ] Add admin CRUD.
- [ ] Add visibility.
- [ ] Add publish/cancel.
- [ ] Show in public/candidate/brother app according to audience.

### Acceptance Criteria

- Admin/Officer can create public or private prayer sessions.
- Sessions appear only to correct audiences.

---

## 11.2 Public Silent Prayer

### Build

Anonymous participation for public prayer.

### Tasks

- [ ] Guest sees public silent prayer.
- [ ] Guest opens session.
- [ ] Guest presses "I am praying".
- [ ] Counter increments anonymously.
- [ ] Guest can leave.
- [ ] Guest is not stored as brother participant.
- [ ] Counter handles disconnect timeout.

### Acceptance Criteria

- Public prayer works without login.
- No personal data is collected for anonymous participants beyond what is necessary for technical operation.

---

## 11.3 Brother Silent Prayer

### Build

Authenticated participation for brother prayer.

### Tasks

- [ ] Brother sees private silent prayer.
- [ ] Brother joins session.
- [ ] Presence is counted once per user.
- [ ] Counter updates in real time.
- [ ] Brother can leave.
- [ ] Disconnect timeout works.
- [ ] Session summary shows aggregate count only.

### Acceptance Criteria

- Brother feels connected in prayer.
- App does not expose participant list unless explicitly approved later.
- Counter is resilient to reconnects.

---

## 11.4 Real-Time Presence Infrastructure

### Build

Socket/real-time layer.

### Tasks

- [ ] Add Socket.io gateway or equivalent.
- [ ] Add Redis adapter if multiple API instances are expected.
- [ ] Add join/leave events.
- [ ] Add heartbeat.
- [ ] Add timeout cleanup.
- [ ] Add room-level counters.
- [ ] Add reconnection state in mobile app.

### Acceptance Criteria

- Counter updates for active users.
- Bad network does not break the screen.
- Duplicate counting is prevented.

---

# Phase 12 — Privacy, Security, Audit, Content Approval

## Goal

Make V1 safe enough for pilot usage.

## 12.1 Privacy Controls

### Build

Strict privacy defaults.

### Tasks

- [ ] Hide brother list by default unless explicitly enabled.
- [ ] Never show exact private addresses.
- [ ] Do not expose roadmap data to unrelated users.
- [ ] Do not expose candidate requests outside admin scope.
- [ ] Do not expose prayer participation lists.
- [ ] Add privacy review checklist.

### Acceptance Criteria

- Default behavior is privacy-preserving.
- Sensitive data is scoped.

---

## 12.2 Content Approval

### Build

Basic content approval workflow.

### Tasks

- [ ] Add content statuses.
- [ ] Add approval metadata.
- [ ] Prevent publishing unapproved content if required by configuration.
- [ ] Add archive behavior.
- [ ] Track createdBy/updatedBy/publishedBy.

### Acceptance Criteria

- Spiritual content is controlled.
- Admin can manage content lifecycle.

---

## 12.3 Audit Log

### Build

Audit critical administrative actions.

### Audit actions

- user created;
- user status changed;
- role changed;
- degree changed;
- roadmap request approved/rejected;
- event published/cancelled;
- announcement published;
- prayer content published;
- visibility changed.

### Tasks

- [ ] Add audit log entity.
- [ ] Add audit logging utility.
- [ ] Log critical admin actions.
- [ ] Add super admin audit view for pilot; limited officer audit view remains approval-gated.
- [ ] Add tests for key audit actions.

### Acceptance Criteria

- Critical changes are traceable.
- Audit logging does not block normal operation unless required.

---

# Phase 13 — Release Hardening and Pilot

## Goal

Prepare for real usage by one pilot chorągiew.

## 13.1 Mobile Hardening

### Tasks

- [ ] Verify app works without login.
- [ ] Verify login works.
- [ ] Verify candidate mode.
- [ ] Verify brother mode.
- [ ] Verify public/private visibility.
- [ ] Verify offline/poor network states.
- [ ] Verify prayer text readability.
- [ ] Verify notification permissions.
- [ ] Verify no crashes on empty data.
- [ ] Add basic accessibility pass.

### Acceptance Criteria

- App can be used by guest, candidate, and brother without developer support.
- No critical crash in core journeys.

---

## 13.2 Admin Hardening

### Tasks

- [ ] Verify officer cannot access other chorągwie.
- [ ] Verify super admin can manage global data.
- [ ] Verify content publishing.
- [ ] Verify event creation.
- [ ] Verify candidate request flow.
- [ ] Verify roadmap approval flow.
- [ ] Verify audit metadata.
- [ ] Replace destructive delete with archive/deactivate where possible.

### Acceptance Criteria

- Admin Lite is safe enough for non-technical officer.
- Admin cannot accidentally expose private content without explicit visibility choice.

---

## 13.3 Pilot Seed

### Build

Seed data for pilot.

### Tasks

- [ ] Create one pilot chorągiew.
- [ ] Create one super admin.
- [ ] Create one officer.
- [ ] Create 5-20 brothers.
- [ ] Create 1-5 candidates.
- [ ] Add basic public prayers.
- [ ] Add brother-only prayers if needed.
- [ ] Add one public event.
- [ ] Add one brother event.
- [ ] Add one candidate event.
- [ ] Add one public silent prayer.
- [ ] Add one brother silent prayer.
- [ ] Add one announcement for each audience.

### Acceptance Criteria

- Pilot group can test realistic workflows.
- Public mode has meaningful content.
- Authenticated mode has meaningful content.

---

## 13.4 Pilot Validation Scenarios

### Scenario A — Guest

- [ ] Open app without login.
- [ ] Read public prayer.
- [ ] View public event.
- [ ] Read about the Order.
- [ ] Submit join request.
- [ ] Join public silent prayer.

### Scenario B — Candidate

- [ ] Log in as candidate.
- [ ] Open candidate dashboard.
- [ ] View candidate roadmap.
- [ ] View candidate event.
- [ ] Read candidate prayer.
- [ ] Confirm candidate cannot access brother content.

### Scenario C — Brother

- [ ] Log in as brother.
- [ ] Open Brother Today.
- [ ] View profile.
- [ ] View my chorągiew.
- [ ] View brother event.
- [ ] Mark event participation intent.
- [ ] Submit roadmap step.
- [ ] Join brother silent prayer.
- [ ] Confirm private data is not public.

### Scenario D — Officer

- [ ] Log in to admin.
- [ ] Create event.
- [ ] Publish announcement.
- [ ] Review candidate request.
- [ ] Approve/reject roadmap request.
- [ ] Create silent prayer event.
- [ ] Confirm officer cannot access unrelated chorągiew data.

### Scenario E — Super Admin

- [ ] Create chorągiew.
- [ ] Assign officer.
- [ ] Manage global prayers.
- [ ] Publish global public content.
- [ ] Review audit logs if implemented.

### Acceptance Criteria

- All pilot scenarios pass.
- Any failure is classified as blocker, important, or later.

---

# Final V1 Definition of Done

V1 is complete when all of the following are true:

## Public Mode

- [ ] App opens without login.
- [ ] Guest sees public home.
- [ ] Guest can read public prayers.
- [ ] Guest can see public/family-open events.
- [ ] Guest can read about the Order.
- [ ] Guest can submit interest request.
- [ ] Guest can join public silent prayer anonymously.

## Candidate Mode

- [ ] Candidate can log in.
- [ ] Candidate sees candidate dashboard.
- [ ] Candidate sees candidate roadmap.
- [ ] Candidate sees candidate events.
- [ ] Candidate sees candidate announcements.
- [ ] Candidate cannot see brother-only content.

## Brother Mode

- [ ] Brother can log in.
- [ ] Brother sees Today dashboard.
- [ ] Brother sees own profile.
- [ ] Brother sees own chorągiew.
- [ ] Brother sees relevant events.
- [ ] Brother sees relevant announcements.
- [ ] Brother uses prayer library.
- [ ] Brother uses formation roadmap.
- [ ] Brother submits roadmap step.
- [ ] Brother joins brother silent prayer.

## Admin Lite

- [ ] Super Admin manages chorągwie.
- [ ] Officer manages own chorągiew brothers.
- [ ] Officer manages candidate requests.
- [ ] Officer creates events.
- [ ] Officer creates announcements.
- [ ] Officer creates silent prayer events.
- [ ] Officer reviews roadmap submissions.
- [ ] Admin can manage prayers/content.
- [ ] Visibility rules are enforced.

## Safety

- [ ] Private content is not visible publicly.
- [ ] Brother data is scoped.
- [ ] Candidate data is scoped.
- [ ] Roadmap data is scoped.
- [ ] Silent prayer does not expose participant lists.
- [ ] Critical admin changes are audited.
- [ ] Destructive deletes are avoided.

---

# Recommended Implementation Order

Use this order unless blocked:

1. Phase 0 — Product and technical baseline.
2. Phase 1 — Repository and infrastructure baseline.
3. Phase 2 — Core domain model and API foundation.
4. Phase 3 — Public mobile shell.
5. Phase 4 — Public prayers and events.
6. Phase 5 — Authentication and mode switching.
7. Phase 6 — Admin Lite foundation.
8. Phase 7 — Candidate funnel.
9. Phase 8 — Brother companion core.
10. Phase 9 — Events, announcements, push.
11. Phase 10 — Formation roadmap.
12. Phase 11 — Silent online prayer.
13. Phase 12 — Privacy, security, audit, content approval.
14. Phase 13 — Release hardening and pilot.

---

# V2 Backlog

These are outside default V1. If one becomes strongly justified, ask for explicit human-owner approval and update scope/backlog/traceability plus affected implementation docs before implementation.

## V2.1 Missions

- mission list;
- charity actions;
- volunteering;
- reports;
- best practices between chorągwie.

## V2.2 Extended Hierarchy

- Province;
- Commandery;
- Generalate;
- hierarchical permissions;
- approval chains by level.

## V2.3 Advanced Formation

- retreat tracking;
- required time intervals;
- advanced degree approval workflows;
- officer/capellan review;
- formation materials by degree.

## V2.4 Knowledge Library

- Reguła;
- Ceremonial;
- documents of the Order;
- writings of St. John Paul II;
- versioned documents;
- offline library.

## V2.5 Analytics

- chorągiew activity;
- event participation;
- candidate conversion;
- growth reporting;
- exportable reports.

## V2.6 Churches and Mass Times

- church map;
- mass times;
- OSM integration;
- moderated crowdsourcing.

## V2.7 Payments

- membership fees;
- treasurer role;
- payment history;
- contribution reports.

## V2.8 Family Accounts

- wife/family role;
- family-visible events;
- family communication preferences.

---

# Agent Notes

When implementing, preserve this product intent:

- Public mode exists to attract and educate.
- Candidate mode exists to guide without exposing private brother content.
- Brother mode exists to support daily spiritual and community life.
- Admin Lite exists only to support V1 operations.
- Privacy and dignity are more important than analytics.
- The app must feel calm, respectful, and spiritually focused.
