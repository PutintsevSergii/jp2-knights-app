CREATE TYPE visibility AS ENUM (
  'PUBLIC',
  'FAMILY_OPEN',
  'CANDIDATE',
  'BROTHER',
  'ORGANIZATION_UNIT',
  'OFFICER',
  'ADMIN'
);

CREATE TYPE content_status AS ENUM (
  'DRAFT',
  'REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED'
);

CREATE TABLE content_pages (
  id uuid PRIMARY KEY,
  slug text NOT NULL,
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

CREATE UNIQUE INDEX content_pages_slug_language_unique
  ON content_pages (slug, language);

CREATE INDEX content_pages_visibility_status_language_idx
  ON content_pages (visibility, status, language);

CREATE INDEX content_pages_status_published_at_idx
  ON content_pages (status, published_at);

CREATE INDEX content_pages_target_organization_unit_id_idx
  ON content_pages (target_organization_unit_id);
