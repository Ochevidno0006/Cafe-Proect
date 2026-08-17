const { query } = require('../config/db');

const BASE_SELECT = `
  SELECT u.id, u.first_name, u.last_name, u.phone, u.password_hash,
         u.status, u.theme_preference, u.created_at, u.updated_at, u.deleted_at,
         r.code AS role_code, r.id AS role_id
  FROM users u
  JOIN roles r ON r.id = u.role_id
`;

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    passwordHash: row.password_hash,
    status: row.status,
    themePreference: row.theme_preference,
    roleCode: row.role_code,
    roleId: row.role_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

async function findByPhone(phone, { includeDeleted = false } = {}) {
  const clause = includeDeleted ? '' : 'AND u.deleted_at IS NULL';
  const { rows } = await query(`${BASE_SELECT} WHERE u.phone = $1 ${clause}`, [phone]);
  return mapRow(rows[0]);
}

async function findById(id, { includeDeleted = false } = {}) {
  const clause = includeDeleted ? '' : 'AND u.deleted_at IS NULL';
  const { rows } = await query(`${BASE_SELECT} WHERE u.id = $1 ${clause}`, [id]);
  return mapRow(rows[0]);
}

async function create(client, { firstName, lastName, phone, passwordHash, roleCode }) {
  const { rows } = await client.query(
    `INSERT INTO users (first_name, last_name, phone, password_hash, role_id)
     SELECT $1, $2, $3, $4, r.id FROM roles r WHERE r.code = $5
     RETURNING id, first_name, last_name, phone, status, theme_preference, created_at`,
    [firstName, lastName, phone, passwordHash, roleCode]
  );
  return rows[0];
}

async function listAdmins({ limit = 50, offset = 0, includeDeleted = false } = {}) {
  const clause = includeDeleted ? '' : 'AND u.deleted_at IS NULL';
  const { rows } = await query(
    `${BASE_SELECT}
     WHERE r.code = 'admin' ${clause}
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map(mapRow);
}

async function setStatus(id, status) {
  const { rows } = await query(
    `UPDATE users SET status = $2 WHERE id = $1 RETURNING id, status`,
    [id, status]
  );
  return rows[0];
}

async function softDelete(id) {
  const { rows } = await query(
    `UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return rows[0];
}

async function restore(id) {
  const { rows } = await query(
    `UPDATE users SET deleted_at = NULL WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0];
}

async function updatePassword(id, passwordHash) {
  await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [id, passwordHash]);
}

module.exports = {
  findByPhone,
  findById,
  create,
  listAdmins,
  setStatus,
  softDelete,
  restore,
  updatePassword,
};
