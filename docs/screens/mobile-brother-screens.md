# Mobile Brother Screens

| Screen                   | Route                     | Purpose              | Visible data                                                  | Primary actions                       | States                    | Restrictions               |
| ------------------------ | ------------------------- | -------------------- | ------------------------------------------------------------- | ------------------------------------- | ------------------------- | -------------------------- |
| Brother Today            | `BrotherToday`            | Daily summary        | degree, next step, prayer, event, announcement, silent prayer | open cards                            | empty cards allowed       | Filtered to brother        |
| Brother Profile          | `BrotherProfile`          | Own identity         | name, role, status, degree, chorągiew, join date              | edit basic contact if enabled, logout | missing optional fields   | Critical data read-only    |
| My Chorągiew             | `MyOrganizationUnits`     | Assigned units       | active organization-unit summaries                            | open today/profile                    | no assignment support     | No brother list            |
| Prayer Categories        | `PrayerCategories`        | Browse prayers       | categories                                                    | select                                | empty                     | Visibility enforced        |
| Prayer List              | `PrayerList`              | Prayer list/search   | summaries                                                     | open/search                           | empty search              | Relevant only              |
| Prayer Detail            | `PrayerDetail`            | Read prayer          | title/body                                                    | favorite/cache                        | not found                 | No leak by id              |
| Events List              | `EventsList`              | Relevant events      | event summaries                                               | filter/open                           | empty                     | Relevant only              |
| Event Detail             | `EventDetail`             | Event detail         | description/time/location/participation                       | plan to attend/cancel                 | cancelled/closed          | Intent only                |
| Announcements List       | `AnnouncementsList`       | Messages             | announcement summaries                                        | open                                  | empty                     | No chat                    |
| Announcement Detail      | `AnnouncementDetail`      | Read message         | title/body                                                    | none                                  | archived/not found        | Relevant only              |
| Formation Roadmap        | `FormationRoadmap`        | Formation path       | stages/steps/status                                           | open step                             | no roadmap                | Own only                   |
| Formation Step Detail    | `FormationStepDetail`     | Step details         | description/status/history                                    | submit if allowed                     | pending/approved/rejected | No auto degree             |
| Roadmap Submission       | `RoadmapSubmission`       | Submit step          | form fields                                                   | submit                                | validation/pending        | Own step only              |
| Silent Prayer List       | `SilentPrayerList`        | Prayer sessions      | sessions                                                      | join                                  | empty/closed              | Relevant only              |
| Silent Prayer Session    | `SilentPrayerSession`     | Real-time prayer     | intention, linked prayer, counter                             | join/leave                            | reconnect/disconnected    | Aggregate only             |
| Notification Preferences | `NotificationPreferences` | Configure push       | category toggles                                              | save                                  | error/retry               | Self only                  |
| Settings                 | `Settings`                | Account/app settings | profile summary, language, logout                             | logout/change prefs                   | offline                   | No admin functions         |

## Implemented Phase 8 Screen Models

- `BrotherToday` now has an API/demo-backed mobile screen model with
  ready/empty/loading/error/offline/forbidden states, action cards, scoped
  organization-unit summaries, and brother-visible upcoming events.
- `BrotherProfile` now has an API/demo-backed mobile screen model for own
  read-only profile, contact summary, active memberships, current degree, and
  join date.
- `MyOrganizationUnits` now has an API/demo-backed mobile screen model and React
  Native screen over `/api/brother/my-organization-units`; it renders active
  organization-unit summaries only with ready/empty/loading/error/offline/
  forbidden/idle-approval states.
- `BrotherEvents` now has an API/demo-backed mobile screen model over
  `/api/brother/events`; it renders brother-visible event summaries with
  ready/empty/loading/error/offline/forbidden states and no participation
  mutation flow.
