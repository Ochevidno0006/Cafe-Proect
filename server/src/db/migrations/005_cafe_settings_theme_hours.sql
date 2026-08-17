CREATE TABLE cafe_settings (
  cafe_id           UUID PRIMARY KEY REFERENCES cafes(id) ON DELETE CASCADE,
  search_enabled    BOOLEAN NOT NULL DEFAULT false,
  favorites_enabled BOOLEAN NOT NULL DEFAULT true,
  share_enabled     BOOLEAN NOT NULL DEFAULT true,
  labels_enabled    BOOLEAN NOT NULL DEFAULT true,
  section_order     JSONB NOT NULL DEFAULT '["header","ads","categories","blocks","gallery","contacts"]',
  status            VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'temporarily_closed')),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_cafe_settings_updated_at
  BEFORE UPDATE ON cafe_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE theme_settings (
  cafe_id           UUID PRIMARY KEY REFERENCES cafes(id) ON DELETE CASCADE,
  preset            VARCHAR(20) NOT NULL DEFAULT 'modern'
                     CHECK (preset IN ('modern', 'elegant', 'minimal', 'dark', 'classic', 'restaurant')),
  primary_color     VARCHAR(9),
  button_color      VARCHAR(9),
  background_color  VARCHAR(9),
  text_color        VARCHAR(9),
  card_radius       SMALLINT NOT NULL DEFAULT 16,
  card_style        VARCHAR(20) NOT NULL DEFAULT 'rounded',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_theme_settings_updated_at
  BEFORE UPDATE ON theme_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE working_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id     UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  mode        VARCHAR(20) NOT NULL DEFAULT 'workday' CHECK (mode IN ('workday', 'day_off', '24h')),
  open_time   TIME,
  close_time  TIME,
  UNIQUE (cafe_id, day_of_week)
);
