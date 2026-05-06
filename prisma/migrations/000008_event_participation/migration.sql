CREATE TYPE participation_status AS ENUM (
  'planning_to_attend',
  'cancelled'
);

CREATE TABLE event_participation (
  id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  intent_status participation_status NOT NULL DEFAULT 'planning_to_attend',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE INDEX event_participation_event_id_idx
  ON event_participation (event_id);

CREATE INDEX event_participation_user_id_idx
  ON event_participation (user_id);

CREATE INDEX event_participation_intent_status_idx
  ON event_participation (intent_status);

CREATE UNIQUE INDEX event_participation_active_event_user_unique
  ON event_participation (event_id, user_id)
  WHERE cancelled_at IS NULL;
