# Notification Architecture

## Scope

Push notifications are for authenticated candidates and brothers only. Public guests do not receive push notifications in V1.

## Data Model

- `device_tokens`: stores token hash or provider-safe token reference, platform, user, last seen, revoked date.
- `notification_preferences`: stores category preferences by user.

## Categories

| Category | Examples | Default |
| --- | --- | --- |
| events | New/cancelled relevant event | Enabled |
| announcements | New relevant announcement | Enabled |
| roadmap_updates | Submission approved/rejected | Enabled |
| prayer_reminders | Silent prayer reminder | Optional |

## Dispatch Rules

- Resolve audience server-side from visibility, role, and chorągiew.
- Respect user preferences.
- Never send private content details to a user who would not be able to fetch the target record.
- Log dispatch attempts at an operational level, not as spiritual participation tracking.
- Notification payloads should contain a record id/deep link and generic title/body where privacy risk exists. The app fetches details after authorization.
- Duplicate token registration transfers ownership safely or revokes the old owner according to the auth/device-token contract.

## Implementation Notes

- Phase 9 adds `device_tokens` and `notification_preferences` persistence.
  Device tokens are registered through `POST /auth/device-tokens`; raw tokens are
  accepted only in the request, hashed before storage, and never returned.
- `PUT /auth/notification-preferences` is self-scoped to candidates and
  brothers. Missing preference rows resolve to the documented defaults.
- Announcement first publication resolves recipients server-side from
  visibility, active candidate/brother profile or membership scope, active
  non-revoked device tokens, and announcement preferences. It dispatches a
  generic payload through the configured push adapter and records operational
  attempted/accepted/failed counts without storing spiritual participation or
  delivery-read state.
- The default local/test push adapter is no-op. It reports attempted token
  counts without sending to Expo or another provider because V1 stores token
  hashes or provider-safe references rather than raw provider tokens.
