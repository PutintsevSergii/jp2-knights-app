import { existsSync, readFileSync } from "node:fs";

const requiredInputs = [
  "docs/data/database-design.md",
  "docs/data/seed-data.md",
  "infra/docker/docker-compose.yml",
  "prisma/schema.prisma",
  "prisma/migrations/000001_core_identity_foundation/migration.sql",
  "prisma/migrations/000002_public_content_pages/migration.sql",
  "prisma/migrations/000003_public_prayers_events/migration.sql",
  "prisma/migrations/000004_identity_provider_accounts/migration.sql",
  "prisma/migrations/000005_candidate_requests/migration.sql",
  "prisma/migrations/000006_candidate_profiles/migration.sql",
  "prisma/migrations/000007_identity_access_reviews/migration.sql",
  "prisma/migrations/000008_event_participation/migration.sql",
  "prisma/migrations/000009_announcements/migration.sql",
  "prisma/seed.mjs"
];

const missingInputs = requiredInputs.filter((path) => !existsSync(path));

if (missingInputs.length > 0) {
  throw new Error(`Migration check baseline is incomplete; missing ${missingInputs.join(", ")}`);
}

const migrationSql = readFileSync(
  "prisma/migrations/000001_core_identity_foundation/migration.sql",
  "utf8"
);

const requiredMigrationSnippets = [
  "CREATE EXTENSION IF NOT EXISTS citext",
  "CREATE TYPE user_status AS ENUM",
  "CREATE TYPE role AS ENUM",
  "CREATE TYPE organization_unit_type AS ENUM",
  "CREATE TYPE organization_unit_status AS ENUM",
  "CREATE TABLE users",
  "CREATE TABLE user_roles",
  "CREATE TABLE organization_units",
  "CREATE TABLE memberships",
  "CREATE TABLE officer_assignments",
  "CREATE TABLE audit_logs",
  "CREATE UNIQUE INDEX users_email_active_unique",
  "WHERE archived_at IS NULL",
  "CREATE UNIQUE INDEX user_roles_user_role_active_unique",
  "CREATE UNIQUE INDEX organization_units_type_name_city_active_unique",
  "CREATE UNIQUE INDEX memberships_user_unit_active_unique"
];

const missingMigrationSnippets = requiredMigrationSnippets.filter(
  (snippet) => !migrationSql.includes(snippet)
);

if (missingMigrationSnippets.length > 0) {
  throw new Error(
    `Core identity migration is missing required baseline SQL: ${missingMigrationSnippets.join(", ")}`
  );
}

const publicContentMigrationSql = readFileSync(
  "prisma/migrations/000002_public_content_pages/migration.sql",
  "utf8"
);

const requiredPublicContentMigrationSnippets = [
  "CREATE TYPE visibility AS ENUM",
  "CREATE TYPE content_status AS ENUM",
  "CREATE TABLE content_pages",
  "CREATE UNIQUE INDEX content_pages_slug_language_unique",
  "CREATE INDEX content_pages_visibility_status_language_idx",
  "CREATE INDEX content_pages_status_published_at_idx"
];

const missingPublicContentMigrationSnippets = requiredPublicContentMigrationSnippets.filter(
  (snippet) => !publicContentMigrationSql.includes(snippet)
);

if (missingPublicContentMigrationSnippets.length > 0) {
  throw new Error(
    `Public content migration is missing required SQL: ${missingPublicContentMigrationSnippets.join(", ")}`
  );
}

const publicPrayersEventsMigrationSql = readFileSync(
  "prisma/migrations/000003_public_prayers_events/migration.sql",
  "utf8"
);

const requiredPublicPrayersEventsMigrationSnippets = [
  "CREATE TYPE event_status AS ENUM",
  "CREATE TABLE prayer_categories",
  "CREATE TABLE prayers",
  "CREATE TABLE events",
  "CREATE UNIQUE INDEX prayer_categories_slug_language_unique",
  "CREATE INDEX prayers_visibility_status_language_idx",
  "CREATE INDEX events_visibility_status_start_at_idx"
];

const missingPublicPrayersEventsMigrationSnippets =
  requiredPublicPrayersEventsMigrationSnippets.filter(
    (snippet) => !publicPrayersEventsMigrationSql.includes(snippet)
  );

if (missingPublicPrayersEventsMigrationSnippets.length > 0) {
  throw new Error(
    `Public prayers/events migration is missing required SQL: ${missingPublicPrayersEventsMigrationSnippets.join(", ")}`
  );
}

const identityProviderMigrationSql = readFileSync(
  "prisma/migrations/000004_identity_provider_accounts/migration.sql",
  "utf8"
);

const requiredIdentityProviderMigrationSnippets = [
  "CREATE TABLE identity_provider_accounts",
  "provider_subject",
  "CREATE UNIQUE INDEX identity_provider_accounts_provider_subject_active_unique",
  "WHERE revoked_at IS NULL",
  "CREATE INDEX identity_provider_accounts_user_id_idx"
];

const missingIdentityProviderMigrationSnippets = requiredIdentityProviderMigrationSnippets.filter(
  (snippet) => !identityProviderMigrationSql.includes(snippet)
);

if (missingIdentityProviderMigrationSnippets.length > 0) {
  throw new Error(
    `Identity provider migration is missing required SQL: ${missingIdentityProviderMigrationSnippets.join(", ")}`
  );
}

const candidateRequestsMigrationSql = readFileSync(
  "prisma/migrations/000005_candidate_requests/migration.sql",
  "utf8"
);

const requiredCandidateRequestsMigrationSnippets = [
  'CREATE TYPE "candidate_request_status" AS ENUM',
  'CREATE TABLE "candidate_requests"',
  "consent_text_version",
  "consent_at",
  "idempotency_key",
  'CREATE UNIQUE INDEX "candidate_requests_active_email_unique_idx"',
  "WHERE \"archived_at\" IS NULL AND \"status\" IN ('new', 'contacted', 'invited')",
  'CREATE UNIQUE INDEX "candidate_requests_idempotency_key_unique_idx"'
];

const missingCandidateRequestsMigrationSnippets = requiredCandidateRequestsMigrationSnippets.filter(
  (snippet) => !candidateRequestsMigrationSql.includes(snippet)
);

if (missingCandidateRequestsMigrationSnippets.length > 0) {
  throw new Error(
    `Candidate requests migration is missing required SQL: ${missingCandidateRequestsMigrationSnippets.join(
      ", "
    )}`
  );
}

const candidateProfilesMigrationSql = readFileSync(
  "prisma/migrations/000006_candidate_profiles/migration.sql",
  "utf8"
);

const requiredCandidateProfilesMigrationSnippets = [
  'CREATE TYPE "candidate_profile_status" AS ENUM',
  'CREATE TABLE "candidate_profiles"',
  "candidate_request_id",
  "responsible_officer_id",
  'CREATE UNIQUE INDEX "candidate_profiles_user_active_unique_idx"',
  "WHERE \"archived_at\" IS NULL AND \"status\" IN ('active', 'paused')",
  'CREATE UNIQUE INDEX "candidate_profiles_candidate_request_active_unique_idx"'
];

const missingCandidateProfilesMigrationSnippets = requiredCandidateProfilesMigrationSnippets.filter(
  (snippet) => !candidateProfilesMigrationSql.includes(snippet)
);

if (missingCandidateProfilesMigrationSnippets.length > 0) {
  throw new Error(
    `Candidate profiles migration is missing required SQL: ${missingCandidateProfilesMigrationSnippets.join(
      ", "
    )}`
  );
}

const identityAccessReviewsMigrationSql = readFileSync(
  "prisma/migrations/000007_identity_access_reviews/migration.sql",
  "utf8"
);

const requiredIdentityAccessReviewsMigrationSnippets = [
  "CREATE TYPE identity_access_review_status AS ENUM",
  "CREATE TABLE identity_access_reviews",
  "CREATE TABLE identity_access_approver_assignments",
  "identity_access_reviews_provider_account_pending_unique",
  "identity_access_approver_assignments_active_unique",
  "WHERE status = 'pending'",
  "WHERE revoked_at IS NULL"
];

const missingIdentityAccessReviewsMigrationSnippets =
  requiredIdentityAccessReviewsMigrationSnippets.filter(
    (snippet) => !identityAccessReviewsMigrationSql.includes(snippet)
  );

if (missingIdentityAccessReviewsMigrationSnippets.length > 0) {
  throw new Error(
    `Identity access review migration is missing required SQL: ${missingIdentityAccessReviewsMigrationSnippets.join(
      ", "
    )}`
  );
}

const eventParticipationMigrationSql = readFileSync(
  "prisma/migrations/000008_event_participation/migration.sql",
  "utf8"
);

const requiredEventParticipationMigrationSnippets = [
  "CREATE TYPE participation_status AS ENUM",
  "CREATE TABLE event_participation",
  "CREATE UNIQUE INDEX event_participation_active_event_user_unique",
  "WHERE cancelled_at IS NULL"
];

const missingEventParticipationMigrationSnippets =
  requiredEventParticipationMigrationSnippets.filter(
    (snippet) => !eventParticipationMigrationSql.includes(snippet)
  );

if (missingEventParticipationMigrationSnippets.length > 0) {
  throw new Error(
    `Event participation migration is missing required SQL: ${missingEventParticipationMigrationSnippets.join(
      ", "
    )}`
  );
}

const announcementsMigrationSql = readFileSync(
  "prisma/migrations/000009_announcements/migration.sql",
  "utf8"
);

const requiredAnnouncementsMigrationSnippets = [
  "CREATE TABLE announcements",
  "target_organization_unit_id",
  "pinned boolean NOT NULL DEFAULT false",
  "CREATE INDEX announcements_visibility_status_pinned_idx",
  "CREATE INDEX announcements_status_published_at_idx"
];

const missingAnnouncementsMigrationSnippets = requiredAnnouncementsMigrationSnippets.filter(
  (snippet) => !announcementsMigrationSql.includes(snippet)
);

if (missingAnnouncementsMigrationSnippets.length > 0) {
  throw new Error(
    `Announcements migration is missing required SQL: ${missingAnnouncementsMigrationSnippets.join(
      ", "
    )}`
  );
}

const seedScript = readFileSync("prisma/seed.mjs", "utf8");
const requiredSeedSnippets = [
  "admin@example.test",
  "officer@example.test",
  "Pilot Choragiew",
  "Second Scope Choragiew",
  "organizationUnit",
  "about-order",
  "contentPage",
  "Morning Offering",
  "Brother Only Prayer",
  "Open Evening",
  "Brother Formation Evening",
  "identityProviderAccount",
  "demo-admin",
  "demo-officer",
  "demo-candidate",
  "candidateProfile",
  "candidate@example.test",
  "candidateRequest",
  "candidate-request@example.test",
  "candidate-request-v1",
  "demo-candidate-request-1",
  "identityAccessApproverAssignment",
  "idle-review@example.test",
  "demo-idle-review",
  "identityAccessReview",
  "announcement",
  "Candidate Welcome",
  "Brother Update"
];
const missingSeedSnippets = requiredSeedSnippets.filter((snippet) => !seedScript.includes(snippet));

if (missingSeedSnippets.length > 0) {
  throw new Error(
    `Seed baseline is missing required Phase 2 fixtures: ${missingSeedSnippets.join(", ")}`
  );
}

console.log(
  "Database migration baseline includes Phase 2 identity, organization-unit, scope fixtures, Phase 3 public content-page fixtures, Phase 4 public prayer/event fixtures, Phase 5 provider-link fixtures, Phase 5/6 identity access review fixtures, Phase 7 candidate request/profile fixtures, Phase 9 event participation, and Phase 9 announcement fixtures."
);
