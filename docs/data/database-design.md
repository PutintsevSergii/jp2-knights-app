# Database Design

## Conventions

- PostgreSQL, snake_case table and column names.
- UUID primary keys unless implementation chooses another consistent id strategy.
- Prefer archive/deactivate over hard delete for business entities.
- Include `created_at`, `updated_at`, and where useful `archived_at`.
- Store role, visibility, status, and type values as enums or constrained text.
- Public contract enums use uppercase strings for role, visibility, and content workflow states. Domain operational statuses use lowercase snake_case unless already defined otherwise below. Do not mix casing within one enum.

## Core Tables

| Table                                  | Purpose                                       | Key columns                                                                                                                                                                                                               | Keys/indexes                                                                           | Deletion/archive                   | Privacy notes                                                 |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| `users`                                | Local application identity                    | `id`, `email`, `phone`, `display_name`, `status`, `preferred_language`, `last_login_at`                                                                                                                                   | PK `id`, unique `email`, index `status`                                                | deactivate via status              | PII, never public; authorization source                       |
| `identity_provider_accounts`           | External auth account links                   | `id`, `user_id`, `provider`, `provider_subject`, `email`, `email_verified`, `phone`, `display_name`, `photo_url`, `last_sign_in_at`, `revoked_at`                                                                         | FK user, unique active `(provider, provider_subject)`, index `user_id`                 | revoke/unlink                      | Provider profile mirror only; never store tokens              |
| `identity_access_reviews`              | Idle external sign-in approval                | `id`, `user_id`, `provider_account_id`, `status`, `scope_organization_unit_id`, `requested_role`, `assigned_role`, `expires_at`, decision metadata                                                                        | indexes user/provider/status/scope/expires; unique pending provider account            | keep decision record               | Admin restricted; no private access until confirmed           |
| `identity_access_approver_assignments` | Scoped approver privilege                     | `id`, `user_id`, `organization_unit_id`, `created_by`, `created_at`, `revoked_at`                                                                                                                                         | unique active `(user_id, organization_unit_id)`                                        | revoke                             | Critical audit; grants confirmation privilege only            |
| `user_roles`                           | Role assignments                              | `id`, `user_id`, `role`, `created_by`, `created_at`, `revoked_at`                                                                                                                                                         | FK user, unique active `(user_id, role)`                                               | revoke                             | Critical audit                                                |
| `organization_units`                   | Generic part of the Order                     | `id`, `type`, `parent_unit_id`, `name`, `city`, `country`, `parish`, `status`, `public_description`                                                                                                                       | unique active `(type, name, city)`, indexes parent/type/status                         | archive                            | Public description only                                       |
| `memberships`                          | User-to-unit brother membership               | `id`, `user_id`, `organization_unit_id`, `status`, `current_degree`, `joined_at`, `archived_at`                                                                                                                           | unique active `(user_id, organization_unit_id)`, indexes `organization_unit_id,status` | archive                            | Sensitive                                                     |
| `officer_assignments`                  | Officer scope                                 | `id`, `user_id`, `organization_unit_id`, `title`, `starts_at`, `ends_at`                                                                                                                                                  | index `user_id`, `organization_unit_id`                                                | end assignment                     | Critical audit                                                |
| `candidate_requests`                   | Public join interest                          | `id`, `first_name`, `last_name`, `email`, `phone`, `country`, `city`, `preferred_language`, `message`, `consent_text_version`, `consent_at`, `idempotency_key`, `status`, `assigned_organization_unit_id`, `officer_note` | indexes `status`, `assigned_organization_unit_id`, `email`, `idempotency_key`          | archive                            | Admin scoped                                                  |
| `candidate_profiles`                   | Authenticated candidate                       | `id`, `user_id`, `candidate_request_id`, `assigned_organization_unit_id`, `responsible_officer_id`, `status`                                                                                                              | unique active `user_id`, indexes scope/status                                          | archive/convert                    | Candidate private                                             |
| `content_pages`                        | Approved informational pages                  | `id`, `slug`, `title`, `body`, `language`, `visibility`, `status`, approval/publish metadata                                                                                                                              | unique `(slug, language)`, index visibility/status                                     | archive                            | Official wording approval                                     |
| `prayer_categories`                    | Prayer grouping                               | `id`, `title`, `slug`, `language`, `sort_order`, `status`, `published_at`                                                                                                                                                 | unique `(slug, language)`, index `status,language,sort_order`                          | archive                            | Public if category has public content                         |
| `prayers`                              | Prayer content                                | `id`, `category_id`, `title`, `body`, `language`, `visibility`, `target_organization_unit_id`, `status`, approval/publish metadata                                                                                        | indexes `visibility,status,language`                                                   | archive                            | Pastoral approval                                             |
| `events`                               | Public/private events                         | `id`, `title`, `description`, `type`, `start_at`, `end_at`, `location_label`, `visibility`, `target_organization_unit_id`, `status`                                                                                       | indexes `start_at,status,visibility,target_organization_unit_id`                       | archive/cancel                     | Location not private address                                  |
| `event_participation`                  | Intent to attend                              | `id`, `event_id`, `user_id`, `intent_status`, `created_at`, `cancelled_at`                                                                                                                                                | unique active `(event_id,user_id)`                                                     | cancel                             | Not attendance tracking                                       |
| `announcements`                        | Audience messages                             | `id`, `title`, `body`, `visibility`, `target_organization_unit_id`, `pinned`, `status`, publish metadata                                                                                                                  | indexes visibility/status/scope                                                        | archive                            | No chat                                                       |
| `roadmap_definitions`                  | Roadmap root                                  | `id`, `title`, `target_role`, `status`, `language`, approval/publish metadata                                                                                                                                             | index target/status                                                                    | archive                            | Config content                                                |
| `roadmap_stages`                       | Roadmap stages                                | `id`, `roadmap_definition_id`, `title`, `sort_order`                                                                                                                                                                      | unique sort per roadmap                                                                | archive with definition            | Config content                                                |
| `roadmap_steps`                        | Roadmap steps                                 | `id`, `stage_id`, `title`, `description`, `requires_submission`, `sort_order`, `status`, `published_at`                                                                                                                   | unique sort per stage, index stage/status                                              | archive                            | Requires approval of wording                                  |
| `roadmap_assignments`                  | User roadmap assignment                       | `id`, `user_id`, `roadmap_definition_id`, `organization_unit_id`, `status`, `assigned_by`, `assigned_at`, `completed_at`                                                                                                  | unique active `(user_id,roadmap_definition_id)`, indexes user/status and scope/status  | archive                            | Private                                                       |
| `roadmap_submissions`                  | Step review                                   | `id`, `assignment_id`, `step_id`, `user_id`, `body`, `attachment_meta`, `status`, `reviewed_by`, `review_comment`, `reviewed_at`                                                                                          | indexes user/status/step; unique pending `(assignment_id,step_id)`                     | archive                            | Sensitive formation data                                      |
| `file_attachments`                     | Private uploaded file metadata                | `id`, `owner_user_id`, `entity_type`, `entity_id`, `storage_key`, `original_filename`, `mime_type`, `size_bytes`, `status`                                                                                                | indexes owner/entity/status                                                            | archive/delete by retention policy | Never public; V1 metadata only unless uploads are implemented |
| `silent_prayer_events`                 | Prayer sessions                               | `id`, `title`, `intention`, `linked_prayer_id`, `start_at`, `end_at`, `visibility`, `target_organization_unit_id`, `status`                                                                                               | indexes time/visibility/status                                                         | archive/cancel                     | Intention approval                                            |
| `silent_prayer_participation`          | Optional technical presence/aggregate summary | `id`, `silent_prayer_event_id`, `user_id`, `anonymous_session_hash`, `joined_at`, `left_at`, `anonymized_at`                                                                                                              | indexes event/user                                                                     | short retention/anonymize          | Not a personal prayer log; do not expose lists                |
| `notification_preferences`             | User preferences                              | `id`, `user_id`, `category`, `enabled`                                                                                                                                                                                    | unique `(user_id,category)`                                                            | delete on user erasure if required | Self only                                                     |
| `device_tokens`                        | Push tokens                                   | `id`, `user_id`, `platform`, `token_hash`, `last_seen_at`, `revoked_at`                                                                                                                                                   | unique token hash                                                                      | revoke                             | Sensitive                                                     |
| `audit_logs`                           | Critical action trace                         | see audit doc                                                                                                                                                                                                             | indexes actor/entity/time/scope                                                        | append-only                        | Admin restricted                                              |

## Enum Values

| Enum                            | Values                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `user_status`                   | `active`, `inactive`, `invited`, `archived`                                              |
| `identity_access_review_status` | `pending`, `confirmed`, `rejected`, `expired`                                            |
| `role`                          | `CANDIDATE`, `BROTHER`, `OFFICER`, `SUPER_ADMIN`                                         |
| `organization_unit_type`        | `ORDER`, `PROVINCE`, `COMMANDERY`, `CHORAGIEW`, `OTHER`                                  |
| `visibility`                    | `PUBLIC`, `FAMILY_OPEN`, `CANDIDATE`, `BROTHER`, `ORGANIZATION_UNIT`, `OFFICER`, `ADMIN` |
| `content_status`                | `DRAFT`, `REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`                                   |
| `candidate_request_status`      | `new`, `contacted`, `invited`, `rejected`, `converted_to_candidate`                      |
| `candidate_profile_status`      | `active`, `paused`, `converted_to_brother`, `archived`                                   |
| `event_status`                  | `draft`, `published`, `cancelled`, `archived`                                            |
| `participation_status`          | `planning_to_attend`, `cancelled`                                                        |
| `device_token_platform`         | `ios`, `android`, `web`                                                                  |
| `notification_category`         | `events`, `announcements`, `roadmap_updates`, `prayer_reminders`                         |
| `roadmap_submission_status`     | `pending_review`, `approved`, `rejected`                                                 |
| `attachment_status`             | `active`, `archived`, `deleted`                                                          |

## Column Detail by Table

This section is the migration starting point. Exact ORM syntax may vary, but field intent should remain stable.

### `users`

| Column                                    | Type        | Required   | Notes                                                                           |
| ----------------------------------------- | ----------- | ---------- | ------------------------------------------------------------------------------- |
| `id`                                      | uuid        | Yes        | Primary key                                                                     |
| `email`                                   | citext/text | Yes        | Unique active login identifier                                                  |
| `phone`                                   | text        | No         | Optional contact                                                                |
| `display_name`                            | text        | Yes        | App/admin display                                                               |
| `status`                                  | user_status | Yes        | Indexed; `invited` plus pending access review represents public-only Idle state |
| `preferred_language`                      | text        | No         | e.g. `en`, `pl`, `lv`                                                           |
| `last_login_at`                           | timestamptz | No         | Auth metadata                                                                   |
| `created_at`, `updated_at`, `archived_at` | timestamptz | Yes/Yes/No | Archive instead of delete                                                       |

### `identity_provider_accounts`

Added in Phase 5 when real authentication is implemented. The first provider is Firebase Authentication through the auth provider adapter.

| Column                                   | Type        | Required   | Notes                                                           |
| ---------------------------------------- | ----------- | ---------- | --------------------------------------------------------------- |
| `id`                                     | uuid        | Yes        | Primary key                                                     |
| `user_id`                                | uuid        | Yes        | FK `users.id`; local authorization still uses the user row      |
| `provider`                               | text        | Yes        | Stable lowercase id, initially `firebase`                       |
| `provider_subject`                       | text        | Yes        | Firebase `uid` or replacement provider subject                  |
| `email`                                  | citext/text | No         | Last verified provider email mirror for reconciliation          |
| `email_verified`                         | boolean     | Yes        | From provider token/profile                                     |
| `phone`                                  | text        | No         | Provider phone number if available                              |
| `display_name`, `photo_url`              | text        | No         | Safe provider profile mirror; UI may prefer local display rules |
| `last_sign_in_at`                        | timestamptz | No         | Provider-authenticated sign-in time                             |
| `created_at`, `updated_at`, `revoked_at` | timestamptz | Yes/Yes/No | Revoke/unlink instead of hard delete                            |

Provider access tokens, refresh tokens, session cookies, and Firebase service-account credentials are not stored in PostgreSQL.

### `identity_access_reviews`

Added with the Firebase sign-in Idle approval gate. A verified Firebase identity
can be known locally before access is granted, but it remains public-only until
reviewed.

| Column                            | Type        | Required | Notes                                                   |
| --------------------------------- | ----------- | -------- | ------------------------------------------------------- |
| `id`                              | uuid        | Yes      | Primary key                                             |
| `user_id`                         | uuid        | Yes      | FK `users.id`; user remains public-only until confirmed |
| `provider_account_id`             | uuid        | Yes      | FK `identity_provider_accounts.id`                      |
| `status`                          | text enum   | Yes      | `pending`, `confirmed`, `rejected`, `expired`           |
| `scope_organization_unit_id`      | uuid        | No       | Country/region scope for the approver decision          |
| `requested_role`, `assigned_role` | role enum   | No       | Requested/assigned app role                             |
| `decided_by`                      | uuid        | No       | FK `users.id` admin actor                               |
| `decided_at`                      | timestamptz | No       | Confirmation/rejection/expiry timestamp                 |
| `expires_at`                      | timestamptz | Yes      | 30 days after first idle Firebase sign-in               |
| `decision_note`                   | text        | No       | Optional admin note; never public                       |
| `created_at`, `updated_at`        | timestamptz | Yes      | Audit-friendly timestamps                               |

Confirmation must be paired with explicit role/scope assignment and audit logs.
Expiry or rejection must leave the user without private app roles or memberships.

### `identity_access_approver_assignments`

| Column                     | Type        | Required | Notes                                                     |
| -------------------------- | ----------- | -------- | --------------------------------------------------------- |
| `id`                       | uuid        | Yes      | Primary key                                               |
| `user_id`                  | uuid        | Yes      | FK `users.id`; approver user                              |
| `organization_unit_id`     | uuid        | Yes      | FK `organization_units.id`; country/region review scope   |
| `created_by`               | uuid        | No       | FK `users.id` admin actor                                 |
| `created_at`, `revoked_at` | timestamptz | Yes/No   | Unique active `(user_id, organization_unit_id)` privilege |

### `user_roles`

| Column                     | Type           | Required | Notes                                            |
| -------------------------- | -------------- | -------- | ------------------------------------------------ |
| `id`                       | uuid           | Yes      | Primary key                                      |
| `user_id`                  | uuid           | Yes      | FK `users.id`                                    |
| `role`                     | role enum/text | Yes      | `CANDIDATE`, `BROTHER`, `OFFICER`, `SUPER_ADMIN` |
| `created_by`               | uuid           | No       | FK `users.id` admin actor                        |
| `created_at`, `revoked_at` | timestamptz    | Yes/No   | Unique active `(user_id, role)`                  |

### `organization_units`

| Column                                    | Type                   | Required   | Notes                                                                      |
| ----------------------------------------- | ---------------------- | ---------- | -------------------------------------------------------------------------- |
| `id`                                      | uuid                   | Yes        | Primary key                                                                |
| `type`                                    | organization_unit_type | Yes        | `CHORAGIEW` for V1 pilot units; generic enough for future Order structures |
| `parent_unit_id`                          | uuid                   | No         | FK `organization_units.id`; supports hierarchy without hardcoding levels   |
| `name`, `city`, `country`                 | text                   | Yes        | Unique active `(type, name, city)`                                         |
| `parish`                                  | text                   | No         | Public-safe label only                                                     |
| `status`                                  | text enum              | Yes        | active/archived                                                            |
| `public_description`                      | text                   | No         | Requires approval if official                                              |
| `created_at`, `updated_at`, `archived_at` | timestamptz            | Yes/Yes/No | Archive policy                                                             |

### `memberships`

| Column                                    | Type        | Required   | Notes                                                       |
| ----------------------------------------- | ----------- | ---------- | ----------------------------------------------------------- |
| `id`                                      | uuid        | Yes        | Primary key                                                 |
| `user_id`                                 | uuid        | Yes        | FK `users.id`; a user may have many active unit memberships |
| `organization_unit_id`                    | uuid        | Yes        | FK `organization_units.id`, indexed                         |
| `status`                                  | text enum   | Yes        | active/inactive/archived                                    |
| `current_degree`                          | text        | No         | Requires Order approval for values                          |
| `joined_at`                               | date        | No         | Official date                                               |
| `created_at`, `updated_at`, `archived_at` | timestamptz | Yes/Yes/No | Sensitive; audit changes                                    |

### `officer_assignments`

| Column                     | Type             | Required | Notes                      |
| -------------------------- | ---------------- | -------- | -------------------------- |
| `id`                       | uuid             | Yes      | Primary key                |
| `user_id`                  | uuid             | Yes      | FK `users.id`              |
| `organization_unit_id`     | uuid             | Yes      | FK `organization_units.id` |
| `title`                    | text             | No       | Local officer title        |
| `starts_at`, `ends_at`     | date             | Yes/No   | Active if no end date      |
| `created_by`, `created_at` | uuid/timestamptz | No/Yes   | Audit important            |

### `candidate_requests`

| Column                                    | Type                     | Required   | Notes                                    |
| ----------------------------------------- | ------------------------ | ---------- | ---------------------------------------- |
| `id`                                      | uuid                     | Yes        | Primary key                              |
| `first_name`, `last_name`, `email`        | text                     | Yes        | PII; indexed email                       |
| `phone`                                   | text                     | No         | Optional                                 |
| `country`, `city`, `preferred_language`   | text                     | Yes/Yes/No | Routing/contact                          |
| `message`                                 | text                     | No         | Private admin-scoped                     |
| `consent_text_version`, `consent_at`      | text/timestamptz         | Yes        | GDPR/RODO support                        |
| `idempotency_key`                         | text                     | No         | Public retry safety; unique when present |
| `status`                                  | candidate_request_status | Yes        | Indexed                                  |
| `assigned_organization_unit_id`           | uuid                     | No         | FK `organization_units.id`               |
| `officer_note`                            | text                     | No         | Admin only                               |
| `created_at`, `updated_at`, `archived_at` | timestamptz              | Yes/Yes/No | Archive policy                           |

### `candidate_profiles`

| Column                                    | Type                     | Required   | Notes                            |
| ----------------------------------------- | ------------------------ | ---------- | -------------------------------- |
| `id`                                      | uuid                     | Yes        | Primary key                      |
| `user_id`                                 | uuid                     | Yes        | FK `users.id`, unique active     |
| `candidate_request_id`                    | uuid                     | No         | FK request source                |
| `assigned_organization_unit_id`           | uuid                     | No         | FK `organization_units.id`       |
| `responsible_officer_id`                  | uuid                     | No         | FK `users.id`                    |
| `status`                                  | candidate_profile_status | Yes        | active/paused/converted/archived |
| `created_at`, `updated_at`, `archived_at` | timestamptz              | Yes/Yes/No | Private                          |

### Content Tables

The following content tables share: `id uuid PK`, `visibility visibility enum`, `target_organization_unit_id uuid nullable FK`, `status content/event status`, `language text nullable/required where relevant`, `created_by`, `updated_by`, `approved_by`, `published_by` nullable FKs to `users`, and `created_at`, `updated_at`, `approved_at`, `published_at`, `archived_at` timestamps.

| Table                  | Required content columns                                                                                           | Main FKs/indexes                                                            | Unique constraints        | Notes                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------- |
| `content_pages`        | `slug text`, `title text`, `body text`, `language text`                                                            | index `visibility,status,language`                                          | unique `(slug, language)` | About/FAQ/candidate path content; approval required |
| `prayer_categories`    | `title text`, `slug text`, `language text`, `sort_order int`, `status content_status`                              | index `status,language,sort_order`                                          | unique `(slug, language)` | Archive if unused                                   |
| `prayers`              | `category_id uuid`, `title text`, `body text`, `language text`                                                     | FK category, index `visibility,status,language,target_organization_unit_id` | none required             | Pastoral/content approval                           |
| `events`               | `title text`, `description text`, `type text`, `start_at timestamptz`, `end_at timestamptz`, `location_label text` | index `start_at,status,visibility,target_organization_unit_id`              | none required             | Avoid private addresses                             |
| `announcements`        | `title text`, `body text`, `pinned boolean default false`                                                          | index `visibility,status,target_organization_unit_id,pinned`                | none required             | One-way messages                                    |
| `silent_prayer_events` | `title text`, `intention text`, `linked_prayer_id uuid nullable`, `start_at`, `end_at`                             | FK prayer, index time/status/visibility                                     | none required             | No participant list exposed                         |

`content_approval` is embedded in these tables for V1 through approval metadata. A separate approval table may be introduced in V2 if workflow complexity increases.

### Event and Roadmap Tables

| Table                 | Columns                                                                                                                                                                                                                              | Keys and indexes                                                                           | Deletion/privacy                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `event_participation` | `id uuid PK`, `event_id uuid FK`, `user_id uuid FK`, `intent_status participation_status`, `created_at`, `updated_at`, `cancelled_at`                                                                                                | partial unique active `(event_id,user_id)`, indexes `event_id`, `user_id`, `intent_status` | Cancel instead of delete; not attendance                                             |
| `roadmap_definitions` | `id uuid PK`, `title text`, `target_role role`, `status content_status`, `language text`, approval/publish timestamps                                                                                                                | index `target_role,status`                                                                 | Archive                                                                              |
| `roadmap_stages`      | `id uuid PK`, `roadmap_definition_id uuid FK`, `title text`, `sort_order int`, timestamps                                                                                                                                            | unique `(roadmap_definition_id, sort_order)`                                               | Archive with definition                                                              |
| `roadmap_steps`       | `id uuid PK`, `stage_id uuid FK`, `title text`, `description text`, `requires_submission boolean`, `sort_order int`, `status content_status`, `published_at`                                                                         | unique `(stage_id, sort_order)`, index `stage_id,status`                                   | Requires approved wording                                                            |
| `roadmap_assignments` | `id uuid PK`, `user_id uuid FK`, `roadmap_definition_id uuid FK`, `organization_unit_id uuid FK nullable`, `status roadmap_assignment_status`, `assigned_by uuid FK`, `assigned_at`, `completed_at`, timestamps                      | unique active `(user_id, roadmap_definition_id)`                                           | Private                                                                              |
| `roadmap_submissions` | `id uuid PK`, `assignment_id uuid FK`, `step_id uuid FK`, `user_id uuid FK`, `body text`, `attachment_meta jsonb`, `status roadmap_submission_status`, `reviewed_by uuid FK`, `review_comment text`, `reviewed_at`, timestamps       | index `user_id,status`, `step_id,status`, unique pending `(assignment_id,step_id)`         | Sensitive formation data                                                             |
| `file_attachments`    | `id uuid PK`, `owner_user_id uuid FK`, `entity_type text`, `entity_id uuid`, `storage_key text`, `original_filename text`, `mime_type text`, `size_bytes int`, `status attachment_status`, `created_at`, `archived_at`, `deleted_at` | index `owner_user_id,status`, `entity_type,entity_id`                                      | Private metadata; binary storage provider selected at implementation; no public URLs |

### Notification, Presence, and Audit Tables

| Table                         | Columns                                                                                                                                                                                                                                                     | Keys and indexes                                                                             | Deletion/privacy                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `silent_prayer_participation` | `id uuid PK`, `silent_prayer_event_id uuid FK`, `user_id uuid nullable FK`, `anonymous_session_hash text nullable`, `joined_at`, `left_at`, `anonymized_at`                                                                                                 | index `event_id`, `user_id`                                                                  | Short retention; anonymize or purge identifiers; never public |
| `notification_preferences`    | `id uuid PK`, `user_id uuid FK`, `category notification_category`, `enabled boolean`, timestamps                                                                                                                                                            | unique `(user_id, category)`, index `category,enabled`                                       | Self only                                                     |
| `device_tokens`               | `id uuid PK`, `user_id uuid FK`, `platform device_token_platform`, `token_hash text`, `token_last4 text`, `last_seen_at`, `revoked_at`, timestamps                                                                                                          | unique `token_hash`, indexes `user_id,revoked_at`, `platform`                                | Store hash and last-four metadata only; revoke                |
| `audit_logs`                  | `id uuid PK`, `actor_user_id uuid nullable FK`, `action text`, `entity_type text`, `entity_id uuid`, `scope_organization_unit_id uuid nullable`, `before_summary jsonb`, `after_summary jsonb`, `request_id text`, `ip_address inet nullable`, `created_at` | indexes `actor_user_id`, `entity_type/entity_id`, `scope_organization_unit_id`, `created_at` | Append-only; admin restricted                                 |

## Database Security Rules

- Application services remain the primary enforcement layer for role, scope, and visibility.
- PostgreSQL row-level security should be enabled for high-risk tables before pilot if the implementation can pass claims into transactions safely. Candidate requests, candidate profiles, memberships, roadmap submissions, device tokens, and audit logs are the first candidates.
- Do not rely on frontend filtering or admin table views for privacy.
- Silent prayer participation rows are technical records for duplicate prevention, reconnect handling, and aggregate safety only. They must not be exposed as participant history, analytics, rankings, or pastoral review data.
- Migrations are versioned and committed. Production uses deploy-only migration commands; destructive resets are development-only.
