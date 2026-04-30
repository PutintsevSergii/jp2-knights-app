# Auth API

| Method | Path | Auth | Required role | Request | Response | Validation/errors | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/auth/login` | No | None | email/credential or chosen auth payload | session tokens, current user | 400,401 | Active users can log in |
| POST | `/auth/logout` | Yes | Any | refresh/session id | success | 401 | Session invalidated |
| POST | `/auth/refresh` | Refresh/session | Any | refresh token | new access token | 401 | Expired refresh rejected |
| GET | `/auth/me` | Yes | Any | none | user, roles, mode, memberships summary | 401,403 inactive | App can resolve mode |
| POST | `/auth/device-tokens` | Yes | Candidate/Brother/Officer/Super Admin | platform, token | registered token id | 400 | Token belongs to current user |
| PUT | `/auth/notification-preferences` | Yes | Candidate/Brother | category booleans | updated preferences | 400 | Preferences respected |

## Security Rules

- Inactive users receive 403 and no private data.
- Role assignments in `/auth/me` must be enough for mode selection but must not expose unrelated admin data.

