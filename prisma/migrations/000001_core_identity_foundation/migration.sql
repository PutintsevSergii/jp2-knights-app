CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'invited', 'archived');
CREATE TYPE role AS ENUM ('CANDIDATE', 'BROTHER', 'OFFICER', 'SUPER_ADMIN');
CREATE TYPE choragiew_status AS ENUM ('active', 'archived');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'archived');

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email citext NOT NULL,
  phone text,
  display_name text NOT NULL,
  status user_status NOT NULL DEFAULT 'invited',
  preferred_language text,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE UNIQUE INDEX users_email_active_unique
  ON users (email)
  WHERE archived_at IS NULL;

CREATE INDEX users_status_idx ON users (status);

CREATE TABLE user_roles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role role NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE UNIQUE INDEX user_roles_user_role_active_unique
  ON user_roles (user_id, role)
  WHERE revoked_at IS NULL;

CREATE INDEX user_roles_user_id_idx ON user_roles (user_id);
CREATE INDEX user_roles_role_idx ON user_roles (role);

CREATE TABLE choragiew (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  parish text,
  status choragiew_status NOT NULL DEFAULT 'active',
  public_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE UNIQUE INDEX choragiew_name_city_active_unique
  ON choragiew (name, city)
  WHERE archived_at IS NULL;

CREATE INDEX choragiew_status_idx ON choragiew (status);

CREATE TABLE memberships (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  choragiew_id uuid NOT NULL REFERENCES choragiew(id) ON DELETE RESTRICT,
  status membership_status NOT NULL DEFAULT 'active',
  current_degree text,
  joined_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE UNIQUE INDEX memberships_user_active_unique
  ON memberships (user_id)
  WHERE archived_at IS NULL;

CREATE INDEX memberships_choragiew_status_idx ON memberships (choragiew_id, status);
CREATE INDEX memberships_user_id_idx ON memberships (user_id);

CREATE TABLE officer_assignments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  choragiew_id uuid NOT NULL REFERENCES choragiew(id) ON DELETE RESTRICT,
  title text,
  starts_at date NOT NULL,
  ends_at date,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX officer_assignments_user_id_idx ON officer_assignments (user_id);
CREATE INDEX officer_assignments_choragiew_id_idx ON officer_assignments (choragiew_id);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  scope_choragiew_id uuid,
  before_summary jsonb,
  after_summary jsonb,
  request_id text,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_actor_user_id_idx ON audit_logs (actor_user_id);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX audit_logs_scope_choragiew_id_idx ON audit_logs (scope_choragiew_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at);
