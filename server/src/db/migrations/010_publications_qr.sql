-- Snapshot-based publishing: admins edit the live tables (the "draft"),
-- and publishing freezes a JSON snapshot that the public client endpoint serves.
CREATE TABLE menu_publications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id       UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  snapshot      JSONB NOT NULL,
  published_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_publications_cafe ON menu_publications(cafe_id, published_at DESC);

CREATE TABLE qr_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id    UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  slug       VARCHAR(80) NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qr_links_cafe ON qr_links(cafe_id);
