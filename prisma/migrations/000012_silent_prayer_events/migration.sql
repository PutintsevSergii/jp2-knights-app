CREATE TABLE silent_prayer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  intention text,
  visibility visibility NOT NULL,
  target_organization_unit_id uuid REFERENCES organization_units(id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'DRAFT',
  starts_at timestamptz(6) NOT NULL,
  ends_at timestamptz(6),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  approved_at timestamptz(6),
  published_at timestamptz(6),
  cancelled_at timestamptz(6),
  archived_at timestamptz(6)
);

CREATE INDEX silent_prayer_events_visibility_status_starts_at_idx
  ON silent_prayer_events(visibility, status, starts_at);

CREATE INDEX silent_prayer_events_status_published_at_idx
  ON silent_prayer_events(status, published_at);

CREATE INDEX silent_prayer_events_target_organization_unit_id_idx
  ON silent_prayer_events(target_organization_unit_id);
