# Domain Modules

| Module | Responsibilities | Entities | APIs | Dependencies | V1 scope | V2 extension points |
| --- | --- | --- | --- | --- | --- | --- |
| Identity | Users, roles, status, external auth provider links, Idle access reviews, sessions | users, user_roles, identity_provider_accounts, identity_access_reviews, identity_access_approver_assignments, device_tokens | Auth API, current user, Admin Lite sign-in reviews | Audit, Auth Provider Adapter | Required | SSO/invitations refinements, provider replacement |
| Organization | Organization units, hierarchy, memberships, officer assignments | organization_units, memberships, officer_assignments | My organization units, admin organization units | Identity | Generic unit model; `CHORAGIEW` is one unit type | Hierarchy-derived permissions, broader rollups |
| Content | Shared publish/approval metadata | content status fields, approval metadata | Admin content lifecycle | Identity, Audit | Shared rules | Advanced editorial workflow |
| Prayers | Prayer categories and texts | prayers, prayer_categories | Public/brother/admin prayers | Content | Required | Offline document library |
| Events | Events and participation intent | events, event_participation | Events API | Organization, Content | Required | Attendance/check-in |
| Candidate | Interest requests and candidate profiles | candidate_requests, candidate_profiles | Candidate/Admin APIs | Identity, Organization | Required | Extended recruitment pipeline |
| Roadmap | Formation/onboarding steps and submissions | roadmap_* | Candidate/Brother/Admin roadmap | Identity, Organization | Required | Advanced degree workflows |
| Announcements | Audience-scoped messages | announcements | Announcement APIs | Content, Notifications | Required | Rich media/comments not V1 |
| Silent Prayer | Prayer sessions and presence | silent_prayer_events, participation | Silent Prayer API + sockets | Redis, Content | Required | Additional aggregate-only formats if approved |
| Notifications | Device tokens, preferences, dispatch | notification_preferences, device_tokens | Auth API | Identity | Basic push | Email/SMS, advanced templates |
| Audit | Critical admin action trace | audit_logs | Admin audit API | All admin modules | Required metadata/logs | Compliance reporting |
| Admin | Admin panel workflows | Uses domain entities | Admin API | All modules | Admin Lite only | ERP modules |
