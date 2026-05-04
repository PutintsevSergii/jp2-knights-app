CREATE TABLE identity_provider_accounts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_subject text NOT NULL,
  email citext,
  email_verified boolean,
  phone text,
  display_name text,
  photo_url text,
  last_sign_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE UNIQUE INDEX identity_provider_accounts_provider_subject_active_unique
  ON identity_provider_accounts (provider, provider_subject)
  WHERE revoked_at IS NULL;

CREATE INDEX identity_provider_accounts_user_id_idx ON identity_provider_accounts (user_id);
CREATE INDEX identity_provider_accounts_provider_subject_idx
  ON identity_provider_accounts (provider, provider_subject);
CREATE INDEX identity_provider_accounts_revoked_at_idx
  ON identity_provider_accounts (revoked_at);
