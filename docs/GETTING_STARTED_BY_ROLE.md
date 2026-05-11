# Getting Started Guide by Role

This document provides role-specific onboarding paths for different team members. Start here to find the right documentation for your role.

---

## 👨‍💻 Software Engineer / Coding Agent

**Goal**: Build features phase by phase while maintaining quality gates and respecting the scope contract.

### Quick Start (30 minutes)

1. **Understand the project** (5 min)
   - Read [Product Vision](product/product-vision.md)
   - Skim [V1 Scope](product/v1-scope.md) and [Out of Scope](product/out-of-scope.md)

2. **Learn the operating contract** (10 min)
   - Read [AGENTS.md](../AGENTS.md) — the rules for coding agents
   - Review [Quality Gates](agent/quality-gates.md) — mandatory validation
   - Check [No Duplicate Policy](agent/no-duplicate-policy.md) — reuse shared contracts

3. **Identify your phase** (5 min)
   - **Check [traceability.md](traceability.md)** — THE source of truth for what phase we're in and what's done
   - Read the relevant phase in [Implementation Roadmap](delivery/implementation-roadmap.md)
   - [IMPLEMENTATION_STATUS.md](delivery/IMPLEMENTATION_STATUS.md) is a quick summary that links back to traceability.md

4. **Plan your work** (10 min)
   - Read the specific phase's product docs (e.g., `docs/product/functional-requirements.md` for the feature area)
   - Read the phase's API/data/screen docs if applicable
   - Create a backlog using [Backlog Format](agent/backlog-format.md)

### Core Documentation Path (1-2 hours)

After quick start, dive into:

1. **Your current phase**
   - [Coding Agent Instructions](agent/coding-agent-instructions.md) — step-by-step guide
   - Phase-specific docs:
     - API contract: e.g., `docs/api/public-api.md`, `docs/api/auth-api.md`
     - Data model: `docs/data/database-design.md`, entity docs
     - Screens: `docs/screens/mobile-public-screens.md`, etc.
     - Flows: `docs/flows/guest-discovery-flow.md`, etc.

2. **Architecture for your feature**
   - [App Runtime Modes](architecture/app-runtime-modes.md) — if touching launch, API clients, or fixtures
   - [Design System & Theming](architecture/design-system-and-theming.md) — if touching UI
   - [Privacy & Security](architecture/privacy-and-security.md) — always relevant
   - [Audit Logging](architecture/audit-logging.md) — if handling critical actions

3. **Testing & quality**
   - [Testing Strategy](delivery/testing-strategy.md) — test types required for your feature
   - [Definition of Done](agent/definition-of-done.md) — what makes a task complete?

### References (as needed)

- **Glossary**: [GLOSSARY.md](GLOSSARY.md) — Order-specific and technical terms
- **Decision Log**: [DECISION_LOG.md](delivery/DECISION_LOG.md) — why key architectural choices were made
- **Monorepo structure**: [Monorepo Structure](architecture/monorepo-structure.md)
- **Error handling**: [Error Handling](architecture/error-handling.md)
- **Dependency upgrade policy**: (see Phase 1 quality gates)

### If You Need to Propose a Scope Change

1. Read [ADR-001 in DECISION_LOG.md](delivery/DECISION_LOG.md) (Scope Control via Explicit Approval Gate)
2. Follow the process in [AGENTS.md](../AGENTS.md) — explain value, impact, and ask before coding
3. Update [V1 Scope](product/v1-scope.md), [V2 Backlog](product/v2-backlog.md), and [Traceability](traceability.md) if approved

---

## 📊 Product Manager / Product Owner

**Goal**: Maintain product clarity, approve scope changes, and validate against user needs.

### Quick Start (30 minutes)

1. **Understand the vision** (10 min)
   - Read [Product Vision](product/product-vision.md) — North Star questions and principles
   - Read [V1 Scope](product/v1-scope.md) — what's in, what's out
   - Read [Out of Scope](product/out-of-scope.md) — the hard boundaries

2. **Know the user journeys** (10 min)
   - [Guest Discovery Flow](flows/guest-discovery-flow.md)
   - [Candidate Onboarding Flow](flows/candidate-onboarding-flow.md)
   - [Brother Daily Use Flow](flows/brother-daily-use-flow.md)
   - [Officer Management Flow](flows/officer-management-flow.md)

3. **Check current progress** (10 min)
   - [Implementation Status](delivery/IMPLEMENTATION_STATUS.md) — what's done, what's next?
   - [Phase Breakdown](delivery/phase-breakdown.md) — what each phase delivers

### Core Documentation Path (1-2 hours)

1. **Product definition**
   - [Roles and Permissions](product/roles-and-permissions.md) — who can do what?
   - [Visibility Model](product/visibility-model.md) — what content is seen by whom?
   - [Functional Requirements](product/functional-requirements.md) — the full feature list
   - [Personas and User Types](product/personas-and-user-types.md)

2. **Screens by user type**
   - [Mobile Public Screens](screens/mobile-public-screens.md) — guest experience
   - [Mobile Candidate Screens](screens/mobile-candidate-screens.md)
   - [Mobile Brother Screens](screens/mobile-brother-screens.md)
   - [Admin Lite Screens](screens/admin-lite-screens.md)

3. **Managing scope and governance**
   - [Coding Agent Instructions](agent/coding-agent-instructions.md) — how we enforce discipline
   - [AGENTS.md](../AGENTS.md) — scope change process (what agents must do for approval)
   - [Traceability](traceability.md) — requirement → implementation mapping

### If a Feature Seems Missing or Wrong

1. Check [Traceability](traceability.md) — is it a V2 item or out-of-scope?
2. Check [V2 Backlog](product/v2-backlog.md) — is it deferred?
3. Check [Out of Scope](product/out-of-scope.md) — was it explicitly excluded?
4. If you believe it should be in V1, work with engineering to document the case and request approval (see [AGENTS.md](../AGENTS.md))

### Key Constraints to Communicate to Stakeholders

- **V1 is intentionally minimal**: public discovery, candidate funnel, brother companion, admin lite. No ERP, no chat, no payments, no maps, no surveillance.
- **Privacy is non-negotiable**: no public brother lists, no spiritual rankings, no shame-based UI, silent prayer is anonymous.
- **Approval is required for scope changes**: V2 or out-of-scope features need a strong rationale and explicit sign-off.

---

## 🧪 QA / Test Engineer

**Goal**: Validate features against requirements and ensure quality gates are met.

### Quick Start (30 minutes)

1. **Understand scope** (10 min)
   - [V1 Scope](product/v1-scope.md) — what we're building
   - [Out of Scope](product/out-of-scope.md) — what we're not

2. **Learn test expectations** (10 min)
   - [Testing Strategy](delivery/testing-strategy.md) — required test types and coverage
   - [Quality Gates](agent/quality-gates.md) — gates that must pass before code ships

3. **Check current status** (10 min)
   - [Implementation Status](delivery/IMPLEMENTATION_STATUS.md) — what's ready for QA?
   - [Pilot Validation Plan](delivery/pilot-validation-plan.md) — pilot scenarios

### Core Documentation Path (2-3 hours)

1. **Feature detail**
   - [Functional Requirements](product/functional-requirements.md) — what features exist?
   - [Traceability](traceability.md) — each requirement → expected APIs, screens, tests
   - Relevant flow docs: e.g., [Guest Discovery](flows/guest-discovery-flow.md), [Candidate Onboarding](flows/candidate-onboarding-flow.md)

2. **Permission & visibility validation** (critical)
   - [Roles and Permissions](product/roles-and-permissions.md)
   - [Visibility Model](product/visibility-model.md)
   - [Testing Strategy](delivery/testing-strategy.md) — permission/visibility test section
   - _→ Verify: can a guest access private content? Can an officer see another chorągiew? Can a candidate see brother content?_

3. **Data & privacy** (critical)
   - [Privacy Data Lifecycle](architecture/privacy-data-lifecycle.md) — retention, erasure, audit
   - [Audit Logging](architecture/audit-logging.md) — critical actions to verify
   - _→ Verify: are critical actions logged? Can audit logs be viewed by super admin? Are PII/sensitive fields redacted?_

4. **Pilot validation**
   - [Pilot Validation Plan](delivery/pilot-validation-plan.md) — scenarios for guest, candidate, brother, officer, super admin
   - [Release Plan](delivery/release-plan.md) — what "ready for pilot" means

### Testing Checklist Per Phase

Use [Testing Strategy](delivery/testing-strategy.md) to create test plans:

- **Unit tests**: 80% coverage on visibility utilities, permission guards, validation schemas
- **Integration tests**: API endpoints with fixture data covering all roles
- **Permission tests**: guest/candidate/brother/officer/super admin access paths
- **Visibility tests**: public API excludes private content; role-appropriate filtering works
- **Mobile/Admin smoke tests**: core user journeys work
- **Launch smoke tests**: apps start in demo mode without backend
- **Migration tests**: new migrations apply cleanly
- **Privacy tests**: archive/export/erasure work correctly

---

## 🏛️ Order Leadership / Spiritual Advisor

**Goal**: Ensure the app reflects the Order's values and mission before and during pilot.

### Quick Start (20 minutes)

1. **Understand the vision** (10 min)
   - [Product Vision](product/product-vision.md) — what the app does for the Order
   - [V1 Scope](product/v1-scope.md) — what's in V1, what's reserved for later

2. **Know what content approval is needed** (10 min)
   - [Localization](architecture/localization.md) — prayers and official text require pastoral approval
   - Read the "Required Human Approval Areas" section in [docs/README.md](README.md):
     - Official wording about the Order, spirituality, mission, candidate path
     - Pastoral approval for public and private prayer content
     - Privacy policy and GDPR/RODO compliance (legal review)
     - Formation roadmap and degree terminology
     - Pilot chorągiew data and officer assignments

3. **Prepare content for pilot** (ongoing)
   - Approve public prayers, public events, and About the Order content
   - Define degree names and advancement requirements
   - Confirm candidate path wording and roadmap steps
   - Review privacy policy and data consent text

### Key Decisions Made on Your Behalf

The app is designed with several non-negotiable principles:

- **Privacy-first**: No public brother lists, no ranking, no spiritual surveillance, silent prayer is aggregate only
- **Human review**: No automatic degree advancement; officers manually approve roadmap steps
- **Scope discipline**: No chat, payments, maps, analytics, or extended hierarchy in V1
- **Audit trail**: Critical admin actions are logged for accountability

If you have questions about why a feature works the way it does, check [DECISION_LOG.md](delivery/DECISION_LOG.md).

### Before Pilot

1. Review [Pilot Validation Plan](delivery/pilot-validation-plan.md) — guest, candidate, brother, officer scenarios
2. Approve pilot chorągiew data and officer assignments (handled with product owner)
3. Verify approved content (prayers, events, About text) is loaded in seed data

---

## 🔒 Legal / Compliance Officer

**Goal**: Ensure the app complies with privacy law (GDPR/RODO), data protection, and the Order's policies.

### Quick Start (20 minutes)

1. **Understand data handling** (10 min)
   - [Privacy Data Lifecycle](architecture/privacy-data-lifecycle.md) — data classification, retention, erasure
   - [Privacy & Security](architecture/privacy-and-security.md) — scope, audit, encryption expectations

2. **Check what needs legal review** (10 min)
   - Read "Required Human Approval Areas" in [docs/README.md](README.md)
   - Privacy policy, consent wording, GDPR/RODO review required before pilot

### Core Documentation Path (2-3 hours)

1. **Data governance**
   - [Database Design](data/database-design.md) — entity catalog and schema
   - [Privacy Data Lifecycle](architecture/privacy-data-lifecycle.md) — retention periods, classification, erasure/export process
   - [Data Access Rules](data/data-access-rules.md) — who can see what

2. **Audit & accountability**
   - [Audit Logging](architecture/audit-logging.md) — what actions are logged, who can see them
   - [Traceability](traceability.md) — FR-AUDIT-001, FR-PRIV-001 requirements

3. **Feature details for compliance**
   - Candidate request form: consent capture, data processing declaration ([Candidate Funnel Phase 7](delivery/implementation-roadmap.md))
   - Device tokens: revocation on logout, no unauthorized use ([Notifications Phase 9](delivery/implementation-roadmap.md))
   - Silent prayer: no participant tracking, aggregate counters only ([Silent Prayer Phase 11](delivery/implementation-roadmap.md))

### Pre-Pilot Checklist

- [ ] Privacy policy wording approved
- [ ] Candidate request consent text and version tracked
- [ ] Data retention periods defined per data classification (short-lived, operational, sensitive review, audit)
- [ ] Erasure/export/anonymization process documented
- [ ] Audit log redaction rules for PII/sensitive fields defined
- [ ] Backup and restore procedures reviewed
- [ ] GDPR/RODO compliance validated

---

## 🚀 DevOps / Infrastructure Engineer

**Goal**: Set up infrastructure, CI/CD, and deployment pipelines for pilot and beyond.

### Quick Start (20 minutes)

1. **Understand architecture** (10 min)
   - [Architecture Overview](architecture/architecture-overview.md) — system shape
   - [Technology Stack](architecture/technology-stack.md) — tools and versions

2. **Know what needs to be deployed** (10 min)
   - [Support and Maintenance](delivery/support-and-maintenance.md) — runbooks and alerting
   - [Phase Breakdown](delivery/phase-breakdown.md) — what each phase delivers

### Core Documentation Path (2-3 hours)

1. **System setup**
   - [Monorepo Structure](architecture/monorepo-structure.md) — how apps are organized
   - [App Runtime Modes](architecture/app-runtime-modes.md) — api vs demo vs test modes
   - Environment config and secrets management (not yet documented; coordinate with engineering lead)

2. **Deployment & CI**
   - [Quality Gates](agent/quality-gates.md) — CI must enforce these checks
   - [Testing Strategy](delivery/testing-strategy.md) — test execution in CI
   - [Release Plan](delivery/release-plan.md) — how features move to pilot/production

3. **Operations**
   - [Support and Maintenance](delivery/support-and-maintenance.md) — runbooks, monitoring, incident response
   - [Audit Logging](architecture/audit-logging.md) — logging strategy for operations
   - Database: PostgreSQL backups/restore, migration testing

### Pre-Pilot Checklist

- [ ] Local dev environment documented (Docker Compose for PostgreSQL, Redis)
- [ ] CI/CD pipeline validates quality gates (lint, typecheck, test, coverage, build)
- [ ] Mobile app can build and deploy (Expo EAS or equivalent)
- [ ] Admin web app can deploy (current HTTP shell; Next.js target if required)
- [ ] API can deploy with database migrations
- [ ] Environment-specific configs set up (dev, staging, pilot, production)
- [ ] Monitoring and alerting in place
- [ ] Backup/restore tested before pilot
- [ ] Runbooks written for common operations

---

## 📚 Documentation / Technical Writer

**Goal**: Keep documentation fresh, discoverable, and aligned with code.

### Quick Start (20 minutes)

1. **Understand the doc structure** (10 min)
   - [docs/README.md](README.md) — documentation map
   - This file — role-based guides
   - [GLOSSARY.md](GLOSSARY.md) — definitions

2. **Learn maintenance rules** (10 min)
   - [docs/README.md](README.md) "Documentation Maintenance Rules" section
   - [Coding Agent Instructions](agent/coding-agent-instructions.md) "Decision Documentation" section
   - [AGENTS.md](../AGENTS.md) "Documentation Rules" section

### Core Documentation Path (1-2 hours)

1. **Current documentation**
   - Walk through `/docs` directory and check which docs are stale
   - Review [Traceability](traceability.md) — is it current?
   - Check [Phase Breakdown](delivery/phase-breakdown.md) — does it match current progress?

2. **Maintenance tasks**
   - Update [Implementation Status](delivery/IMPLEMENTATION_STATUS.md) after each phase completion
   - Update [Traceability](traceability.md) when APIs, screens, or data tables change
   - Update [Decision Log](delivery/DECISION_LOG.md) when new major decisions are made
   - Ensure [docs/README.md](README.md) links are current

3. **Quality checks**
   - Broken links (e.g., phase docs referencing non-existent requirement IDs)
   - Outdated examples or version numbers
   - Missing "see also" cross-references
   - Unclear definitions or jargon not in glossary

---

## 🔗 How These Guides Relate

```
Order Leadership / Spiritual Advisor
  ↓ (approves content & values)
Product Manager
  ↓ (translates to requirements)
Software Engineer / Coding Agent
  ↓ (builds features)
QA / Test Engineer
  ↓ (validates quality)
DevOps / Infrastructure
  ↓ (deploys)
Legal / Compliance
  ↑ (reviews risk)
Technical Writer / Documentation
  ↑ (keeps docs in sync)
```

---

## Questions?

If you can't find an answer in this guide:

1. **Check the Glossary** ([GLOSSARY.md](GLOSSARY.md)) for definitions
2. **Check the Decision Log** ([docs/delivery/DECISION_LOG.md](delivery/DECISION_LOG.md)) for "why"
3. **Check the Traceability** ([docs/traceability.md](traceability.md)) for requirement details
4. **Ask a colleague or raise an issue** in your team's workflow

---

**Last Updated**: May 1, 2026
