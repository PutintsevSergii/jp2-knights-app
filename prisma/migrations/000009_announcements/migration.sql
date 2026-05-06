CREATE TABLE announcements (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  visibility visibility NOT NULL,
  target_organization_unit_id uuid REFERENCES organization_units(id) ON DELETE SET NULL,
  pinned boolean NOT NULL DEFAULT false,
  status content_status NOT NULL,
  created_by uuid,
  updated_by uuid,
  approved_by uuid,
  published_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz
);

CREATE INDEX announcements_visibility_status_pinned_idx
  ON announcements (visibility, status, pinned);

CREATE INDEX announcements_status_published_at_idx
  ON announcements (status, published_at);

CREATE INDEX announcements_target_organization_unit_id_idx
  ON announcements (target_organization_unit_id);
