const { query } = require('../config/db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    cafeId: row.cafe_id,
    type: row.type,
    value: row.value,
    isEnabled: row.is_enabled,
    position: row.position,
  };
}

async function list(cafeId) {
  const { rows } = await query(
    `SELECT * FROM contacts WHERE cafe_id = $1 ORDER BY position ASC`,
    [cafeId]
  );
  return rows.map(mapRow);
}

async function findByIdScoped(id, cafeId) {
  const { rows } = await query(`SELECT * FROM contacts WHERE id = $1 AND cafe_id = $2`, [id, cafeId]);
  return mapRow(rows[0]);
}

async function create(cafeId, { type, value, position = 0, isEnabled = true }) {
  const { rows } = await query(
    `INSERT INTO contacts (cafe_id, type, value, position, is_enabled) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [cafeId, type, value, position, isEnabled]
  );
  return mapRow(rows[0]);
}

async function updateScoped(id, cafeId, patch) {
  const fields = [];
  const values = [];
  let i = 1;
  const columnMap = { type: 'type', value: 'value', position: 'position', isEnabled: 'is_enabled' };
  for (const [key, column] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      fields.push(`${column} = $${i}`);
      values.push(patch[key]);
      i += 1;
    }
  }
  if (fields.length === 0) return findByIdScoped(id, cafeId);
  values.push(id, cafeId);
  const { rows } = await query(
    `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${i} AND cafe_id = $${i + 1} RETURNING *`,
    values
  );
  return mapRow(rows[0]);
}

async function removeScoped(id, cafeId) {
  const { rows } = await query(`DELETE FROM contacts WHERE id = $1 AND cafe_id = $2 RETURNING id`, [
    id,
    cafeId,
  ]);
  return rows[0];
}

module.exports = { list, findByIdScoped, create, updateScoped, removeScoped };
