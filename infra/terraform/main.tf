locals {
  common_labels = merge(var.labels, {
    app         = "jp2"
    environment = var.environment
    managed_by  = "terraform"
  })

  required_project_services = toset([
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    "firebasedatabase.googleapis.com",
    "iam.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "serviceusage.googleapis.com",
    "sqladmin.googleapis.com"
  ])

  secret_definitions = {
    database_url = {
      secret_id = var.secret_names.database_url
    }
    session_secret = {
      secret_id = var.secret_names.session_secret
    }
    csrf_secret = {
      secret_id = var.secret_names.csrf_secret
    }
    firebase_service_account = {
      secret_id = var.secret_names.firebase_service_account
    }
    silent_prayer_hash_secret = {
      secret_id = var.secret_names.silent_prayer_hash_secret
    }
    push_provider_credentials = {
      secret_id = var.secret_names.push_provider_credentials
    }
    admin_bootstrap_token = {
      secret_id = var.secret_names.admin_bootstrap_token
    }
  }
}

resource "google_project_service" "required" {
  for_each = local.required_project_services

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

resource "google_service_account" "api" {
  project      = var.project_id
  account_id   = "${var.environment}-jp2-api"
  display_name = "JP2 API ${var.environment}"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "admin" {
  project      = var.project_id
  account_id   = "${var.environment}-jp2-admin"
  display_name = "JP2 Admin Lite ${var.environment}"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "migration" {
  project      = var.project_id
  account_id   = "${var.environment}-jp2-migration"
  display_name = "JP2 migration job ${var.environment}"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "deploy" {
  project      = var.project_id
  account_id   = "${var.environment}-jp2-deploy"
  display_name = "JP2 deploy automation ${var.environment}"

  depends_on = [google_project_service.required]
}

resource "google_artifact_registry_repository" "jp2" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "JP2 API and Admin Lite container images"
  format        = "DOCKER"
  labels        = local.common_labels

  depends_on = [google_project_service.required]
}

resource "google_firebase_project" "default" {
  provider        = google-beta
  project         = var.firebase_project_id
  deletion_policy = "ABANDON"

  depends_on = [google_project_service.required]
}

resource "google_firebase_database_instance" "silent_prayer" {
  provider        = google-beta
  project         = google_firebase_project.default.project
  region          = var.firebase_database_region
  instance_id     = var.firebase_database_instance_id
  type            = var.firebase_database_type
  desired_state   = "ACTIVE"
  deletion_policy = var.firebase_database_deletion_policy

  depends_on = [google_firebase_project.default]
}

resource "google_sql_database_instance" "postgres" {
  project             = var.project_id
  name                = var.cloud_sql_instance_name
  region              = var.region
  database_version    = var.cloud_sql_database_version
  deletion_protection = var.cloud_sql_deletion_protection

  settings {
    tier              = var.cloud_sql_tier
    availability_type = var.cloud_sql_availability_type
    disk_type         = "PD_SSD"
    disk_size         = var.cloud_sql_disk_size_gb
    disk_autoresize   = true
    user_labels       = local.common_labels

    backup_configuration {
      enabled    = var.cloud_sql_backup_enabled
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled = true
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_sql_database" "app" {
  project  = var.project_id
  name     = var.cloud_sql_database_name
  instance = google_sql_database_instance.postgres.name
}

resource "google_secret_manager_secret" "secrets" {
  for_each = local.secret_definitions

  project   = var.project_id
  secret_id = each.value.secret_id
  labels    = local.common_labels

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret_iam_member" "api_secret_access" {
  for_each = {
    database_url              = local.secret_definitions.database_url
    firebase_service_account  = local.secret_definitions.firebase_service_account
    silent_prayer_hash_secret = local.secret_definitions.silent_prayer_hash_secret
    push_provider_credentials = local.secret_definitions.push_provider_credentials
  }

  project   = var.project_id
  secret_id = google_secret_manager_secret.secrets[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.api.email}"
}

resource "google_secret_manager_secret_iam_member" "migration_secret_access" {
  for_each = {
    database_url          = local.secret_definitions.database_url
    admin_bootstrap_token = local.secret_definitions.admin_bootstrap_token
  }

  project   = var.project_id
  secret_id = google_secret_manager_secret.secrets[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.migration.email}"
}

resource "google_project_iam_member" "api_cloud_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "migration_cloud_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.migration.email}"
}

resource "google_cloud_run_v2_service" "api" {
  project             = var.project_id
  name                = var.api_service_name
  location            = var.region
  ingress             = var.cloud_run_ingress
  deletion_protection = false
  labels              = local.common_labels

  template {
    service_account = google_service_account.api.email

    scaling {
      min_instance_count = var.api_min_instances
      max_instance_count = var.api_max_instances
    }

    containers {
      image = var.api_image

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "APP_RUNTIME_MODE"
        value = "api"
      }

      env {
        name  = "AUTH_PROVIDER_MODE"
        value = "firebase"
      }

      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }

      env {
        name  = "FIREBASE_DATABASE_URL"
        value = google_firebase_database_instance.silent_prayer.database_url
      }

      env {
        name  = "SILENT_PRAYER_REALTIME_PROVIDER"
        value = var.silent_prayer_realtime_provider
      }

      env {
        name  = "PRISMA_CONNECT_ON_BOOT"
        value = "true"
      }

      env {
        name  = "PRISMA_CONNECTION_LIMIT"
        value = tostring(var.prisma_connection_limit)
      }

      env {
        name  = "PRISMA_POOL_TIMEOUT_SECONDS"
        value = tostring(var.prisma_pool_timeout_seconds)
      }

      env {
        name  = "PRISMA_STARTUP_RETRY_ATTEMPTS"
        value = tostring(var.prisma_startup_retry_attempts)
      }

      env {
        name  = "PRISMA_STARTUP_RETRY_DELAY_MS"
        value = tostring(var.prisma_startup_retry_delay_ms)
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["database_url"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "FIREBASE_SERVICE_ACCOUNT_JSON"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["firebase_service_account"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SILENT_PRAYER_PRESENCE_HASH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["silent_prayer_hash_secret"].secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.required,
    google_firebase_database_instance.silent_prayer,
    google_project_iam_member.api_cloud_sql_client,
    google_secret_manager_secret_iam_member.api_secret_access
  ]
}

resource "google_cloud_run_v2_service" "admin" {
  project             = var.project_id
  name                = var.admin_service_name
  location            = var.region
  ingress             = var.cloud_run_ingress
  deletion_protection = false
  labels              = local.common_labels

  template {
    service_account = google_service_account.admin.email

    scaling {
      min_instance_count = var.admin_min_instances
      max_instance_count = var.admin_max_instances
    }

    containers {
      image = var.admin_image

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "APP_RUNTIME_MODE"
        value = "api"
      }

      env {
        name  = "API_BASE_URL"
        value = "${var.api_public_url}/api/"
      }

      env {
        name  = "ADMIN_PUBLIC_URL"
        value = var.admin_public_url
      }
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_cloud_run_v2_job" "migration" {
  project             = var.project_id
  name                = var.migration_job_name
  location            = var.region
  deletion_protection = false
  labels              = local.common_labels

  template {
    template {
      service_account = google_service_account.migration.email
      timeout         = "${var.migration_job_timeout_seconds}s"
      max_retries     = 1

      containers {
        image   = var.api_image
        command = ["pnpm"]
        args    = ["exec", "prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"]

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "APP_RUNTIME_MODE"
          value = "api"
        }

        env {
          name  = "PRISMA_CONNECTION_LIMIT"
          value = tostring(var.migration_prisma_connection_limit)
        }

        env {
          name  = "PRISMA_POOL_TIMEOUT_SECONDS"
          value = tostring(var.prisma_pool_timeout_seconds)
        }

        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.secrets["database_url"].secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.required,
    google_project_iam_member.migration_cloud_sql_client,
    google_secret_manager_secret_iam_member.migration_secret_access,
    google_sql_database.app
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public_api_invoker" {
  count = var.enable_public_invoker ? 1 : 0

  project  = var.project_id
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "public_admin_invoker" {
  count = var.enable_public_invoker ? 1 : 0

  project  = var.project_id
  location = google_cloud_run_v2_service.admin.location
  name     = google_cloud_run_v2_service.admin.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
