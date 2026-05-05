CREATE TYPE identity_access_review_status AS ENUM ('pending', 'confirmed', 'rejected', 'expired');

CREATE TABLE identity_access_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_account_id uuid NOT NULL REFERENCES identity_provider_accounts(id) ON DELETE RESTRICT,
  status identity_access_review_status NOT NULL DEFAULT 'pending',
  scope_organization_unit_id uuid REFERENCES organization_units(id) ON DELETE SET NULL,
  requested_role role,
  assigned_role role,
  expires_at timestamptz NOT NULL,
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX identity_access_reviews_user_id_idx ON identity_access_reviews(user_id);
CREATE INDEX identity_access_reviews_provider_account_id_idx ON identity_access_reviews(provider_account_id);
CREATE INDEX identity_access_reviews_status_expires_at_idx ON identity_access_reviews(status, expires_at);
CREATE INDEX identity_access_reviews_scope_status_idx ON identity_access_reviews(scope_organization_unit_id, status);
CREATE UNIQUE INDEX identity_access_reviews_provider_account_pending_unique
  ON identity_access_reviews(provider_account_id)
  WHERE status = 'pending';

CREATE TABLE identity_access_approver_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  organization_unit_id uuid NOT NULL REFERENCES organization_units(id) ON DELETE RESTRICT,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX identity_access_approver_assignments_user_id_idx
  ON identity_access_approver_assignments(user_id);
CREATE INDEX identity_access_approver_assignments_organization_unit_id_idx
  ON identity_access_approver_assignments(organization_unit_id);
CREATE INDEX identity_access_approver_assignments_revoked_at_idx
  ON identity_access_approver_assignments(revoked_at);
CREATE UNIQUE INDEX identity_access_approver_assignments_active_unique
  ON identity_access_approver_assignments(user_id, organization_unit_id)
  WHERE revoked_at IS NULL;
