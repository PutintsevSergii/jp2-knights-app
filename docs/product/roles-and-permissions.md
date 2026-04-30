# Roles and Permissions

`GUEST` is not stored in `user_roles`. It is an unauthenticated runtime state used by permission checks and documentation. Stored roles are `CANDIDATE`, `BROTHER`, `OFFICER`, and `SUPER_ADMIN`.

## Role Matrix

| Capability | Guest | Candidate | Brother | Officer | Super Admin |
| --- | --- | --- | --- | --- | --- |
| Open public app | Yes | Yes | Yes | Yes | Yes |
| View public prayers/events | Yes | Yes | Yes | Yes | Yes |
| Submit join request | Yes | No, already known | No | No | No |
| View candidate dashboard | No | Yes | No | If assigned/admin view | Yes |
| View brother Today | No | No | Yes | Yes if also brother | Yes if also brother |
| View brother-only content | No | No | Yes | Yes within scope | Yes |
| View chorągiew-only content | No | No | Own chorągiew only | Own chorągiew only | All |
| Edit own profile basics | No | Limited | Limited | Limited | Limited |
| Edit critical membership data | No | No | No | Own chorągiew | All |
| Manage candidate requests | No | No | No | Own chorągiew/unassigned workflow | All |
| Manage events | No | No | No | Own chorągiew and permitted visibility | All |
| Manage prayers/content | No | No | No | If permitted | All |
| Approve roadmap submissions | No | No | No | Own chorągiew | All |
| View audit logs | No | No | No | Limited if enabled | Yes |

## Role Transition Rules

- Guest to candidate starts as a `candidate_request`; it does not create a login automatically.
- Candidate account creation grants `CANDIDATE` and creates an active `candidate_profile`.
- Candidate to brother is an administrative conversion. It creates or activates a `membership`, grants `BROTHER`, and deactivates candidate-only access by setting the candidate profile to `converted_to_brother`.
- Officer is an additional administrative role and does not imply brother membership in the data model.
- Super Admin is global administration and does not imply brother membership in mobile mode.

## Critical Membership Fields

Brothers must not directly edit:

- current degree;
- membership status;
- role;
- chorągiew assignment;
- official date of joining.

These fields are managed by officers or super admins and require audit logging.

## Officer Scoping

An officer can administer only records linked to his own chorągiew unless the record is an unassigned candidate request assigned to the officer workflow. Super Admin scope is global.
