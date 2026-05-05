# Public vs Authenticated Mode

## Mode Resolution

| State                                                        | App mode                                                                        | Default landing screen                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| No session                                                   | Public                                                                          | Public Home                                     |
| Firebase-authenticated session without approved local access | Idle                                                                            | Public Home with pending/approval guidance      |
| Session with `CANDIDATE` role                                | Candidate                                                                       | Candidate Dashboard                             |
| Session with `BROTHER` role                                  | Brother                                                                         | Brother Today                                   |
| Session with `OFFICER` role only                             | Admin Lite web only; no brother mobile mode unless also `BROTHER`               | Admin Dashboard on web                          |
| Session with `BROTHER` + `OFFICER` roles                     | Brother mobile plus Admin Lite web                                              | Brother Today on mobile; Admin Dashboard on web |
| Session with `SUPER_ADMIN` role only                         | Admin Lite web only; no member mobile mode unless also `BROTHER` or `CANDIDATE` | Admin Dashboard on web                          |

Role precedence for mobile is `BROTHER` over `CANDIDATE` after candidate conversion. Candidate-only access must be removed or deactivated when a user becomes a brother unless the human owner explicitly approves a dual-mode transition period.

## Public Mode

Public mode includes:

- public home;
- about the Order;
- public prayer library;
- public/family-open events;
- public silent prayer;
- join interest request form;
- login entry point.

Public mode excludes:

- brother-only content;
- candidate-only content;
- private chorągiew events;
- brother profiles;
- private announcements;
- roadmap;
- admin functions.

## Authenticated Mode

Authenticated app behavior is role-aware. A user may have multiple roles, but the mobile app must select the safest primary mode:

- Firebase Authentication sign-in by itself is not an app mode and does not grant private access;
- Idle users remain public-only until a scoped country/region approver or Super Admin confirms access;
- candidate-only role shows candidate experience;
- brother role shows brother experience;
- admin functions stay in Admin Lite web unless a later approved mobile admin scope is added.

## Session Failure Behavior

- Expired session: return user to public mode and preserve intended route only for allowed authenticated destinations.
- Forbidden route: show access denied, not hidden data.
- Idle or unapproved Firebase user: protected APIs return `IDLE_APPROVAL_REQUIRED`; show pending/approval guidance and keep the user in public mode with public content usable.
- Inactive user: block private access and show support/contact guidance.
