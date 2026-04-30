# Public vs Authenticated Mode

## Mode Resolution

| State | App mode | Default landing screen |
| --- | --- | --- |
| No session | Public | Public Home |
| Session with `CANDIDATE` role | Candidate | Candidate Dashboard |
| Session with `BROTHER` role | Brother | Brother Today |
| Session with `OFFICER` role only | Admin Lite web only; no brother mobile mode unless also `BROTHER` | Admin Dashboard on web |
| Session with `BROTHER` + `OFFICER` roles | Brother mobile plus Admin Lite web | Brother Today on mobile; Admin Dashboard on web |
| Session with `SUPER_ADMIN` role only | Admin Lite web only; no member mobile mode unless also `BROTHER` or `CANDIDATE` | Admin Dashboard on web |

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

- candidate-only role shows candidate experience;
- brother role shows brother experience;
- admin functions stay in Admin Lite web unless a later approved mobile admin scope is added.

## Session Failure Behavior

- Expired session: return user to public mode and preserve intended route only for allowed authenticated destinations.
- Forbidden route: show access denied, not hidden data.
- Inactive user: block private access and show support/contact guidance.
