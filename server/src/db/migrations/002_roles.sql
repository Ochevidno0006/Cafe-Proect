CREATE TABLE roles (
  id   SMALLINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL
);

INSERT INTO roles (id, code, name) VALUES
  (1, 'super_admin', 'Super Admin'),
  (2, 'admin', 'Admin');
