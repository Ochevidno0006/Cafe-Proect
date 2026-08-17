CREATE TABLE languages (
  code VARCHAR(5) PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

INSERT INTO languages (code, name) VALUES
  ('ru', 'Русский'),
  ('tg', 'Тоҷикӣ'),
  ('en', 'English');

CREATE TABLE cafe_languages (
  cafe_id       UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL REFERENCES languages(code),
  is_enabled    BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (cafe_id, language_code)
);
