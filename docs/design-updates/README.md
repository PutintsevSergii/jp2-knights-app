# JP2 Knights Mobile App - Design Documentation

## Cross-Reference to Product Documentation

> 📌 **Important:** This is **design-focused documentation**. It complements (not replaces) the authoritative product documentation:
> - [Functional Requirements](../product/functional-requirements.md) — Complete feature specs with acceptance criteria
> - [Personas & User Types](../product/personas-and-user-types.md) — User role definitions  
> - [Product Vision](../product/product-vision.md) — Strategic direction and principles
> - [Visibility Model](../product/visibility-model.md) — Permission & visibility rules
> - [User Flows](../flows/) — User journeys and workflows

**Each screen in this design doc is mapped to a Functional Requirement (FR-###).** When implementing, cross-reference the FR for acceptance criteria, permissions, and edge cases.

---

## Overview

This directory contains comprehensive **UX/UI design documentation** for the JP2 Knights mobile application. It specifies screen layouts, interactions, navigation patterns, and visual design details—bridging the gap between functional requirements and implemented screens.

**Contents:**
- Design system specifications (colors, typography, spacing)
- 23 detailed screen specifications with FR mappings
- Navigation and interaction patterns
- User role design implications
- Visual design and branding guidelines  
- Ready-to-use prompts for creating visual mockups
- In-progress Figma implementation plan for Gold/Grey screen parity, role/RBAC alignment, and per-screen build targets

---

## Documents in This Package

### 1. **01-users-and-roles.md**
**Purpose:** Define all user types, their roles, permissions, and functionality

**Contents:**
- Public user (unauthenticated)
- Candidate profile (in formation)
- Brother profile (full member with 4 degree levels)
- Wife/Family member (proposed future feature)
- Officer (leadership with management capabilities)
- Super Admin (system administrator)
- User lifecycle and progression flows
- Content visibility matrix
- Approval workflow states
- Security and permission model

**Key Sections:**
- User types (6 main roles)
- Access levels and functionality matrix
- Profile status transitions
- Candidate approval process
- Content visibility by role
- Device and notification preferences

**Use Case:** Understand what each user can do and see in the application

---

### 2. **02-screen-structure-ux-design.md**
**Purpose:** Complete screen-by-screen design specification with layouts, interactions, and UX patterns

**Contents:**
- Design system (colors, typography, spacing, radius)
- Global navigation structure
- 23 detailed screen specifications including:
  - Authentication flows
  - Candidate module screens (Dashboard, Events, Announcements, Profile)
  - Brother module screens (Brother Today, Events, Profile, Organization Units)
  - Officer management screens (Dashboard, Candidate Management, Event Creation)
  - Admin panel overview

**Key Sections:**
- Design system colors and typography
- Color palette (Primary: #1d4ed8 Blue)
- Navigation patterns (bottom tabs, breadcrumbs)
- Interaction patterns (lists, modals, empty states, loading states)
- Accessibility guidelines
- Mobile-first responsive design approach

**Per Screen Includes:**
- Screen purpose
- Screen type (dashboard, list, detail, form)
- UI elements and layout
- Navigation flow
- Available actions
- States and variations

**Use Case:** Build UI mockups, implement frontend screens, understand user flows

---

### 3. **03-google-slides-design-prompt.md**
**Purpose:** Ready-to-use prompt for AI design tools and manual mockup creation instructions

**Contents:**
- Design system specification (for copying into design tools)
- Complete AI prompt for generating mockups (works with Figma AI, Adobe XD, etc.)
- 12 priority screens to mockup (with detailed specifications)
- Design guidelines (spacing, typography, colors, radius)
- Manual Google Slides instructions
- Tool recommendations (Figma, Adobe XD, Sketch, Penpot)
- Design handoff checklist
- Testing and accessibility guidelines

**Key Prompt Sections:**
1. Candidate Dashboard
2. Candidate Events List
3. Candidate Event Detail
4. Brother Dashboard (Brother Today)
5. Brother Profile
6. My Choragiew (Organization Units)
7. Brother Events List
8. Brother Announcements List
9. Officer Dashboard
10. Create Event Form
11. Sign In
12. Candidate Request Form (Multi-step)

**Use Case:** Generate high-fidelity mockups, create design prototypes, design in Figma/Adobe XD

### 4. **06-figma-implementation-plan.md**
**Purpose:** Track the exact in-progress implementation plan for matching the inspected Figma screens while preserving product scope and RBAC rules

**Contents:**
- Figma file and inspected frame node IDs
- Current implementation gap between Phase 9 code and Figma Gold/Grey design
- Canonical role/RBAC update for design work
- Shared design-token update plan
- Screen-by-screen implementation matrix
- Mobile/Admin Lite route and component targets
- Visual QA and acceptance checks

**Use Case:** Plan and execute Figma-to-code implementation without expanding V1 mobile/admin scope by accident

---

## Screen-to-Requirement Mapping

Each screen maps to one or more Functional Requirements. Check [02-screen-structure-ux-design.md](02-screen-structure-ux-design.md) for the FR reference in each screen section. Example:

| Screen | Requirement | Details |
|--------|-------------|---------|
| Candidate Dashboard | FR-CANDIDATE-001 | [View Spec](02-screen-structure-ux-design.md#2-candidate-dashboard-screen) |
| Brother Today | FR-BROTHER-001 | [View Spec](02-screen-structure-ux-design.md#8-brother-today-screen) |
| Officer Dashboard | FR-ADMIN-002 | [View Spec](02-screen-structure-ux-design.md#17-officer-dashboard) |
| Create Event | FR-ADMIN-005 | [View Spec](02-screen-structure-ux-design.md#20-create-event-screen-officer) |

**See [02-screen-structure-ux-design.md](02-screen-structure-ux-design.md) for the complete screen → FR mapping.**

---

## Quick Start Guide

### For Product Managers / Stakeholders
1. Read: [Product Vision](../product/product-vision.md) (strategic direction)
2. Review: [Functional Requirements](../product/functional-requirements.md) (what we're building)
3. See: **02-screen-structure-ux-design.md** (how it looks and flows)
4. Review: Design mockups (once created from Prompt #3)

### For UX/UI Designers
1. Read: [Functional Requirements](../product/functional-requirements.md) (what needs to be built)
2. Understand: **01-users-and-roles.md** (design implications of each role)
3. Study: **02-screen-structure-ux-design.md** (detailed layout, interaction, and FR mappings)
4. Use: **03-google-slides-design-prompt.md** (create high-fidelity mockups)
5. Reference: **04-color-scheme-branding.md** (colors, typography, spacing tokens)

### For Frontend Developers
1. Review: [Functional Requirements](../product/functional-requirements.md) (acceptance criteria)
2. Study: **02-screen-structure-ux-design.md** (screen by screen with FR links)
3. Check: **06-figma-implementation-plan.md** for exact current implementation status, Figma node IDs, and route/component targets
4. Check: Each screen's FR for permissions, edge cases, visibility rules
5. Implement: Following shared design system tokens from **04-color-scheme-branding.md** and the Figma Gold/Grey token plan
6. Code: Using existing screen builders (brother-screens.ts, candidate-screens.ts, etc.) until a Figma-specific React Native screen replaces a generic renderer
7. Test: Against FR acceptance criteria and visibility rules from functional requirements

### For Backend/API Developers
1. Review: **01-users-and-roles.md** (permissions and access control)
2. Study: Content visibility matrix (what each role sees)
3. Check: Approval workflows (candidate, content approval)
4. Implement: Permission checks, visibility filters, role-based endpoints
5. Verify any Figma-driven screen change still uses server-side RBAC and does not introduce client-only filtering

---

## Design System Quick Reference

### Colors
- **Primary Action:** `#1d4ed8` (Blue) - Buttons, links, primary actions
- **Dark Text:** `#111827` - Headlines, body text
- **Muted Text:** `#4b5563` - Secondary info, labels
- **Light Background:** `#f8fafc` - App background
- **White Surface:** `#ffffff` - Cards, content areas
- **Border:** `#d1d5db` - Dividers, subtle separations
- **Success:** `#15803d` (Green) - Confirmations
- **Warning:** `#a16207` (Orange) - Pending states
- **Danger:** `#b91c1c` (Red) - Errors, warnings

### Typography
- **Headlines:** 28px, Bold, #111827
- **Subheadings:** 20px, Bold, #111827
- **Body Text:** 16px, Regular, #111827
- **Secondary Text:** 14px, Regular, #4b5563
- **Labels:** 12px, Regular, #4b5563

### Spacing
- **Base unit:** 4px
- **Margins:** 16px (4 base units)
- **Gaps:** 8px or 16px between elements
- **Padding:** 16px inside cards and containers
- **Safe area:** 16px on mobile sides

### Radius
- **Small elements:** 4px
- **Medium/Cards:** 8px
- **No large radius** (keep modern/flat)

---

## Screen Navigation Overview

```
┌─────────────────────────────────────────────────┐
│          AUTHENTICATION & PUBLIC                 │
├─────────────────────────────────────────────────┤
│  Sign In  →  Candidate Request Form  →  Status  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        CANDIDATE MODULE (5 Bottom Tabs)          │
├─────────────────────────────────────────────────┤
│ 1. Dashboard                                    │
│    ├─ Next Step Action                         │
│    ├─ Local Assignment                         │
│    └─ Officer Contact                          │
│ 2. Events                                       │
│    └─ Event Details                            │
│ 3. Announcements                               │
│    └─ Announcement Details                     │
│ 4. Contact Officer                             │
│ 5. Profile                                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         BROTHER MODULE (5 Bottom Tabs)           │
├─────────────────────────────────────────────────┤
│ 1. Brother Today (Dashboard)                    │
│    ├─ Profile Summary                          │
│    ├─ Quick Actions                            │
│    ├─ Upcoming Events                          │
│    └─ Organization Units                       │
│ 2. Events                                       │
│    └─ Event Details + Participation            │
│ 3. Announcements                               │
│    └─ Announcement Details                     │
│ 4. My Choragiew (Organization Units)           │
│    └─ Unit Details                             │
│ 5. Profile                                      │
│    ├─ Personal Details                         │
│    └─ Memberships & Degrees                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        OFFICER MANAGEMENT (5 Bottom Tabs)        │
├─────────────────────────────────────────────────┤
│ 1. Dashboard (Quick Stats & Actions)            │
│ 2. Candidates (Requests & Active)               │
│    ├─ Candidate Detail                         │
│    └─ Approval Workflow                        │
│ 3. Events (Create, List, Edit)                 │
│ 4. Announcements (Create, List, Edit)          │
│ 5. Members (Unit Management)                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         ADMIN PANEL (Web-focused)                │
├─────────────────────────────────────────────────┤
│ Dashboard → Users → Organization → Content      │
└─────────────────────────────────────────────────┘
```

---

## Key Features by User Role

| Feature | Public | Candidate | Brother | Officer | Admin |
|---------|--------|-----------|---------|---------|-------|
| **Authentication** | Sign in | ✓ | ✓ | ✓ | ✓ |
| **Candidate Request** | ✓ | | | | |
| **Dashboard** | | ✓ | ✓ | ✓ | ✓ |
| **View Events** | | ✓ | ✓ | ✓ | ✓ |
| **Register Events** | | ✓ | ✓ | Limited | ✓ |
| **View Announcements** | | ✓ | ✓ | ✓ | ✓ |
| **Profile Management** | | ✓ | ✓ | ✓ | ✓ |
| **Contact Officer** | | ✓ | | Limited | |
| **Create Events** | | | | ✓ | ✓ |
| **Post Announcements** | | | | ✓ | ✓ |
| **Approve Candidates** | | | | ✓ | ✓ |
| **Manage Members** | | | | ✓ | ✓ |
| **System Management** | | | | | ✓ |

---

## Implementation Roadmap

### Phase 1: Core Screens (MVP)
- [ ] Sign In / Authentication
- [ ] Candidate Dashboard
- [ ] Candidate Events (List & Detail)
- [ ] Candidate Announcements (List & Detail)
- [ ] Brother Dashboard (Brother Today)
- [ ] Brother Profile

### Phase 2: Extended Features
- [ ] My Choragiew (Organization Units)
- [ ] Brother Events (List & Detail)
- [ ] Brother Announcements
- [ ] Contact Officer (Message Form)
- [ ] Officer Dashboard

### Phase 3: Management Features
- [ ] Candidate Management (Officer)
- [ ] Event Creation (Officer)
- [ ] Announcement Creation (Officer)
- [ ] Member Management (Officer)

### Phase 4: Advanced Features
- [ ] Admin Panel / System Management
- [ ] Family Member Access
- [ ] Advanced Analytics
- [ ] Offline Support
- [ ] Push Notifications Enhancement

---

## File Structure Recommendations

```
docs/
├── design-updates/
│   ├── README.md (this file)
│   ├── 01-users-and-roles.md
│   ├── 02-screen-structure-ux-design.md
│   ├── 03-google-slides-design-prompt.md
│   └── assets/
│       ├── mockups/ (generated designs)
│       ├── color-palette.png
│       └── typography-specimen.png
├── brand/
│   ├── logo.svg
│   ├── brand-guidelines.md
│   └── organization-structure.md
└── api/
    ├── endpoints.md
    ├── data-models.md
    └── permission-matrix.md
```

---

## Design Review Checklist

Before implementing screens, verify:

- [ ] All colors match hex specifications exactly
- [ ] Typography sizes and weights are correct
- [ ] Spacing follows 16px margin and 8-16px gap rules
- [ ] Border radius is 4px or 8px (no other values)
- [ ] Button size minimum 44×44px (touch target)
- [ ] All form inputs have visible labels
- [ ] Empty states are designed (no data scenarios)
- [ ] Loading states are shown (spinner, skeleton)
- [ ] Error states are designed (clear messaging)
- [ ] Focus states defined for accessibility
- [ ] Content is scannable (visual hierarchy)
- [ ] Bottom navigation is fixed/sticky
- [ ] Role-based content is properly hidden/shown
- [ ] Navigation flow matches specification
- [ ] Screen titles are consistent
- [ ] Back buttons work as expected

---

## Collaboration & Handoff

### For Design-to-Development Handoff
1. Export all mockups at 2x resolution (Retina)
2. Create component library in design tool (Figma/XD)
3. Document all interactions and micro-interactions
4. Provide design specs (spacing, colors, typography)
5. Export design tokens as JSON (if using Figma)
6. Create accessibility documentation
7. Provide assets (icons, illustrations)

### For Feedback & Iteration
1. Share mockups in design tool (Figma, Adobe XD)
2. Enable comments for team feedback
3. Track changes with version history
4. Update design documentation with feedback
5. Create design review meetings (weekly during design phase)

---

## Accessibility & Quality Assurance

### Color Contrast
- Text on background: ≥4.5:1 ratio (WCAG AA)
- Large text on background: ≥3:1 ratio
- Interactive elements clearly distinguishable

### Touch Targets
- Minimum: 44×44 dp (logical pixels)
- Comfortable: 48×48 dp or larger
- Spacing: 8dp minimum between targets

### Focus & Navigation
- Logical tab order
- Visible focus indicators
- Skip links (if applicable)
- Keyboard navigation support

### Content Clarity
- Descriptive link text (not "click here")
- Clear labels on all inputs
- Error messages specific and actionable
- Alternative text for images
- Language simple and direct

---

## Next Steps

1. **Review this documentation** with the design team
2. **Create mockups** using the prompt in 03-google-slides-design-prompt.md
3. **Get stakeholder feedback** on user roles and functionality
4. **Design component library** in your design tool
5. **Create prototype** showing key user flows
6. **Plan development** based on feature priority
7. **Implement iteratively** following the roadmap

---

## Questions & Contact

**For questions about:**
- **User roles & permissions** → See 01-users-and-roles.md
- **Screen design & layout** → See 02-screen-structure-ux-design.md  
- **Mockup creation** → See 03-google-slides-design-prompt.md
- **Design system colors** → See color palette section above
- **Implementation specifics** → Check the code in `/apps/mobile/src/`

---

## Additional Resources

### Organization Information
- Website: https://rycerzejp2.org/
- About Page: https://rycerzejp2.org/ryt
- Current implementation: See `/apps/mobile/src/` and `/apps/admin/src/`

### Design Tools References
- Figma: https://figma.com
- Adobe XD: https://adobe.com/products/xd
- Penpot: https://penpot.app
- Google Slides: https://docs.google.com/presentation

### Development Code
- Mobile screens: `/apps/mobile/src/brother-screens.ts`, `/apps/mobile/src/candidate-screens.ts`
- Design tokens: `/libs/shared/design-tokens/src/index.ts`
- Shared types: `/libs/shared/types/src/index.ts`
- Navigation: `/apps/mobile/src/navigation.ts`

---

## Document Version & Maintenance

- **Created:** 2026-05-07
- **Last Updated:** 2026-05-07
- **Status:** Ready for Design Review & Implementation
- **Next Review:** After initial mockup creation and stakeholder feedback

### Maintenance Notes

- **Design docs should link to product docs** when referencing user roles, permissions, or functional specs
- **Each new screen should include the FR reference** in its title/heading
- **When product requirements change**, update the corresponding FR and then update the design screen spec
- **Keep color scheme doc in sync** with design tokens in `/libs/shared/design-tokens/src/index.ts`
- **When flows change** (from `docs/flows/`), update navigation structure accordingly

---

## Document Relationships

```
docs/
├── product/
│   ├── product-vision.md ────────┐
│   ├── functional-requirements.md ├─→ What we're building
│   ├── personas-and-user-types.md┘
│   ├── roles-and-permissions.md ──→ Who can do what
│   ├── visibility-model.md ──────→ What each role sees
│   └── v1-scope.md ─────────────→ Scope boundaries
│
├── flows/
│   ├── guest-discovery-flow.md
│   ├── candidate-onboarding-flow.md ─→ User journeys
│   ├── brother-daily-use-flow.md     
│   └── officer-management-flow.md
│
└── design-updates/ (THIS FOLDER)
    ├── README.md ──────────────────→ You are here
    ├── 01-users-and-roles.md ──────→ Design implications of roles
    ├── 02-screen-structure-ux-design.md ──→ Screen specs with FR links
    ├── 03-google-slides-design-prompt.md ─→ Mockup prompts
    └── 04-color-scheme-branding.md ─→ Visual design tokens
```

**Data Flow for Implementation:**
1. **Product** defines functional requirements (FR-###)
2. **Design** creates screen specs for each FR
3. **Developers** implement screens, following FR acceptance criteria
4. **QA** validates against FR and design specs
5. **Product** verifies V1 scope completion

---

**End of Design Documentation**
