# Entity Catalog

| Entity | Owner module | Main users | Notes |
| --- | --- | --- | --- |
| User | Identity | Candidate, Brother, Officer, Super Admin | Authentication identity; not public |
| Role Assignment | Identity | Admin | Allows multiple roles; revoke rather than delete |
| Chorągiew | Organization | Brother, Officer, Super Admin | Simplified local unit for V1 |
| Membership | Organization | Brother, Officer | Critical brother data |
| Officer Assignment | Organization | Officer, Super Admin | Defines admin scope |
| Candidate Request | Candidate | Guest, Officer | Created publicly with consent |
| Candidate Profile | Candidate | Candidate, Officer | Authenticated candidate record |
| Content Page | Content | Guest, Candidate, Brother, Admin | Approved informational pages such as About/FAQ |
| Prayer Category | Prayers | All | Language-aware grouping |
| Prayer | Prayers | All according to visibility | Requires pastoral/content approval |
| Event | Events | All according to visibility | Participation intent optional |
| Event Participation | Events | Candidate/Brother, Officer | Intent, not attendance |
| Announcement | Announcements | Candidate/Brother/Admin | Audience-scoped messages |
| Roadmap Definition/Stage/Step | Roadmap | Candidate/Brother/Admin | Configurable formation/onboarding |
| Roadmap Assignment | Roadmap | Candidate/Brother | User-specific roadmap |
| Roadmap Submission | Roadmap | Brother/Candidate, Officer | Human-reviewed |
| Silent Prayer Event | Silent Prayer | All according to visibility | Real-time aggregate counter |
| Silent Prayer Participation | Silent Prayer | System | Optional aggregate/technical record |
| Notification Preference | Notifications | Candidate/Brother | Self-managed |
| Device Token | Notifications | System | Revocable token |
| Audit Log | Audit | Super Admin | Append-only critical action trace |
