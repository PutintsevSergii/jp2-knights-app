variable "project_id" {
  description = "Google Cloud project id for the selected JP2 environment."
  type        = string
}

variable "region" {
  description = "Google Cloud region for regional resources."
  type        = string
  default     = "europe-west4"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "pilot"

  validation {
    condition     = contains(["staging", "pilot", "production"], var.environment)
    error_message = "environment must be staging, pilot, or production."
  }
}

variable "labels" {
  description = "Additional labels applied to supported Google Cloud resources."
  type        = map(string)
  default     = {}
}

variable "repository_id" {
  description = "Artifact Registry repository id for JP2 container images."
  type        = string
  default     = "jp2"
}

variable "api_service_name" {
  description = "Cloud Run service name for the JP2 API."
  type        = string
  default     = "jp2-api"
}

variable "admin_service_name" {
  description = "Cloud Run service name for JP2 Admin Lite."
  type        = string
  default     = "jp2-admin"
}

variable "migration_job_name" {
  description = "Cloud Run Job name for Prisma migrations."
  type        = string
  default     = "jp2-migrate"
}

variable "api_image" {
  description = "Prebuilt API container image reference."
  type        = string
}

variable "admin_image" {
  description = "Prebuilt Admin Lite container image reference."
  type        = string
}

variable "api_public_url" {
  description = "Public API origin, without the /api suffix."
  type        = string
}

variable "admin_public_url" {
  description = "Public Admin Lite origin."
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase project id used by Firebase Auth and Admin SDK."
  type        = string
}

variable "firebase_database_region" {
  description = "Firebase Realtime Database region for silent-prayer aggregate counts."
  type        = string
  default     = "europe-west4"
}

variable "firebase_database_instance_id" {
  description = "Globally unique Firebase Realtime Database instance id."
  type        = string
  default     = "jp2-pilot-default-rtdb"
}

variable "firebase_database_type" {
  description = "Firebase Realtime Database type."
  type        = string
  default     = "DEFAULT_DATABASE"

  validation {
    condition     = contains(["DEFAULT_DATABASE", "USER_DATABASE"], var.firebase_database_type)
    error_message = "firebase_database_type must be DEFAULT_DATABASE or USER_DATABASE."
  }
}

variable "firebase_database_deletion_policy" {
  description = "Terraform deletion behavior for the Firebase Realtime Database."
  type        = string
  default     = "ABANDON"

  validation {
    condition     = contains(["ABANDON", "DELETE", "PREVENT"], var.firebase_database_deletion_policy)
    error_message = "firebase_database_deletion_policy must be ABANDON, DELETE, or PREVENT."
  }
}

variable "silent_prayer_realtime_provider" {
  description = "Live silent-prayer realtime provider."
  type        = string
  default     = "firebase-rtdb"

  validation {
    condition     = var.silent_prayer_realtime_provider == "firebase-rtdb"
    error_message = "Pilot/production Terraform only supports firebase-rtdb; do not provision Redis/Memorystore."
  }
}

variable "prisma_connection_limit" {
  description = "API Prisma connection_limit appended when DATABASE_URL does not already define it."
  type        = number
  default     = 5
}

variable "prisma_pool_timeout_seconds" {
  description = "API Prisma pool_timeout appended when DATABASE_URL does not already define it."
  type        = number
  default     = 10
}

variable "prisma_startup_retry_attempts" {
  description = "Production API startup database connection retry attempts."
  type        = number
  default     = 5
}

variable "prisma_startup_retry_delay_ms" {
  description = "Delay between production API startup database connection retries."
  type        = number
  default     = 1000
}

variable "migration_prisma_connection_limit" {
  description = "Migration job Prisma connection_limit appended when DATABASE_URL does not already define it."
  type        = number
  default     = 2
}

variable "migration_job_timeout_seconds" {
  description = "Cloud Run migration job task timeout in seconds."
  type        = number
  default     = 900
}

variable "api_min_instances" {
  description = "Minimum API Cloud Run instances."
  type        = number
  default     = 0
}

variable "api_max_instances" {
  description = "Maximum API Cloud Run instances."
  type        = number
  default     = 3
}

variable "admin_min_instances" {
  description = "Minimum Admin Lite Cloud Run instances."
  type        = number
  default     = 0
}

variable "admin_max_instances" {
  description = "Maximum Admin Lite Cloud Run instances."
  type        = number
  default     = 2
}

variable "cloud_sql_instance_name" {
  description = "Cloud SQL PostgreSQL instance name."
  type        = string
  default     = "jp2-postgres"
}

variable "cloud_sql_database_name" {
  description = "Application database name inside the Cloud SQL PostgreSQL instance."
  type        = string
  default     = "jp2_app"
}

variable "cloud_sql_database_version" {
  description = "Cloud SQL PostgreSQL database version."
  type        = string
  default     = "POSTGRES_16"
}

variable "cloud_sql_tier" {
  description = "Cloud SQL machine tier for the lean pilot."
  type        = string
  default     = "db-f1-micro"
}

variable "cloud_sql_availability_type" {
  description = "Cloud SQL availability type."
  type        = string
  default     = "ZONAL"
}

variable "cloud_sql_disk_size_gb" {
  description = "Initial Cloud SQL disk size in GB."
  type        = number
  default     = 10
}

variable "cloud_sql_backup_enabled" {
  description = "Enable Cloud SQL automated backups."
  type        = bool
  default     = true
}

variable "cloud_sql_deletion_protection" {
  description = "Protect the Cloud SQL instance from accidental Terraform deletion."
  type        = bool
  default     = true
}

variable "cloud_run_ingress" {
  description = "Cloud Run ingress setting for API and Admin services."
  type        = string
  default     = "INGRESS_TRAFFIC_ALL"
}

variable "enable_public_invoker" {
  description = "Grant allUsers Cloud Run invoker on API and Admin services. Enable only for a reviewed pilot/staging rollout."
  type        = bool
  default     = false
}

variable "secret_names" {
  description = "Secret Manager secret ids created as shells. Values are added outside Terraform."
  type = object({
    database_url                = string
    session_secret              = string
    csrf_secret                 = string
    firebase_service_account    = string
    silent_prayer_hash_secret   = string
    push_provider_credentials   = string
    admin_bootstrap_token       = string
  })
  default = {
    database_url              = "jp2-database-url"
    session_secret            = "jp2-session-secret"
    csrf_secret               = "jp2-csrf-secret"
    firebase_service_account  = "jp2-firebase-service-account-json"
    silent_prayer_hash_secret = "jp2-silent-prayer-presence-hash-secret"
    push_provider_credentials = "jp2-push-provider-credentials"
    admin_bootstrap_token     = "jp2-admin-bootstrap-token"
  }
}
