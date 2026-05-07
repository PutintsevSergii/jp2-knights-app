CREATE TYPE device_token_platform AS ENUM ('ios', 'android', 'web');

CREATE TYPE notification_category AS ENUM (
  'events',
  'announcements',
  'roadmap_updates',
  'prayer_reminders'
);

CREATE TABLE device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  platform device_token_platform NOT NULL,
  token_hash text NOT NULL,
  token_last4 text NOT NULL,
  last_seen_at timestamptz(6) NOT NULL DEFAULT now(),
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  revoked_at timestamptz(6)
);

CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category notification_category NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX device_tokens_token_hash_unique ON device_tokens(token_hash);
CREATE INDEX device_tokens_user_revoked_at_idx ON device_tokens(user_id, revoked_at);
CREATE INDEX device_tokens_platform_idx ON device_tokens(platform);

CREATE UNIQUE INDEX notification_preferences_user_category_unique ON notification_preferences(user_id, category);
CREATE INDEX notification_preferences_category_enabled_idx ON notification_preferences(category, enabled);
