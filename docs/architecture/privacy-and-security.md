# Privacy and Security

## Privacy Principles

- No public brother list.
- No exact home addresses in V1.
- No public personal prayer logs.
- No private personal silent-prayer history or participant review lists in V1.
- No public roadmap history.
- No geocheck-ins.
- No shame-based progress UI.
- No leaderboards or rankings.
- Silent prayer exposes counters, not identities.

## GDPR/RODO Concerns

Candidate requests must store consent timestamp and consent text/version. Data retention and deletion/archive policy require human legal review before production.

## Sensitive Data

| Data | Protection |
| --- | --- |
| Membership status, role, degree, joining date | Brother self-read, officer scoped write |
| Candidate request details | Admin scoped only |
| Roadmap submissions | Self and scoped officers only |
| Device tokens | Self/system only |
| Audit logs | Super Admin, limited officer view if approved |

## Security Rules

- All protected endpoints require authentication.
- Admin endpoints require officer or super admin role.
- Officer scope is enforced in backend, not UI only.
- Visibility filters are mandatory for content.
- Audit critical changes.
