# JP2 App Documentation

This documentation package defines the V1 product and technical contract for the JP2 App digital ecosystem for the Order of the Knights of Saint John Paul II the Great.

V1 is intentionally focused:

> Public Discovery + Candidate Funnel + Brother Companion + Admin Lite

This is not a full ERP for the whole Order. Implementation agents must build phase by phase and preserve public/private separation. V2 or out-of-scope work may be proposed only with a strong rationale and must receive explicit human-owner approval before implementation.

## Documentation Map

### Quick Start (Start Here)
- **⭐ [traceability.md](traceability.md)** — **THE source of truth for implementation progress** (requirements, current phase, status)
  - **All agents**: Check this before starting work
  - **All agents**: Update this after completing work
  - See [STATUS_CONSOLIDATION_GUIDE.md](STATUS_CONSOLIDATION_GUIDE.md) for rules
- **[GLOSSARY.md](GLOSSARY.md)** — Order terms (chorągiew, brother, reguła), user types, technical concepts
- **[GETTING_STARTED_BY_ROLE.md](GETTING_STARTED_BY_ROLE.md)** — Role-based onboarding guides (engineer, product, QA, leadership, legal, DevOps, docs)
- **[DECISION_LOG.md](delivery/DECISION_LOG.md)** — Why key architectural choices were made (10 major decisions documented)
- **[IMPLEMENTATION_STATUS.md](delivery/IMPLEMENTATION_STATUS.md)** — Quick summary dashboard (links to traceability.md for details)

### Core Documentation

| Area | Purpose |
| --- | --- |
| [product](product/product-vision.md) | Vision, scope, roles, visibility, requirements, flows, screens, accessibility |
| [architecture](architecture/architecture-overview.md) | System shape, stack, modules, auth, privacy, real-time, notifications, versioning |
| [data](data/database-design.md) | PostgreSQL schema, entity catalog, ER diagram, access rules, seed data |
| [api](api/api-contract-overview.md) | API principles, contracts, errors, visibility, versioning & deprecation policy |
| [screens](screens/mobile-public-screens.md) | Screen descriptions for mobile and Admin Lite |
| [flows](flows/guest-discovery-flow.md) | User and admin workflows with rules and data effects |
| [delivery](delivery/implementation-roadmap.md) | Roadmap, phases, testing, release plan, support, risk register |
| [agent](agent/working-agreement.md) | Operating contract, quality gates, no-duplicate policy, component boundary contracts, instructions |

### Strategy & Governance

| Document | Purpose |
| --- | --- |
| [traceability.md](traceability.md) | Requirement-to-implementation mapping (42+ features) |
| [DECISION_LOG.md](delivery/DECISION_LOG.md) | Architectural decisions and rationale |
| [RISK_AND_MITIGATION.md](delivery/RISK_AND_MITIGATION.md) | 15 identified risks with mitigations (5 high-priority) |
| [ACCESSIBILITY_AND_INCLUSION.md](product/ACCESSIBILITY_AND_INCLUSION.md) | WCAG 2.1 AA compliance requirements and testing |
| [API_VERSIONING_AND_DEPRECATION.md](api/API_VERSIONING_AND_DEPRECATION.md) | API evolution strategy, backwards compatibility, breaking changes |
| [SOLID/Clean Architecture Rules](agent/solid-clean-architecture-rules.md) | Required SOLID, Clean Code, aggregation, and Clean Architecture implementation rules |

## Single Source of Truth for Implementation Progress

### ⭐ **[traceability.md](traceability.md) — CANONICAL IMPLEMENTATION STATUS**

**This is the ONE source of truth for what's implemented, in progress, and pending.**

It contains:
- **Current phase and completion status**
- **All 42+ V1 requirements** (FR-*, NFR-*) with descriptions
- **Requirement-to-implementation mapping** (APIs, screens, data, tests for each requirement)
- **Detailed progress narrative** updated after each phase completion

**Update [traceability.md](traceability.md) after every phase. All other status references (IMPLEMENTATION_STATUS.md, commits, reports) point back to it.**

---

## Canonical Documents by Decision Area

| Decision area | Canonical document |
| --- | --- |
| **⭐ Implementation Progress** | **[traceability.md](traceability.md)** — THE source of truth |
| V1 scope and exclusions | [product/v1-scope.md](product/v1-scope.md), [product/out-of-scope.md](product/out-of-scope.md) |
| Roles, mode precedence, and permissions | [product/roles-and-permissions.md](product/roles-and-permissions.md), [product/public-vs-authenticated-mode.md](product/public-vs-authenticated-mode.md) |
| Auth provider integration | [architecture/authentication-and-authorization.md](architecture/authentication-and-authorization.md), [architecture/auth-provider-adapter.md](architecture/auth-provider-adapter.md) |
| Visibility and audience filtering | [product/visibility-model.md](product/visibility-model.md) |
| Functional requirements | [product/functional-requirements.md](product/functional-requirements.md) |
| Technical stack decisions | [architecture/technology-stack.md](architecture/technology-stack.md), [architecture/technical-decisions.md](architecture/technical-decisions.md) |
| App runtime and demo mode | [architecture/app-runtime-modes.md](architecture/app-runtime-modes.md) |
| Design system and theming | [architecture/design-system-and-theming.md](architecture/design-system-and-theming.md) |
| API style and DTO contract rules | [api/api-design-principles.md](api/api-design-principles.md), [api/api-contract-format.md](api/api-contract-format.md) |
| Data model and lifecycle | [data/database-design.md](data/database-design.md), [architecture/privacy-data-lifecycle.md](architecture/privacy-data-lifecycle.md) |
| Delivery sequence | [delivery/implementation-roadmap.md](delivery/implementation-roadmap.md), [delivery/phase-breakdown.md](delivery/phase-breakdown.md) |

### Historical Context

`JP2_APP_IMPLEMENTATION_ROADMAP.md` in the repository root is the **historical source brief** from project inception. It documents the original V1 feature set and phasing plan. This document is no longer updated; it exists for historical reference only. **The canonical, up-to-date implementation contract is in the /docs folder and especially in [traceability.md](traceability.md).**

The non-negotiable constraints remain:

- open public mode before login;
- candidate mode separate from brother mode;
- Admin Lite, not a full ERP;
- role-scoped administration;
- reusable visibility model;
- privacy-first data model;
- no spiritual surveillance;
- no silent V2 expansion; approved scope changes must update the canonical docs.

## Documentation Maintenance Rules

- Do not add a new rule to a duplicate summary if a canonical document already owns it.
- Requirement changes must update [traceability.md](traceability.md).
- API behavior changes must update endpoint docs, DTO/schema docs, permission tests, and visibility tests together.
- Data model changes must update the entity catalog, database design, access rules, and seed data expectations together.
- Technology stack changes require a short architecture decision entry with the reason, tradeoffs, and migration impact.
- Coding tasks must satisfy [agent/quality-gates.md](agent/quality-gates.md) before completion.
- New reusable logic must follow [agent/no-duplicate-policy.md](agent/no-duplicate-policy.md).
- New code and refactors must follow [agent/solid-clean-architecture-rules.md](agent/solid-clean-architecture-rules.md).
- New screens, route groups, and reusable components must declare or follow [agent/component-boundary-contracts.md](agent/component-boundary-contracts.md) before adding more code to a root or shell file.
- Approved scope expansion must update scope, backlog, traceability, and affected implementation docs before or with the code change.

## Required Human Approval Areas

- official wording about the Order, spirituality, mission, and candidate path;
- pastoral approval for public and private prayer content;
- privacy policy, consent wording, and GDPR/RODO review (see [RISK_AND_MITIGATION.md](delivery/RISK_AND_MITIGATION.md));
- whether brother lists may ever be visible inside a chorągiew;
- exact formation roadmap and degree terminology;
- pilot chorągiew data and officer assignments;
- accessibility compliance validation before pilot (see [ACCESSIBILITY_AND_INCLUSION.md](product/ACCESSIBILITY_AND_INCLUSION.md)).

## Using This Documentation

**New to the project?** Start with:
1. [GLOSSARY.md](GLOSSARY.md) — Learn the terminology
2. [GETTING_STARTED_BY_ROLE.md](GETTING_STARTED_BY_ROLE.md) — Find your role-specific guide
3. [IMPLEMENTATION_STATUS.md](delivery/IMPLEMENTATION_STATUS.md) — See current progress
4. Your role's specific docs (linked in the getting-started guide)

**Making a code change?**
1. Check [AGENTS.md](../AGENTS.md) — Operating contract
2. Check [traceability.md](traceability.md) — What phase are we in?
3. Read phase-specific docs (product, API, data, screens)
4. Check [DECISION_LOG.md](delivery/DECISION_LOG.md) — Why were key choices made?

**Concerned about risk or compliance?**
- Check [RISK_AND_MITIGATION.md](delivery/RISK_AND_MITIGATION.md) — 15 identified risks and mitigations
- Check [ACCESSIBILITY_AND_INCLUSION.md](product/ACCESSIBILITY_AND_INCLUSION.md) — WCAG 2.1 AA standards
- Check [privacy-data-lifecycle.md](architecture/privacy-data-lifecycle.md) — Data handling and retention
