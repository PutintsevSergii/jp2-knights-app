CREATE TYPE roadmap_assignment_status AS ENUM ('active', 'completed', 'archived');

CREATE TYPE roadmap_submission_status AS ENUM ('pending_review', 'approved', 'rejected');

CREATE TABLE roadmap_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  target_role role NOT NULL,
  status content_status NOT NULL DEFAULT 'DRAFT',
  language text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  approved_at timestamptz(6),
  published_at timestamptz(6),
  archived_at timestamptz(6)
);

CREATE TABLE roadmap_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_definition_id uuid NOT NULL REFERENCES roadmap_definitions(id) ON DELETE RESTRICT,
  title text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  archived_at timestamptz(6)
);

CREATE TABLE roadmap_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES roadmap_stages(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  requires_submission boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL,
  status content_status NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  published_at timestamptz(6),
  archived_at timestamptz(6)
);

CREATE TABLE roadmap_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  roadmap_definition_id uuid NOT NULL REFERENCES roadmap_definitions(id) ON DELETE RESTRICT,
  organization_unit_id uuid REFERENCES organization_units(id) ON DELETE SET NULL,
  status roadmap_assignment_status NOT NULL DEFAULT 'active',
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz(6) NOT NULL DEFAULT now(),
  completed_at timestamptz(6),
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  archived_at timestamptz(6)
);

CREATE TABLE roadmap_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES roadmap_assignments(id) ON DELETE RESTRICT,
  step_id uuid NOT NULL REFERENCES roadmap_steps(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body text NOT NULL,
  attachment_meta jsonb,
  status roadmap_submission_status NOT NULL DEFAULT 'pending_review',
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  review_comment text,
  reviewed_at timestamptz(6),
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  archived_at timestamptz(6)
);

CREATE INDEX roadmap_definitions_target_role_status_idx
  ON roadmap_definitions(target_role, status);
CREATE INDEX roadmap_definitions_status_published_at_idx
  ON roadmap_definitions(status, published_at);

CREATE UNIQUE INDEX roadmap_stages_definition_sort_order_unique
  ON roadmap_stages(roadmap_definition_id, sort_order);
CREATE INDEX roadmap_stages_definition_idx
  ON roadmap_stages(roadmap_definition_id);

CREATE UNIQUE INDEX roadmap_steps_stage_sort_order_unique
  ON roadmap_steps(stage_id, sort_order);
CREATE INDEX roadmap_steps_stage_status_idx
  ON roadmap_steps(stage_id, status);

CREATE INDEX roadmap_assignments_user_status_idx
  ON roadmap_assignments(user_id, status);
CREATE INDEX roadmap_assignments_definition_status_idx
  ON roadmap_assignments(roadmap_definition_id, status);
CREATE INDEX roadmap_assignments_organization_unit_status_idx
  ON roadmap_assignments(organization_unit_id, status);
CREATE UNIQUE INDEX roadmap_assignments_user_definition_active_unique
  ON roadmap_assignments(user_id, roadmap_definition_id)
  WHERE status = 'active' AND archived_at IS NULL;

CREATE INDEX roadmap_submissions_assignment_idx
  ON roadmap_submissions(assignment_id);
CREATE INDEX roadmap_submissions_user_status_idx
  ON roadmap_submissions(user_id, status);
CREATE INDEX roadmap_submissions_step_status_idx
  ON roadmap_submissions(step_id, status);
CREATE INDEX roadmap_submissions_reviewed_by_idx
  ON roadmap_submissions(reviewed_by);
CREATE UNIQUE INDEX roadmap_submissions_assignment_step_pending_unique
  ON roadmap_submissions(assignment_id, step_id)
  WHERE status = 'pending_review' AND archived_at IS NULL;
