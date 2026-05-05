CREATE TYPE "candidate_profile_status" AS ENUM (
  'active',
  'paused',
  'converted_to_brother',
  'archived'
);

CREATE TABLE "candidate_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "candidate_request_id" uuid,
  "assigned_organization_unit_id" uuid,
  "responsible_officer_id" uuid,
  "status" "candidate_profile_status" NOT NULL DEFAULT 'active',
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "archived_at" timestamptz(6),
  CONSTRAINT "candidate_profiles_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "users"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT "candidate_profiles_candidate_request_id_fkey"
    FOREIGN KEY ("candidate_request_id")
    REFERENCES "candidate_requests"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT "candidate_profiles_assigned_organization_unit_id_fkey"
    FOREIGN KEY ("assigned_organization_unit_id")
    REFERENCES "organization_units"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT "candidate_profiles_responsible_officer_id_fkey"
    FOREIGN KEY ("responsible_officer_id")
    REFERENCES "users"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX "candidate_profiles_candidate_request_id_idx"
  ON "candidate_profiles"("candidate_request_id");
CREATE INDEX "candidate_profiles_assigned_organization_unit_id_status_idx"
  ON "candidate_profiles"("assigned_organization_unit_id", "status");
CREATE INDEX "candidate_profiles_responsible_officer_id_idx"
  ON "candidate_profiles"("responsible_officer_id");
CREATE INDEX "candidate_profiles_user_id_idx"
  ON "candidate_profiles"("user_id");
CREATE INDEX "candidate_profiles_status_idx"
  ON "candidate_profiles"("status");
CREATE UNIQUE INDEX "candidate_profiles_user_active_unique_idx"
  ON "candidate_profiles"("user_id")
  WHERE "archived_at" IS NULL AND "status" IN ('active', 'paused');
CREATE UNIQUE INDEX "candidate_profiles_candidate_request_active_unique_idx"
  ON "candidate_profiles"("candidate_request_id")
  WHERE "candidate_request_id" IS NOT NULL
    AND "archived_at" IS NULL
    AND "status" IN ('active', 'paused');
