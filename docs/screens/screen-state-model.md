# Screen State Model

Every mobile and admin screen must define and implement these states.

| State | Requirement |
| --- | --- |
| Loading | Show stable loading UI without layout jumps |
| Empty | Explain absence of data without implying failure |
| Error | Show recoverable message and retry where possible |
| Forbidden | Show access denied without leaking data |
| Offline | Mobile only; show cached safe data or retry |
| Archived/Cancelled | Show explicit state for removed/cancelled business records |

## Permission Rule

Screens must not fetch private data and then hide it locally. They must call the correct endpoint for the current mode.

