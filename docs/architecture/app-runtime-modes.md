# App Runtime Modes

The apps must be runnable throughout development, even before the backend is complete. Runtime mode is a development and QA tool, not a way to bypass production authorization.

## Modes

| Mode | Purpose | Backend required | Data source | Allowed environments |
| --- | --- | --- | --- | --- |
| `api` | Normal application mode | Yes | Real API | local, staging, pilot production |
| `demo` | UI/product walkthrough without backend | No | Versioned local fixtures/mock service | local, CI visual/smoke checks, controlled demos |
| `test` | Automated tests | No or test API | Test fixtures/factories | CI and local tests |

Production builds must default to `api` mode and must fail fast if configured for `demo`.

## Demo Mode Requirements

- Demo mode must be enabled by explicit config, such as `APP_RUNTIME_MODE=demo`.
- Demo fixtures live in a dedicated fixture package or app-local fixture directory and are clearly marked non-production.
- Demo data must cover public, candidate, brother, officer, and super admin journeys without using real personal data.
- Demo mode must exercise the same screen routing, state handling, generated DTO shapes, and visibility assumptions as the real app.
- Demo mode must visibly identify itself in development/admin chrome so screenshots cannot be mistaken for production.
- Demo mode must not write to production services, send push notifications, create real accounts, or call payment/map/analytics providers.
- Demo mode must include loading, empty, error, forbidden, offline, and happy-path states for core screens.
- Demo fixtures must be versioned with the API contract; if DTOs change, demo fixtures and contract tests must change together.

## Mobile Expectations

- A developer can launch the mobile app without the backend and navigate public, candidate, and brother demo flows.
- Authenticated demo personas are selected through a development-only switch or fixture login, never through production auth code.
- Demo mode must not weaken production auth, token, or visibility logic.

## Admin Expectations

- A developer can launch Admin Lite without the backend and inspect list/detail/form states using fixtures.
- Demo mutations may update in-memory or local mock state, but must not pretend to be durable.
- Officer scoping and forbidden states must be represented with at least two demo chorągwie.

## Quality Gates

- Phase 1 must add launch commands for mobile, admin, and API.
- Phase 1 must add demo-mode launch commands for mobile and admin.
- Each later phase must keep both normal local mode and demo mode runnable unless the human owner explicitly accepts a temporary break.
- CI should include at least one demo-mode smoke check for mobile and admin once the apps exist.
