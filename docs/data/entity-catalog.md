# Entity Catalog

| Entity                        | Owner module   | Main users                               | Notes                                                                                                    |
| ----------------------------- | -------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| User                          | Identity       | Candidate, Brother, Officer, Super Admin | Local application identity and authorization anchor; not public                                          |
| Identity Provider Account     | Identity       | System                                   | Links Firebase or replacement provider subject to a local user; stores profile mirror only, never tokens |
| Identity Access Review        | Identity/Admin | Country/Region Approver, Super Admin     | Tracks 30-day Idle Firebase sign-in approval, rejection, or expiry before private access is granted      |
| Identity Access Approver Assignment | Identity/Admin | Super Admin, Country/Region Approver | Scoped, revocable privilege for confirming/rejecting Idle Firebase sign-ins                              |
| Role Assignment               | Identity       | Admin                                    | Allows multiple roles; revoke rather than delete                                                         |
| Organization Unit             | Organization   | Brother, Officer, Super Admin            | Generic Order part; `CHORAGIEW` is a unit type, not a table                                              |
| Membership                    | Organization   | Brother, Officer                         | User-to-organization-unit relationship; users may have multiple active units                             |
| Officer Assignment            | Organization   | Officer, Super Admin                     | Defines admin scope by organization unit                                                                 |
| Candidate Request             | Candidate      | Guest, Officer                           | Created publicly with consent                                                                            |
| Candidate Profile             | Candidate      | Candidate, Officer                       | Authenticated candidate record                                                                           |
| Content Page                  | Content        | Guest, Candidate, Brother, Admin         | Approved informational pages such as About/FAQ                                                           |
| Prayer Category               | Prayers        | All                                      | Language-aware grouping                                                                                  |
| Prayer                        | Prayers        | All according to visibility              | Requires pastoral/content approval                                                                       |
| Event                         | Events         | All according to visibility              | Participation intent optional                                                                            |
| Event Participation           | Events         | Candidate/Brother, Officer               | Intent, not attendance                                                                                   |
| Announcement                  | Announcements  | Candidate/Brother/Admin                  | Audience-scoped messages                                                                                 |
| Roadmap Definition/Stage/Step | Roadmap        | Candidate/Brother/Admin                  | Configurable formation/onboarding                                                                        |
| Roadmap Assignment            | Roadmap        | Candidate/Brother                        | User-specific roadmap                                                                                    |
| Roadmap Submission            | Roadmap        | Brother/Candidate, Officer               | Human-reviewed                                                                                           |
| Silent Prayer Event           | Silent Prayer  | All according to visibility              | Real-time aggregate counter                                                                              |
| Silent Prayer Participation   | Silent Prayer  | System                                   | Optional aggregate/technical record                                                                      |
| Notification Preference       | Notifications  | Candidate/Brother                        | Self-managed                                                                                             |
| Device Token                  | Notifications  | System                                   | Revocable token                                                                                          |
| Audit Log                     | Audit          | Super Admin                              | Append-only critical action trace                                                                        |
