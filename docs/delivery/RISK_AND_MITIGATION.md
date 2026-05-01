# Risk Register & Mitigation Plan

This document identifies potential risks that could derail the JP2 App pilot or production release, and the mitigations in place or planned.

## Format

Each risk includes:
- **Risk**: What could go wrong?
- **Probability**: Low / Medium / High
- **Impact**: Low / Medium / High
- **Current Mitigation**: What are we doing now?
- **Planned Mitigation**: What will we do before pilot?
- **Owner**: Who tracks this risk?
- **Status**: Open / Mitigated / Accepted

---

## High Priority Risks

### 1. Religious/Spiritual Content Misrepresentation

**Risk**: The app publishes prayers, formation content, or Order descriptions that don't reflect the Order's authentic teaching, causing spiritual confusion or loss of trust.

**Probability**: Medium (content must be approved; approval process may not be robust)  
**Impact**: High (damages Order reputation and member trust)

**Current Mitigation**:
- Explicit "Required Human Approval Areas" in [docs/README.md](../README.md)
- Pastoral approval for prayers and spiritual content documented as requirement
- Seed data placeholder ensures unvetted content is not live in pilot

**Planned Mitigation**:
- Establish a content approval workflow with clear roles (who approves prayers? who approves formation language?).
- Create a content checklist before pilot (e.g., "all public prayers approved by chaplain").
- Implement a content status enum (DRAFT → REVIEW → APPROVED → PUBLISHED) with guards preventing published content without approval.
- Document the approval process in Phase 12 (Content Approval).

**Owner**: Order Spiritual Advisor, Product Owner  
**Status**: Open (approval workflow not yet formalized)

---

### 2. Privacy Data Breach or Unauthorized Access

**Risk**: Brother names, contact info, membership status, or spiritual progress is exposed to unintended audiences (leaked publicly, accessed by unauthorized officer, etc.).

**Probability**: Medium (privacy is complex; bugs are possible)  
**Impact**: High (members' trust eroded; legal/GDPR liability; spiritual harm)

**Current Mitigation**:
- Privacy-first defaults in architecture (Phase 0)
- Visibility enum enforced server-side, never client-only
- Officer scope enforced by backend guards, not trust
- [Testing Strategy](testing-strategy.md) requires permission and visibility matrix tests
- Quality gate: 80% test coverage with focus on sensitive libraries

**Planned Mitigation**:
- Phase 2: Complete permission matrix tests (all 5 roles × guest/candidate/brother/private content)
- Phase 4: Visibility enforcement tests for every new endpoint (public API returns no brother content)
- Phase 5: Login and mode switching tests (candidate cannot access brother data after login)
- Phase 12: Privacy controls and audit tests
- Before pilot: Security review of all permission/visibility checks
- Ongoing: Code review checklist includes "is this data properly filtered?" for all queries

**Owner**: Lead Engineer, Security Reviewer  
**Status**: Open (full test coverage in progress)

---

### 3. Scope Creep into V2/Out-of-Scope Features

**Risk**: Agents or stakeholders quietly add chat, payments, maps, social features, or advanced hierarchy without proper approval, ballooning scope and delaying pilot.

**Probability**: Medium (temptation to be helpful; unclear lines can cause scope drift)  
**Impact**: High (delays pilot; undermines privacy/simplicity goals; wastes months)

**Current Mitigation**:
- Explicit V1 scope and out-of-scope lists ([docs/product/v1-scope.md](../product/v1-scope.md), [docs/product/out-of-scope.md](../product/out-of-scope.md))
- Mandatory approval gate in [AGENTS.md](../../AGENTS.md) for any V2 feature
- Quality gate rule: "Red pipeline must not be skipped to enable out-of-scope features"
- Code review checklist includes "is this in V1 scope?"

**Planned Mitigation**:
- Document approval process clearly (who is "human owner"? response time?).
- Require pull request comments linking to decision when a scope question is approved.
- Track decision in [Decision Log](DECISION_LOG.md) once approved.
- Quarterly review of [V2 Backlog](../product/v2-backlog.md) with stakeholders to confirm deferred items are still deferred.

**Owner**: Product Owner, Lead Engineer  
**Status**: Open (approval process roles not formalized)

---

### 4. Database Migration Failure in Production

**Risk**: A migration that works in dev breaks in production (e.g., timeout, constraint violation on large table, data incompatibility), causing app downtime or data loss.

**Probability**: Low (Prisma migrations are well-tested; we run clean migration tests)  
**Impact**: High (app down, user trust lost, data at risk)

**Current Mitigation**:
- Migrations are committed to version control and tested in CI
- [Quality Gates](quality-gates.md) require clean migration validation
- Seed data is reproducible
- Phase 1 includes Docker Compose for local PostgreSQL (agents can test locally)

**Planned Mitigation**:
- Before pilot: Migrate production database (or a production-like staging DB) and verify rollback works
- Document rollback procedure in support runbook ([support-and-maintenance.md](support-and-maintenance.md))
- Each migration includes a comment documenting any special considerations (e.g., "do not apply during high traffic")
- Backup and restore test run before pilot launch

**Owner**: DevOps, Lead Engineer  
**Status**: Mitigated (automated tests in place; manual validation needed before pilot)

---

### 5. Silent Prayer Counter Divergence or Duplicate Counting

**Risk**: Redis presence data and aggregate counters get out of sync (network issues, missed heartbeats), showing incorrect prayer participant counts or causing duplicate counting.

**Probability**: Medium (real-time is hard; network is unreliable)  
**Impact**: Medium (UX hiccup; breaks the prayer feature, but non-critical for pilot)

**Current Mitigation**:
- Architecture uses Redis presence and Socket.IO heartbeats
- Duplicate prevention logic in place (once-per-user counting)
- Reconnect behavior defined in [architecture/realtime-silent-prayer.md](../architecture/realtime-silent-prayer.md)

**Planned Mitigation**:
- Phase 11 includes Socket.IO reconnect tests and Redis TTL expiry tests
- Counter reconciliation logic (periodically verify count matches joined users)
- If count diverges, log incident and force refresh (graceful degradation)
- Operational runbook for resetting counter if needed

**Owner**: Lead Engineer (Backend/Real-time)  
**Status**: Open (testing framework planned for Phase 11)

---

### 6. Auth Provider Dependency / Firebase Lock-in

**Risk**: Heavy reliance on Firebase auth leads to lock-in; if Firebase API changes or we need to migrate to a different provider, effort is very high.

**Probability**: Low (unlikely Firebase goes away; but API changes are possible)  
**Impact**: Medium (high effort to migrate, but not a blocker if detected early)

**Current Mitigation**:
- Adapter pattern defined in [auth-provider-adapter.md](../architecture/auth-provider-adapter.md)
- Test/fake provider exists for development (tests don't depend on Firebase)
- Business logic is provider-agnostic; only adapter imports Firebase

**Planned Mitigation**:
- Phase 5: Implement and test fake auth provider alongside Firebase
- Code review checklist: "does business logic import Firebase directly?" (should be no)
- Document migration path if needed (not required for V1, but plan exists)

**Owner**: Lead Engineer (Backend/Auth)  
**Status**: Mitigated (architecture in place; implementation in Phase 5)

---

## Medium Priority Risks

### 7. Mobile App Performance Degradation on Older Devices

**Risk**: App becomes sluggish on older Android/iOS devices, limiting accessibility for members in less wealthy communities.

**Probability**: Medium (React Native and Expo are generally performant, but can degrade with complex screens)  
**Impact**: Medium (some members excluded; but can be addressed post-V1)

**Current Mitigation**:
- React Native and Expo chosen for broad device support
- Shared design tokens and component library
- No heavy animations or complex calculations in screens

**Planned Mitigation**:
- Phase 13 (hardening) includes performance profiling on test devices (iPhone 8, Android 8)
- Code review checklist: "Does this screen perform on older devices?"
- Lazy loading for long lists (prayers, events)
- Monitor performance metrics in production if V2 launches

**Owner**: Mobile Lead  
**Status**: Open (performance testing deferred to Phase 13)

---

### 8. Candidate Roadmap Confusion (Too Complex or Not Defined)

**Risk**: Candidate roadmap steps are unclear, redundant, or missing, causing candidates to give up or get confused.

**Probability**: Medium (roadmap language is important; easy to get wrong)  
**Impact**: Medium (candidate funnel broken; candidates don't progress to brothers)

**Current Mitigation**:
- Roadmap is configured, not hardcoded (stored in database; officers can update)
- Phase 7 includes candidate request management
- Phase 10 includes roadmap configuration UI

**Planned Mitigation**:
- Order leadership defines candidate path steps (spiritual/pastoral decision)
- Phase 10: Implement roadmap step editor for super admin
- Pilot validation includes "candidate follows roadmap and feels guided" scenario
- Post-pilot feedback from officers on clarity

**Owner**: Order Spiritual Advisor, Product Owner  
**Status**: Open (roadmap definition pending approval)

---

### 9. Officer Workload Too High (Not Enough Tools)

**Risk**: Admin Lite doesn't provide officers with efficient tools, causing manual workarounds (spreadsheets, emails) and officer burnout.

**Probability**: Medium (hard to predict admin UX needs without real usage)  
**Impact**: Medium (pilot stalls; officers overwhelmed; features added ad-hoc post-V1)

**Current Mitigation**:
- Admin Lite scope is narrow (organization units, brothers, candidates, events, roadmap)
- Phase 6 includes admin shell and scoped navigation
- Phases 7-10 add feature-specific admin UX

**Planned Mitigation**:
- Pilot includes officer feedback sessions (usability testing)
- Phase 13 pilot validation includes officer workload scenarios
- Post-pilot, prioritize high-impact UX improvements
- Defer nice-to-haves (bulk import, advanced filtering) to V2

**Owner**: Product Owner, Pilot Officer  
**Status**: Open (usability testing planned for Phase 13)

---

### 10. Notification Fatigue or Deliverability Issues

**Risk**: Push notifications are not delivered, or are delivered too frequently, causing members to disable them or distrust the app.

**Probability**: Medium (push is unreliable; audience filtering is easy to get wrong)  
**Impact**: Medium (members miss important updates; but issue is recoverable in-app)

**Current Mitigation**:
- Notification preferences allow users to opt in/out per category
- Audience filtering enforced server-side (no spam to guests)
- Phase 9 includes device token management and revocation

**Planned Mitigation**:
- Phase 9: Test notification delivery across iOS and Android
- Pilot: Monitor notification open rates and user feedback
- If delivery is low, explore push provider change or in-app messaging fallback
- Document notification best practices (when to notify, max frequency)

**Owner**: Backend Lead, QA  
**Status**: Open (implementation and testing in Phase 9)

---

## Low Priority Risks

### 11. Localization / Language Support

**Risk**: UI is not translated for non-English languages (Polish, other languages the Order uses), limiting accessibility.

**Probability**: Low (i18n is planned; content approval is the bottleneck, not implementation)  
**Impact**: Low (not a blocker for V1; deferred to V2 if needed)

**Current Mitigation**:
- i18n-ready architecture in Phase 1 (UI strings use translation keys)
- [Localization](../architecture/localization.md) doc defines expectations
- Content tables include language field

**Planned Mitigation**:
- Phase 13: Verify UI is i18n-ready (can be translated without code changes)
- V2: Translate UI and approve Polish content translations

**Owner**: Technical Writer, Localization Lead (future)  
**Status**: Mitigated (architecture ready; translation deferred to V2)

---

### 12. Offline Mode Gaps

**Risk**: Mobile app doesn't work well offline, causing frustration for members in areas with poor connectivity.

**Probability**: Low (offline caching is a nice-to-have, not a blocker for V1)  
**Impact**: Low (affects UX in some areas, but in-app state is preserved)

**Current Mitigation**:
- [Offline and Caching](../architecture/offline-and-caching.md) doc outlines expectations
- Expo provides offline support primitives
- Phase 3+ implements loading/error states

**Planned Mitigation**:
- Phase 13: Verify app degrades gracefully when offline (shows cached data, queues actions for sync)
- V2: Implement full offline sync (sync queues, conflict resolution)

**Owner**: Mobile Lead  
**Status**: Mitigated (graceful degradation planned for V1; full offline sync for V2)

---

## Accepted Risks (Known Limitations)

### 13. No Real-Time Chat or Notifications for Manual Approvals

**Risk**: Officers don't get instant notifications when a roadmap step is submitted; they check admin panel manually, causing delays.

**Probability**: High (by design; no chat or instant notifications in V1)  
**Impact**: Low (minor workflow delay; acceptable for pilot with small member count)

**Acceptance Rationale**: 
- Real-time notifications add complexity; V1 is intentionally async.
- Officers are trusted to check admin panel regularly.
- Post-pilot, can add email or SMS notifications if needed.

**Owner**: Product Owner  
**Status**: ACCEPTED

---

### 14. No Analytics or Reporting

**Risk**: Super Admin has no visibility into member engagement, event attendance, or candidate conversion rates.

**Probability**: High (by design; not in V1 scope)  
**Impact**: Medium (limits ability to optimize; but not needed for pilot with one chorągiew)

**Acceptance Rationale**:
- Analytics could enable surveillance; privacy principles prevent this in V1.
- Manual audit of critical metrics (candidate conversions, event participation) is sufficient for pilot.
- V2 can add privacy-preserving analytics (aggregated counts, no personal history).

**Owner**: Product Owner  
**Status**: ACCEPTED

---

### 15. Manual User Import / No Bulk Onboarding

**Risk**: Creating 100+ brothers for a large chorągiew requires manual entry through admin UI, which is slow.

**Probability**: Medium (likely during pilot setup and scale)  
**Impact**: Low (one-time setup cost; not an ongoing operational issue)

**Acceptance Rationale**:
- Bulk import adds security complexity (CSV parsing, validation, error handling).
- V1 pilot is small (1 chorągiew, ~20 brothers); manual entry is acceptable.
- V2 can add bulk import via CSV or directory sync (LDAP, etc.).

**Owner**: Product Owner, DevOps  
**Status**: ACCEPTED

---

## Risk Tracking

### How to Update This Register

1. **After each phase**: Review risks and update probability/status
2. **Before pilot**: Ensure high-priority risks have mitigations in place
3. **Post-pilot**: Capture real incidents and adjust register
4. **Quarterly**: Review accepted risks and consider if any should be escalated

### Risk Review Schedule

| Milestone | Review Owner | Focus |
|-----------|--------------|-------|
| Phase 2 complete | Lead Engineer | Privacy & data risks |
| Phase 5 complete | Lead Engineer | Auth & session risks |
| Phase 13 (pilot ready) | Product Owner + All Leads | All high-priority risks |
| 1 week before pilot | Product Owner + DevOps | Operational readiness |
| Pilot launch | Product Owner + Spiritual Advisor | Content & spiritual risks |
| Post-pilot | Team | Capture real incidents |

---

**Last Updated**: May 1, 2026
