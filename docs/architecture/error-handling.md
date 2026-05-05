# Error Handling

## API Error Shape

All APIs should use the common error contract documented in `/docs/api/error-contract.md`.

## User-Facing Behavior

| Situation | Mobile/Admin behavior |
| --- | --- |
| 401 Unauthorized | Return to public/login mode for invalid/expired credentials |
| 403 Forbidden | Show access denied without data; missing sessions on protected routes stay public/login |
| 404 Not found | Show not found or removed state |
| 409 Conflict | Show actionable duplicate/state message |
| Validation error | Show field-level messages |
| Network error | Show retry state and preserve safe cached content |

## Logging

Backend logs should include request id, endpoint, user id if authenticated, error code, and safe metadata. Do not log prayer text submissions, candidate private messages, or sensitive personal data unnecessarily.
