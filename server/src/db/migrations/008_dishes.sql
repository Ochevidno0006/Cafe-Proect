CREATE TABLE dishes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id      UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  name         VARCHAR(150) NOT NULL,
  price        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description  TEXT,
  photo_url    TEXT,
  rating       SMALLINT NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_enabled   BOOLEAN NOT NULL DEFAULT true,
  position     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dishes_cafe ON dishes(cafe_id);
CREATE INDEX idx_dishes_category ON dishes(category_id);

CREATE TRIGGER trg_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Optional per-dish characteristics; each one individually toggled visible/hidden.
CREATE TABLE dish_attributes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id    UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  attr_key   VARCHAR(30) NOT NULL
             CHECK (attr_key IN ('ingredients', 'weight', 'calories', 'allergens', 'spiciness', 'prep_time')),
  attr_value TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (dish_id, attr_key)
);

CREATE TABLE dish_translations (
  dish_id       UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL REFERENCES languages(code),
  name          VARCHAR(150),
  description   TEXT,
  PRIMARY KEY (dish_id, language_code)
);

CREATE TABLE dish_labels (
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  label   VARCHAR(20) NOT NULL
          CHECK (label IN ('popular', 'new', 'recommended', 'spicy', 'vegetarian', 'promo')),
  PRIMARY KEY (dish_id, label)
);

CREATE TABLE menu_block_dishes (
  block_id UUID NOT NULL REFERENCES menu_blocks(id) ON DELETE CASCADE,
  dish_id  UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  PRIMARY KEY (block_id, dish_id)
);
