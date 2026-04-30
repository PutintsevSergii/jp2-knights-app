# Visibility Model

## Visibility Values

| Visibility | Who can see it | Notes |
| --- | --- | --- |
| `PUBLIC` | Everyone, including unauthenticated guests | Safe for public APIs |
| `FAMILY_OPEN` | Everyone, including unauthenticated guests | Public but marked suitable for families |
| `CANDIDATE` | Authenticated candidates, officers in scope, super admins | Not visible to guests |
| `BROTHER` | Authenticated brothers, officers in scope, super admins | Not visible to candidates unless separately published |
| `CHORAGIEW` | Authenticated brothers assigned to the target chorągiew, candidates assigned to the target chorągiew when the content type explicitly allows candidate visibility, scoped officers, super admins | Requires `target_choragiew_id` and a content-type audience rule |
| `OFFICER` | Officers and super admins | Operational/private |
| `ADMIN` | Admin panel only | Never returned to mobile public/candidate/brother APIs unless explicitly designed |

## Applies To

- prayers;
- events;
- announcements;
- content pages and approved informational material;
- silent prayer events;
- roadmap definitions or steps when audience-specific;
- dashboard cards derived from those entities.

## Non-Negotiable Rule

Private content must never be returned by public APIs. Public endpoints must query only `PUBLIC` and, where appropriate, `FAMILY_OPEN` records with published status.

## Filtering Inputs

Visibility filtering requires:

- current authentication state;
- role assignments;
- user status;
- membership and chorągiew assignment;
- target chorągiew on content;
- content status and publication timestamps.

## Candidate Access to `CHORAGIEW`

`CHORAGIEW` is not automatically candidate-visible. A candidate may see chorągiew-scoped records only when all of the following are true:

- the candidate has an active candidate profile assigned to that chorągiew;
- the content type permits candidate access, such as candidate events, candidate announcements, or assigned contact information;
- the record is published and not archived/cancelled except where a cancelled state is intentionally shown;
- the endpoint is a candidate endpoint or an admin endpoint, not a brother endpoint.

Brother-only chorągiew prayers, private brother events, brother announcements, membership lists, roadmap submissions, and brother profiles remain hidden from candidates.

## Acceptance Criteria

- A guest never receives `CANDIDATE`, `BROTHER`, `CHORAGIEW`, `OFFICER`, or `ADMIN` records.
- A candidate never receives brother-only content.
- A brother sees public, brother, and own chorągiew content.
- An officer sees administrative content only for his scoped chorągiew unless super admin.
- Visibility changes are audit logged for publishable content.
