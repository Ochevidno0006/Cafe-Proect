CREATE TABLE audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  cafe_id        UUID REFERENCES cafes(id) ON DELETE SET NULL,
  action         VARCHAR(60) NOT NULL,
  entity_type    VARCHAR(40),
  entity_id      UUID,
  meta           JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_cafe ON audit_logs(cafe_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);

CREATE TABLE statistics (
  id         BIGSERIAL PRIMARY KEY,
  cafe_id    UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL
             CHECK (event_type IN ('menu_view', 'dish_view', 'category_view', 'qr_scan', 'link_open')),
  entity_id  UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_statistics_cafe_type ON statistics(cafe_id, event_type, created_at DESC);
