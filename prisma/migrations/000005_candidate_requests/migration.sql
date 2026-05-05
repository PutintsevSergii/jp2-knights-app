CREATE TYPE "candidate_request_status" AS ENUM (
  'new',
  'contacted',
  'invited',
  'rejected',
  'converted_to_candidate'
);

CREATE TABLE "candidate_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" citext NOT NULL,
  "phone" text,
  "country" text NOT NULL,
  "city" text NOT NULL,
  "preferred_language" text,
  "message" text,
  "consent_text_version" text NOT NULL,
  "consent_at" timestamptz(6) NOT NULL,
  "idempotency_key" text,
  "status" "candidate_request_status" NOT NULL DEFAULT 'new',
  "assigned_organization_unit_id" uuid,
  "officer_note" text,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "archived_at" timestamptz(6),
  CONSTRAINT "candidate_requests_assigned_organization_unit_id_fkey"
    FOREIGN KEY ("assigned_organization_unit_id")
    REFERENCES "organization_units"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX "candidate_requests_status_idx" ON "candidate_requests"("status");
CREATE INDEX "candidate_requests_assigned_organization_unit_id_idx"
  ON "candidate_requests"("assigned_organization_unit_id");
CREATE INDEX "candidate_requests_email_idx" ON "candidate_requests"("email");
CREATE INDEX "candidate_requests_idempotency_key_idx" ON "candidate_requests"("idempotency_key");
CREATE UNIQUE INDEX "candidate_requests_active_email_unique_idx"
  ON "candidate_requests"("email")
  WHERE "archived_at" IS NULL AND "status" IN ('new', 'contacted', 'invited');
CREATE UNIQUE INDEX "candidate_requests_idempotency_key_unique_idx"
  ON "candidate_requests"("idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;
