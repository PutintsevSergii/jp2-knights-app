# Announcements API

| Method | Path | Auth | Role | Purpose | Visibility |
| --- | --- | --- | --- | --- | --- |
| GET | `/candidate/announcements` | Yes | Candidate | Candidate announcement list | candidate/public/own scoped |
| GET | `/brother/announcements` | Yes | Brother | Brother announcement list | brother/public/own scoped |
| GET | `/admin/announcements` | Yes | Admin | Admin list | scoped/all |
| POST | `/admin/announcements` | Yes | Admin | Create announcement | scoped/all |
| PATCH | `/admin/announcements/:id` | Yes | Admin | Edit/publish/archive | scoped/all |

## Rules

- Announcements are one-way messages, not chat.
- Pinned announcements sort before normal announcements.
- Push dispatch must use the same audience rules as read visibility.

