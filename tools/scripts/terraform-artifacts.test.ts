import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function read(path: string) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

describe("Phase 13 Terraform foundation", () => {
  it("pins Terraform and Google provider requirements", async () => {
    const versions = await read("infra/terraform/versions.tf");
    const providers = await read("infra/terraform/providers.tf");

    expect(versions).toContain('required_version = ">= 1.6.0"');
    expect(versions).toContain('source  = "hashicorp/google"');
    expect(versions).toContain('source  = "hashicorp/google-beta"');
    expect(versions).toContain('version = "~> 5.45"');
    expect(providers).toContain('provider "google"');
    expect(providers).toContain('provider "google-beta"');
    expect(providers).toContain("project = var.project_id");
    expect(providers).toContain("region  = var.region");
    expect(providers).toContain("user_project_override = true");
  });

  it("creates the first milestone resource shells without Redis or secret versions", async () => {
    const main = await read("infra/terraform/main.tf");

    expect(main).toContain('resource "google_project_service" "required"');
    expect(main).toContain('resource "google_service_account" "api"');
    expect(main).toContain('resource "google_service_account" "admin"');
    expect(main).toContain('resource "google_service_account" "migration"');
    expect(main).toContain('resource "google_artifact_registry_repository" "jp2"');
    expect(main).toContain('resource "google_secret_manager_secret" "secrets"');
    expect(main).toContain('resource "google_firebase_project" "default"');
    expect(main).toContain('resource "google_firebase_database_instance" "silent_prayer"');
    expect(main).toContain('resource "google_sql_database_instance" "postgres"');
    expect(main).toContain('resource "google_sql_database" "app"');
    expect(main).toContain('resource "google_cloud_run_v2_service" "api"');
    expect(main).toContain('resource "google_cloud_run_v2_service" "admin"');
    expect(main).toContain('resource "google_cloud_run_v2_job" "migration"');
    expect(main).not.toContain("google_secret_manager_secret_version");
    expect(main).not.toContain("google_sql_user");
    expect(main).not.toMatch(/redis|memorystore/i);
  });

  it("enforces Firebase RTDB as the only live silent-prayer provider", async () => {
    const variables = await read("infra/terraform/variables.tf");
    const tfvars = await read("infra/terraform/terraform.tfvars.example");

    expect(variables).toContain('default     = "firebase-rtdb"');
    expect(variables).toContain(
      'condition     = var.silent_prayer_realtime_provider == "firebase-rtdb"'
    );
    expect(variables).toContain("do not provision Redis/Memorystore");
    expect(tfvars).toContain('silent_prayer_realtime_provider = "firebase-rtdb"');
    expect(tfvars).not.toMatch(/redis-socket|in-memory/);
  });

  it("maps Cloud Run runtime env to existing app configuration keys", async () => {
    const main = await read("infra/terraform/main.tf");

    expect(main).toContain('name  = "APP_RUNTIME_MODE"');
    expect(main).toContain('name  = "AUTH_PROVIDER_MODE"');
    expect(main).toContain('name  = "FIREBASE_PROJECT_ID"');
    expect(main).toContain('name  = "FIREBASE_DATABASE_URL"');
    expect(main).toContain("value = google_firebase_database_instance.silent_prayer.database_url");
    expect(main).toContain('name  = "SILENT_PRAYER_REALTIME_PROVIDER"');
    expect(main).toContain('name = "DATABASE_URL"');
    expect(main).toContain('name = "FIREBASE_SERVICE_ACCOUNT_JSON"');
    expect(main).toContain('name = "SILENT_PRAYER_PRESENCE_HASH_SECRET"');
    expect(main).toContain('name  = "API_BASE_URL"');
    expect(main).toContain('value = "${var.api_public_url}/api/"');
  });

  it("adds Cloud SQL and migration job settings without storing database credentials", async () => {
    const main = await read("infra/terraform/main.tf");
    const variables = await read("infra/terraform/variables.tf");
    const outputs = await read("infra/terraform/outputs.tf");
    const tfvars = await read("infra/terraform/terraform.tfvars.example");

    expect(main).toContain('database_version    = var.cloud_sql_database_version');
    expect(main).toContain('deletion_protection = var.cloud_sql_deletion_protection');
    expect(main).toContain('backup_configuration');
    expect(main).toContain('role    = "roles/cloudsql.client"');
    expect(main).toContain('command = ["pnpm"]');
    expect(main).toContain(
      'args    = ["exec", "prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"]'
    );
    expect(main).toContain('value = tostring(var.migration_prisma_connection_limit)');
    expect(variables).toContain('variable "cloud_sql_instance_name"');
    expect(variables).toContain('variable "migration_prisma_connection_limit"');
    expect(outputs).toContain('output "cloud_sql_instance_connection_name"');
    expect(outputs).toContain('output "migration_job_name"');
    expect(tfvars).toContain('cloud_sql_database_version    = "POSTGRES_16"');
    expect(tfvars).toContain("migration_prisma_connection_limit = 2");
  });

  it("provisions Firebase RTDB through beta resources with safe deletion/import settings", async () => {
    const main = await read("infra/terraform/main.tf");
    const variables = await read("infra/terraform/variables.tf");
    const outputs = await read("infra/terraform/outputs.tf");
    const tfvars = await read("infra/terraform/terraform.tfvars.example");
    const readme = await read("infra/terraform/README.md");

    expect(main).toMatch(/provider\s+= google-beta/);
    expect(main).toContain('resource "google_firebase_project" "default"');
    expect(main).toContain('resource "google_firebase_database_instance" "silent_prayer"');
    expect(main).toContain("instance_id     = var.firebase_database_instance_id");
    expect(main).toContain("type            = var.firebase_database_type");
    expect(main).toContain('desired_state   = "ACTIVE"');
    expect(main).toContain("deletion_policy = var.firebase_database_deletion_policy");
    expect(variables).toContain('variable "firebase_database_instance_id"');
    expect(variables).toContain('default     = "DEFAULT_DATABASE"');
    expect(variables).toContain('default     = "ABANDON"');
    expect(outputs).toContain('output "firebase_database_url"');
    expect(tfvars).toMatch(/firebase_database_instance_id\s+= "jp2-pilot-default-rtdb"/);
    expect(readme).toContain("terraform import google_firebase_project.default");
    expect(readme).toContain("terraform import google_firebase_database_instance.silent_prayer");
    expect(readme).toContain("pnpm exec firebase deploy --only database");
  });

  it("keeps local Terraform state and tfvars out of git while tracking the example", async () => {
    const gitignore = await read(".gitignore");

    expect(gitignore).toContain("*.tfvars");
    expect(gitignore).toContain("!terraform.tfvars.example");
    expect(gitignore).toContain("*.tfstate");
    expect(gitignore).toContain(".terraform/");
    expect(gitignore).toContain(".terraform.lock.hcl");
  });
});
