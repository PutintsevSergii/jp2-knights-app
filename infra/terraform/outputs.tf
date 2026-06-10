output "artifact_registry_repository" {
  description = "Artifact Registry repository name for JP2 images."
  value       = google_artifact_registry_repository.jp2.name
}

output "api_service_name" {
  description = "Cloud Run API service name."
  value       = google_cloud_run_v2_service.api.name
}

output "api_service_uri" {
  description = "Generated Cloud Run API service URI."
  value       = google_cloud_run_v2_service.api.uri
}

output "admin_service_name" {
  description = "Cloud Run Admin Lite service name."
  value       = google_cloud_run_v2_service.admin.name
}

output "admin_service_uri" {
  description = "Generated Cloud Run Admin Lite service URI."
  value       = google_cloud_run_v2_service.admin.uri
}

output "cloud_sql_instance_connection_name" {
  description = "Cloud SQL instance connection name for DATABASE_URL secret construction."
  value       = google_sql_database_instance.postgres.connection_name
}

output "cloud_sql_database_name" {
  description = "Application database name inside Cloud SQL."
  value       = google_sql_database.app.name
}

output "firebase_database_url" {
  description = "Firebase Realtime Database URL used by the API and mobile RTDB configuration."
  value       = google_firebase_database_instance.silent_prayer.database_url
}

output "firebase_database_instance_name" {
  description = "Fully qualified Firebase Realtime Database instance resource name."
  value       = google_firebase_database_instance.silent_prayer.name
}

output "migration_job_name" {
  description = "Cloud Run migration job name."
  value       = google_cloud_run_v2_job.migration.name
}

output "api_service_account_email" {
  description = "API runtime service account email."
  value       = google_service_account.api.email
}

output "admin_service_account_email" {
  description = "Admin Lite runtime service account email."
  value       = google_service_account.admin.email
}

output "migration_service_account_email" {
  description = "Migration job service account email."
  value       = google_service_account.migration.email
}

output "secret_names" {
  description = "Secret Manager shell names. Secret values are added outside Terraform."
  value = {
    for key, secret in google_secret_manager_secret.secrets :
    key => secret.secret_id
  }
}
