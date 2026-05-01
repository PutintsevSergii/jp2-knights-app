# Auth API

| Method | Path | Auth | Required role | Request | Response | Validation/errors | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/auth/session` | No | None | Firebase ID token plus CSRF token when using cookies | secure session cookie plus current user | 400,401,403 | Recent verified provider login can establish Admin Lite/web session |
| POST | `/auth/logout` | Yes | Any | none or active session cookie | success and cleared cookie/session state | 401 | Session invalidated locally; provider refresh revocation handled for security events |
| POST | `/auth/refresh` | Refresh/session | Any | provider-managed refresh/session context | refreshed current user/session where applicable | 401 | Expired or revoked provider session rejected |
| GET | `/auth/me` | Yes | Any | bearer Firebase ID token or session cookie | user, roles, mode, memberships summary | 401,403 inactive | App can resolve mode from local authorization data |
| POST | `/auth/device-tokens` | Yes | Candidate/Brother/Officer/Super Admin | platform, token | registered token id | 400 | Token belongs to current user |
| PUT | `/auth/notification-preferences` | Yes | Candidate/Brother | category booleans | updated preferences | 400 | Preferences respected |

## Security Rules

- Inactive users receive 403 and no private data.
- Role assignments in `/auth/me` must be enough for mode selection but must not expose unrelated admin data.
- Firebase/provider identity proves authentication only. App roles, status, memberships, candidate profile, and officer scope come from local database tables.
- Provider tokens, refresh tokens, session cookies, and device tokens must never be returned in DTOs or logs.
- Demo mode uses fixture principals and must not call Firebase or any production identity provider.
