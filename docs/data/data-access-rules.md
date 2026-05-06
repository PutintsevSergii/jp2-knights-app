# Data Access Rules

## Public

- Can read only published `PUBLIC` and `FAMILY_OPEN` content.
- Can create candidate requests.
- Can join public silent prayer anonymously.
- Cannot read users, memberships, candidate profiles, roadmap, private events, private announcements, or audit logs.

## Idle Firebase Sign-In

- Can authenticate with an enabled Firebase provider, such as Google/Gmail, email, or another configured provider, and keep a local provider identity for review.
- Remains public-only for up to 30 days until approved.
- Cannot read candidate, brother, officer, admin, membership, roadmap, private event, private announcement, or audit data.
- Cannot receive roles, memberships, candidate profiles, or officer assignments without an audited country/region approver or Super Admin confirmation.
- Expires or remains blocked if not confirmed within 30 days.

## Candidate

- Can read own candidate profile and assigned contact.
- Can read public, family-open, candidate, and assigned organization-unit candidate content.
- Can read own roadmap assignment and submissions.
- Cannot read brother-only content or brother profiles.

## Brother

- Can read own user/membership/profile.
- Can read own active organization-unit summaries.
- Can read public, family-open, brother, and own organization-unit content.
- Can create/cancel own event participation intent.
- Can create own roadmap submissions.
- Cannot update critical membership fields.

## Officer

- Can read/write operational records scoped to assigned organization units.
- Can manage candidate requests assigned to own organization units or in approved unassigned workflow.
- Can confirm/reject Idle Firebase sign-ins only when explicitly assigned country/region approver privilege for the relevant scope.
- Can approve/reject roadmap submissions for assigned organization units.
- Cannot access unrelated organization-unit private data.

## Super Admin

- Can manage all V1 data.
- Should still use audit logging for critical actions.

## V1 Organization Scope Constraints

- V1 permissions are explicit, assignment-based, and scoped to the concrete organization-unit ids on the principal.
- V1 does not derive permissions from parent/child hierarchy, sibling units, geography, or implied country/region rollups.
- V1 does not expose cross-unit operational rollups to officers. Super Admin remains the only global operational role.
- Read replicas, hierarchy-derived reporting, `/v2` routes, and cross-unit analytics stay out of scope unless the human owner approves a documented scope expansion.
- Admin and brother/candidate APIs must continue to filter on the server before returning data; UI hiding is never a permission boundary.
