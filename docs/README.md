# JP2 App Documentation

This documentation package defines the V1 product and technical contract for the JP2 App digital ecosystem for the Order of the Knights of Saint John Paul II the Great.

V1 is intentionally focused:

> Public Discovery + Candidate Funnel + Brother Companion + Admin Lite

This is not a full ERP for the whole Order. Implementation agents must build phase by phase and preserve public/private separation. V2 or out-of-scope work may be proposed only with a strong rationale and must receive explicit human-owner approval before implementation.

## Documentation Map

| Area | Purpose |
| --- | --- |
| [product](product/product-vision.md) | Product vision, scope, roles, visibility, requirements, flows, screens |
| [architecture](architecture/architecture-overview.md) | System shape, stack, modules, auth, privacy, real-time, notifications |
| [data](data/database-design.md) | PostgreSQL schema design, entity catalog, ER diagram, access rules, seed data |
| [api](api/api-contract-overview.md) | API principles, endpoint contracts, errors, visibility behavior |
| [screens](screens/mobile-public-screens.md) | Pure screen descriptions for mobile and Admin Lite |
| [flows](flows/guest-discovery-flow.md) | User and admin workflows with rules and data effects |
| [delivery](delivery/implementation-roadmap.md) | Phased implementation roadmap, acceptance, testing, release, pilot |
| [agent](agent/working-agreement.md) | Rules for coding agents and human process control |
| [traceability](traceability.md) | Requirement-to-implementation coverage map |
| [support](delivery/support-and-maintenance.md) | Support runbooks, maintenance policy, operational expectations |
| [quality gates](agent/quality-gates.md) | Required validation before coding tasks are complete |
| [no duplicate policy](agent/no-duplicate-policy.md) | Single-source rules for shared contracts and utilities |

## Source of Direction

`JP2_APP_IMPLEMENTATION_ROADMAP.md` in the repository root is the historical source brief. The canonical implementation contract now lives in the focused docs below. If a duplicated statement conflicts with a canonical document, update the duplicate and follow the canonical document.

| Decision area | Canonical document |
| --- | --- |
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
- Approved scope expansion must update scope, backlog, traceability, and affected implementation docs before or with the code change.

## Required Human Approval Areas

- official wording about the Order, spirituality, mission, and candidate path;
- pastoral approval for public and private prayer content;
- privacy policy, consent wording, and GDPR/RODO review;
- whether brother lists may ever be visible inside a chorągiew;
- exact formation roadmap and degree terminology;
- pilot chorągiew data and officer assignments.
