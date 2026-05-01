# Non-Functional Requirements

| ID | Area | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| NFR-PRIV-001 | Privacy | Use least-privilege visibility and role filtering on every read path | Public APIs cannot return private records in tests |
| NFR-PRIV-002 | GDPR/RODO | Store consent for candidate requests and support archive/deactivation | Consent timestamp and text/version are stored |
| NFR-SEC-001 | Authentication | Sessions must use Firebase-backed provider verification behind a replaceable adapter, secure tokens/cookies, expiry, refresh/session handling, logout, provider-account linking, and inactive-user blocking | Expired/revoked/provider-invalid/inactive sessions cannot access private APIs; fake-provider tests prove Firebase is replaceable |
| NFR-SEC-002 | Authorization | RBAC and officer chorągiew scoping must be centralized | Permission tests cover all roles |
| NFR-AUD-001 | Auditability | Critical admin changes must create audit logs | Audit rows include actor, action, entity, timestamp |
| NFR-PERF-001 | API performance | Normal list endpoints should support pagination and indexed filters | Key lists respond acceptably for pilot scale |
| NFR-CONTRACT-001 | API contracts | OpenAPI and generated TypeScript clients must represent all implemented endpoints | CI fails when generated contracts drift |
| NFR-DATA-001 | Data integrity | Database constraints must protect core invariants | Duplicate active role/membership/participation records are impossible |
| NFR-TEST-001 | Unit coverage | Unit tests must maintain at least 80% statements, branches, functions, and lines per implemented app/library | CI coverage thresholds fail below 80% |
| NFR-TEST-002 | Integration testing | Cross-boundary behavior must have integration tests where applicable | API/database/auth/visibility/realtime/notification flows are covered |
| NFR-OFF-001 | Offline behavior | Mobile must handle poor network and may cache only safe previously opened content under explicit cache rules | No crash on offline open; clear retry states; logout clears private cache |
| NFR-REL-001 | Reliability | Core flows must tolerate empty data and transient failures | Mobile/admin show loading, empty, and error states |
| NFR-RUN-001 | Launchability | Each app must have documented launch commands and remain runnable after each phase | Mobile, admin, and API start locally from documented commands |
| NFR-DEMO-001 | Demo mode | Mobile and admin must support backend-free demo mode for development and controlled demos | `APP_RUNTIME_MODE=demo` launches fixture-backed public/candidate/brother/admin flows without backend |
| NFR-A11Y-001 | Accessibility | Text must be readable and controls accessible | Basic screen-reader labels and contrast pass |
| NFR-LOC-001 | Localization | Content and UI should support at least language fields and future i18n | DB content includes language; UI uses i18n-ready strings |
| NFR-THEME-001 | Theming | Mobile and admin styling must use shared design tokens and semantic component variants | Brand colors/spacing/type can be changed from token files without screen rewrites |
| NFR-A11Y-002 | Contrast | Design tokens must define accessible foreground/background pairs | Primary text/actions/status states pass contrast checks |
| NFR-OBS-001 | Observability | Backend must log errors and critical operational events | Failures are searchable in logs |
| NFR-BACKUP-001 | Backup/recovery | PostgreSQL must have a backup plan before pilot production | Documented restore test before launch |
| NFR-RET-001 | Retention | Sensitive records must support archive, erasure, and retention workflows | Candidate, device token, silent prayer, and audit lifecycle paths documented and tested |
| NFR-UPGRADE-001 | Maintainability | Major dependencies are pinned and upgraded intentionally | Lockfile committed; upgrade notes added for framework major changes |
| NFR-MOD-001 | Moderation | Publishable content must have status and archive path | Draft/private content not visible to app users |
| NFR-CONTENT-001 | Content approval | Spiritual/public content requires approval where configured | Approval metadata stored |
| NFR-MOBILE-001 | Mobile performance | Public home and Today should avoid excessive startup calls | Aggregated dashboard endpoints used |
| NFR-ADMIN-001 | Admin usability | Admin workflows must be clear for non-technical officers | No direct database edits required in pilot |
| NFR-REALTIME-001 | Real-time scalability | Silent prayer presence must work across API instances with Redis | Counters remain accurate on reconnect/multiple instances |
| NFR-SUPPORT-001 | Supportability | Every production error response includes a request id and safe log context | Support can correlate user report to backend logs without exposing private content |
