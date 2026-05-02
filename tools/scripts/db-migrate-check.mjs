import { existsSync, readFileSync } from "node:fs";

const requiredInputs = [
  "docs/data/database-design.md",
  "docs/data/seed-data.md",
  "infra/docker/docker-compose.yml",
  "prisma/schema.prisma",
  "prisma/migrations/000001_core_identity_foundation/migration.sql",
  "prisma/migrations/000002_public_content_pages/migration.sql",
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

const seedScript = readFileSync("prisma/seed.mjs", "utf8");
const requiredSeedSnippets = [
  "admin@example.test",
  "officer@example.test",
  "Pilot Choragiew",
  "Second Scope Choragiew",
  "organizationUnit",
  "about-order",
  "contentPage"
];
const missingSeedSnippets = requiredSeedSnippets.filter((snippet) => !seedScript.includes(snippet));

if (missingSeedSnippets.length > 0) {
  throw new Error(
    `Seed baseline is missing required Phase 2 fixtures: ${missingSeedSnippets.join(", ")}`
  );
}

console.log(
  "Database migration baseline includes Phase 2 identity, organization-unit, scope fixtures, and Phase 3 public content-page fixtures."
);
