# Roles and Permissions

`GUEST` is not stored in `user_roles`. It is an unauthenticated runtime state used by permission checks and documentation. `IDLE` is also not a role; it is the temporary state for a Firebase-authenticated local identity that has not been approved for app access. Stored roles are `CANDIDATE`, `BROTHER`, `OFFICER`, and `SUPER_ADMIN`.

## Role Matrix

| Capability                            | Guest | Candidate         | Brother                            | Officer                                              | Super Admin         |
| ------------------------------------- | ----- | ----------------- | ---------------------------------- | ---------------------------------------------------- | ------------------- |
| Open public app                       | Yes   | Yes               | Yes                                | Yes                                                  | Yes                 |
| View public prayers/events            | Yes   | Yes               | Yes                                | Yes                                                  | Yes                 |
| Submit join request                   | Yes   | No, already known | No                                 | No                                                   | No                  |
| View candidate dashboard              | No    | Yes               | No                                 | If assigned/admin view                               | Yes                 |
| View brother Today                    | No    | No                | Yes                                | Yes if also brother                                  | Yes if also brother |
| View brother-only content             | No    | No                | Yes                                | Yes within scope                                     | Yes                 |
| View organization-unit-scoped content | No    | No                | Own active organization units only | Assigned organization units only                     | All                 |
| Edit own profile basics               | No    | Limited           | Limited                            | Limited                                              | Limited             |
| Edit critical membership data         | No    | No                | No                                 | Assigned organization units                          | All                 |
| Manage candidate requests             | No    | No                | No                                 | Assigned organization units/unassigned workflow      | All                 |
| Manage events                         | No    | No                | No                                 | Assigned organization units and permitted visibility | All                 |
| Manage prayers/content                | No    | No                | No                                 | If permitted                                         | All                 |
| Confirm idle Firebase sign-ins        | No    | No                | No                                 | Only if assigned country/region approver privilege   | All                 |
| Approve roadmap submissions           | No    | No                | No                                 | Assigned organization units                          | All                 |
| View audit logs                       | No    | No                | No                                 | Limited if enabled                                   | Yes                 |

## Role Transition Rules

- Firebase Authentication sign-in can create or link a local identity, but it starts in Idle mode for 30 days and grants no Candidate, Brother, Officer, or Admin access by itself.
- Idle users become app users only after an authorized country/region approver or Super Admin confirms the person and assigns the correct role/scope.
- Guest to candidate starts as a `candidate_request`; it does not create a login automatically.
- Candidate account creation grants `CANDIDATE` and creates an active `candidate_profile`.
- Candidate to brother is an administrative conversion. It creates or activates a `membership`, grants `BROTHER`, and deactivates candidate-only access by setting the candidate profile to `converted_to_brother`.
- Officer is an additional administrative role and does not imply brother membership in the data model.
- Super Admin is global administration and does not imply brother membership in mobile mode.

## Country/Region Approver Privilege

Country/region approval is an admin-assigned privilege, not automatic access from Firebase Authentication. Any participant of the Order may receive this privilege if a Super Admin or other authorized admin assigns it. The privilege must be scoped to one or more country/region organization units, must be auditable, and must allow confirming or rejecting Idle Firebase sign-ins only inside that scope. Super Admin can confirm or reject globally.

Approver confirmation must record:

- actor admin;
- target idle user;
- scope country/region or organization unit;
- decision: confirmed, rejected, or expired;
- roles/scopes assigned, if confirmed;
- timestamp and optional note.

## Critical Membership Fields

Brothers must not directly edit:

- current degree;
- membership status;
- role;
- organization-unit assignments;
- official date of joining.

These fields are managed by officers or super admins and require audit logging.

## Officer Scoping

An officer can administer only records linked to assigned organization units unless the record is an unassigned candidate request assigned to the officer workflow. Super Admin scope is global.

## User and Organization Model

`users` is the canonical account/person entity for app access. Status lives on
`users.status`; app capability is derived from active `user_roles` plus scoped
relations such as `memberships`, `candidate_profiles`, and `officer_assignments`.
Do not create role-specific user tables.

Order structure is modeled as generic `organization_units`. A chorągiew is a
unit with `type = CHORAGIEW`, not a separate table or API concept. Users may have
many active memberships and many officer assignments across units. Unit hierarchy
uses `parentUnitId`; future permissions may derive inherited scope from that tree,
but Phase 2 checks direct assignment only.
