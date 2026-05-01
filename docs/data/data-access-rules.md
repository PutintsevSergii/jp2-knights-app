# Data Access Rules

## Public

- Can read only published `PUBLIC` and `FAMILY_OPEN` content.
- Can create candidate requests.
- Can join public silent prayer anonymously.
- Cannot read users, memberships, candidate profiles, roadmap, private events, private announcements, or audit logs.

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
- Can approve/reject roadmap submissions for assigned organization units.
- Cannot access unrelated organization-unit private data.

## Super Admin

- Can manage all V1 data.
- Should still use audit logging for critical actions.
