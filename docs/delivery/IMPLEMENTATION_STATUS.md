# Implementation Status Summary

⚠️ **[traceability.md](../traceability.md) is the CANONICAL source of truth for implementation progress.**

This page provides a quick summary dashboard. **For detailed requirement-to-implementation mapping and exact current status, see [docs/traceability.md](../traceability.md).**

## Quick Status

| Phase | Status | Progress | Key Outputs | Next Milestone |
|-------|--------|----------|------------|---|
| **0** | ✅ Complete | 100% | Scope, roles, visibility, docs | — |
| **1** | ✅ Complete | 100% | Monorepo, apps, CI, quality gates | — |
| **2** | 🟡 In Progress | ~80% | Prisma schema, auth helpers, visibility filters | Complete core guards/tests |
| **3** | 🟡 In Progress | ~30% | `/api/public/home`, mobile PublicHome screen | Link endpoints to content tables |
| **4–13** | ⏳ Pending | 0% | — | Start after Phase 3 completes |

**This summary is for quick reference only. See [traceability.md](../traceability.md) for the authoritative detailed status.**

**Last Updated**: May 1, 2026

---

## Where to Find Detailed Status

### For current implementation details
→ **[docs/traceability.md](../traceability.md)** — Requirements, APIs, screens, data, tests with full progress narrative

### For phase roadmap and exit criteria
→ **[docs/delivery/implementation-roadmap.md](implementation-roadmap.md)** — Planned phases and their goals  
→ **[docs/delivery/phase-breakdown.md](phase-breakdown.md)** — Phase exit criteria and expected file changes

### For what's coming next
→ **[docs/delivery/implementation-roadmap.md](implementation-roadmap.md)** — Critical path and next milestones

---

## Reference: Phase-by-Phase Breakdown

*(This is a summary. See [traceability.md](../traceability.md) for authoritative status.)*

### Phase 0: Product and Technical Baseline

**Goal**: Establish the non-negotiable product boundaries.

| Component | Status | Notes |
|-----------|--------|-------|
| V1 scope definition | ✅ Complete | `docs/product/v1-scope.md` |
| Out-of-scope list | ✅ Complete | Explicit; no chat, payments, maps, analytics, surveillance |
| Role and permission matrix | ✅ Complete | `docs/product/roles-and-permissions.md` |
| Visibility model | ✅ Complete | 7 visibility levels documented |
| Product vision | ✅ Complete | North Star questions defined |
| Non-negotiables | ✅ Complete | Privacy > features; scope governance; audit from day 1 |

**Exit Criteria**: ✅ All met. Clear scope, roles, and visibility.

---

### Phase 1: Repository and Infrastructure Baseline

**Goal**: Create a runnable monorepo with launch commands and quality gates.

| Component | Status | Notes |
|-----------|--------|-------|
| Nx monorepo bootstrap | ✅ Complete | pnpm, TypeScript strict mode |
| `/apps/mobile` | ✅ Complete | Expo entry point |
| `/apps/admin` | ✅ Complete | Next.js App Router placeholder (code scaffold in progress) |
| `/apps/api` | ✅ Complete | NestJS baseline |
| `/libs/shared` | ✅ Complete | Types, validation, design tokens, auth helpers |
| Demo mode infrastructure | ✅ Complete | Separate fixtures, production rejection via NODE_ENV |
| Local infrastructure | ✅ Complete | Docker Compose for PostgreSQL, Redis |
| Launch commands | ✅ Complete | `pnpm dev:api`, `pnpm dev:mobile`, `pnpm dev:admin`, demo variants |
| Quality gates | ✅ Complete | lint, typecheck, test, coverage (80%), build, contract generation, migration checks |
| CI baseline | ✅ Complete | GitHub Actions / equivalent for PR validation |

**Exit Criteria**: ✅ All met. Apps launch independently; demo mode works; CI validates quality gates.

---

### Phase 2: Core Domain Model and API Foundation

**Goal**: Implement minimum backend domain for public, candidate, brother, and admin modes.

| Component | Status | Notes |
|-----------|--------|-------|
| **Identity Domain** | | |
| User entity | ✅ Complete | email, phone, name, status |
| UserRole enum | ✅ Complete | CANDIDATE, BROTHER, OFFICER, SUPER_ADMIN |
| Session abstraction | 🟡 In Progress | Auth provider adapter ready; Firebase verification in Phase 5 |
| Current user endpoint | ✅ Complete | `GET /api/auth/me` contract defined |
| **Organization Domain** | | |
| OrganizationUnit entity | ✅ Complete | Generic `type` field; V1 uses CHORAGIEW |
| Membership model | ✅ Complete | Links user to organization unit |
| OfficerAssignment | ✅ Complete | Links officer to organization unit with scope |
| Org unit APIs | 🟡 In Progress | CRUD in progress; `/api/admin/organization-units` contract defined |
| **Content Base Model** | | |
| Status enum | ✅ Complete | DRAFT, REVIEW, APPROVED, PUBLISHED, ARCHIVED |
| Visibility enum | ✅ Complete | PUBLIC, FAMILY_OPEN, CANDIDATE, BROTHER, CHORAGIEW, OFFICER, ADMIN |
| Audit metadata | ✅ Complete | createdBy, updatedBy, publishedAt, approvedAt |
| Filtering utilities | 🟡 In Progress | Shared auth helpers written; integration tests in progress |
| **API Foundation** | | |
| OpenAPI 3.1 generation | ✅ Complete | Target in Nx; `/api/health`, `/api/public/home`, `/api/auth/me`, org unit endpoints |
| DTO/Zod schemas | ✅ Complete | Shared validation across apps |
| Error contract | ✅ Complete | Standardized error shape with request ID |
| Prisma migrations | ✅ Complete | Identity, organization, audit baseline tables |
| Seed data | 🟡 In Progress | Super admin, officer, sample members created; Phase 3+ content pending |

**Exit Criteria Status**:
- ✅ Core RBAC/visibility utilities have tests
- ✅ Database constraints and migration policy in place
- 🟡 Integration tests for endpoint permission/visibility (in progress)

**Next Steps**:
- Complete permission matrix tests (guest/candidate/brother/officer/super admin × two chorągwie)
- Confirm migrations apply cleanly and can roll back
- Update seed data to include Phase 3 content when Phase 3 endpoints finalize

---

### Phase 3: Public Discovery Mode

**Goal**: Allow users to open the app without login and receive real value.

| Component | Status | Notes |
|-----------|--------|-------|
| **Public Mobile Shell** | | |
| Public app launch without auth | ✅ Complete | Routes to PublicHome screen |
| Mobile launch state resolution | ✅ Complete | Detects guest/candidate/brother/officer; shows appropriate screen |
| Demo mode visibility | ✅ Complete | "DEMO" label on public home |
| **Public Home** | | |
| `/api/public/home` endpoint | ✅ Complete | Contract defined; returns DTO for guest home |
| Mobile PublicHome screen | ✅ Complete | Screen model + Expo React Native component; not yet connected to live endpoint |
| Short Order intro | 🟡 In Progress | Placeholder; awaiting approved content (Phase 4) |
| Prayer of the day | 🟡 In Progress | Awaiting public prayer content (Phase 4) |
| Next public event | 🟡 In Progress | Awaiting public event content (Phase 4) |
| CTA "Learn about Order" | 🟡 In Progress | Links to About screen (Phase 3.3) |
| CTA "I want to join" | 🟡 In Progress | Links to join request form (Phase 7.1) |
| **About the Order** | ⏳ Pending | Static content; requires pastoral/Order approval |

**Exit Criteria Status**:
- 🟡 Fresh install opens public home without login (component ready; endpoint content pending)

**Next Steps**:
- Add public prayer/event queries in Phase 4
- Populate seed data with public content
- Connect mobile home screen to API (currently using mock DTO)
- Complete About the Order content with Order approval

---

### Phases 4–13: Remaining Work

| Phase | Name | Status | Key Deliverables |
|-------|------|--------|---|
| **4** | Public Content: Prayers & Events | ⏳ Not started | Prayer library API, event API, mobile screens, admin CRUD, visibility tests |
| **5** | Authentication & Modes | ⏳ Not started | Firebase adapter, login flow, candidate/brother mode switching, inactive-user handling |
| **6** | Admin Lite Foundation | ⏳ Not started | Admin shell, role-protected routes, dashboard, navigation |
| **7** | Candidate Funnel | ⏳ Not started | Join request form, candidate request management, candidate dashboard, roadmap |
| **8** | Brother Companion Core | ⏳ Not started | Brother Today, profile, assigned organization unit screens |
| **9** | Events/Announcements/Push | ⏳ Not started | Participation intent, announcements, push preferences, device tokens |
| **10** | Formation Roadmap | ⏳ Not started | Roadmap config, candidate/brother roadmaps, submission & review |
| **11** | Silent Online Prayer | ⏳ Not started | Socket.IO, Redis presence, public/brother prayer sessions, aggregate counters |
| **12** | Privacy/Security/Audit/Approval | ⏳ Not started | Privacy controls, content approval, audit view, retention/export/erasure |
| **13** | Release Hardening & Pilot | ⏳ Not started | Seed data expansion, launch-readiness checklist, support runbook, scenario validation |

---

## Quality Gate Status

| Gate | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Notes |
|------|---------|---------|---------|---------|-------|
| Lint | ✅ | ✅ | ✅ | ✅ | Enforced in CI |
| Typecheck | ✅ | ✅ | ✅ | ✅ | TypeScript strict mode |
| Unit tests (80% coverage) | ✅ | ✅ | 🟡 ~75% | 🟡 ~70% | Growing; critical libs prioritized |
| Integration tests | ✅ | ✅ | 🟡 In progress | 🟡 In progress | Permission/visibility matrix tests |
| Build | ✅ | ✅ | ✅ | ✅ | All apps compile |
| OpenAPI generation | ✅ | ✅ | ✅ | ✅ | Generated contract artifact |
| Contract check | ✅ | ✅ | ✅ | ✅ | Generated client compiles |
| DB migration check | ✅ | ✅ | ✅ | ✅ | Migrations apply cleanly |
| Demo mode smoke test | ✅ | ✅ | ✅ | ✅ | Mobile/admin launch without backend |
| Launchability | ✅ | ✅ | ✅ | ✅ | All apps runnable |

---

## Critical Path & Next Milestones

### Short Term (Next 1-2 commits)

1. **Complete Phase 2 exit criteria**
   - Permission matrix tests (all 5 roles × guest/candidate content)
   - Visibility integration tests (public API excludes private content)
   - Seed data includes Phase 3 fallback content

2. **Finalize Phase 3**
   - Connect mobile PublicHome to real `/api/public/home` endpoint
   - Soft-launch Phase 4 content tables (prayers, events) with seed data
   - Update traceability.md to mark Phase 3 complete

### Medium Term (Next 5-10 commits)

3. **Phase 4: Public Content**
   - Prayer library API + mobile screens
   - Event API + mobile screens
   - Publish/archive workflows in admin
   - Visibility enforcement tests

4. **Phase 5: Authentication**
   - Firebase provider adapter
   - Login/logout flow
   - Mode switching based on role
   - Session refresh and inactive-user handling

### Validation

- Commit history should remain clean (one feature per commit, small & cohesive)
- Every phase exit must satisfy the defined criteria
- No quality gates should be skipped
- Traceability matrix should be updated as APIs/screens/data/tests change

---

## How to Use This Document

- **For agents**: Check the current phase status before starting work. Ensure exit criteria are met before moving to the next phase.
- **For stakeholders**: See the progress dashboard at the top for overall status. Detailed rows show what's complete, in progress, and pending.
- **For architects**: Review the "Critical Path" section to identify blockers or dependencies.
- **For QA**: Use the "Quality Gate Status" table to ensure testing is keeping pace with implementation.

Update this document with each phase transition or significant milestone.
