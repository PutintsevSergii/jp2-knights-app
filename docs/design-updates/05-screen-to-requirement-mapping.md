# Screen-to-Requirement Mapping
## Design Screens ↔ Functional Requirements

This document maps each design screen to its corresponding functional requirement (FR) for easy cross-referencing during implementation and QA.

> **See also:** [Functional Requirements](../product/functional-requirements.md) | [Screen Structure & UX Design](02-screen-structure-ux-design.md)

For current Figma-to-code status, route/component targets, and RBAC constraints, use [06-figma-implementation-plan.md](06-figma-implementation-plan.md).

## Priority Figma Alignment Frames

| Figma node | Screen | Requirement | Implementation status |
| --- | --- | --- | --- |
| `1:2` | Sign In | FR-AUTH-001 | Implemented foundation: Gold/Grey Expo auth shell, Google/Firebase provider action, `/api/auth/session` exchange, Idle Approval routing; pilot environment values and native-device validation remain pending |
| `1:47` | Candidate Events | FR-CANDIDATE-002 / FR-EVENT-003 | Implemented foundation: dedicated RN list and detail screens with own RSVP state/actions and no participant-list exposure; visual QA remains pending |
| `1:177` | Brother Today | FR-BROTHER-001 | Implemented foundation: dedicated RN dashboard screen over the guarded Brother Today contract; visual QA remains pending |
| `1:1635` | Candidate Requests | FR-ADMIN-001 | Implemented foundation: responsive Admin Lite web list/detail with Gold/Grey metric cards, candidate cards, bounded message previews, status badges, and scoped follow-up forms; visual QA remains pending |

---

## Authentication & Public Flows

| Screen | FR ID | FR Title | Role | Design Doc |
|--------|-------|----------|------|-----------|
| Sign In | [FR-AUTH-001](../product/functional-requirements.md) | Firebase Sign-In Idle Approval | Guest/Public | [View](02-screen-structure-ux-design.md#1-authentication-flow) |
| Candidate Request Form | [FR-CANDIDATE-REQ-001](../product/functional-requirements.md) | Join Interest Request | Guest/Public | [View](02-screen-structure-ux-design.md#1-authentication-flow) |
| Account Approval Pending | (State screen - implicit in FR-AUTH-001) | Idle Approval State | Idle User | [View](02-screen-structure-ux-design.md#1-authentication-flow) |

---

## Candidate Module

| Screen | FR ID | FR Title | Role | Design Doc |
|--------|-------|----------|------|-----------|
| Candidate Dashboard | [FR-CANDIDATE-001](../product/functional-requirements.md) | Candidate Dashboard | Candidate | [View](02-screen-structure-ux-design.md#2-candidate-dashboard-screen) |
| Candidate Events List | [FR-CANDIDATE-002](../product/functional-requirements.md) | Candidate Events | Candidate | [View](02-screen-structure-ux-design.md#3-candidate-events-list-screen) |
| Candidate Event Detail | [FR-EVENT-003](../product/functional-requirements.md) | Event Participation Intent | Candidate | [View](02-screen-structure-ux-design.md#4-candidate-event-detail-screen) |
| Candidate Announcements List | [FR-CANDIDATE-003](../product/functional-requirements.md) | Candidate Announcements | Candidate | [View](02-screen-structure-ux-design.md#5-candidate-announcements-list-screen) |
| Candidate Announcements Detail | (Detail view of FR-CANDIDATE-003) | Candidate Announcements | Candidate | [View](02-screen-structure-ux-design.md#6-candidate-announcements-detail-screen) |
| Contact Officer | (Messaging feature) | Communication | Candidate | [View](02-screen-structure-ux-design.md#7-contact-officer-screen-candidate) |
| Candidate Roadmap | [FR-ROADMAP-001](../product/functional-requirements.md) | Candidate Roadmap | Candidate | (Not yet designed) |
| Candidate Profile | (Implied in dashboard) | Profile Management | Candidate | (Not yet designed) |

---

## Brother Module

| Screen | FR ID | FR Title | Role | Design Doc |
|--------|-------|----------|------|-----------|
| Brother Today Dashboard | [FR-BROTHER-001](../product/functional-requirements.md) | Brother Today Dashboard | Brother | [View](02-screen-structure-ux-design.md#8-brother-today-screen) |
| Brother Profile | [FR-BROTHER-002](../product/functional-requirements.md) | Brother Profile | Brother | [View](02-screen-structure-ux-design.md#9-brother-profile-screen) |
| My Choragiew (Org Units) | [FR-ORG-001](../product/functional-requirements.md) | My Chorągiew | Brother | [View](02-screen-structure-ux-design.md#10-my-choragiew-screen) |
| Organization Unit Detail | (Detail view of FR-ORG-001) | My Chorągiew | Brother | [View](02-screen-structure-ux-design.md#11-organization-unit-detail-screen) |
| Brother Events List | [FR-EVENT-002](../product/functional-requirements.md) | Brother Events | Brother | [View](02-screen-structure-ux-design.md#12-brother-events-list-screen) |
| Brother Event Detail | [FR-EVENT-003](../product/functional-requirements.md) | Event Participation Intent | Brother | [View](02-screen-structure-ux-design.md#13-brother-event-detail-screen) |
| Brother Announcements List | [FR-ANN-001](../product/functional-requirements.md) | Brother Announcements | Brother | [View](02-screen-structure-ux-design.md#14-brother-announcements-list-screen) |
| Brother Announcements Detail | (Detail view of FR-ANN-001) | Brother Announcements | Brother | [View](02-screen-structure-ux-design.md#15-brother-announcements-detail-screen) |
| Silent Prayer | [FR-PRAYER-004](../product/functional-requirements.md) | Silent Brother Prayer | Brother | [View](02-screen-structure-ux-design.md#16-silent-prayer-screen) |
| Prayer Library | [FR-PRAYER-003](../product/functional-requirements.md) | Brother Prayer Library | Brother | (Not yet designed) |
| Formation Roadmap | [FR-ROADMAP-002](../product/functional-requirements.md) | Formation Roadmap | Brother | (Not yet designed) |
| Roadmap Step Submission | [FR-ROADMAP-003](../product/functional-requirements.md) | Roadmap Step Submission | Brother | (Not yet designed) |

---

## Officer Management Module

| Screen | FR ID | FR Title | Role | Design Doc |
|--------|-------|----------|------|-----------|
| Officer Dashboard | [FR-ADMIN-002](../product/functional-requirements.md) | Admin Lite Dashboard | Officer/Admin | [View](02-screen-structure-ux-design.md#17-officer-dashboard) |
| Candidate Requests List | [FR-ADMIN-001](../product/functional-requirements.md) | Candidate Request Management | Officer/Admin | [View](02-screen-structure-ux-design.md#18-candidate-requests-list-screen-officer) |
| Candidate Request Detail | [FR-ADMIN-001](../product/functional-requirements.md) | Candidate Request Management | Officer/Admin | [View](02-screen-structure-ux-design.md#19-candidate-request-detail-screen-officer) |
| Create Event | [FR-ADMIN-005](../product/functional-requirements.md) | Event Management | Officer/Admin | [View](02-screen-structure-ux-design.md#20-create-event-screen-officer) |
| Event Management List | [FR-ADMIN-005](../product/functional-requirements.md) | Event Management | Officer/Admin | [View](02-screen-structure-ux-design.md#21-event-management-list-screen-officer) |
| Create Announcement | [FR-ADMIN-006](../product/functional-requirements.md) | Announcement Management | Officer/Admin | [View](02-screen-structure-ux-design.md#22-create-announcement-screen-officer) |
| Announcement Management List | [FR-ADMIN-006](../product/functional-requirements.md) | Announcement Management | Officer/Admin | [View](02-screen-structure-ux-design.md#23-announcement-management-list-screen-officer) |
| Brother Registry | [FR-ADMIN-003](../product/functional-requirements.md) | Brother Registry | Officer | (Not yet designed) |
| Candidate Profile Management | [FR-ADMIN-008](../product/functional-requirements.md) | Candidate Profile Management | Officer/Admin | (Not yet designed) |
| Prayer Content Management | [FR-ADMIN-004](../product/functional-requirements.md) | Prayer Content Management | Officer/Admin | (Not yet designed) |
| Silent Prayer Event Management | [FR-ADMIN-007](../product/functional-requirements.md) | Silent Prayer Event Management | Officer/Admin | (Not yet designed) |

---

## Admin Panel

| Screen | FR ID | FR Title | Role | Design Doc |
|--------|-------|----------|------|-----------|
| Admin Dashboard | [FR-ADMIN-002](../product/functional-requirements.md) | Admin Lite Dashboard | Super Admin | [View](02-screen-structure-ux-design.md#23-admin-panel-simplified-mobile--web) |
| User Management | (System-level) | System Management | Super Admin | (Not yet designed) |
| Organization Management | [FR-ORG-002](../product/functional-requirements.md) | Chorągiew Management | Super Admin | (Not yet designed) |

---

## Implicit/Cross-Cutting Requirements

These requirements affect multiple screens:

| FR ID | FR Title | Affected Screens | Notes |
|-------|----------|-----------------|-------|
| [FR-PRIV-001](../product/functional-requirements.md) | Privacy Controls | All authenticated screens | Visibility filtering, permission enforcement |
| [FR-AUDIT-001](../product/functional-requirements.md) | Audit Logging | All admin/officer screens | Not visible in UI, but logged on backend |
| [FR-CONTENT-001](../product/functional-requirements.md) | Content Approval | Event/Announcement/Prayer creation | Draft → Review → Approved → Published workflow |
| [FR-NOTIF-001](../product/functional-requirements.md) | Notification Preferences | User settings (not yet designed) | Controls for push notification categories |

---

## Implementation Guidance

### For Each Screen During Implementation

1. **Find the FR Reference** - Use this table to locate the Functional Requirement
2. **Read the FR Spec** - Check [Functional Requirements](../product/functional-requirements.md) for:
   - Acceptance criteria
   - Permission rules
   - Edge cases
   - Visibility rules
3. **Read the Design Spec** - Review the screen in [02-screen-structure-ux-design.md](02-screen-structure-ux-design.md) for:
   - Layout and components
   - Navigation flow
   - Interaction patterns
4. **Check Color/Tokens** - Reference [04-color-scheme-branding.md](04-color-scheme-branding.md) for visual design
5. **Implement** - Build the screen following both FRand design specs
6. **Test** - Verify against FR acceptance criteria and design specifications

### For QA/Testing

1. For each screen, find the corresponding FR
2. Use the FR's acceptance criteria and edge cases for test cases
3. Verify visibility rules match the [Visibility Model](../product/visibility-model.md)
4. Test permission enforcement matches [Roles and Permissions](../product/roles-and-permissions.md)

---

## Status Legend

- ✅ **Designed** - Screen spec exists in [02-screen-structure-ux-design.md](02-screen-structure-ux-design.md)
- 🎨 **Mockup Ready** - High-fidelity mockup created (from prompt in [03-google-slides-design-prompt.md](03-google-slides-design-prompt.md))
- 💻 **Implemented** - Code exists in app (check `/apps/mobile/src/` or `/apps/admin/src/`)
- 🧪 **Tested** - Tests exist with coverage
- ❌ **Not Yet Designed** - No screen spec exists yet (future design work)
- (Not yet designed) - This screen may be in V2 or requires additional design

---

## Quick Reference: Requirements Count by Module

| Module | Total FR | Designed Screens | Status |
|--------|----------|------------------|--------|
| **Authentication** | 2 | 3 | ✅ Partially |
| **Candidate** | 4 | 5 | ✅ Designed |
| **Brother** | 6 | 9 | ✅ Partially |
| **Officer/Admin** | 9 | 7 | ✅ Partially |
| **Cross-cutting** | 4 | N/A | ✅ Documented |
| **TOTAL** | 42 | 24 | ✅ 57% designed |

---

## Design Debt & Future Work

Screens not yet designed:

- Candidate Roadmap (FR-ROADMAP-001)
- Candidate Profile (Self edit screen)
- Prayer Library (FR-PRAYER-003)
- Formation Roadmap (FR-ROADMAP-002)
- Brother Registry (FR-ADMIN-003)
- Candidate Profile Management (FR-ADMIN-008)
- Prayer Content Management (FR-ADMIN-004)
- Silent Prayer Event Management (FR-ADMIN-007)
- Chorągiew Management (FR-ORG-002)
- User Management (System-level)
- Organization Management (System-level)
- Notification Preferences (FR-NOTIF-001)

**Recommendation:** Prioritize screens by:
1. Critical path for V1 pilot (public → candidate → brother)
2. Officer management screens needed to run pilot
3. Secondary features and admin screens

---

**Last Updated:** 2026-05-09  
**Maintainer:** Design Team  
**Next Review:** After design mockup creation
