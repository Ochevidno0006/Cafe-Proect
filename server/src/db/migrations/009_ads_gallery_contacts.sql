CREATE TABLE advertisements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id    UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_advertisements_cafe ON advertisements(cafe_id);

CREATE TABLE gallery (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id    UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  category   VARCHAR(20) NOT NULL DEFAULT 'interior'
             CHECK (category IN ('interior', 'hall', 'dishes', 'atmosphere')),
  position   INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_cafe ON gallery(cafe_id);

CREATE TABLE contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id    UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  type       VARCHAR(20) NOT NULL
             CHECK (type IN ('phone', 'whatsapp', 'telegram', 'instagram', 'address', 'delivery', 'email', 'other')),
  value      TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  position   INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_contacts_cafe ON contacts(cafe_id);
