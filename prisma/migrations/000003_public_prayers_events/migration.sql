CREATE TYPE event_status AS ENUM (
  'draft',
  'published',
  'cancelled',
  'archived'
);

CREATE TABLE prayer_categories (
  id uuid PRIMARY KEY,
  slug text NOT NULL,
  title text NOT NULL,
  language text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status content_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  archived_at timestamptz
);

CREATE UNIQUE INDEX prayer_categories_slug_language_unique
  ON prayer_categories (slug, language);

CREATE INDEX prayer_categories_status_language_sort_order_idx
  ON prayer_categories (status, language, sort_order);

CREATE TABLE prayers (
  id uuid PRIMARY KEY,
  category_id uuid REFERENCES prayer_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  language text NOT NULL,
  visibility visibility NOT NULL,
  target_organization_unit_id uuid REFERENCES organization_units(id) ON DELETE RESTRICT,
  status content_status NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz
);

CREATE INDEX prayers_category_id_idx
  ON prayers (category_id);

CREATE INDEX prayers_visibility_status_language_idx
  ON prayers (visibility, status, language);

CREATE INDEX prayers_status_published_at_idx
  ON prayers (status, published_at);

CREATE INDEX prayers_target_organization_unit_id_idx
  ON prayers (target_organization_unit_id);

CREATE TABLE events (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  location_label text,
  visibility visibility NOT NULL,
  target_organization_unit_id uuid REFERENCES organization_units(id) ON DELETE RESTRICT,
  status event_status NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  cancelled_at timestamptz,
  archived_at timestamptz
);

CREATE INDEX events_visibility_status_start_at_idx
  ON events (visibility, status, start_at);

CREATE INDEX events_status_published_at_idx
  ON events (status, published_at);

CREATE INDEX events_target_organization_unit_id_idx
  ON events (target_organization_unit_id);
