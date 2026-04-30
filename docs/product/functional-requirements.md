# Functional Requirements

Each requirement must be implemented with permission tests and visibility tests where applicable.

| ID | Title | Actor | Preconditions | Main flow | Alternative flows | Permissions | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-PUBLIC-001 | Public Home | Guest | App installed/opened | Load intro, prayer of day, next public/family event, join/login CTAs | Empty content shows calm empty state | Public only | Opens without login and returns no private content |
| FR-PUBLIC-002 | About the Order | Guest | Public app available | View mission, spirituality, who can join, chorągiew, candidate path, FAQ | Content unavailable shows fallback | Public | Content marked Requires Order approval before production |
| FR-PRAYER-001 | Public Prayer Library | Guest | Published public prayers exist | Browse categories, list prayers, open detail | Empty category/search states | `PUBLIC` only | Guest sees only published public prayers |
| FR-EVENT-001 | Public Events | Guest | Published public/family events exist | List events, open detail, optional share/calendar | No upcoming events state | `PUBLIC`, `FAMILY_OPEN` | Private events never appear |
| FR-PRAYER-002 | Public Silent Prayer | Guest | Public prayer session published/active | Join anonymously, increment aggregate counter, leave | Disconnect cleanup; closed session state | Public, aggregate only | No personal prayer log is stored for guest |
| FR-CANDIDATE-REQ-001 | Join Interest Request | Guest | Consent text available | Submit name, email, optional phone, city/country, language, message, consent | Validation errors; duplicate email flagged for admin review | Public create only | Request stored with consent and status `new` |
| FR-ADMIN-001 | Candidate Request Management | Officer | Officer logged in | List, filter, view, note, assign, contact status, reject, convert | Unassigned requests may be global or routed by city | Officer scoped; Super Admin all | Request pipeline is traceable |
| FR-ADMIN-008 | Candidate Profile Management | Officer | Candidate account exists | List, view, update status/contact/assignment, convert to brother when approved | Candidate paused; assignment changed; duplicate brother conversion blocked | Officer scoped; Super Admin all | Candidate profile changes and conversion are audited |
| FR-CANDIDATE-001 | Candidate Dashboard | Candidate | Active candidate account | Show next step, contact, events, announcements | No assignment state | Candidate only | Brother content is inaccessible |
| FR-ROADMAP-001 | Candidate Roadmap | Candidate | Candidate roadmap published/assigned | View stages/steps and detail | No roadmap assigned state | Candidate; scoped admin | Candidate sees onboarding path |
| FR-CANDIDATE-002 | Candidate Events | Candidate | Candidate logged in | List public, family-open, candidate, own chorągiew candidate events | Empty state | Candidate visibility rules | No brother-only events returned |
| FR-CANDIDATE-003 | Candidate Announcements | Candidate | Candidate logged in | List/read candidate/public announcements | Pinned announcements first | Candidate visibility rules | Private brother announcements hidden |
| FR-BROTHER-001 | Brother Today Dashboard | Brother | Active brother account | Show degree, next step, prayer, event, announcement, active silent prayer | Empty cards if no content | Brother, own chorągiew | Personalized data is filtered |
| FR-BROTHER-002 | Brother Profile | Brother | Membership exists | View own name, role, status, degree, chorągiew, join date | Missing optional fields hidden | Self only; admin scoped | Critical data read-only |
| FR-ORG-001 | My Chorągiew | Brother | Brother assigned to chorągiew | View chorągiew info, officer, events, announcements | No assignment support message | Own chorągiew | No brother list unless approved |
| FR-PRAYER-003 | Brother Prayer Library | Brother | Authenticated | Browse public, brother, own chorągiew prayers | Offline cache for opened prayers if available | Brother visibility | Brother-only prayers not public |
| FR-EVENT-002 | Brother Events | Brother | Authenticated | List relevant events and details | Cancelled archived state | Brother visibility | Only relevant events shown |
| FR-EVENT-003 | Event Participation Intent | Candidate/Brother | Event visible and open | Mark planning to attend; cancel intent | Duplicate intent updates existing record | User can act only on visible events | This is not verified attendance |
| FR-ANN-001 | Brother Announcements | Brother | Authenticated | List/read public, brother, chorągiew announcements | Empty state | Brother visibility | No comments/chat added |
| FR-ROADMAP-002 | Formation Roadmap | Brother | Roadmap assigned/published | View stages, steps, next action | No roadmap state | Brother; scoped admin | No automatic degree awarding |
| FR-ROADMAP-003 | Roadmap Step Submission | Brother | Step accepts submission | Submit text and optional attachment metadata | Already pending state; validation errors | Own step only | Submission status becomes `pending_review` |
| FR-ROADMAP-004 | Roadmap Approval by Officer | Officer | Submission in scoped chorągiew | Approve/reject with comment | Request more info as rejection/comment | Officer own chorągiew; Super Admin all | Decision audited and brother notified |
| FR-PRAYER-004 | Silent Brother Prayer | Brother | Private session visible/active | Join room, count once per user, heartbeat, leave | Reconnect reuses user presence | Brother visibility | Aggregate counter only |
| FR-NOTIF-001 | Notification Preferences | Candidate/Brother | Authenticated | Enable/disable categories | Device token missing state | Self only | Preferences respected by push jobs |
| FR-ADMIN-002 | Admin Lite Dashboard | Officer/Super Admin | Admin login | Show scoped tasks and counts | Access denied if not admin | Officer scoped; Super Admin all | No unrelated chorągiew data |
| FR-ADMIN-003 | Brother Registry | Officer | Officer logged in | Create/edit/deactivate brothers in own chorągiew | Duplicate email; inactive member | Officer scoped | Critical changes audited |
| FR-ORG-002 | Chorągiew Management | Super Admin | Admin login | Create/edit/archive chorągiew; assign officer | Officer view own only | Super Admin write | Archive preferred over delete |
| FR-ADMIN-004 | Prayer Content Management | Officer/Super Admin | Admin login | Create/edit/approve/publish/archive prayers | Draft/review flows | Role policy; Super Admin all | Visibility and status required |
| FR-ADMIN-005 | Event Management | Officer/Super Admin | Admin login | Create/edit/publish/cancel/archive events | Past event locked where needed | Officer scoped | Public/private visibility explicit |
| FR-ADMIN-006 | Announcement Management | Officer/Super Admin | Admin login | Create/edit/publish/archive announcements | Pinned ordering | Officer scoped | Audience-safe push trigger |
| FR-ADMIN-007 | Silent Prayer Event Management | Officer/Super Admin | Admin login | Create/edit/publish/cancel prayer sessions | Active session edit limited | Officer scoped | Correct real-time room audience |
| FR-AUDIT-001 | Audit Logging | System/Admin | Critical action occurs | Record actor, action, entity, before/after summary, IP/request metadata | Log failure must be observable | System | Critical admin changes traceable |
| FR-CONTENT-001 | Content Approval | Officer/Super Admin | Content status workflow enabled | Draft -> Review -> Approved -> Published -> Archived | Super Admin may approve/publish if policy allows | Configurable by role | Unapproved content cannot publish when approval required |
| FR-PRIV-001 | Privacy Controls | System | Any data read | Apply least-privilege filters | Forbidden returns 403 or filtered list | All roles | No private profile, candidate, roadmap, or prayer participation leaks |

## Edge Cases Required Across Functional Areas

- inactive users cannot access private modes;
- archived records are excluded from normal lists;
- officer loses access immediately when officer assignment is removed;
- changing visibility from public to private removes content from public APIs;
- duplicate device tokens update ownership safely;
- duplicate silent prayer joins do not inflate counters;
- candidate conversion to brother deactivates or migrates candidate-only access according to implementation decision.
